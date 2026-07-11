import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })

  return NextResponse.json({ connected: !!process.env.ANTHROPIC_API_KEY })
}
