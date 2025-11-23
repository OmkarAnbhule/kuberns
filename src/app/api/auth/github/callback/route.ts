import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BACKEND_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000";
const FRONTEND_BASE_URL = process.env.BASE_URL || "http://localhost:3000";
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${error}`, FRONTEND_BASE_URL)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=no_code", FRONTEND_BASE_URL)
    );
  }

  try {
    // Call backend callback API with the code and state
    const backendCallbackUrl = `${BACKEND_BASE_URL}/api/accounts/auth/github/callback?code=${code}&state=${state || ""}`;
    
    const response = await fetch(backendCallbackUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Backend authentication failed");
    }

    const data = await response.json();

    console.log(data);
    // Store token and user data in cookies
    const redirectResponse = NextResponse.redirect(new URL("/", FRONTEND_BASE_URL));
    
    if (data.access_token) {
      redirectResponse.cookies.set("access_token", data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 1, // 1 hour
      });
    }

    if (data.refresh_token) {
      redirectResponse.cookies.set("refresh_token", data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    // Store user data in cookie (non-httpOnly so client can read it)
    if (data.user) {
      redirectResponse.cookies.set("user_data", JSON.stringify(data.user), {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 1, // 1 hour
      });
    }

    return redirectResponse;
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(
      new URL("/login?error=auth_failed", FRONTEND_BASE_URL)
    );
  }
}

