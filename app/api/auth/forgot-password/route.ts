import { NextRequest, NextResponse } from "next/server"

import { createResetToken, findUserByEmail } from "@/lib/users-db"

async function sendResetEmail(to: string, code: string) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error("RESEND_API_KEY is not set")

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "LumaSpace <onboarding@resend.dev>",
      to,
      subject: "Dein Reset-Code für LumaSpace",
      html: `
        <div style="font-family:sans-serif;max-width:400px;margin:0 auto">
          <h2 style="margin-bottom:8px">Passwort zurücksetzen</h2>
          <p style="color:#6b7280">Dein Code ist 15 Minuten gültig.</p>
          <div style="font-size:36px;font-weight:bold;letter-spacing:8px;margin:24px 0;text-align:center">
            ${code}
          </div>
          <p style="color:#6b7280;font-size:13px">Falls du das nicht angefordert hast, ignoriere diese E-Mail.</p>
        </div>
      `,
    }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(`Resend error ${res.status}: ${JSON.stringify(body)}`)
  }
}

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email) {
    return NextResponse.json({ error: "E-Mail erforderlich" }, { status: 400 })
  }

  const user = await findUserByEmail(email)

  if (!user) {
    // Return success to avoid email enumeration
    return NextResponse.json({ success: true })
  }

  const code = await createResetToken(email)

  try {
    await sendResetEmail(email, code)
  } catch (err) {
    console.error("[forgot-password]", err)
    return NextResponse.json(
      { error: "E-Mail konnte nicht gesendet werden. Bitte später erneut versuchen." },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
