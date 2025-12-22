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
}

export function PropertiesPageClient({
  initialProperties,
}: PropertiesPageClientProps) {
  const [filters, setFilters] = useState<PropertyFiltersType>({});
  const [sortBy, setSortBy] = useState<SortOption>("latest");

  // Apply filters and sorting
  let displayedProperties = filterProperties(initialProperties, filters);
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
            {initialProperties.length}
          </span>{" "}
          properties
        </p>
      </div>

      {/* Properties Grid */}
      <PropertyGrid properties={displayedProperties} />
    </div>
  );
}
