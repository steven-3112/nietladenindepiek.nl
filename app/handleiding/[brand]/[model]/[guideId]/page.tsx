import Link from 'next/link';
import Image from 'next/image';
import { getGuideWithSteps } from '@/lib/db';
import { notFound } from 'next/navigation';
import { FeedbackButtons } from '@/components/FeedbackButtons';

interface PageProps {
  params: {
    brand: string;
    model: string;
    guideId: string;
  };
}

export default async function GuideDetailPage({ params }: PageProps) {
  const guide = await getGuideWithSteps(parseInt(params.guideId));

  if (!guide || guide.status !== 'APPROVED') {
    notFound();
  }

  const sortedSteps = guide.steps.sort((a, b) => a.step_number - b.step_number);

  return (
    <main className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href={`/handleiding/${params.brand}/${params.model}`}
            className="text-primary-600 hover:text-primary-800"
          >
            ← Terug naar handleidingen
          </Link>
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
                    <div className="relative w-full max-w-md h-64 rounded-lg overflow-hidden">
                      <Image
                        src={step.image_url}
                        alt={`Stap ${step.step_number}`}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 448px"
                      />
                    </div>
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
  );
}

