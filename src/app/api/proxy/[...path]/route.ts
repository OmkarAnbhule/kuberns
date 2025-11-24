import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Check both API_BASE_URL (server-side) and NEXT_PUBLIC_API_BASE_URL (client-side)
const API_BASE_URL = (process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000") + "/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const pathSegments = resolvedParams.path || [];
    let path = pathSegments.join("/");
    
    // Check if the original request URL had a trailing slash
    const originalUrl = request.url;
    const urlPath = new URL(originalUrl).pathname;
    const hasTrailingSlash = urlPath.endsWith("/") || 
                             (pathSegments.length > 0 && pathSegments[pathSegments.length - 1] === "");
    
    if (hasTrailingSlash && !path.endsWith("/") && path !== "") {
      path = path + "/";
    }
    
    const searchParams = request.nextUrl.searchParams.toString();
    const url = searchParams
      ? `${API_BASE_URL}/${path}?${searchParams}`
      : `${API_BASE_URL}/${path}`;

    const token = request.cookies.get("access_token")?.value;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    let response: Response;
    try {
      response = await fetch(url, {
        method: "GET",
        headers,
      });
    } catch (fetchError: any) {
      return NextResponse.json(
        { 
          error: "Fetch failed", 
          message: fetchError.message,
        },
        { status: 500 }
      );
    }

    // Handle 401 Unauthorized - session expired
    if (response.status === 401) {
      const errorResponse = NextResponse.json(
        { error: "Unauthorized", message: "Session expired. Please login again." },
        { status: 401 }
      );
      
      // Clear all auth cookies
      errorResponse.cookies.set("access_token", "", { maxAge: 0, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" });
      errorResponse.cookies.set("refresh_token", "", { maxAge: 0, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" });
      errorResponse.cookies.set("user_data", "", { maxAge: 0, httpOnly: false, secure: process.env.NODE_ENV === "production", sameSite: "lax" });
      
      return errorResponse;
    }

    // Extract and log cache-related headers
    const cacheControl = response.headers.get("cache-control");
    const etag = response.headers.get("etag");
    const lastModified = response.headers.get("last-modified");
    const expires = response.headers.get("expires");
    const age = response.headers.get("age");
    const vary = response.headers.get("vary");
    
    // Log cache information
    console.log("GET Proxy - Cache Headers:", {
      url,
      "cache-control": cacheControl,
      "etag": etag,
      "last-modified": lastModified,
      "expires": expires,
      "age": age,
      "vary": vary,
      "status": response.status,
      "cacheable": response.status === 200 && !cacheControl?.includes("no-store") && !cacheControl?.includes("no-cache"),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }
    
    // Create response with cache headers
    const nextResponse = NextResponse.json(data);
    
    // Forward cache-related headers from backend
    if (cacheControl) {
      nextResponse.headers.set("cache-control", cacheControl);
      console.log("GET Proxy - Setting cache-control header:", cacheControl);
    }
    if (etag) {
      nextResponse.headers.set("etag", etag);
      console.log("GET Proxy - Setting etag header:", etag);
    }
    if (lastModified) {
      nextResponse.headers.set("last-modified", lastModified);
      console.log("GET Proxy - Setting last-modified header:", lastModified);
    }
    if (expires) {
      nextResponse.headers.set("expires", expires);
      console.log("GET Proxy - Setting expires header:", expires);
    }
    if (vary) {
      nextResponse.headers.set("vary", vary);
      console.log("GET Proxy - Setting vary header:", vary);
    }
    
    return nextResponse;
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.log("GET Proxy - Error occurred:", {
      url: request.url,
      error: errorMessage,
      "cache-status": "error-no-cache",
    });
    return NextResponse.json(
      { 
        error: "Proxy request failed", 
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const pathSegments = resolvedParams.path || [];
    let path = pathSegments.join("/");
    
    // Check if the original request URL had a trailing slash
    // Next.js might normalize it, so we check multiple sources
    const originalUrl = request.url;
    const urlPath = new URL(originalUrl).pathname;
    
    // Also check if the last segment is empty (indicates trailing slash in catch-all route)
    const hasTrailingSlash = urlPath.endsWith("/") || 
                             (pathSegments.length > 0 && pathSegments[pathSegments.length - 1] === "");
    
    // If we detected a trailing slash, add it to the path
    if (hasTrailingSlash && !path.endsWith("/") && path !== "") {
      path = path + "/";
    }
    
    const url = `${API_BASE_URL}/${path}`;
    console.log("POST Proxy - Original URL:", originalUrl);
    console.log("POST Proxy - URL Pathname:", urlPath);
    console.log("POST Proxy - Path segments:", pathSegments);
    console.log("POST Proxy - Has trailing slash:", hasTrailingSlash);
    console.log("POST Proxy - Constructed path:", path);
    console.log("POST Proxy - Final backend URL:", url);
    const token = request.cookies.get("access_token")?.value;
    const body = await request.json();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
    } catch (fetchError: any) {
      return NextResponse.json(
        { 
          error: "Fetch failed", 
          message: fetchError.message,
        },
        { status: 500 }
      );
    }

    // Handle 401 Unauthorized - session expired
    if (response.status === 401) {
      const errorResponse = NextResponse.json(
        { error: "Unauthorized", message: "Session expired. Please login again." },
        { status: 401 }
      );
      
      // Clear all auth cookies
      errorResponse.cookies.set("access_token", "", { maxAge: 0, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" });
      errorResponse.cookies.set("refresh_token", "", { maxAge: 0, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" });
      errorResponse.cookies.set("user_data", "", { maxAge: 0, httpOnly: false, secure: process.env.NODE_ENV === "production", sameSite: "lax" });
      
      return errorResponse;
    }

    // Log cache-related headers for POST (usually not cacheable, but log for debugging)
    const cacheControl = response.headers.get("cache-control");
    const etag = response.headers.get("etag");
    
    console.log("POST Proxy - Response Headers:", {
      url,
      "cache-control": cacheControl,
      "etag": etag,
      "status": response.status,
      "method": "POST",
      "note": "POST requests are typically not cacheable",
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.log("POST Proxy - Error occurred:", {
      url: request.url,
      error: errorMessage,
      "cache-status": "error-no-cache",
    });
    return NextResponse.json(
      { 
        error: "Proxy request failed", 
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const pathSegments = resolvedParams.path || [];
    let path = pathSegments.join("/");
    
    // Check if the original request URL had a trailing slash
    const originalUrl = request.url;
    const urlPath = new URL(originalUrl).pathname;
    const hasTrailingSlash = urlPath.endsWith("/") || 
                             (pathSegments.length > 0 && pathSegments[pathSegments.length - 1] === "");
    
    if (hasTrailingSlash && !path.endsWith("/") && path !== "") {
      path = path + "/";
    }
    
    const url = `${API_BASE_URL}/${path}`;
    const token = request.cookies.get("access_token")?.value;
    const body = await request.json();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    let response: Response;
    try {
      response = await fetch(url, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
      });
    } catch (fetchError: any) {
      return NextResponse.json(
        { 
          error: "Fetch failed", 
          message: fetchError.message,
        },
        { status: 500 }
      );
    }

    // Handle 401 Unauthorized - session expired
    if (response.status === 401) {
      const errorResponse = NextResponse.json(
        { error: "Unauthorized", message: "Session expired. Please login again." },
        { status: 401 }
      );
      
      // Clear all auth cookies
      errorResponse.cookies.set("access_token", "", { maxAge: 0, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" });
      errorResponse.cookies.set("refresh_token", "", { maxAge: 0, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" });
      errorResponse.cookies.set("user_data", "", { maxAge: 0, httpOnly: false, secure: process.env.NODE_ENV === "production", sameSite: "lax" });
      
      return errorResponse;
    }

    // Log cache-related headers for PUT
    const cacheControl = response.headers.get("cache-control");
    const etag = response.headers.get("etag");
    
    console.log("PUT Proxy - Response Headers:", {
      url,
      "cache-control": cacheControl,
      "etag": etag,
      "status": response.status,
      "method": "PUT",
      "note": "PUT requests typically invalidate cache",
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.log("PUT Proxy - Error occurred:", {
      url: request.url,
      error: errorMessage,
      "cache-status": "error-no-cache",
    });
    return NextResponse.json(
      { 
        error: "Proxy request failed", 
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const pathSegments = resolvedParams.path || [];
    let path = pathSegments.join("/");
    
    // Check if the original request URL had a trailing slash
    const originalUrl = request.url;
    const urlPath = new URL(originalUrl).pathname;
    const hasTrailingSlash = urlPath.endsWith("/") || 
                             (pathSegments.length > 0 && pathSegments[pathSegments.length - 1] === "");
    
    if (hasTrailingSlash && !path.endsWith("/") && path !== "") {
      path = path + "/";
    }
    
    const searchParams = request.nextUrl.searchParams.toString();
    const url = searchParams
      ? `${API_BASE_URL}/${path}?${searchParams}`
      : `${API_BASE_URL}/${path}`;
    const token = request.cookies.get("access_token")?.value;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    let response: Response;
    try {
      response = await fetch(url, {
        method: "DELETE",
        headers,
      });
    } catch (fetchError: any) {
      return NextResponse.json(
        { 
          error: "Fetch failed", 
          message: fetchError.message,
        },
        { status: 500 }
      );
    }

    // Handle 401 Unauthorized - session expired
    if (response.status === 401) {
      const errorResponse = NextResponse.json(
        { error: "Unauthorized", message: "Session expired. Please login again." },
        { status: 401 }
      );
      
      // Clear all auth cookies
      errorResponse.cookies.set("access_token", "", { maxAge: 0, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" });
      errorResponse.cookies.set("refresh_token", "", { maxAge: 0, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" });
      errorResponse.cookies.set("user_data", "", { maxAge: 0, httpOnly: false, secure: process.env.NODE_ENV === "production", sameSite: "lax" });
      
      return errorResponse;
    }

    // Log cache-related headers for DELETE
    const cacheControl = response.headers.get("cache-control");
    const etag = response.headers.get("etag");
    
    console.log("DELETE Proxy - Response Headers:", {
      url: request.url,
      "cache-control": cacheControl,
      "etag": etag,
      "status": response.status,
      "method": "DELETE",
      "note": "DELETE requests typically invalidate cache",
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.log("DELETE Proxy - Error occurred:", {
      url: request.url,
      error: errorMessage,
      "cache-status": "error-no-cache",
    });
    return NextResponse.json(
      { 
        error: "Proxy request failed", 
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

