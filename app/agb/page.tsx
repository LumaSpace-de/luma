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
              LumaSpace (lumaspace.de), betrieben von Flux Network. Mit der Registrierung akzeptierst
              du diese Bedingungen.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">§ 2 Leistungsbeschreibung</h2>
            <p>
              LumaSpace ist eine webbasierte Produktivitäts- und Planungsplattform. Sie umfasst
              Funktionen wie Kalender, Workspace-Verwaltung, Seiten und Notizen. Der Dienst wird
              als Software-as-a-Service (SaaS) bereitgestellt.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">§ 3 Nutzungsbedingungen</h2>
            <p>Die Nutzung von LumaSpace ist nur für volljährige Personen oder mit Einwilligung eines
              Erziehungsberechtigten gestattet. Du verpflichtest dich:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Keine rechtswidrigen Inhalte zu erstellen oder zu verbreiten</li>
              <li>Deine Zugangsdaten sicher aufzubewahren</li>
              <li>Den Dienst nicht zu missbrauchen oder zu überlasten</li>
              <li>Keine automatisierten Zugriffe ohne Genehmigung durchzuführen</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">§ 4 Pläne und Preise</h2>
            <p>
              LumaSpace bietet verschiedene Tarife an (Free, Pro, Enterprise). Der Free-Tarif ist
              dauerhaft kostenlos. Kostenpflichtige Tarife werden separat ausgewiesen. Preisänderungen
              werden mindestens 4 Wochen im Voraus kommuniziert.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">§ 5 Kündigung und Datenlöschung</h2>
            <p>
              Du kannst dein Konto jederzeit löschen. Nach der Kündigung werden deine Daten innerhalb
              von 30 Tagen vollständig gelöscht, sofern keine gesetzlichen Aufbewahrungspflichten bestehen.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">§ 6 Haftungsbeschränkung</h2>
            <p>
              Flux Network haftet nicht für Datenverlust, entgangenen Gewinn oder sonstige mittelbare
              Schäden, soweit dies gesetzlich zulässig ist. Wir übernehmen keine Garantie für eine
              ununterbrochene Verfügbarkeit des Dienstes.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">§ 7 Änderungen der AGB</h2>
            <p>
              Wir behalten uns vor, diese AGB zu ändern. Änderungen werden dir per E-Mail oder über
              die Plattform mitgeteilt. Widersprichst du nicht innerhalb von 4 Wochen, gelten die
              neuen AGB als akzeptiert.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">§ 8 Anwendbares Recht</h2>
            <p>
              Es gilt deutsches Recht. Gerichtsstand ist der Sitz von Flux Network.
            </p>
            <p className="mt-2">Stand: Juni 2026</p>
          </section>
        </div>
      </div>
    </div>
  )
}
