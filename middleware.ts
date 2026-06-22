import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

const PROTECTED = [
  "/calendar", "/dashboard", "/settings", "/pages",
  "/inbox", "/statistics", "/discover", "/admin", "/github",
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow: auth, beta-verify page, public pages
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/beta-verify") ||
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/agb") ||
    pathname.startsWith("/datenschutz") ||
    pathname.startsWith("/impressum")
  ) {
    return NextResponse.next()
  }

  const isProtected = PROTECTED.some(p => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  // Must be logged in
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Must have beta access (only enforced when BETA_CODE is set)
  const betaCode = process.env.BETA_CODE
  if (betaCode) {
    const cookie = request.cookies.get("beta_access")?.value
    if (cookie !== betaCode) {
      return NextResponse.redirect(new URL("/beta-verify", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/calendar/:path*",
    "/dashboard/:path*", "/dashboard",
    "/settings/:path*", "/settings",
    "/pages/:path*",
    "/inbox/:path*",
    "/statistics/:path*",
    "/discover/:path*",
    "/admin/:path*", "/admin",
    "/github/:path*", "/github",
  ],
}
