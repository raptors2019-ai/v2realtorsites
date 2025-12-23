"use client";

import {
  Property,
  PropertyFilters as PropertyFiltersType,
  SortOption,
} from "@repo/types";
import { filterProperties, sortProperties } from "@repo/lib";
import { useState } from "react";
import { PropertyFilters as PropertyFiltersComponent } from "./PropertyFilters";
import { PropertyGrid } from "./PropertyGrid";

interface PropertiesPageClientProps {
  initialProperties: Property[];
  total: number;
}

export function PropertiesPageClient({
  initialProperties,
  total,
}: PropertiesPageClientProps) {
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [offset, setOffset] = useState(initialProperties.length);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialProperties.length < total);

  const [filters, setFilters] = useState<PropertyFiltersType>({});
  const [sortBy, setSortBy] = useState<SortOption>("latest");

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    try {
      const response = await fetch(`/api/properties?limit=20&offset=${offset}`);
      const data = await response.json();

      if (data.success && data.properties?.length) {
        setProperties(prev => [...prev, ...data.properties]);
        setOffset(prev => prev + data.properties.length);
        setHasMore(offset + data.properties.length < total);
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
      />

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-text-secondary text-sm">
          Showing{" "}
          <span className="font-semibold text-secondary">
            {displayedProperties.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-secondary">
            {total.toLocaleString()}
          </span>{" "}
          properties
        </p>
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
