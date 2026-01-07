export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Skeleton */}
      <section className="py-16 bg-gradient-to-b from-cream to-white">
        <div className="container mx-auto px-4 text-center">
          <div className="h-1 w-12 bg-gray-200 rounded-full mx-auto mb-6 animate-pulse" />
          <div className="h-12 w-96 max-w-full bg-gray-200 rounded-lg mx-auto mb-4 animate-pulse" />
          <div className="h-6 w-80 max-w-full bg-gray-200 rounded mx-auto animate-pulse" />

          {/* Stats Skeleton */}
          <div className="flex justify-center gap-12 mt-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center animate-pulse">
                <div className="h-8 w-12 bg-gray-200 rounded mx-auto mb-2" />
                <div className="h-4 w-20 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grid Skeleton */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="luxury-card-premium rounded-xl overflow-hidden animate-pulse"
              >
                <div className="h-56 md:h-64 bg-gray-200" />
                <div className="p-5 md:p-6 space-y-3">
                  <div className="h-7 w-3/4 bg-gray-200 rounded" />
                  <div className="h-5 w-1/2 bg-gray-200 rounded" />
                  <div className="flex gap-2">
                    <div className="h-6 w-20 bg-gray-200 rounded-full" />
                    <div className="h-6 w-20 bg-gray-200 rounded-full" />
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div className="h-8 w-28 bg-gray-200 rounded" />
                    <div className="h-10 w-24 bg-gray-200 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
