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
    let path = resolvedParams.path?.join("/") || "";
    // Preserve trailing slash if the original request had one
    if (request.nextUrl.pathname.endsWith("/") && !path.endsWith("/")) {
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

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
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
    let path = resolvedParams.path?.join("/") || "";
    // Preserve trailing slash if the original request had one
    if (request.nextUrl.pathname.endsWith("/") && !path.endsWith("/")) {
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

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
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
    let path = resolvedParams.path?.join("/") || "";
    // Preserve trailing slash if the original request had one
    if (request.nextUrl.pathname.endsWith("/") && !path.endsWith("/")) {
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

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
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
    let path = resolvedParams.path?.join("/") || "";
    // Preserve trailing slash if the original request had one
    if (request.nextUrl.pathname.endsWith("/") && !path.endsWith("/")) {
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

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { 
        error: "Proxy request failed", 
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

