import { supabase } from "./supabase"

export interface DbUser {
  id: string
  email: string
  password: string
  name: string
  username: string | null
  displayName: string | null
  createdAt: string
}

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, password, name, username, display_name, created_at")
    .ilike("email", email)
    .maybeSingle()

  if (error || !data) return null

  return {
    id: data.id,
    email: data.email,
    password: data.password,
    name: data.name,
    username: data.username ?? null,
    displayName: data.display_name ?? null,
    createdAt: data.created_at,
  }
}

export async function findUserByUsername(username: string): Promise<DbUser | null> {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, password, name, username, display_name, created_at")
    .ilike("username", username)
    .maybeSingle()

  if (error || !data) return null

  return {
    id: data.id,
    email: data.email,
    password: data.password,
    name: data.name,
    username: data.username ?? null,
    displayName: data.display_name ?? null,
    createdAt: data.created_at,
  }
}

export async function updateUserProfile(
  id: string,
  { displayName, username }: { displayName: string; username: string }
): Promise<void> {
  const { error } = await supabase
    .from("users")
    .update({ display_name: displayName, username, name: displayName })
    .eq("id", id)

  if (error) throw new Error(error.message)
}

export async function updateUserPassword(
  id: string,
  hashedPassword: string
): Promise<void> {
  const { error } = await supabase
    .from("users")
    .update({ password: hashedPassword })
    .eq("id", id)

  if (error) throw new Error(error.message)
}

export async function createResetToken(email: string): Promise<string> {
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expires_at = new Date(Date.now() + 15 * 60 * 1000).toISOString()

  await supabase.from("password_reset_tokens").delete().ilike("email", email)

  const { error } = await supabase
    .from("password_reset_tokens")
    .insert({ email: email.toLowerCase(), code, expires_at })

  if (error) throw new Error(error.message)
  return code
}

export async function verifyResetToken(
  email: string,
  code: string
): Promise<boolean> {
  const { data } = await supabase
    .from("password_reset_tokens")
    .select("code, expires_at")
    .ilike("email", email)
    .eq("code", code)
    .maybeSingle()

  if (!data) return false
  if (new Date(data.expires_at) < new Date()) return false
  return true
}

export async function deleteResetToken(email: string): Promise<void> {
  await supabase.from("password_reset_tokens").delete().ilike("email", email)
}

export async function createUser(
  email: string,
  hashedPassword: string
): Promise<DbUser> {
  const name = email.split("@")[0]

  const { data, error } = await supabase
    .from("users")
    .insert({ email, password: hashedPassword, name })
    .select("id, email, password, name, created_at")
    .single()

  if (error) throw new Error(error.message)

  return {
    id: data.id,
    email: data.email,
    password: data.password,
    name: data.name,
    username: null,
    displayName: null,
    createdAt: data.created_at,
  }
}
