export default function MovieDetailsLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Mock Header space */}
      <main className="flex-grow">
        {/* Hero Section Skeleton */}
        <div className="relative h-[60vh] w-full bg-surface-dark/50 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-surface-dark/95 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full">
            <div className="container mx-auto px-4 py-12 max-w-7xl">
              <div className="flex flex-col md:flex-row gap-8 items-end animate-pulse">
                {/* Poster Skeleton */}
                <div className="hidden md:block w-64 h-96 rounded-xl bg-white/5 border border-white/10 shrink-0" />
                
                {/* Details Skeleton */}
                <div className="flex-grow w-full space-y-4">
                  <div className="flex gap-2">
                    <div className="h-6 w-16 bg-white/5 rounded-full" />
                    <div className="h-6 w-20 bg-white/5 rounded-full" />
                  </div>
                  <div className="h-10 md:h-12 w-2/3 bg-white/10 rounded-xl" />
                  <div className="h-6 w-1/2 bg-white/5 rounded-lg" />
                  <div className="flex items-center gap-6 pt-2">
                    <div className="h-5 w-24 bg-white/5 rounded-lg" />
                    <div className="h-5 w-16 bg-white/5 rounded-lg" />
                    <div className="h-5 w-20 bg-white/5 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section Skeleton */}
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-pulse">
            <div className="lg:col-span-2 space-y-12">
              <section className="space-y-4">
                <div className="h-7 w-28 bg-white/10 rounded-lg" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-white/5 rounded" />
                  <div className="h-4 w-5/6 bg-white/5 rounded" />
                  <div className="h-4 w-2/3 bg-white/5 rounded" />
                </div>
              </section>

              <section className="space-y-6">
                <div className="h-7 w-40 bg-white/10 rounded-lg" />
                <div className="bg-surface-dark/50 border border-white/5 rounded-2xl p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <div key={idx} className="h-24 bg-white/5 rounded-xl" />
                    ))}
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-8">
              <div className="bg-surface-dark/80 border border-white/5 rounded-2xl p-6 space-y-4">
                <div className="h-6 w-24 bg-white/10 rounded-lg" />
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="flex justify-between border-b border-white/5 pb-4">
                      <div className="h-4 w-16 bg-white/5 rounded" />
                      <div className="h-4 w-24 bg-white/10 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
