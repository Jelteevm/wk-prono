import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/voorspellingen",
  "/ranking",
  "/profiel",
  "/admin",
  "/reglement",
];

export function middleware(request: NextRequest) {
  const userId = request.cookies.get("user_id")?.value;
  const path = request.nextUrl.pathname;

  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );



  if (isProtectedRoute && !userId) {
    return NextResponse.redirect(new URL("/login?error=login_required", request.url));
  }

  if ((path === "/login" || path === "/register") && userId) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/voorspellingen/:path*",
    "/ranking/:path*",
    "/profiel/:path*",
    "/admin/:path*",
    "/reglement/:path*",
    "/login",
    "/register",
  ],
};