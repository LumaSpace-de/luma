import Link from "next/link"
import Image from "next/Image"

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
      <div className="absolute right-4 top-4 z-50 flex gap-2">
          <Link href="/login">
            <Button size="sm">Login</Button>
        </Link>
      </div>
  )
}