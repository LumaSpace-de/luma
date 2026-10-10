"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart2,
  Calendar,
  Compass,
  Home,
  Mail,
  Menu,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useInlineSidebar } from "@/hooks/use-inline-sidebar"

const TOP_NAV_ITEMS = [
  { icon: Home,     label: "Home",      href: "/dashboard" },
  { icon: Calendar, label: "Kalender",  href: "/calendar" },
  { icon: Mail,     label: "Inbox",     href: "/inbox" },
  { icon: BarChart2,label: "Stats",     href: "/statistics" },
  { icon: Compass,  label: "Entdecken", href: "/discover" },
]

const BOTTOM_NAV_ITEMS = [
  { icon: Home,     label: "Home",     href: "/dashboard" },
  { icon: Calendar, label: "Kalender", href: "/calendar" },
  { icon: Mail,     label: "Inbox",    href: "/inbox" },
  { icon: BarChart2,label: "Stats",    href: "/statistics" },
  { icon: Settings, label: "Settings", href: "/settings" },
]

export function MobileTopNav() {
  const pathname = usePathname()
  const { toggle } = useInlineSidebar()

  return (
    <div className="flex h-11 shrink-0 items-center gap-0.5 border-b border-border/40 bg-background/95 px-1 backdrop-blur-sm">
      {/* Hamburger — opens sidebar overlay */}
      <button
        onClick={toggle}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground/60 transition-colors hover:bg-accent hover:text-foreground"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Scrollable section tabs */}
      <div className="flex flex-1 items-center gap-0.5 overflow-x-auto scrollbar-none">
        {TOP_NAV_ITEMS.map(({ icon: Icon, label, href }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground/60 hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex h-[60px] shrink-0 items-stretch border-t border-border/40 bg-background/95 backdrop-blur-sm"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {BOTTOM_NAV_ITEMS.map(({ icon: Icon, label, href }) => {
        const active = pathname === href || pathname.startsWith(href + "/")
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 transition-colors",
              active ? "text-primary" : "text-muted-foreground/50 hover:text-muted-foreground"
            )}
          >
            <Icon className={cn("h-5 w-5 transition-transform", active && "scale-110")} />
            <span className={cn("text-[10px] font-medium leading-none", active ? "text-primary" : "text-muted-foreground/50")}>
              {label}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
