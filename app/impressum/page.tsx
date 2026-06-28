import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function ImpressumPage() {
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

        <h1 className="mb-8 text-3xl font-bold">Impressum</h1>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">Angaben gemäß § 5 DDG</h2>
            <p>
              Flux Network<br />
              Inhaber: Bastian Kroha<br />
              Sandbrink 7<br />
              31558 Hagenburg<br />
              Deutschland
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">Kontakt</h2>
            <p>
              E-Mail: support@lumaspace.de
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
            <p>
              Bastian Kroha<br />
              Sandbrink 7<br />
              31558 Hagenburg
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">EU-Streitschlichtung</h2>
            <p>
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS)
              bereit: <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://ec.europa.eu/consumers/odr/</a>.
              Unsere E-Mail-Adresse finden Sie oben im Impressum. Wir sind nicht bereit oder verpflichtet,
              an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">Haftungsausschluss</h2>

            <h3 className="mb-1 font-medium text-foreground/80">Haftung für Inhalte</h3>
            <p>
              Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit,
              Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
              Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten
              nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als
              Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
              Informationen zu überwachen.
            </p>

            <h3 className="mb-1 mt-4 font-medium text-foreground/80">Haftung für Links</h3>
            <p>
              Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen
              Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
              Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der
              Seiten verantwortlich.
            </p>

            <h3 className="mb-1 mt-4 font-medium text-foreground/80">Keine Finanzberatung</h3>
            <p>
              Die über LumaSpace bereitgestellten Trading-Daten, Portfolio-Übersichten und
              PnL-Auswertungen dienen ausschließlich der persönlichen Information und Organisation.
              Sie stellen keine Anlageberatung, Empfehlung oder Aufforderung zum Kauf oder Verkauf
              von Finanzinstrumenten dar. Jegliche Handelsentscheidungen triffst du eigenverantwortlich.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-semibold text-foreground">Urheberrecht</h2>
            <p>
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
              dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art
              der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen
              Zustimmung des jeweiligen Autors bzw. Erstellers.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
