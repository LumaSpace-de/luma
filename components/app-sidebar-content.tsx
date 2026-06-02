"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart,
  Bell,
  Calendar,
  ChevronDown,
  Folder,
  Home,
  LogOut,
  Mail,
  Plus,
  Search,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const navigationItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard", badge: null },
  { icon: Calendar, label: "Kalender", href: "/calendar", badge: null },
  { icon: BarChart, label: "Analytics", href: "/analytics", badge: "New" },
  { icon: Mail, label: "Inbox", href: "/inbox", badge: null },
  { icon: Folder, label: "Dokumente", href: "/documents", badge: "New" },
]

const workspaces = [
  { name: "LumaSpace", plan: "Pro" },
  { name: "Stark Industries", plan: "Free" },
  { name: "Wayne Enterprises", plan: "Enterprise" },
]

export function AppSidebarContent() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Workspace switcher */}
      <div className="border-b p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-accent">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary">
                <span className="text-sm font-medium text-primary-foreground">A</span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col items-start">
                <span className="text-sm font-medium">LumaSpace</span>
                <span className="text-xs text-muted-foreground">Pro Plan</span>
              </div>
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            {workspaces.map((ws) => (
              <DropdownMenuItem key={ws.name} className="gap-2 p-2">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-muted">
                  <span className="text-xs font-medium">{ws.name[0]}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{ws.name}</span>
                  <span className="text-xs text-muted-foreground">{ws.plan} Plan</span>
                </div>
              </DropdownMenuItem>
            ))}
            <Separator className="my-1" />
            <DropdownMenuItem className="gap-2 p-2">
              <Plus className="h-4 w-4" />
              <span>Neuer Workspace</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Suchen..." className="bg-background pl-8" />
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <div className="flex-1 overflow-auto p-3">
        <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Navigation
        </p>
        <nav className="flex flex-col gap-0.5">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-accent font-medium text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <Badge variant="default" className="ml-auto text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      <Separator />

      {/* User footer */}
      <div className="p-4">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src="https://github.com/whoisbezofx.png" alt="@prodbybezo" />
            <AvatarFallback>PB</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium">Prodbybezo</span>
            <span className="truncate text-xs text-muted-foreground">bezzo19@gmx.de</span>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Bell className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
