import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { updateWorkspaceImage } from "@/lib/workspaces-db"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_BYTES = 2 * 1024 * 1024 // 2 MB
const BUCKET = "workspace-images"

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets()
  if (!buckets?.find((b) => b.name === BUCKET)) {
    await supabase.storage.createBucket(BUCKET, { public: true })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  const form = await req.formData()
  const file = form.get("image") as File | null
  if (!file) return NextResponse.json({ error: "Keine Datei" }, { status: 400 })

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Nur JPG, PNG, WebP oder GIF erlaubt" }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  if (buffer.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: "Datei zu groß (max. 2 MB)" }, { status: 400 })
  }

  await ensureBucket()

  const ext = file.type.split("/")[1].replace("jpeg", "jpg")
  const path = `${params.id}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: true })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)
  const imageUrl = `${urlData.publicUrl}?t=${Date.now()}`

  await updateWorkspaceImage(params.id, session.user.id, imageUrl)

  return NextResponse.json({ imageUrl })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 })
  }

  await updateWorkspaceImage(params.id, session.user.id, null)
  return NextResponse.json({ success: true })
}
