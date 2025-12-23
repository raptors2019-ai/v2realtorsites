"use client";

import {
  Property,
  PropertyFilters as PropertyFiltersType,
  SortOption,
} from "@repo/types";
import { filterProperties, sortProperties } from "@repo/lib";
import { useState, useMemo } from "react";
import { PropertyFilters as PropertyFiltersComponent } from "./PropertyFilters";
import { PropertyGrid } from "./PropertyGrid";

interface PropertiesPageClientProps {
  initialProperties: Property[];
  initialCities?: string[];
  total: number;
}

export function PropertiesPageClient({
  initialProperties,
  initialCities = [],
  total,
}: PropertiesPageClientProps) {
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [offset, setOffset] = useState(initialProperties.length);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialProperties.length < total);

  // Default to showing "For Sale" properties only
  const [filters, setFilters] = useState<PropertyFiltersType>({ listingType: 'sale' });
  const [sortBy, setSortBy] = useState<SortOption>("price-desc");

  // Build cities list from initial cities + any new ones from loaded properties
  const cities = useMemo(() => {
    const citySet = new Set(initialCities);
    properties.forEach(p => {
      if (p.city) citySet.add(p.city);
    });
    return Array.from(citySet).sort();
  }, [initialCities, properties]);

  // Cap max loaded properties for performance (users should use filters for large datasets)
  const MAX_LOADED_PROPERTIES = 200;

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    try {
      const response = await fetch(`/api/properties?limit=20&offset=${offset}`);
      const data = await response.json();

      if (data.success && data.properties?.length) {
        setProperties(prev => [...prev, ...data.properties]);
        const newOffset = offset + data.properties.length;
        setOffset(newOffset);
        // Stop loading if we hit the cap or no more properties
        setHasMore(newOffset < total && newOffset < MAX_LOADED_PROPERTIES);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('[properties.loadMore.error]', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Apply filters and sorting to all loaded properties
  let displayedProperties = filterProperties(properties, filters);
  displayedProperties = sortProperties(displayedProperties, sortBy);

  return (
    <div className="space-y-6">
      {/* Horizontal Filters */}
      <PropertyFiltersComponent
        onFilterChange={setFilters}
        onSortChange={setSortBy}
        initialFilters={filters}
        initialSort={sortBy}
        cities={cities}
      />

      {/* Results Count & Filter Hint */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-text-secondary text-sm">
          Showing{" "}
          <span className="font-semibold text-secondary">
            {displayedProperties.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-secondary">
            {total >= 1000 ? `${Math.floor(total / 1000)}K+` : total.toLocaleString()}
          </span>{" "}
          {total >= 1000 ? "available properties" : "properties"}
        </p>
        {total > 1000 && !Object.keys(filters).some(k => {
          const val = filters[k as keyof typeof filters];
          if (k === 'listingType' && val === 'sale') return false;
          return val !== undefined;
        }) && (
          <p className="text-xs text-primary/80 italic">
            Use filters to narrow results
          </p>
        )}
      </div>

      {/* Properties Grid */}
      <PropertyGrid
        properties={displayedProperties}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={handleLoadMore}
      />
    </div>
  );
}
