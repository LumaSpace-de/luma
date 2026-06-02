import { supabase } from "./supabase"

export interface DbUser {
  id: string
  email: string
  password: string
  name: string
  createdAt: string
}

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, password, name, created_at")
    .ilike("email", email)
    .maybeSingle()

  if (error || !data) return null

  return {
    id: data.id,
    email: data.email,
    password: data.password,
    name: data.name,
    createdAt: data.created_at,
  }
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
    createdAt: data.created_at,
  }
}
