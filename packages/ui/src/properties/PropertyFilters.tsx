"use client";

import {
  PropertyFilters as PropertyFiltersType,
  PropertyType,
  SortOption,
} from "@repo/types";
import { cn } from "@repo/lib";
import { useState } from "react";

interface PropertyFiltersProps {
  onFilterChange: (filters: PropertyFiltersType) => void;
  onSortChange: (sort: SortOption) => void;
  initialFilters?: PropertyFiltersType;
  initialSort?: SortOption;
  className?: string;
}

export function PropertyFilters({
  onFilterChange,
  onSortChange,
  initialFilters = {},
  initialSort = "latest",
  className,
}: PropertyFiltersProps) {
  const [filters, setFilters] = useState<PropertyFiltersType>(initialFilters);
  const [sortBy, setSortBy] = useState<SortOption>(initialSort);

  // Cities should be passed as a prop from the app level
  const cities: string[] = [];
  const propertyTypes: PropertyType[] = [
    "detached",
    "semi-detached",
    "townhouse",
    "condo",
  ];

  const handleFilterChange = (key: keyof PropertyFiltersType, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = (value: SortOption) => {
    setSortBy(value);
    onSortChange(value);
  };

  const handleClearFilters = () => {
    const clearedFilters: PropertyFiltersType = {};
    setFilters(clearedFilters);
    setSortBy("latest");
    onFilterChange(clearedFilters);
    onSortChange("latest");
  };

  const hasActiveFilters = Object.keys(filters).some(
    (key) => filters[key as keyof PropertyFiltersType] !== undefined
  );

  const selectClasses =
    "w-full px-4 py-3 text-sm text-[#0a1628] bg-white border border-[#e7e5e4] rounded-lg focus:outline-none focus:border-[#dc2626]/50 focus:ring-1 focus:ring-[#dc2626]/20 appearance-none cursor-pointer transition-all";
  const inputClasses =
    "w-32 px-3 py-2.5 text-sm text-[#0a1628] bg-white border border-[#e7e5e4] rounded-lg focus:outline-none focus:border-[#dc2626]/50 focus:ring-1 focus:ring-[#dc2626]/20 placeholder:text-[#a8a29e] transition-all";

  return (
    <div className={cn("luxury-card rounded-xl", className)}>
      {/* Main Filters Row */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          {/* Property Type Dropdown */}
          <div>
            <label className="block text-xs text-[#57534e] mb-2 uppercase tracking-wider font-medium">
              Property Type
            </label>
            <select
              value={filters.type?.[0] || ""}
              onChange={(e) =>
                handleFilterChange(
                  "type",
                  e.target.value ? [e.target.value as PropertyType] : undefined
                )
              }
              className={selectClasses}
            >
              <option value="">All Types</option>
              {propertyTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs text-[#57534e] mb-2 uppercase tracking-wider font-medium">
              City
            </label>
            <select
              value={filters.location || ""}
              onChange={(e) =>
                handleFilterChange("location", e.target.value || undefined)
              }
              className={selectClasses}
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Bedrooms */}
          <div>
            <label className="block text-xs text-[#57534e] mb-2 uppercase tracking-wider font-medium">
              Bedrooms
            </label>
            <select
              value={filters.bedrooms || ""}
              onChange={(e) =>
                handleFilterChange(
                  "bedrooms",
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
              className={selectClasses}
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
          </div>

          {/* Bathrooms */}
          <div>
            <label className="block text-xs text-[#57534e] mb-2 uppercase tracking-wider font-medium">
              Bathrooms
            </label>
            <select
              value={filters.bathrooms || ""}
              onChange={(e) =>
                handleFilterChange(
                  "bathrooms",
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
              className={selectClasses}
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-xs text-[#57534e] mb-2 uppercase tracking-wider font-medium">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className={selectClasses}
            >
              <option value="latest">Latest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="featured">Featured First</option>
            </select>
          </div>
        </div>

        {/* Price Range & More Filters Toggle */}
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-[#e7e5e4]">
          {/* Price Range Inputs */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#57534e] uppercase tracking-wider font-medium">
              Price:
            </span>
            <input
              type="number"
              placeholder="Min"
              value={filters.priceRange?.min || ""}
              onChange={(e) =>
                handleFilterChange("priceRange", {
                  ...filters.priceRange,
                  min: e.target.value ? parseInt(e.target.value) : undefined,
                  max: filters.priceRange?.max || 10000000,
                })
              }
              className={inputClasses}
            />
            <span className="text-[#a8a29e]">-</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.priceRange?.max || ""}
              onChange={(e) =>
                handleFilterChange("priceRange", {
                  min: filters.priceRange?.min || 0,
                  max: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              className={inputClasses}
            />
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="btn-outline px-4 py-2 rounded-lg text-xs uppercase tracking-wider font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
