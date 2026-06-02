import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function DatenschutzPage() {
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

        <h1 className="mb-8 text-3xl font-bold">Datenschutzerklärung</h1>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">1. Verantwortlicher</h2>
            <p>
              Verantwortlicher im Sinne der DSGVO ist:<br /><br />
              Flux Network<br />
              [Straße und Hausnummer]<br />
              [PLZ] [Stadt]<br />
              E-Mail: support@lumaspace.de
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">2. Erhebung und Speicherung personenbezogener Daten</h2>
            <p>
              Bei der Registrierung auf LumaSpace erheben wir folgende Daten:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>E-Mail-Adresse</li>
              <li>Passwort (verschlüsselt gespeichert, nicht im Klartext)</li>
              <li>Anzeigename und optionaler Benutzername</li>
              <li>Optionales Profilbild</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">3. Zweck der Datenverarbeitung</h2>
            <p>
              Die erhobenen Daten werden ausschließlich zur Bereitstellung und Verbesserung des
              LumaSpace-Dienstes verwendet. Wir geben keine personenbezogenen Daten an Dritte weiter,
              sofern dies nicht zur Vertragserfüllung erforderlich ist oder du ausdrücklich eingewilligt hast.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">4. Speicherung und Sicherheit</h2>
            <p>
              Deine Daten werden in einer verschlüsselten Datenbank (Supabase/PostgreSQL) gespeichert.
              Passwörter werden mit bcrypt gehasht und niemals im Klartext gespeichert. Profilbilder
              werden sicher in Supabase Storage abgelegt.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">5. Cookies und Sessions</h2>
            <p>
              LumaSpace verwendet Session-Cookies (NextAuth.js) zur Authentifizierung. Diese Cookies
              sind technisch notwendig und enthalten keine persönlichen Daten außer einer verschlüsselten
              Session-ID. Es werden keine Tracking- oder Werbe-Cookies eingesetzt.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">6. Deine Rechte</h2>
            <p>Du hast jederzeit das Recht auf:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Auskunft über deine gespeicherten Daten</li>
              <li>Berichtigung unrichtiger Daten</li>
              <li>Löschung deiner Daten</li>
              <li>Einschränkung der Verarbeitung</li>
              <li>Datenübertragbarkeit</li>
              <li>Widerspruch gegen die Verarbeitung</li>
            </ul>
            <p className="mt-2">
              Zur Ausübung deiner Rechte wende dich an: support@lumaspace.de
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">7. Kontakt bei Datenschutzfragen</h2>
            <p>
              Bei Fragen zum Datenschutz erreichst du uns unter:<br />
              E-Mail: support@lumaspace.de
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">8. Änderungen dieser Datenschutzerklärung</h2>
            <p>
              Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um sie an geänderte
              Rechtslagen oder bei Änderungen des Dienstes anzupassen. Die jeweils aktuelle Version
              ist auf dieser Seite abrufbar.
            </p>
            <p className="mt-2">Stand: Juni 2026</p>
          </section>
        </div>
      </div>
    </div>
  )
}
