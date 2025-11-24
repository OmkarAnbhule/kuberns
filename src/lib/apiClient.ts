const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

interface RequestOptions extends RequestInit {
  token?: string | null; // Deprecated - token is now handled by proxy via httpOnly cookie
}

export async function apiClient(
  endpoint: string,
  options: RequestOptions = {}
): Promise<Response> {
  const { token, ...fetchOptions } = options;

  // If endpoint starts with /api/, it's a Next.js API route - use as-is
  // Otherwise, route through the proxy which has access to httpOnly cookies
  let url: string;
  if (endpoint.startsWith("http")) {
    url = endpoint;
  } else if (endpoint.startsWith("/api/")) {
    url = endpoint;
  } else {
    // Route through proxy for backend API calls
    // The proxy will automatically include the httpOnly access_token cookie
    url = `/api/proxy/${endpoint.startsWith("/") ? endpoint.slice(1) : endpoint}`;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };

  // Note: We don't set Authorization header here for backend API calls
  // The proxy route will handle adding the token from httpOnly cookie
  // Only set it if explicitly provided (for non-proxy routes)
  if (token && !url.startsWith("/api/proxy/")) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    // Ensure method is included in fetch options
    const method = fetchOptions.method || "GET";
    
    const response = await fetch(url, {
      ...fetchOptions,
      method,
      headers,
      credentials: "include", // Include cookies in the request
    });

    // Handle 401 Unauthorized - session expired
    if (response.status === 401) {
      // Clear Redux state
      if (typeof window !== "undefined") {
        try {
          // Import store dynamically to avoid circular dependencies
          const { store } = await import("@/lib/store");
          const { clearUser } = await import("@/lib/slices/authSlice");
          store.dispatch(clearUser());
        } catch (reduxError) {
          // Ignore Redux errors
        }
        
        // Call logout API to clear cookies
        try {
          await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
        } catch (logoutError) {
          // Ignore logout errors
        }
        
        // Redirect to login with session expired message
        window.location.href = "/login?session=expired";
      }
      
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Session expired. Please login again.`);
    }

    if (!response.ok) {
      // Try to parse as JSON first, fallback to text
      let errorMessage = response.statusText;
      try {
        const errorData = await response.clone().json();
        console.log("API Client Error - Response Data:", errorData);
        errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
      } catch {
        try {
          errorMessage = await response.text();
          console.log("API Client Error - Response Text:", errorMessage);
        } catch {
          errorMessage = response.statusText;
          console.log("API Client Error - Status Text:", errorMessage);
        }
      }
      console.log("API Client Error - Final Error Message:", errorMessage);
      throw new Error(errorMessage || `API Error: ${response.status}`);
    }

    return response;
  } catch (error) {
    throw error;
  }
}

export async function apiClientJson<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  try {
    const response = await apiClient(endpoint, options);
    const jsonData = await response.json();
    return jsonData;
  } catch (error) {
    throw error;
  }
}

