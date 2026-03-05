import Link from "next/link"
import Image from "next/image"

/* Components */

import { Button } from "@/components/ui/button"

export default function IndexPage() {
  return (
    <div className="flex justify-between items-center p-4">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Image
          src="./public/logo_icon.png"
          alt="Logo"
          width={32}
          height={32}
        />
        <span className="font-bold">LumaSpace</span>
      </div>

      <Link href="/login">
        <Button size="sm">
          Login
        </Button>
      </Link>

    </div>
  )
}