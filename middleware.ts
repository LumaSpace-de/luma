export { default } from "next-auth/middleware"

export const config = {
  matcher: ["/calendar/:path*", "/dashboard", "/dashboard/:path*", "/settings", "/settings/:path*"],
}
