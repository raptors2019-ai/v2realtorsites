"use client";

interface PropertyListing {
  id: string;
  title: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  city: string;
  address: string;
  image?: string;
}

interface ListingsDisplayStepProps {
  listings: PropertyListing[];
  onContinue: () => void;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function ListingsDisplayStep({ listings, onContinue }: ListingsDisplayStepProps) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <p className="text-sm font-medium text-stone-800 mb-1">
          Here are 3 properties matching your criteria:
        </p>
      </div>

      {/* Display 3 compact property cards */}
      <div className="space-y-3">
        {listings.slice(0, 3).map((property) => (
          <div key={property.id} className="flex gap-3 p-2 bg-stone-50 rounded-lg">
            <div className="w-20 h-16 bg-gradient-to-br from-stone-200 to-stone-300 rounded flex items-center justify-center shrink-0">
              {property.image ? (
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-20 h-16 object-cover rounded"
                />
              ) : (
                <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-stone-800 truncate">
                {formatPrice(property.price)}
              </p>
              <p className="text-xs text-stone-600 truncate">
                {property.bedrooms} bed | {property.bathrooms} bath | {property.city}
              </p>
              <p className="text-xs text-stone-500 truncate">{property.address}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onContinue}
        className="w-full py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#c9a962] to-[#b8944d] text-white shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
      >
        Save These & Get Similar Listings
      </button>
    </div>
  );
}
