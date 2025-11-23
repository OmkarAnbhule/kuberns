import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BACKEND_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  
  // Redirect to backend GitHub auth URL
  const backendAuthUrl = `${BACKEND_BASE_URL}/api/accounts/auth/github/url`;
  
  return NextResponse.redirect(backendAuthUrl);
}

