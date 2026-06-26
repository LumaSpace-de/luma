"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const FAQS = [
  {
    q: "Ist LumaSpace wirklich kostenlos?",
    a: "Ja – der Free Plan ist dauerhaft kostenlos, keine Kreditkarte erforderlich. Du bekommst Kalender, Seiten-Editor mit 17+ Block-Typen, MEXC Trading-Integration, Workspaces und alles andere ohne versteckte Kosten.",
  },
  {
    q: "Was ist der Unterschied zwischen Free und Enterprise?",
    a: "Der Free Plan deckt alles für Einzelpersonen und kleine Teams ab – inklusive Trading-Tools. Enterprise richtet sich an Unternehmen mit Slack-Integration, dediziertem Support und erweiterter Rollenverwaltung.",
  },
  {
    q: "Wie funktioniert die MEXC-Integration?",
    a: "Verbinde deine MEXC API-Keys in den Einstellungen (nur Leserechte nötig). Danach stehen dir Portfolio-Block, PnL Kalender und Trade Logs als Blöcke auf jeder Seite zur Verfügung – alles wird automatisch synchronisiert.",
  },
  {
    q: "Kann ich mehrere Workspaces erstellen?",
    a: "Im Free Plan kannst du Workspaces erstellen und Mitglieder einladen. Enterprise-Kunden erhalten unbegrenzte Workspaces mit zusätzlichen Admin-Funktionen.",
  },
  {
    q: "Werden meine Daten sicher gespeichert?",
    a: "Alle Daten werden verschlüsselt in einer Supabase-Datenbank (PostgreSQL) in der EU gespeichert. MEXC API-Keys werden serverseitig verschlüsselt – wir haben nie Zugriff auf dein Exchange-Guthaben.",
  },
  {
    q: "Wie bekomme ich Enterprise-Zugang?",
    a: "Schreib uns eine E-Mail an support@lumaspace.de mit dem Betreff 'Enterprise-Anfrage'. Wir melden uns innerhalb von 24 Stunden bei dir.",
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-border/50 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left text-sm font-medium transition-colors hover:text-foreground"
      >
        <span>{q}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <p className="pb-5 text-sm text-muted-foreground leading-relaxed">
          {a}
        </p>
      )}
    </div>
  )
}

interface FaqSectionProps {
  variant?: "landing" | "dashboard"
}

export function FaqSection({ variant = "landing" }: FaqSectionProps) {
  if (variant === "dashboard") {
    return (
      <div className="mt-10">
        <div className="mb-5">
          <h2 className="text-base font-semibold uppercase tracking-wider text-muted-foreground">
            Häufige Fragen
          </h2>
        </div>
        <div className="rounded-xl border border-border/60 bg-card px-5">
          {FAQS.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <section className="relative z-10 mx-auto w-full max-w-2xl px-6 pb-28">
      <div className="mb-10 text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Häufige Fragen
        </h2>
        <p className="mt-3 text-muted-foreground">
          Alles was du über LumaSpace wissen möchtest.
        </p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 px-6 backdrop-blur-sm">
        {FAQS.map((faq) => (
          <FaqItem key={faq.q} q={faq.q} a={faq.a} />
        ))}
      </div>
    </section>
  )
}
