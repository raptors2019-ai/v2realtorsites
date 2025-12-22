export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Skeleton */}
      <section className="py-16 bg-gradient-to-b from-cream to-white">
        <div className="container mx-auto px-4 text-center">
          <div className="h-1 w-16 bg-gray-200 rounded mx-auto mb-6 animate-pulse" />
          <div className="h-12 w-80 bg-gray-200 rounded mx-auto mb-4 animate-pulse" />
          <div className="h-6 w-96 max-w-full bg-gray-200 rounded mx-auto animate-pulse" />
        </div>
      </section>

      {/* Filters Skeleton */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="luxury-card rounded-xl p-6 mb-8 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              {[...Array(5)].map((_, i) => (
                <div key={i}>
                  <div className="h-3 w-20 bg-gray-200 rounded mb-2" />
                  <div className="h-12 bg-gray-200 rounded-lg" />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
              <div className="h-3 w-12 bg-gray-200 rounded" />
              <div className="h-10 w-32 bg-gray-200 rounded-lg" />
              <div className="h-3 w-4 bg-gray-200 rounded" />
              <div className="h-10 w-32 bg-gray-200 rounded-lg" />
            </div>
          </div>

          {/* Results Count Skeleton */}
          <div className="flex items-center justify-between mb-6">
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Property Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="luxury-card-premium rounded-xl overflow-hidden animate-pulse">
                <div className="h-60 bg-gray-200" />
                <div className="p-6 space-y-3">
                  <div className="flex justify-between">
                    <div className="h-7 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-16" />
                  </div>
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex gap-4">
                      <div className="h-8 w-16 bg-gray-200 rounded" />
                      <div className="h-8 w-16 bg-gray-200 rounded" />
                      <div className="h-8 w-20 bg-gray-200 rounded" />
                    </div>
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
