"use client";

import { Property } from "@repo/types";
import { PropertyCard } from "./PropertyCard";
import { ScrollProgressDots } from "./ScrollProgressDots";
import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";

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
  const [activeScrollIndex, setActiveScrollIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Track scroll position to update active dot
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || similar.length === 0) return;

    const scrollLeft = container.scrollLeft;
    const itemWidth = container.scrollWidth / similar.length;
    const newIndex = Math.round(scrollLeft / itemWidth);
    setActiveScrollIndex(Math.min(newIndex, similar.length - 1));
  }, [similar.length]);

  // Scroll to specific item when dot is clicked
  const scrollToIndex = useCallback((index: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const itemWidth = container.scrollWidth / similar.length;
    container.scrollTo({
      left: itemWidth * index,
      behavior: "smooth",
    });
  }, [similar.length]);

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

  // Empty state with explore CTA
  if (similar.length === 0) {
    return (
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-secondary mb-4">
            Explore More Properties
          </h2>
          <p className="text-text-secondary mb-6">
            Discover other listings in {currentProperty.city} and surrounding areas.
          </p>
          <Link
            href={`/properties/${citySlug}`}
            className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-lg"
          >
            View All in {currentProperty.city}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-cream">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-secondary">
            Similar Properties
          </h2>
          <Link
            href={`/properties/${citySlug}`}
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            See all in {currentProperty.city}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-text-secondary">
            Finding better matches...
          </div>
        ) : (
          <>
            {/* Mobile: Horizontal scroll with scroll tracking */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="md:hidden overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide"
            >
              <div className="flex gap-4 w-max">
                {similar.map((p, index) => (
                  <div key={p.id} className="w-[85vw] max-w-sm snap-center">
                    <PropertyCard property={p} citySlug={citySlug} index={index} />
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile scroll indicators (tappable) */}
            {similar.length > 1 && (
              <div className="md:hidden mt-4">
                <ScrollProgressDots
                  total={similar.length}
                  activeIndex={activeScrollIndex}
                  onDotClick={scrollToIndex}
                />
              </div>
            )}

            {/* Mobile: See all link */}
            <div className="flex justify-center mt-4 sm:hidden">
              <Link
                href={`/properties/${citySlug}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                See all in {currentProperty.city}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
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
