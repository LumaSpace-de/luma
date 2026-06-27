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
              Verantwortlicher im Sinne der DSGVO:<br /><br />
              Flux Network<br />
              Inhaber: Bezo Alizada<br />
              Sandbrink 7<br />
              31558 Hagenburg<br />
              E-Mail: support@lumaspace.de
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">2. Erhebung und Speicherung personenbezogener Daten</h2>
            <p>Bei der Nutzung von LumaSpace erheben wir folgende Daten:</p>

            <h3 className="mb-1 mt-3 font-medium text-foreground/80">a) Bei der Registrierung</h3>
            <ul className="mt-1 list-inside list-disc space-y-1">
              <li>E-Mail-Adresse</li>
              <li>Passwort (verschlüsselt mit bcrypt, niemals im Klartext gespeichert)</li>
              <li>Anzeigename und optionaler Benutzername</li>
              <li>Optionales Profilbild</li>
            </ul>
            <p className="mt-1">Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).</p>

            <h3 className="mb-1 mt-3 font-medium text-foreground/80">b) Bei Nutzung der GitHub-Integration</h3>
            <p>
              Wenn du deinen GitHub-Account verbindest, wird über den OAuth-Prozess ein Zugangstoken
              von GitHub (Microsoft, USA) an uns übermittelt und serverseitig gespeichert. Wir erhalten
              damit Zugriff auf deine öffentlichen Repository-Daten. Du kannst die Verbindung jederzeit
              in den Einstellungen trennen, wobei der Token gelöscht wird.
            </p>
            <p className="mt-1">Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).</p>

            <h3 className="mb-1 mt-3 font-medium text-foreground/80">c) Bei Nutzung der MEXC-Integration</h3>
            <p>
              Wenn du deine MEXC API-Schlüssel hinterlegst, werden API Key und API Secret serverseitig
              verschlüsselt in unserer Datenbank gespeichert. Die Schlüssel werden ausschließlich verwendet,
              um in deinem Namen Leseabfragen an die MEXC-API zu senden (Kontostände, Handelshistorie).
              LumaSpace führt keine Transaktionen auf deinem Exchange-Konto durch.
              Du kannst die Verbindung jederzeit trennen, wobei die Schlüssel gelöscht werden.
            </p>
            <p className="mt-1">Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).</p>

            <h3 className="mb-1 mt-3 font-medium text-foreground/80">d) Bei Nutzung der Discord-Integration</h3>
            <p>
              Wenn du deinen Discord-Account verbindest, wird über den OAuth-Prozess ein Zugangstoken
              von Discord (Discord Inc., USA) an uns übermittelt und serverseitig gespeichert. Wir erhalten
              damit Zugriff auf deine öffentlichen Profilinformationen (Benutzername, Avatar). Du kannst
              die Verbindung jederzeit in den Einstellungen trennen, wobei der Token gelöscht wird.
            </p>
            <p className="mt-1">Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).</p>

            <h3 className="mb-1 mt-3 font-medium text-foreground/80">e) Nutzungsdaten</h3>
            <p>
              Beim Zugriff auf LumaSpace werden automatisch technische Daten erhoben (IP-Adresse,
              Browser-Typ, Zugriffszeitpunkt). Diese Daten werden nicht mit personenbezogenen Daten
              zusammengeführt und nach 30 Tagen gelöscht.
            </p>
            <p className="mt-1">Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Sicherheit des Dienstes).</p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">3. Zweck der Datenverarbeitung</h2>
            <p>
              Die erhobenen Daten werden ausschließlich für folgende Zwecke verwendet:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Bereitstellung und Betrieb des LumaSpace-Dienstes</li>
              <li>Authentifizierung und Kontoverwaltung</li>
              <li>Darstellung von Portfolio- und Handelsdaten (MEXC-Integration)</li>
              <li>Verknüpfung mit Drittdiensten (GitHub, Discord, Kalender)</li>
              <li>Sicherheit und Missbrauchsprävention</li>
            </ul>
            <p className="mt-2">
              Wir geben keine personenbezogenen Daten an Dritte weiter, sofern dies nicht zur
              Vertragserfüllung erforderlich ist oder du ausdrücklich eingewilligt hast.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">4. Hosting und Datenübertragung in Drittländer</h2>
            <p>
              LumaSpace wird über <strong>Vercel Inc.</strong> (USA) gehostet. Die Datenbank liegt bei
              <strong> Supabase Inc.</strong> (PostgreSQL, Serverstandort EU – Frankfurt). Für die
              Datenübertragung an US-Anbieter gelten die EU-Standardvertragsklauseln (SCC) gemäß
              Art. 46 Abs. 2 lit. c DSGVO.
            </p>
            <p className="mt-2">Folgende Drittanbieter werden eingebunden:</p>
            <ul className="mt-1 list-inside list-disc space-y-1">
              <li><strong>Vercel</strong> – Hosting, Edge-Funktionen (USA, SCC)</li>
              <li><strong>Supabase</strong> – Datenbank, Dateispeicher (EU – Frankfurt)</li>
              <li><strong>GitHub/Microsoft</strong> – OAuth-Authentifizierung (USA, SCC)</li>
              <li><strong>Discord</strong> – OAuth-Authentifizierung, nur bei aktiver Verknüpfung (USA, SCC)</li>
              <li><strong>MEXC Global</strong> – Trading-API, nur bei aktiver Verknüpfung (Seychellen)</li>
              <li><strong>Hostinger</strong> – E-Mail-Versand für Passwort-Reset (EU – Litauen)</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">5. Speicherung und Sicherheit</h2>
            <p>
              Deine Daten werden in einer verschlüsselten Datenbank (Supabase/PostgreSQL, Standort
              EU – Frankfurt) gespeichert. Passwörter werden mit bcrypt gehasht. MEXC API-Schlüssel
              werden serverseitig verschlüsselt abgelegt. Profilbilder werden in Supabase Storage
              gespeichert. Die Kommunikation erfolgt durchgängig über HTTPS/TLS.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">6. Cookies und Sessions</h2>
            <p>
              LumaSpace verwendet ausschließlich technisch notwendige Session-Cookies (NextAuth.js)
              zur Authentifizierung. Diese Cookies enthalten eine verschlüsselte Session-ID und werden
              beim Schließen des Browsers bzw. nach Ablauf der Sitzung gelöscht.
            </p>
            <p className="mt-2">
              Es werden <strong>keine</strong> Tracking-, Analyse- oder Werbe-Cookies eingesetzt.
              Es findet kein Profiling statt.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">7. Kalender-Export (ICS)</h2>
            <p>
              LumaSpace bietet die Möglichkeit, deinen Kalender als ICS-Feed zu abonnieren (Apple
              Kalender, Google Kalender, Outlook etc.). Der ICS-Link enthält einen zufällig generierten
              Token und ist nur mit diesem Token abrufbar. Es werden keine personenbezogenen Daten
              an den Kalender-Client übertragen, die über den Inhalt deiner Events hinausgehen.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">8. Deine Rechte (DSGVO)</h2>
            <p>Du hast jederzeit folgende Rechte:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li><strong>Auskunft</strong> – über deine gespeicherten Daten (Art. 15 DSGVO)</li>
              <li><strong>Berichtigung</strong> – unrichtiger Daten (Art. 16 DSGVO)</li>
              <li><strong>Löschung</strong> – deiner Daten, „Recht auf Vergessenwerden" (Art. 17 DSGVO)</li>
              <li><strong>Einschränkung</strong> – der Verarbeitung (Art. 18 DSGVO)</li>
              <li><strong>Datenübertragbarkeit</strong> – in einem gängigen Format (Art. 20 DSGVO)</li>
              <li><strong>Widerspruch</strong> – gegen die Verarbeitung (Art. 21 DSGVO)</li>
              <li><strong>Widerruf</strong> – einer erteilten Einwilligung jederzeit (Art. 7 Abs. 3 DSGVO)</li>
            </ul>
            <p className="mt-2">
              Zur Ausübung deiner Rechte wende dich an: <strong>support@lumaspace.de</strong>
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">9. Beschwerderecht bei der Aufsichtsbehörde</h2>
            <p>
              Du hast das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren. Die für
              uns zuständige Aufsichtsbehörde ist:
            </p>
            <p className="mt-2">
              Die Landesbeauftragte für den Datenschutz Niedersachsen<br />
              Prinzenstraße 5<br />
              30159 Hannover<br />
              <a href="https://www.lfd.niedersachsen.de" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.lfd.niedersachsen.de</a>
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">10. Änderungen dieser Datenschutzerklärung</h2>
            <p>
              Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um sie an geänderte
              Rechtslagen oder Änderungen des Dienstes anzupassen. Die jeweils aktuelle Version
              ist auf dieser Seite abrufbar.
            </p>
            <p className="mt-2">Stand: Juni 2026</p>
          </section>
        </div>
      </div>
    </div>
  )
}
