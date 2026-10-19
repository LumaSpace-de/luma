"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300",
        scrolled
          ? "bg-[#080808]/80 backdrop-blur-xl border-b border-white/[0.04]"
          : "bg-transparent"
      )}
    >
      <div className="flex items-center gap-2.5">
        <Image src="/logo_icon.png" alt="LumaSpace" width={30} height={30} className="rounded-lg" />
        <span className="text-sm font-bold tracking-tight text-white">LumaSpace</span>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/login">
          <Button
            variant="ghost"
            size="sm"
            className="text-white/50 hover:bg-white/[0.06] hover:text-white"
          >
            Anmelden
          </Button>
        </Link>
        <Link href="/signup">
          <Button
            size="sm"
            className="bg-white text-black hover:bg-white/90"
          >
            Registrieren
          </Button>
        </Link>
      </div>
    </nav>
  )
}
