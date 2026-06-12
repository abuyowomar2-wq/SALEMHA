import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("sallemha_token")?.value;

  const isAdminPath = pathname.startsWith("/admin");
  const isDashboardPath = pathname.startsWith("/dashboard");
  const isLoginPath = pathname === "/login";
  const isRegisterPath = pathname === "/register";
  const isRoot = pathname === "/";

  const userStr = token
    ? request.cookies.get("sallemha_user")?.value
    : null;

  let role = "guest";

  if (userStr) {
    try {
      const user = JSON.parse(decodeURIComponent(userStr));
      role = user?.role || "guest";
    } catch {}
  }

  if (!token && (isAdminPath || isDashboardPath)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && (isLoginPath || isRegisterPath)) {
    const dest = role === "admin" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  if (role === "admin" && isDashboardPath) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (role === "merchant" && isAdminPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (role === "admin" && isRoot) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/login", "/register", "/"],
};
