import { Suspense } from 'react';
import { SearchForm } from '@/components/SearchForm';
import DocumentFlow from '@/components/DocumentFlow'; // The new client component
import AuthButton from '@/components/AuthButton'; // Import the AuthButton
import { Cpu } from 'lucide-react';
import { getDocumentsForHome } from '@/features/documents/actions'; // Import server action

// A simple loading skeleton for the main content
function MainContentSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white/50 p-6 rounded-xl shadow-sm border">
          <div className="h-8 w-1/3 bg-gray-200 rounded mb-4"></div>
          <div className="@container">
            <div className="grid grid-cols-1 @sm:grid-cols-2 @md:grid-cols-3 @lg:grid-cols-4 gap-4">
              <div className="h-20 bg-gray-200 rounded-lg"></div>
              <div className="h-20 bg-gray-200 rounded-lg"></div>
              <div className="h-20 bg-gray-200 rounded-lg hidden @md:block"></div>
              <div className="h-20 bg-gray-200 rounded-lg hidden @lg:block"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


export default async function HomePage() {
  // Prefetch data on the server
  const initialDocuments = await getDocumentsForHome();

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className='flex items-center gap-2'>
            <Cpu size={32} className="text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">VINTECHCO Hub</h1>
          </div>
          {/* SearchForm is a client component, needs Suspense */}
          <Suspense>
            <SearchForm />
          </Suspense>
          <AuthButton />
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* DocumentFlow handles its own data fetching and loading states */}
        <Suspense fallback={<MainContentSkeleton />}>
          <DocumentFlow initialDocuments={initialDocuments} />
        </Suspense>
      </main>
    </div>
  );
}
