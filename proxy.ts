import { NextResponse, type NextRequest } from "next/server";

const AUTH_ROUTES = ["/auth/login", "/auth/register"];
const SESSION_COOKIE_NAMES = ["fitflow_session", "access_token", "refresh_token"];

export function proxy(request: NextRequest) {
  const isAuthRoute = AUTH_ROUTES.some((route) => request.nextUrl.pathname.startsWith(route));

  if (!isAuthRoute) {
    return NextResponse.next();
  }

  const hasSession = SESSION_COOKIE_NAMES.some((name) => Boolean(request.cookies.get(name)?.value));

  if (!hasSession) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}

export const config = {
  matcher: ["/auth/login", "/auth/register"],
};
