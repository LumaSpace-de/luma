app/page.tsx
import Link from "next/link"

import { siteConfig } from "@/config/site"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function IndexPage() {
  return (
    <div>
      <Button variant="outline">Outline</Button>
      <Link href="/login">
        <Button variant="outline">Login</Button>
      </Link>
    </div>
  )
}