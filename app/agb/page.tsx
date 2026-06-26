import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function AgbPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück
        </Link>

        <h1 className="mb-8 text-3xl font-bold">Allgemeine Geschäftsbedingungen</h1>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">§ 1 Geltungsbereich</h2>
            <p>
              Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der Plattform
              LumaSpace (lumaspace.de), betrieben von Flux Network, Inhaber Bezo Alizada. Mit der
              Registrierung akzeptierst du diese Bedingungen.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">§ 2 Leistungsbeschreibung</h2>
            <p>
              LumaSpace ist eine webbasierte Produktivitäts- und Planungsplattform. Sie umfasst
              Funktionen wie Kalender, Workspace-Verwaltung, Seiten-Editor mit Block-System,
              Aufgabenverwaltung sowie optionale Integrationen mit Drittdiensten (GitHub, MEXC Exchange,
              Kalender-Apps). Der Dienst wird als Software-as-a-Service (SaaS) bereitgestellt.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">§ 3 Nutzungsbedingungen</h2>
            <p>
              Die Nutzung von LumaSpace ist nur für volljährige Personen oder mit Einwilligung eines
              Erziehungsberechtigten gestattet. Du verpflichtest dich:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Keine rechtswidrigen Inhalte zu erstellen oder zu verbreiten</li>
              <li>Deine Zugangsdaten sicher aufzubewahren</li>
              <li>Den Dienst nicht zu missbrauchen oder zu überlasten</li>
              <li>Keine automatisierten Zugriffe ohne Genehmigung durchzuführen</li>
              <li>API-Schlüssel von Drittdiensten (z. B. MEXC) eigenverantwortlich zu verwalten</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">§ 4 Pläne und Preise</h2>
            <p>
              LumaSpace bietet einen dauerhaft kostenlosen Free-Tarif sowie einen Enterprise-Tarif
              für Unternehmen (auf Anfrage). Preisänderungen werden mindestens 4 Wochen im Voraus
              kommuniziert.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">§ 5 MEXC-Integration & Trading-Haftung</h2>
            <p>
              LumaSpace bietet die Möglichkeit, MEXC-API-Schlüssel zu hinterlegen, um Kontostände
              und Handelshistorie abzurufen. Dabei gilt:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>LumaSpace führt keine Handelsaktionen auf deinem Exchange-Konto durch</li>
              <li>Alle angezeigten Daten (Portfolio, PnL, Trade Logs) dienen ausschließlich der
                persönlichen Übersicht und Information</li>
              <li>LumaSpace stellt keine Anlageberatung, Handelsempfehlung oder Aufforderung
                zum Kauf oder Verkauf von Finanzinstrumenten dar</li>
              <li>Du bist allein verantwortlich für deine Handelsentscheidungen</li>
              <li>Flux Network haftet nicht für Verluste, die aus Trading-Aktivitäten entstehen</li>
              <li>Die Korrektheit der von MEXC bereitgestellten Daten wird nicht garantiert</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">§ 6 Drittanbieter-Integrationen</h2>
            <p>
              LumaSpace ermöglicht die Verknüpfung mit Drittdiensten (GitHub, MEXC, Kalender-Apps).
              Für diese Dienste gelten deren eigene Nutzungsbedingungen und Datenschutzrichtlinien.
              Flux Network ist nicht verantwortlich für die Verfügbarkeit, Richtigkeit oder Sicherheit
              von Drittanbieterdiensten. Du kannst Verknüpfungen jederzeit in den Einstellungen trennen.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">§ 7 Kündigung und Datenlöschung</h2>
            <p>
              Du kannst dein Konto jederzeit löschen. Nach der Kündigung werden deine Daten innerhalb
              von 30 Tagen vollständig gelöscht, sofern keine gesetzlichen Aufbewahrungspflichten bestehen.
              Hinterlegte API-Schlüssel werden sofort bei Kontolöschung entfernt.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">§ 8 Haftungsbeschränkung</h2>
            <p>
              Flux Network haftet nicht für Datenverlust, entgangenen Gewinn, Handelsverluste oder
              sonstige mittelbare Schäden, soweit dies gesetzlich zulässig ist. Wir übernehmen keine
              Garantie für eine ununterbrochene Verfügbarkeit des Dienstes. Die Haftung für Vorsatz
              und grobe Fahrlässigkeit bleibt unberührt.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">§ 9 Änderungen der AGB</h2>
            <p>
              Wir behalten uns vor, diese AGB zu ändern. Änderungen werden dir per E-Mail oder über
              die Plattform mitgeteilt. Widersprichst du nicht innerhalb von 4 Wochen nach Zugang
              der Änderungsmitteilung, gelten die neuen AGB als akzeptiert.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">§ 10 Anwendbares Recht und Gerichtsstand</h2>
            <p>
              Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand ist, soweit gesetzlich
              zulässig, der Sitz von Flux Network (Hagenburg). Für Verbraucher gilt der gesetzliche
              Gerichtsstand.
            </p>
            <p className="mt-2">Stand: Juni 2026</p>
          </section>
        </div>
      </div>
    </div>
  )
}
