export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb Skeleton */}
      <div className="container mx-auto px-4 py-4">
        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Skeleton */}
            <div className="aspect-[16/10] rounded-xl bg-gray-200 animate-pulse" />

            {/* Details Skeleton */}
            <div className="luxury-card-premium rounded-xl p-8 animate-pulse">
              <div className="h-9 w-3/4 bg-gray-200 rounded mb-4" />
              <div className="h-5 w-2/3 bg-gray-200 rounded mb-8" />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-y border-gray-200">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="text-center">
                    <div className="h-8 w-12 bg-gray-200 rounded mx-auto mb-2" />
                    <div className="h-4 w-16 bg-gray-200 rounded mx-auto" />
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3">
                <div className="h-6 w-1/4 bg-gray-200 rounded" />
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-4 w-5/6 bg-gray-200 rounded" />
                <div className="h-4 w-4/6 bg-gray-200 rounded" />
              </div>

              <div className="mt-6">
                <div className="h-4 w-24 bg-gray-200 rounded" />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            <div className="luxury-card-premium rounded-xl p-6 animate-pulse">
              <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
              <div className="h-10 w-40 bg-gray-200 rounded mb-6" />
              <div className="h-14 w-full bg-gray-200 rounded-lg mb-4" />
              <div className="h-14 w-full bg-gray-200 rounded-lg" />

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="h-4 w-28 bg-gray-200 rounded mb-4" />
                <div className="h-5 w-36 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Properties Skeleton */}
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-4">
          <div className="h-8 w-48 bg-gray-200 rounded mb-8 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="luxury-card-premium rounded-xl overflow-hidden animate-pulse">
                <div className="h-60 bg-gray-200" />
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
