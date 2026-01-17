export default function ToolsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Skeleton */}
      <section className="bg-gradient-to-br from-[#0a1628] to-[#1a2d4d] py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="h-4 bg-white/20 rounded w-32 mx-auto mb-4 animate-pulse" />
            <div className="h-12 bg-white/20 rounded w-80 mx-auto mb-6 animate-pulse" />
            <div className="h-6 bg-white/10 rounded w-full max-w-xl mx-auto animate-pulse" />
          </div>
        </div>
      </section>

      {/* Calculator Grid Skeleton */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse"
              >
                <div className="h-12 w-12 bg-slate-200 rounded-lg mb-4" />
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-slate-100 rounded w-full mb-4" />
                <div className="h-10 bg-slate-100 rounded w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
