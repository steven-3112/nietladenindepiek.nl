import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Over Niet laden in de piek | Het initiatief',
  description: 'Een initiatief van Steven Heitel om bij te dragen aan de energietransitie. Leer hoe deze website helpt om het energienet te ontlasten.',
};

export default function OverPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 text-primary-600 hover:text-primary-800">
              <Image
                src="/logo.png"
                alt="Niet laden in de piek logo"
                width={36}
                height={36}
                className="h-7 w-auto"
              />
              <span>← Terug naar home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Over dit initiatief
        </h1>

        {/* Introduction */}
        <section className="prose prose-lg max-w-none mb-12">
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Het verhaal achter Niet laden in de piek
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Hoi! Ik ben <strong>Steven Heijtel</strong> en ik heb deze website gemaakt om mijn 
              steentje bij te dragen aan de energietransitie. Als eigenaar van een elektrische 
              auto merkte ik dat veel mensen niet weten hoe ze hun auto zo kunnen instellen 
              dat deze niet laadt tijdens piekuren (16:00-21:00 uur).
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Het laden tijdens piekuren legt extra druk op het energienet, juist op het moment 
              dat iedereen thuiskomt, kookt en verwarmt. Door slim te laden buiten deze tijden, 
              kunnen we met z&apos;n allen het net ontlasten en de energietransitie versnellen.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Omdat niet iedereen weet hoe dit in te stellen op hun specifieke auto, heb ik deze 
              website gemaakt. Door de kracht van de community kunnen we samen een complete en 
              betrouwbare database opbouwen met handleidingen voor alle elektrische auto&apos;s.
            </p>
          </div>

          <div className="bg-secondary-50 border-l-4 border-secondary-500 p-6 mb-8">
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
              💡 Het doel
            </h3>
            <p className="text-secondary-800">
              Een simpele, toegankelijke plek waar iedereen kan vinden hoe ze hun elektrische 
              auto zo instellen dat deze buiten piekuren laadt. Goed voor het energienet, goed 
              voor je portemonnee, en goed voor de energietransitie.
            </p>
          </div>
        </section>

        {/* License Section */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Open licentie: CC BY-SA
          </h2>
          
          <p className="text-gray-700 leading-relaxed mb-4">
            Alle handleidingen en content op deze website vallen onder de{' '}
            <a 
              href="https://creativecommons.org/licenses/by-sa/4.0/deed.nl" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-800 underline font-semibold"
            >
              Creative Commons Attribution-ShareAlike 4.0 (CC BY-SA 4.0)
            </a>{' '}
            licentie.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Wat betekent dit?
          </h3>

          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">
                ✓
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Je mag de content gebruiken</h4>
                <p className="text-gray-700 text-sm">
                  Kopiëren, verspreiden en verder gebruiken voor elk doel, zelfs commercieel.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">
                ✓
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Je mag de content aanpassen</h4>
                <p className="text-gray-700 text-sm">
                  Bewerken, transformeren en verder bouwen op het materiaal.
                </p>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Onder de volgende voorwaarden:
          </h3>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-lg">
                BY
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Naamsvermelding (BY)</h4>
                <p className="text-gray-700 text-sm">
                  Je moet de maker vermelden (in dit geval de persoon die de handleiding heeft 
                  gemaakt) en een link naar de licentie geven. Je mag dit op redelijke wijze doen, 
                  maar niet op een manier die suggereert dat de licentiegever jou steunt.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-lg">
                SA
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Gelijk Delen (ShareAlike)</h4>
                <p className="text-gray-700 text-sm">
                  Als je het materiaal remixt, transformeert of erop voortbouwt, moet je 
                  het onder dezelfde licentie verspreiden als het origineel.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700">
              <strong>In het kort:</strong> Je mag alles gebruiken en delen, zolang je de 
              oorspronkelijke maker vermeldt en eventuele aanpassingen onder dezelfde licentie 
              deelt. Dit bevordert het delen van kennis en helpt ons samen een betere 
              handleidingendatabase te bouwen! 🌱
            </p>
          </div>

          <div className="mt-6">
            <a 
              href="https://creativecommons.org/licenses/by-sa/4.0/deed.nl" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-800 font-semibold"
            >
              Lees meer over CC BY-SA 4.0
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </section>

        {/* Special Mentions Section */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Speciale vermeldingen
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Deze website maakt gebruik van verschillende bronnen en diensten. We willen graag 
            de volgende partijen bedanken voor hun bijdrage:
          </p>
          <div className="mt-4">
            <a 
              href="https://logo.dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-800 underline font-semibold"
            >
              Logos provided by Logo.dev
            </a>
          </div>
        </section>

        {/* Contribute Section */}
        <section className="bg-green-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Doe mee!
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Deze website is alleen succesvol met jouw hulp. Heb je een elektrische auto en weet 
            je hoe je de laadtijden moet instellen? Deel je kennis en help anderen!
          </p>
          <Link
            href="/indienen"
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Handleiding toevoegen
          </Link>
        </section>

        {/* Contact */}
        <section className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            Vragen of suggesties? Deze website is open source en community-driven.
          </p>
        </section>
      </article>
    </main>
  );
}

