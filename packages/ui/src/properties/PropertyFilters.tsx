"use client";

import {
  PropertyFilters as PropertyFiltersType,
  PropertyType,
  SortOption,
  ListingType,
} from "@repo/types";
import { cn } from "@repo/lib";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";

// Toronto region mappings - maps display name to all city codes in that region
const TORONTO_REGIONS: Record<string, string[]> = {
  "Toronto Central": ["Toronto", "Toronto C01", "Toronto C02", "Toronto C03", "Toronto C04", "Toronto C06", "Toronto C07", "Toronto C08", "Toronto C09", "Toronto C10", "Toronto C11", "Toronto C12", "Toronto C13", "Toronto C14", "Toronto C15"],
  "Toronto East": ["Toronto E01", "Toronto E02", "Toronto E03", "Toronto E04", "Toronto E05", "Toronto E06", "Toronto E07", "Toronto E08", "Toronto E09", "Toronto E10", "Toronto E11"],
  "Toronto West": ["Toronto W01", "Toronto W02", "Toronto W03", "Toronto W04", "Toronto W05", "Toronto W06", "Toronto W07", "Toronto W08", "Toronto W09", "Toronto W10"],
  "North York": ["North York", "Willowdale"],
  "Scarborough": ["Scarborough"],
  "Etobicoke": ["Etobicoke"],
};

// Other GTA regions
const GTA_REGIONS: Record<string, string[]> = {
  "York Region": ["Markham", "Richmond Hill", "Vaughan", "Aurora", "Newmarket", "Stouffville", "King", "East Gwillimbury", "Georgina", "Whitchurch-Stouffville"],
  "Peel Region": ["Mississauga", "Brampton", "Caledon"],
  "Durham Region": ["Oshawa", "Whitby", "Ajax", "Pickering", "Clarington", "Uxbridge", "Scugog", "Brock"],
  "Halton Region": ["Oakville", "Burlington", "Milton", "Halton Hills"],
  "Hamilton Area": ["Hamilton", "Ancaster", "Dundas", "Stoney Creek", "Flamborough"],
};

interface AreaOption {
  label: string;
  value: string; // Single city or region name
  cities: string[]; // All cities this option represents
  isRegion: boolean;
  isHeader?: boolean;
}

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
  const propertyTypes: PropertyType[] = ["detached", "semi-detached", "townhouse", "condo"];

  // Price range state
  const MIN_PRICE = 0;
  const MAX_PRICE = 5000000;
  const STEP = 50000;
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.priceRange?.min ?? MIN_PRICE,
    filters.priceRange?.max ?? MAX_PRICE,
  ]);

  // Build area options from available cities
  const areaOptions = useMemo(() => {
    const options: AreaOption[] = [];
    const citySet = new Set(cities.map(c => c.toLowerCase()));
    const usedCities = new Set<string>();

    // Helper to get matching cities from a list
    const getMatchingCities = (cityList: string[]) =>
      cityList.filter(c => citySet.has(c.toLowerCase()));

    // Toronto Areas
    const torontoOptions: AreaOption[] = [];
    Object.entries(TORONTO_REGIONS).forEach(([regionName, regionCities]) => {
      const matching = getMatchingCities(regionCities);
      if (matching.length > 0) {
        matching.forEach(c => usedCities.add(c.toLowerCase()));
        // If region has multiple cities, show as region. If single, show city directly.
        if (matching.length > 1 || regionName === "Toronto Central") {
          torontoOptions.push({
            label: regionName,
            value: regionName,
            cities: matching,
            isRegion: true,
          });
        } else {
          // Single city - show it directly without region wrapper
          torontoOptions.push({
            label: matching[0],
            value: matching[0],
            cities: matching,
            isRegion: false,
          });
        }
      }
    });

    if (torontoOptions.length > 0) {
      options.push({ label: "── Toronto ──", value: "", cities: [], isRegion: false, isHeader: true });
      options.push(...torontoOptions);
    }

    // GTA Regions
    Object.entries(GTA_REGIONS).forEach(([regionName, regionCities]) => {
      const matching = getMatchingCities(regionCities);
      if (matching.length > 0) {
        matching.forEach(c => usedCities.add(c.toLowerCase()));

        if (matching.length > 1) {
          // Multiple cities - show region header then individual cities OR just region
          options.push({ label: `── ${regionName} ──`, value: "", cities: [], isRegion: false, isHeader: true });
          // Add "All [Region]" option
          options.push({
            label: `All ${regionName}`,
            value: regionName,
            cities: matching,
            isRegion: true,
          });
          // Add individual cities
          matching.forEach(city => {
            options.push({
              label: city,
              value: city,
              cities: [city],
              isRegion: false,
            });
          });
        } else {
          // Single city - just add it directly (no region header needed)
          options.push({
            label: matching[0],
            value: matching[0],
            cities: matching,
            isRegion: false,
          });
        }
      }
    });

    // Other cities not in any region
    const otherCities = cities.filter(c =>
      !usedCities.has(c.toLowerCase()) &&
      !c.match(/Toronto [CEW]\d+/i) // Exclude raw Toronto codes
    );

    if (otherCities.length > 0) {
      options.push({ label: "── Other ──", value: "", cities: [], isRegion: false, isHeader: true });
      otherCities.forEach(city => {
        options.push({
          label: city,
          value: city,
          cities: [city],
          isRegion: false,
        });
      });
    }

    return options;
  }, [cities]);

  // Track selected area option
  const [selectedArea, setSelectedArea] = useState<string>("");

  // Track initial mount
  const isInitialMount = useRef(true);

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
    setFilters({ listingType: 'sale' });
    setSortBy("price-desc");
    setPriceRange([MIN_PRICE, MAX_PRICE]);
    setSelectedArea("");
    onSortChange("price-desc");
  };

  const handleAreaChange = (value: string) => {
    setSelectedArea(value);

    if (!value) {
      // Clear location filters
      handleFilterChange("location", undefined);
      handleFilterChange("locations", undefined);
      return;
    }

    // Find the selected option
    const option = areaOptions.find(o => o.value === value);
    if (!option) return;

    if (option.cities.length === 1) {
      // Single city
      handleFilterChange("location", option.cities[0]);
      handleFilterChange("locations", undefined);
    } else {
      // Multiple cities (region)
      handleFilterChange("location", undefined);
      handleFilterChange("locations", option.cities);
    }
  };

  const handlePriceRangeChange = useCallback((index: 0 | 1, value: number) => {
    const newRange: [number, number] = [...priceRange] as [number, number];
    newRange[index] = value;

    if (index === 0 && value > priceRange[1]) newRange[1] = value;
    if (index === 1 && value < priceRange[0]) newRange[0] = value;

    setPriceRange(newRange);

    const priceFilter = {
      min: newRange[0] > MIN_PRICE ? newRange[0] : undefined,
      max: newRange[1] < MAX_PRICE ? newRange[1] : undefined,
    };

    handleFilterChange("priceRange", priceFilter.min || priceFilter.max ? priceFilter : undefined);
  }, [priceRange, handleFilterChange]);

  const hasActiveFilters = Object.keys(filters).some((key) => {
    const value = filters[key as keyof PropertyFiltersType];
    if (key === 'listingType' && value === 'sale') return false;
    return value !== undefined;
  });

  const formatPrice = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${Math.round(value / 1000)}K`;
    return `$${value}`;
  };

  const getPercent = (value: number) => ((value - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;

  return (
    <div className={cn("bg-white rounded-xl shadow-sm border border-stone-200 p-4", className)}>
      {/* Grid Layout for Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Listing Type */}
        <div>
          <label className="block text-[10px] text-stone-500 mb-1.5 uppercase tracking-wide font-medium">
            Listing
          </label>
          <select
            value={filters.listingType || ""}
            onChange={(e) => handleFilterChange("listingType", e.target.value ? (e.target.value as ListingType) : undefined)}
            className="w-full h-9 px-3 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
          >
            <option value="">All</option>
            <option value="sale">For Sale</option>
            <option value="lease">For Lease</option>
          </select>
        </div>

        {/* Property Type */}
        <div>
          <label className="block text-[10px] text-stone-500 mb-1.5 uppercase tracking-wide font-medium">
            Property
          </label>
          <select
            value={filters.type?.[0] || ""}
            onChange={(e) => handleFilterChange("type", e.target.value ? [e.target.value as PropertyType] : undefined)}
            className="w-full h-9 px-3 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
          >
            <option value="">All Types</option>
            {propertyTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Area with Regions */}
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-[10px] text-stone-500 mb-1.5 uppercase tracking-wide font-medium">
            Area
          </label>
          <select
            value={selectedArea}
            onChange={(e) => handleAreaChange(e.target.value)}
            className="w-full h-9 px-3 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
          >
            <option value="">All Areas</option>
            {areaOptions.map((opt, i) => (
              opt.isHeader ? (
                <option key={i} value="" disabled className="font-semibold text-stone-500 bg-stone-100">
                  {opt.label}
                </option>
              ) : (
                <option key={i} value={opt.value}>
                  {opt.isRegion ? `${opt.label} (${opt.cities.length} areas)` : opt.label}
                </option>
              )
            ))}
          </select>
        </div>

        {/* Bedrooms */}
        <div>
          <label className="block text-[10px] text-stone-500 mb-1.5 uppercase tracking-wide font-medium">
            Beds
          </label>
          <select
            value={filters.bedrooms || ""}
            onChange={(e) => handleFilterChange("bedrooms", e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full h-9 px-3 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
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
          <label className="block text-[10px] text-stone-500 mb-1.5 uppercase tracking-wide font-medium">
            Baths
          </label>
          <select
            value={filters.bathrooms || ""}
            onChange={(e) => handleFilterChange("bathrooms", e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full h-9 px-3 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
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
          <label className="block text-[10px] text-stone-500 mb-1.5 uppercase tracking-wide font-medium">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as SortOption)}
            className="w-full h-9 px-3 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
          >
            <option value="price-desc">Price: High → Low</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="latest">Newest First</option>
          </select>
        </div>
      </div>

      {/* Price Range Slider */}
      <div className="mt-4 pt-4 border-t border-stone-100">
        <div className="flex items-center justify-between mb-3">
          <label className="text-[10px] text-stone-500 uppercase tracking-wide font-medium">
            Price Range
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-secondary">
              {formatPrice(priceRange[0])}
            </span>
            <span className="text-stone-400">—</span>
            <span className="text-sm font-medium text-secondary">
              {priceRange[1] >= MAX_PRICE ? `${formatPrice(MAX_PRICE)}+` : formatPrice(priceRange[1])}
            </span>
          </div>
        </div>

        {/* Dual Range Slider */}
        <div className="relative h-6 flex items-center">
          <div className="absolute w-full h-2 bg-stone-200 rounded-full" />
          <div
            className="absolute h-2 bg-primary rounded-full"
            style={{
              left: `${getPercent(priceRange[0])}%`,
              width: `${getPercent(priceRange[1]) - getPercent(priceRange[0])}%`,
            }}
          />
          <input
            type="range"
            min={MIN_PRICE}
            max={MAX_PRICE}
            step={STEP}
            value={priceRange[0]}
            onChange={(e) => handlePriceRangeChange(0, parseInt(e.target.value))}
            className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none z-10
              [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary
              [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform
              [&::-webkit-slider-thumb]:hover:scale-110
              [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none
              [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary
              [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
          />
          <input
            type="range"
            min={MIN_PRICE}
            max={MAX_PRICE}
            step={STEP}
            value={priceRange[1]}
            onChange={(e) => handlePriceRangeChange(1, parseInt(e.target.value))}
            className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none z-20
              [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary
              [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform
              [&::-webkit-slider-thumb]:hover:scale-110
              [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none
              [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary
              [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
          />
        </div>

        <div className="flex justify-between mt-1 text-[10px] text-stone-400">
          <span>$0</span>
          <span>$1M</span>
          <span>$2M</span>
          <span>$3M</span>
          <span>$4M</span>
          <span>$5M+</span>
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="mt-4 pt-3 border-t border-stone-100 flex justify-end">
          <button
            onClick={handleClearFilters}
            className="text-xs font-medium text-stone-500 hover:text-primary transition-colors flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
