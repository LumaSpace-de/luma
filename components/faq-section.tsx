"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const FAQS = [
  {
    q: "Ist LumaSpace wirklich kostenlos?",
    a: "Ja – der Free Plan ist dauerhaft kostenlos, kein Kreditkarte erforderlich. Du bekommst Kalender, Seiten-Editor, Workspaces und alles andere ohne versteckte Kosten.",
  },
  {
    q: "Was ist der Unterschied zwischen Free und Enterprise?",
    a: "Der Free Plan deckt alles für Einzelpersonen und kleine Teams ab. Enterprise richtet sich an Unternehmen mit SSO, eigener Domain, dediziertem Support und erweiterter Rollenverwaltung – auf Anfrage.",
  },
  {
    q: "Kann ich mehrere Workspaces erstellen?",
    a: "Im Free Plan kannst du Workspaces erstellen und Mitglieder einladen. Enterprise-Kunden erhalten unbegrenzte Workspaces mit zusätzlichen Admin-Funktionen.",
  },
  {
    q: "Wie lade ich Teammitglieder ein?",
    a: "In deinem Workspace kannst du Mitglieder per E-Mail-Adresse oder @Benutzername einladen. Du vergibst dabei Rollen: Betrachter, Mitglied, Admin oder Eigentümer.",
  },
  {
    q: "Werden meine Daten sicher gespeichert?",
    a: "Alle Daten werden verschlüsselt in einer Supabase-Datenbank (PostgreSQL) in der EU gespeichert. Wir geben keine Daten an Dritte weiter.",
  },
  {
    q: "Wie bekomme ich Enterprise-Zugang?",
    a: "Schreib uns eine E-Mail an support@lumaspace.de mit dem Betreff „Enterprise-Anfrage". Wir melden uns innerhalb von 24 Stunden bei dir.",
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

export function FaqSection() {
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
