import { supabase } from "./supabase"

export interface DbUser {
  id: string
  email: string
  password: string
  name: string
  username: string | null
  avatarUrl: string | null
  createdAt: string
}

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, password, name, username, avatar_url, created_at")
    .ilike("email", email)
    .maybeSingle()

  if (error || !data) return null

  return {
    id: data.id,
    email: data.email,
    password: data.password,
    name: data.name,
    username: data.username ?? null,
    avatarUrl: data.avatar_url ?? null,
    createdAt: data.created_at,
  }
}

export async function findUserByUsername(username: string): Promise<DbUser | null> {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, password, name, username, avatar_url, created_at")
    .ilike("username", username)
    .maybeSingle()

  if (error || !data) return null

  return {
    id: data.id,
    email: data.email,
    password: data.password,
    name: data.name,
    username: data.username ?? null,
    avatarUrl: data.avatar_url ?? null,
    createdAt: data.created_at,
  }
}

export async function updateName(id: string, name: string): Promise<void> {
  const { error } = await supabase.from("users").update({ name }).eq("id", id)
  if (error) throw new Error(error.message)
}

export async function updateAvatarUrl(id: string, avatarUrl: string): Promise<void> {
  const { error } = await supabase.from("users").update({ avatar_url: avatarUrl }).eq("id", id)
  if (error) throw new Error(error.message)
}

export async function updateUsername(id: string, username: string): Promise<void> {
  const { error } = await supabase
    .from("users")
    .update({ username })
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

// -- GitHub token helpers --
// Requires columns: github_token (text, nullable), github_username (text, nullable) on users table
// SQL: ALTER TABLE users ADD COLUMN github_token text, ADD COLUMN github_username text;

export async function getGithubToken(userId: string): Promise<{ token: string; username: string } | null> {
  const { data, error } = await supabase
    .from("users")
    .select("github_token, github_username")
    .eq("id", userId)
    .maybeSingle()

  if (error || !data?.github_token) return null
  return { token: data.github_token, username: data.github_username ?? "" }
}

export async function setGithubToken(userId: string, token: string, username: string): Promise<void> {
  const { error } = await supabase
    .from("users")
    .update({ github_token: token, github_username: username })
    .eq("id", userId)
  if (error) throw new Error(error.message)
}

export async function removeGithubToken(userId: string): Promise<void> {
  const { error } = await supabase
    .from("users")
    .update({ github_token: null, github_username: null })
    .eq("id", userId)
  if (error) throw new Error(error.message)
}

// -- MEXC API key helpers --
// SQL: ALTER TABLE users ADD COLUMN mexc_api_key text, ADD COLUMN mexc_api_secret text;

export async function getMexcKeys(userId: string): Promise<{ apiKey: string; apiSecret: string } | null> {
  const { data, error } = await supabase
    .from("users")
    .select("mexc_api_key, mexc_api_secret")
    .eq("id", userId)
    .maybeSingle()

  if (error || !data?.mexc_api_key || !data?.mexc_api_secret) return null
  return { apiKey: data.mexc_api_key, apiSecret: data.mexc_api_secret }
}

export async function setMexcKeys(userId: string, apiKey: string, apiSecret: string): Promise<void> {
  const { error } = await supabase
    .from("users")
    .update({ mexc_api_key: apiKey, mexc_api_secret: apiSecret })
    .eq("id", userId)
  if (error) throw new Error(error.message)
}

export async function removeMexcKeys(userId: string): Promise<void> {
  const { error } = await supabase
    .from("users")
    .update({ mexc_api_key: null, mexc_api_secret: null })
    .eq("id", userId)
  if (error) throw new Error(error.message)
}

// -- Discord token helpers --
// SQL: ALTER TABLE users ADD COLUMN discord_token text, ADD COLUMN discord_username text, ADD COLUMN discord_user_id text, ADD COLUMN discord_avatar text;

export async function getDiscordToken(userId: string): Promise<{ token: string; username: string; discordUserId: string; avatar: string | null } | null> {
  const { data, error } = await supabase
    .from("users")
    .select("discord_token, discord_username, discord_user_id, discord_avatar")
    .eq("id", userId)
    .maybeSingle()

  if (error || !data?.discord_token) return null
  return {
    token: data.discord_token,
    username: data.discord_username ?? "",
    discordUserId: data.discord_user_id ?? "",
    avatar: data.discord_avatar ?? null,
  }
}

export async function setDiscordToken(
  userId: string,
  token: string,
  username: string,
  discordUserId: string,
  avatar: string | null
): Promise<void> {
  const { error } = await supabase
    .from("users")
    .update({
      discord_token: token,
      discord_username: username,
      discord_user_id: discordUserId,
      discord_avatar: avatar,
    })
    .eq("id", userId)
  if (error) throw new Error(error.message)
}

export async function removeDiscordToken(userId: string): Promise<void> {
  const { error } = await supabase
    .from("users")
    .update({ discord_token: null, discord_username: null, discord_user_id: null, discord_avatar: null })
    .eq("id", userId)
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
    username: null,
    avatarUrl: null,
    createdAt: data.created_at,
  }
}
