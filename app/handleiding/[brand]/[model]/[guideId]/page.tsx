import Link from 'next/link';
import Image from 'next/image';
import { getGuideWithSteps } from '@/lib/db';
import { notFound } from 'next/navigation';
import { FeedbackButtons } from '@/components/FeedbackButtons';
import { ImageModal } from '@/components/ImageModal';
import { getServerSession } from 'next-auth';
import { authOptions, hasRole } from '@/lib/auth';

interface PageProps {
  params: {
    brand: string;
    model: string;
    guideId: string;
  };
}

export default async function GuideDetailPage({ params }: PageProps) {
  const guide = await getGuideWithSteps(parseInt(params.guideId));
  const session = await getServerSession(authOptions);
  const isAdmin = session && hasRole(session.user.roles, 'MODERATOR');

  if (!guide || guide.status !== 'APPROVED') {
    notFound();
  }

  const sortedSteps = guide.steps.sort((a, b) => a.step_number - b.step_number);

  // Schema.org HowTo structured data for SEO
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `Laadtijden instellen op ${guide.models[0]?.brand_name} ${guide.models[0]?.name}`,
    description: `Stap-voor-stap handleiding om je ${guide.models[0]?.brand_name} ${guide.models[0]?.name} zo in te stellen dat deze niet laadt tussen 16:00 en 21:00 uur.`,
    image: sortedSteps.find(s => s.image_url)?.image_url || '',
    step: sortedSteps.map((step) => ({
      '@type': 'HowToStep',
      name: `Stap ${step.step_number}`,
      text: step.description,
      image: step.image_url || undefined,
      position: step.step_number,
    })),
  };

  return (
    <>
      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      
      <main className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href={`/handleiding/${params.brand}/${params.model}`}
              className="flex items-center gap-3 text-primary-600 hover:text-primary-800"
            >
              <Image
                src="/logo.png"
                alt="Niet laden in de piek logo"
                width={36}
                height={36}
                className="h-7 w-auto"
              />
              <span>← Terug naar handleidingen</span>
            </Link>
            {isAdmin && (
              <Link
                href={`/admin/handleidingen?edit=${params.guideId}`}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Bewerken
              </Link>
            )}
          </div>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Laadtijden instellen
          </h1>
          <p className="text-gray-600">
            Handleiding door {guide.submitted_by_name}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Geldt voor: {guide.models.map(m => `${m.brand_name} ${m.name}`).join(', ')}
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-primary-50 border-l-4 border-primary-500 p-6 mb-8">
          <h2 className="font-bold text-primary-900 mb-2">
            📌 Doel: Niet laden tussen 16:00 - 21:00 uur
          </h2>
          <p className="text-primary-800">
            Volg de onderstaande stappen om je auto zo in te stellen dat deze buiten
            de piekuren laadt. Dit helpt het energienet en bespaart je geld!
          </p>
        </div>

        {/* Steps */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          {sortedSteps.map((step, index) => (
            <div
              key={step.id}
              className={`p-6 ${index !== sortedSteps.length - 1 ? 'border-b border-gray-200' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                  {step.step_number}
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 whitespace-pre-wrap mb-4">
                    {step.description}
                  </p>
                  {step.image_url && (
                    <ImageModal
                      src={step.image_url}
                      alt={`Stap ${step.step_number}`}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Success Message */}
        <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-8">
          <h3 className="font-bold text-green-900 mb-2">
            ✅ Gelukt? Perfect!
          </h3>
          <p className="text-green-800">
            Je auto laadt nu niet meer tussen 16:00 en 21:00 uur. Bedankt voor je
            bijdrage aan een stabieler energienet!
          </p>
        </div>

        {/* Feedback Section */}
        <FeedbackButtons guideId={guide.id} />
      </section>
    </main>
    </>
  );
}

