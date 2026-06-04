"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

export function LoadingScreen() {
  const [fading, setFading] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setFading(true), 900)
    const t2 = setTimeout(() => setGone(true), 1500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (gone) return null

  return (
    <div
      className={`fixed inset-0 z-[999] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[100px]" />
      </div>

      <div className="relative flex flex-col items-center gap-5">
        {/* Logo */}
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-blue-500/20 blur-xl" />
          <Image
            src="/logo_icon.png"
            alt="LumaSpace"
            width={64}
            height={64}
            className="relative rounded-2xl"
            priority
          />
        </div>

        {/* Name */}
        <span className="text-2xl font-bold tracking-tight"></span>

        {/* Dots */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40"
              style={{ animation: `luma-pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes luma-pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
