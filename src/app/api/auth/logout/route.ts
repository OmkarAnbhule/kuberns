import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  
  // Clear auth cookies by setting them with expired dates
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 0, // Expire immediately
    path: "/",
  };

  response.cookies.set("access_token", "", cookieOptions);
  response.cookies.set("refresh_token", "", cookieOptions);
  response.cookies.set("user_data", "", {
    ...cookieOptions,
    httpOnly: false, // user_data is not httpOnly
  });
  
  return response;
}

