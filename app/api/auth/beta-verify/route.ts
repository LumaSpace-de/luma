import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { code } = await req.json()
  const validCode = process.env.BETA_CODE

  if (!validCode || code !== validCode) {
    return NextResponse.json(
      { error: "Ungültiger Beta-Code. Wende dich ans LumaSpace-Team." },
      { status: 403 }
    )
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set("beta_access", code, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 Jahr
    path: "/",
  })
  return response
}
