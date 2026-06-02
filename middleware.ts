export { default } from "next-auth/middleware"

export const config = {
  matcher: ["/calendar/:path*", "/dashboard/:path*", "/settings", "/settings/:path*"],
}
