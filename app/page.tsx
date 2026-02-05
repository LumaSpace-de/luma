import Link from "next/link"

import { siteConfig } from "@/config/site"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function IndexPage() {
  return (
    <div className="absolute right-4 top-4 z-50 flex gap-2">
        <Button variant="outline" size="sm">
          Outline
        </Button>
        <Link href="/login">
          <Button size="sm">
            Login
          </Button>
        </Link>
      </div>
  )
}