import { NextResponse, type NextRequest } from "next/server";

const AUTH_ROUTES = ["/auth/login", "/auth/register"];
const PROTECTED_ROUTES = ["/dashboard", "/meals", "/progress", "/settings", "/workouts"];
const SESSION_COOKIE_NAMES = ["fitflow_session", "access_token", "refresh_token", "fitflow_refresh_token"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip static assets, public files (e.g. images, favicon.ico), and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") || // e.g. favicon.ico, logo.png, sw.js
    pathname === "/sw.js"
  ) {
    return NextResponse.next();
  }

  const hasSession = SESSION_COOKIE_NAMES.some((name) => Boolean(request.cookies.get(name)?.value));

  // 2. Auth Routes -> Redirect to dashboard if already logged in
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  if (isAuthRoute) {
    if (hasSession) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // 3. Protected Routes -> Redirect to login if not logged in
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  if (isProtectedRoute) {
    if (!hasSession) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Proceed normally for other public routes (like the landing page `/`)
  return NextResponse.next();
}

export const config = {
  // Apply proxy to all request paths except api routes and static assets
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
