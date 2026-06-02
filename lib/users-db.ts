import fs from "fs"
import path from "path"

export interface DbUser {
  id: string
  email: string
  password: string
  name: string
  createdAt: string
}

const DB_PATH = path.join(process.cwd(), "data", "users.json")

function ensureDb() {
  const dir = path.join(process.cwd(), "data")
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, "[]", "utf-8")
}

export function getUsers(): DbUser[] {
  ensureDb()
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"))
  } catch {
    return []
  }
}

export function findUserByEmail(email: string): DbUser | undefined {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase())
}

export function createUser(
  email: string,
  hashedPassword: string
): DbUser {
  const users = getUsers()
  const user: DbUser = {
    id: crypto.randomUUID(),
    email,
    password: hashedPassword,
    name: email.split("@")[0],
    createdAt: new Date().toISOString(),
  }
  fs.writeFileSync(DB_PATH, JSON.stringify([...users, user], null, 2), "utf-8")
  return user
}
