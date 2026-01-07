export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb Skeleton */}
      <div className="container mx-auto px-4 py-4">
        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Hero Skeleton */}
      <section className="relative h-[400px] md:h-[500px] bg-gray-200 animate-pulse">
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="container mx-auto">
            <div className="h-8 w-32 bg-gray-300 rounded-full mb-4" />
            <div className="h-12 w-64 bg-gray-300 rounded mb-2" />
            <div className="h-6 w-48 bg-gray-300 rounded" />
          </div>
        </div>
      </section>

      {/* Content Skeleton */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Price Card */}
            <div className="luxury-card-premium rounded-xl p-6 md:p-8 animate-pulse">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                  <div className="h-10 w-40 bg-gray-200 rounded" />
                </div>
                <div className="h-12 w-32 bg-gray-200 rounded-lg" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-4 w-5/6 bg-gray-200 rounded" />
                <div className="h-4 w-4/6 bg-gray-200 rounded" />
              </div>
            </div>

            {/* Product Types Card */}
            <div className="luxury-card-premium rounded-xl p-6 md:p-8 animate-pulse">
              <div className="h-6 w-48 bg-gray-200 rounded mb-6" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 bg-gray-100 rounded-lg">
                    <div className="flex justify-between mb-3">
                      <div className="h-6 w-32 bg-gray-200 rounded" />
                      <div className="h-6 w-40 bg-gray-200 rounded" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-6 w-20 bg-gray-200 rounded-full" />
                      <div className="h-6 w-20 bg-gray-200 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            <div className="luxury-card-premium rounded-xl p-6 animate-pulse">
              <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
              <div className="h-4 w-full bg-gray-200 rounded mb-2" />
              <div className="h-4 w-5/6 bg-gray-200 rounded mb-6" />
              <div className="h-12 w-full bg-gray-200 rounded-lg mb-4" />
              <div className="h-12 w-full bg-gray-200 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
