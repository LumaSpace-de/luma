import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL ?? "http://localhost:3000"))
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.redirect(new URL("/settings?claude=error", process.env.NEXTAUTH_URL ?? "http://localhost:3000"))
  }

  return NextResponse.redirect(new URL("/settings?claude=connected", process.env.NEXTAUTH_URL ?? "http://localhost:3000"))
}
