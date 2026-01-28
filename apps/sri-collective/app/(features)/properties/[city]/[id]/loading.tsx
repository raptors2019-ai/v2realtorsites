export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb Skeleton */}
      <div className="container mx-auto px-4 py-4">
        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Mobile: Full-bleed Gallery Skeleton */}
      <div className="lg:hidden">
        <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Desktop Gallery Skeleton */}
            <div className="hidden lg:block aspect-[16/10] rounded-xl bg-gray-200 animate-pulse" />

            {/* Mobile: Horizontal Stats Bar Skeleton */}
            <div className="lg:hidden overflow-x-auto -mx-4 px-4">
              <div className="flex gap-4 w-max">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-24 h-20 rounded-xl bg-gray-200 animate-pulse" />
                ))}
              </div>
            </div>

            {/* Mobile CTA Skeleton */}
            <div className="lg:hidden luxury-card-premium rounded-xl p-5 animate-pulse">
              <div className="h-14 w-full bg-gray-200 rounded-lg mb-3" />
              <div className="h-14 w-full bg-gray-200 rounded-lg" />
            </div>

            {/* Details Card Skeleton */}
            <div className="luxury-card-premium rounded-xl p-5 md:p-8 animate-pulse">
              <div className="h-8 w-3/4 bg-gray-200 rounded mb-4" />
              <div className="h-5 w-2/3 bg-gray-200 rounded mb-6" />

              {/* Share Buttons Skeleton */}
              <div className="flex gap-2 mb-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-10 h-10 bg-gray-200 rounded-full" />
                ))}
              </div>

              {/* Highlights Skeleton */}
              <div className="mb-6">
                <div className="h-4 w-32 bg-gray-200 rounded mb-3" />
                <div className="flex gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-8 w-24 bg-gray-200 rounded-full" />
                  ))}
                </div>
              </div>

              {/* Desktop Stats Grid Skeleton */}
              <div className="hidden lg:grid grid-cols-4 gap-4 py-6 border-y border-gray-200">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="text-center">
                    <div className="h-8 w-12 bg-gray-200 rounded mx-auto mb-2" />
                    <div className="h-4 w-16 bg-gray-200 rounded mx-auto" />
                  </div>
                ))}
              </div>

              {/* Description Skeleton */}
              <div className="mt-6 space-y-3">
                <div className="h-6 w-1/3 bg-gray-200 rounded" />
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-4 w-5/6 bg-gray-200 rounded" />
                <div className="h-4 w-4/6 bg-gray-200 rounded" />
              </div>

              {/* Listing Details Skeleton */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
                <div className="grid grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i}>
                      <div className="h-3 w-16 bg-gray-200 rounded mb-1" />
                      <div className="h-5 w-24 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Agent Card Skeleton */}
            <div className="lg:hidden luxury-card-premium rounded-xl p-5 animate-pulse">
              <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
              <div className="h-16 w-full bg-gray-200 rounded-lg" />
            </div>
          </div>

          {/* Right Column - Desktop Only */}
          <div className="hidden lg:block">
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
          <div className="flex items-center justify-between mb-8">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="hidden sm:block h-5 w-36 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Mobile: Horizontal scroll skeleton */}
          <div className="md:hidden overflow-x-auto -mx-4 px-4">
            <div className="flex gap-4 w-max">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-[85vw] max-w-sm luxury-card-premium rounded-xl overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop: Grid skeleton */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
