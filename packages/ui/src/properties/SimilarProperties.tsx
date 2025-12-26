"use client";

import { Property } from "@repo/types";
import { PropertyCard } from "./PropertyCard";
import { useEffect, useState } from "react";

interface SimilarPropertiesProps {
  currentProperty: Property;
  initialSimilar: Property[];
  citySlug: string;
}

const STORAGE_KEY = 'propertyPreferences';

export function SimilarProperties({
  currentProperty,
  initialSimilar,
  citySlug
}: SimilarPropertiesProps) {
  const [similar, setSimilar] = useState<Property[]>(initialSimilar);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Try to fetch smarter recommendations based on user preferences
    const fetchWithPreferences = async () => {
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (!stored) return; // No preferences, use initial similar properties

        const preferences = JSON.parse(stored);

        // Build preferences object from stored data
        const userPrefs = {
          cities: preferences.filters?.locations || preferences.survey?.locations || [],
          priceMin: preferences.filters?.priceRange?.min,
          priceMax: preferences.filters?.priceRange?.max,
          listingType: preferences.filters?.listingType ||
                       (preferences.survey?.listingType ? [preferences.survey.listingType] : []),
          propertyTypes: preferences.filters?.type || [],
          bedrooms: preferences.filters?.bedrooms || [],
          bathrooms: preferences.filters?.bathrooms || [],
        };

        // Only fetch if we have meaningful preferences
        if (userPrefs.cities.length === 0 && !userPrefs.priceMin && !userPrefs.priceMax) {
          return; // Use initial similar properties
        }

        setIsLoading(true);

        // Fetch similar properties with preferences
        const params = new URLSearchParams({
          propertyId: currentProperty.id,
          limit: '5',
        });

        if (userPrefs.cities.length > 0) {
          params.set('cities', userPrefs.cities.join(','));
        }
        if (userPrefs.priceMin) params.set('priceMin', String(userPrefs.priceMin));
        if (userPrefs.priceMax) params.set('priceMax', String(userPrefs.priceMax));
        if (userPrefs.listingType.length > 0) {
          params.set('listingType', userPrefs.listingType.join(','));
        }
        if (userPrefs.propertyTypes.length > 0) {
          params.set('propertyTypes', userPrefs.propertyTypes.join(','));
        }
        if (userPrefs.bedrooms.length > 0) {
          params.set('bedrooms', userPrefs.bedrooms.join(','));
        }
        if (userPrefs.bathrooms.length > 0) {
          params.set('bathrooms', userPrefs.bathrooms.join(','));
        }

        const response = await fetch(`/api/similar-properties?${params.toString()}`);
        const data = await response.json();

        if (data.success && data.properties) {
          setSimilar(data.properties);
          console.log('[similar.preferences.applied]', {
            count: data.properties.length,
            preferences: userPrefs,
          });
        }
      } catch (error) {
        console.error('[similar.fetch.error]', error);
        // Keep initial similar properties on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchWithPreferences();
  }, [currentProperty.id]);

  if (similar.length === 0) return null;

  return (
    <section className="py-16 bg-cream">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-secondary">
            Similar Properties{similar.length > 0 && ` (${similar.length})`}
          </h2>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-text-secondary">
            Finding better matches...
          </div>
        ) : (
          <>
            {/* Mobile: Horizontal scroll */}
            <div className="md:hidden overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory">
              <div className="flex gap-4 w-max">
                {similar.map((p, index) => (
                  <div key={p.id} className="w-[85vw] max-w-sm snap-center">
                    <PropertyCard property={p} citySlug={citySlug} index={index} />
                  </div>
                ))}
              </div>
              {similar.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {similar.map((_, index) => (
                    <div key={index} className="w-2 h-2 rounded-full bg-primary/30" />
                  ))}
                </div>
              )}
            </div>

            {/* Desktop: Grid */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similar.map((p) => (
                <PropertyCard key={p.id} property={p} citySlug={citySlug} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
