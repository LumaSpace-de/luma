"use client"

import { Building2, Check, PanelLeft, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { useInlineSidebar } from "@/hooks/use-inline-sidebar"
import { cn } from "@/lib/utils"

interface Invitation {
  id: string
  workspaceId: string
  workspaceName: string
  workspaceImageUrl: string | null
  workspacePlan: string
  invitedByName: string
  invitedByEmail: string
  createdAt: string
}

const planLabel: Record<string, string> = {
  free: "Free Plan",
  pro: "Pro Plan",
  enterprise: "Enterprise Plan",
}

const planBadge: Record<string, string> = {
  free: "bg-muted text-muted-foreground",
  pro: "bg-blue-500/20 text-blue-400",
  enterprise: "bg-purple-500/20 text-purple-400",
}

export default function InboxPage() {
  const { toggle } = useInlineSidebar()
  const router = useRouter()

  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/inbox")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setInvitations(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function handleAccept(inv: Invitation) {
    setProcessing(inv.id)
    const res = await fetch(`/api/inbox/${inv.id}`, { method: "PATCH" })
    if (res.ok) {
      setInvitations((prev) => prev.filter((i) => i.id !== inv.id))
      // Trigger workspace reload by navigating to dashboard
      router.push("/dashboard")
    }
    setProcessing(null)
  }

  async function handleDecline(inv: Invitation) {
    setProcessing(inv.id)
    await fetch(`/api/inbox/${inv.id}`, { method: "DELETE" })
    setInvitations((prev) => prev.filter((i) => i.id !== inv.id))
    setProcessing(null)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex h-12 shrink-0 items-center gap-3 border-b px-4">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggle}>
          <PanelLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold tracking-tight">Inbox</h1>
        {invitations.length > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-medium text-primary-foreground">
            {invitations.length}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl border bg-muted/20" />
            ))}
          </div>
        ) : invitations.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
            <Building2 className="mb-3 h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm font-medium">Keine Benachrichtigungen</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Einladungen zu Workspaces erscheinen hier.
            </p>
          </div>
        ) : (
          <>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Workspace-Einladungen
            </h2>
            <div className="flex flex-col gap-3">
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center gap-4 rounded-xl border bg-card p-4"
                >
                  {/* Workspace avatar */}
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-primary/10">
                    {inv.workspaceImageUrl ? (
                      <img
                        src={inv.workspaceImageUrl}
                        alt={inv.workspaceName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-base font-bold text-primary">
                        {inv.workspaceName[0]?.toUpperCase() ?? "?"}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold">{inv.workspaceName}</p>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                          planBadge[inv.workspacePlan] ?? planBadge.free
                        )}
                      >
                        {planLabel[inv.workspacePlan] ?? inv.workspacePlan}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      Eingeladen von{" "}
                      <span className="font-medium text-foreground">
                        {inv.invitedByName || inv.invitedByEmail}
                      </span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      disabled={processing === inv.id}
                      onClick={() => handleDecline(inv)}
                    >
                      <X className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Ablehnen</span>
                    </Button>
                    <Button
                      size="sm"
                      className="gap-1.5"
                      disabled={processing === inv.id}
                      onClick={() => handleAccept(inv)}
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Annehmen</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
