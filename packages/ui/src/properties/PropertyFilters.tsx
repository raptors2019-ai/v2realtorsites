"use client";

import {
  PropertyFilters as PropertyFiltersType,
  PropertyType,
  SortOption,
  ListingType,
} from "@repo/types";
import { cn } from "@repo/lib";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";

// GTA Region mappings - aggregate Toronto codes into regions
const GTA_REGIONS: Record<string, { display: string; cities: string[] }> = {
  "toronto-central": { display: "Toronto Central", cities: ["Toronto", "Toronto C01", "Toronto C02", "Toronto C03", "Toronto C04", "Toronto C06", "Toronto C07", "Toronto C08", "Toronto C09", "Toronto C10", "Toronto C11", "Toronto C12", "Toronto C13", "Toronto C14", "Toronto C15"] },
  "toronto-east": { display: "Toronto East", cities: ["Toronto E01", "Toronto E02", "Toronto E03", "Toronto E04", "Toronto E05", "Toronto E06", "Toronto E07", "Toronto E08", "Toronto E09", "Toronto E10", "Toronto E11"] },
  "toronto-west": { display: "Toronto West", cities: ["Toronto W01", "Toronto W02", "Toronto W03", "Toronto W04", "Toronto W05", "Toronto W06", "Toronto W07", "Toronto W08", "Toronto W09", "Toronto W10"] },
  "north-york": { display: "North York", cities: ["North York", "Willowdale"] },
  "scarborough": { display: "Scarborough", cities: ["Scarborough"] },
  "etobicoke": { display: "Etobicoke", cities: ["Etobicoke"] },
  "york-region": { display: "York Region", cities: ["Markham", "Richmond Hill", "Vaughan", "Aurora", "Newmarket", "Stouffville", "King", "East Gwillimbury", "Georgina", "Whitchurch-Stouffville"] },
  "peel-region": { display: "Peel Region", cities: ["Mississauga", "Brampton", "Caledon"] },
  "durham-region": { display: "Durham Region", cities: ["Oshawa", "Whitby", "Ajax", "Pickering", "Clarington", "Uxbridge", "Scugog", "Brock"] },
  "halton-region": { display: "Halton Region", cities: ["Oakville", "Burlington", "Milton", "Halton Hills"] },
  "hamilton": { display: "Hamilton", cities: ["Hamilton", "Ancaster", "Dundas", "Stoney Creek", "Flamborough"] },
};

interface PropertyFiltersProps {
  onFilterChange: (filters: PropertyFiltersType) => void;
  onSortChange: (sort: SortOption) => void;
  initialFilters?: PropertyFiltersType;
  initialSort?: SortOption;
  cities?: string[];
  className?: string;
}

export function PropertyFilters({
  onFilterChange,
  onSortChange,
  initialFilters = {},
  initialSort = "price-desc",
  cities = [],
  className,
}: PropertyFiltersProps) {
  const [filters, setFilters] = useState<PropertyFiltersType>(initialFilters);
  const [sortBy, setSortBy] = useState<SortOption>(initialSort);
  const propertyTypes: PropertyType[] = [
    "detached",
    "semi-detached",
    "townhouse",
    "condo",
  ];

  // Price slider state
  const MIN_PRICE = 0;
  const MAX_PRICE = 5000000;
  const PRICE_STEP = 50000;
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.priceRange?.min ?? MIN_PRICE,
    filters.priceRange?.max ?? MAX_PRICE,
  ]);

  // Build available regions from the cities we actually have data for
  // Only show REGION NAMES, not individual Toronto codes
  const availableRegions = useMemo(() => {
    const regions: { key: string; display: string; matchedCities: string[] }[] = [];
    const unmatchedCities: string[] = [];

    // Check which regions have cities in our data
    for (const [key, { display, cities: regionCities }] of Object.entries(GTA_REGIONS)) {
      const matched = cities.filter(city =>
        regionCities.some(rc =>
          city.toLowerCase() === rc.toLowerCase() ||
          city.toLowerCase().startsWith(rc.toLowerCase()) ||
          rc.toLowerCase().startsWith(city.toLowerCase())
        )
      );
      if (matched.length > 0) {
        regions.push({ key, display, matchedCities: matched });
      }
    }

    // Find cities that don't match any region (excluding Toronto codes)
    cities.forEach(city => {
      const isMatched = regions.some(r => r.matchedCities.includes(city));
      if (!isMatched && !city.match(/Toronto [CEW]\d+/i)) {
        unmatchedCities.push(city);
      }
    });

    // Add unmatched as individual options
    unmatchedCities.forEach(city => {
      regions.push({ key: city, display: city, matchedCities: [city] });
    });

    return regions;
  }, [cities]);

  // Track if this is the initial mount to avoid triggering onFilterChange
  const isInitialMount = useRef(true);

  // Notify parent of filter changes via useEffect
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleFilterChange = useCallback((key: keyof PropertyFiltersType, value: unknown) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSortChange = (value: SortOption) => {
    setSortBy(value);
    onSortChange(value);
  };

  const handleClearFilters = () => {
    const clearedFilters: PropertyFiltersType = { listingType: 'sale' };
    setFilters(clearedFilters);
    setSortBy("price-desc");
    setPriceRange([MIN_PRICE, MAX_PRICE]);
    onSortChange("price-desc");
  };

  const handlePriceChange = useCallback((minVal: number, maxVal: number) => {
    const newMin = Math.min(minVal, maxVal);
    const newMax = Math.max(minVal, maxVal);
    setPriceRange([newMin, newMax]);

    const priceFilter = {
      min: newMin > MIN_PRICE ? newMin : undefined,
      max: newMax < MAX_PRICE ? newMax : undefined,
    };

    if (priceFilter.min === undefined && priceFilter.max === undefined) {
      handleFilterChange("priceRange", undefined);
    } else {
      handleFilterChange("priceRange", priceFilter);
    }
  }, [handleFilterChange]);

  // Handle region selection - uses first city from region
  const handleRegionChange = (regionKey: string) => {
    if (!regionKey) {
      handleFilterChange("location", undefined);
      return;
    }
    const region = availableRegions.find(r => r.key === regionKey);
    if (region && region.matchedCities.length > 0) {
      handleFilterChange("location", region.matchedCities[0]);
    }
  };

  // Get current selected region key
  const selectedRegionKey = useMemo(() => {
    if (!filters.location) return "";
    const region = availableRegions.find(r => r.matchedCities.includes(filters.location!));
    return region?.key || "";
  }, [filters.location, availableRegions]);

  // Check if any filters are active (excluding default listingType='sale')
  const hasActiveFilters = Object.keys(filters).some((key) => {
    const value = filters[key as keyof PropertyFiltersType];
    if (key === 'listingType' && value === 'sale') return false;
    return value !== undefined;
  });

  // Calculate slider position percentage
  const getPercent = (value: number) =>
    ((value - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;

  // Format price for display
  const formatPrice = (value: number) => {
    if (value >= 1000000) {
      const m = value / 1000000;
      return `$${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
    }
    return `$${Math.round(value / 1000)}K`;
  };

  const selectClasses = "w-full h-8 px-2 text-xs bg-stone-50 border border-stone-200 rounded focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary transition-all cursor-pointer";

  return (
    <div className={cn("bg-white rounded-lg shadow-sm border border-stone-200", className)}>
      <div className="p-3">
        {/* Row 1: Basic Filters */}
        <div className="flex flex-wrap items-end gap-2 mb-3">
          {/* Listing Type */}
          <div className="w-[70px]">
            <label className="block text-[9px] text-stone-500 mb-1 uppercase tracking-wide font-medium">Type</label>
            <select
              value={filters.listingType || ""}
              onChange={(e) => handleFilterChange("listingType", e.target.value ? (e.target.value as ListingType) : undefined)}
              className={selectClasses}
            >
              <option value="">All</option>
              <option value="sale">Sale</option>
              <option value="lease">Lease</option>
            </select>
          </div>

          {/* Property Type */}
          <div className="w-[90px]">
            <label className="block text-[9px] text-stone-500 mb-1 uppercase tracking-wide font-medium">Property</label>
            <select
              value={filters.type?.[0] || ""}
              onChange={(e) => handleFilterChange("type", e.target.value ? [e.target.value as PropertyType] : undefined)}
              className={selectClasses}
            >
              <option value="">All</option>
              {propertyTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Area - Clean region names ONLY (no Toronto codes) */}
          <div className="w-[130px]">
            <label className="block text-[9px] text-stone-500 mb-1 uppercase tracking-wide font-medium">Area</label>
            <select
              value={selectedRegionKey}
              onChange={(e) => handleRegionChange(e.target.value)}
              className={selectClasses}
            >
              <option value="">All Areas</option>
              {availableRegions.map((region) => (
                <option key={region.key} value={region.key}>
                  {region.display}
                </option>
              ))}
            </select>
          </div>

          {/* Beds */}
          <div className="w-[60px]">
            <label className="block text-[9px] text-stone-500 mb-1 uppercase tracking-wide font-medium">Beds</label>
            <select
              value={filters.bedrooms || ""}
              onChange={(e) => handleFilterChange("bedrooms", e.target.value ? parseInt(e.target.value) : undefined)}
              className={selectClasses}
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>

          {/* Baths */}
          <div className="w-[60px]">
            <label className="block text-[9px] text-stone-500 mb-1 uppercase tracking-wide font-medium">Baths</label>
            <select
              value={filters.bathrooms || ""}
              onChange={(e) => handleFilterChange("bathrooms", e.target.value ? parseInt(e.target.value) : undefined)}
              className={selectClasses}
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
            </select>
          </div>

          {/* Sort */}
          <div className="w-[75px]">
            <label className="block text-[9px] text-stone-500 mb-1 uppercase tracking-wide font-medium">Sort</label>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className={selectClasses}
            >
              <option value="price-desc">Price ↓</option>
              <option value="price-asc">Price ↑</option>
              <option value="latest">New</option>
            </select>
          </div>

          {/* Clear */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="h-8 px-2 text-[10px] font-medium text-stone-500 hover:text-primary transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Row 2: Price Range Slider with Floating Labels */}
        <div className="pt-3 border-t border-stone-100">
          <div className="flex items-center gap-3">
            <label className="text-[9px] text-stone-500 uppercase tracking-wide font-medium shrink-0">Price</label>

            {/* Price Slider Container */}
            <div className="flex-1 relative pt-6 pb-1">
              {/* Floating Min Label */}
              <div
                className="absolute top-0 transform -translate-x-1/2 pointer-events-none transition-all"
                style={{ left: `${Math.max(8, Math.min(92, getPercent(priceRange[0])))}%` }}
              >
                <div className="bg-stone-700 text-white text-[10px] font-medium px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                  {formatPrice(priceRange[0])}
                </div>
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-stone-700 mx-auto" />
              </div>

              {/* Floating Max Label */}
              <div
                className="absolute top-0 transform -translate-x-1/2 pointer-events-none transition-all"
                style={{ left: `${Math.max(8, Math.min(92, getPercent(priceRange[1])))}%` }}
              >
                <div className="bg-stone-700 text-white text-[10px] font-medium px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                  {formatPrice(priceRange[1])}{priceRange[1] >= MAX_PRICE && "+"}
                </div>
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-stone-700 mx-auto" />
              </div>

              {/* Slider Track */}
              <div className="relative h-5 flex items-center">
                {/* Background Track */}
                <div className="absolute w-full h-1.5 bg-stone-200 rounded-full" />

                {/* Active Track with Gradient */}
                <div
                  className="absolute h-1.5 rounded-full"
                  style={{
                    left: `${getPercent(priceRange[0])}%`,
                    width: `${getPercent(priceRange[1]) - getPercent(priceRange[0])}%`,
                    background: 'linear-gradient(to right, #22c55e, #84cc16, #eab308, #f97316, #ef4444)',
                  }}
                />

                {/* Min Range Input */}
                <input
                  type="range"
                  min={MIN_PRICE}
                  max={MAX_PRICE}
                  step={PRICE_STEP}
                  value={priceRange[0]}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value <= priceRange[1]) handlePriceChange(value, priceRange[1]);
                  }}
                  className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none z-10
                    [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-stone-400
                    [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-all
                    [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:hover:border-primary
                    [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none
                    [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-stone-400
                    [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
                />

                {/* Max Range Input */}
                <input
                  type="range"
                  min={MIN_PRICE}
                  max={MAX_PRICE}
                  step={PRICE_STEP}
                  value={priceRange[1]}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value >= priceRange[0]) handlePriceChange(priceRange[0], value);
                  }}
                  className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none z-20
                    [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-stone-400
                    [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-all
                    [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:hover:border-primary
                    [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none
                    [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-stone-400
                    [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
                />
              </div>

              {/* Scale Labels */}
              <div className="flex justify-between text-[9px] text-stone-400 mt-0.5 px-1">
                <span>$0</span>
                <span>$5M+</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
