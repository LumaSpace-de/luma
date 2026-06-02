import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { updateAvatarUrl } from "@/lib/users-db"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_SIZE = 2 * 1024 * 1024

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get("avatar") as File | null

  if (!file) {
    return NextResponse.json({ error: "Keine Datei ausgewählt" }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Nur JPG, PNG, WebP und GIF erlaubt" }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Datei darf maximal 2 MB groß sein" }, { status: 400 })
  }

  const ext = file.type.split("/")[1].replace("jpeg", "jpg")
  const path = `${session.user.id}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, buffer, { contentType: file.type, upsert: true })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path)

  await updateAvatarUrl(session.user.id, publicUrl)

  return NextResponse.json({ avatarUrl: publicUrl })
}
