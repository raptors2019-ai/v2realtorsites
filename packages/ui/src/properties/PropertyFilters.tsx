"use client";

import {
  PropertyFilters as PropertyFiltersType,
  PropertyType,
  SortOption,
  ListingType,
  PropertyClass,
} from "@repo/types";
import { cn } from "@repo/lib";
import { useState, useCallback, useRef, useEffect } from "react";

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

  // All GTA cities for the dropdown (not just filtered results)
  const allCities = [
    'Toronto', 'Mississauga', 'Brampton', 'Vaughan',
    'Markham', 'Richmond Hill', 'Milton', 'Oakville',
    'Burlington', 'Hamilton', 'Caledon'
  ];

  // Price range state
  const MIN_PRICE = 0;
  const MAX_PRICE = 5000000;
  const STEP = 50000;
  const [priceRange, setPriceRange] = useState<[number, number]>([
    initialFilters.priceRange?.min ?? MIN_PRICE,
    initialFilters.priceRange?.max ?? MAX_PRICE,
  ]);

  // Track selected cities for multi-select
  const [selectedCities, setSelectedCities] = useState<string[]>(
    initialFilters.locations || []
  );
  const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const areaButtonRef = useRef<HTMLButtonElement>(null);

  // Track initial mount
  const isInitialMount = useRef(true);

  // Update dropdown position when it opens or on scroll
  useEffect(() => {
    const updatePosition = () => {
      if (areaButtonRef.current) {
        const rect = areaButtonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 4, // Fixed positioning, no scroll offset needed
          left: rect.left,
          width: rect.width,
        });
      }
    };

    if (isAreaDropdownOpen) {
      updatePosition();
      // Update position on scroll
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    } else {
      setDropdownPosition(null);
    }

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isAreaDropdownOpen]);

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
    setFilters({ listingType: 'sale', propertyClass: 'residential' });
    setSortBy("price-desc");
    setPriceRange([MIN_PRICE, MAX_PRICE]);
    setSelectedCities([]);
    onSortChange("price-desc");
  };

  const handleCityToggle = (city: string) => {
    const newSelectedCities = selectedCities.includes(city)
      ? selectedCities.filter(c => c !== city)
      : [...selectedCities, city];

    setSelectedCities(newSelectedCities);

    if (newSelectedCities.length === 0) {
      handleFilterChange("location", undefined);
      handleFilterChange("locations", undefined);
    } else if (newSelectedCities.length === 1) {
      handleFilterChange("location", newSelectedCities[0]);
      handleFilterChange("locations", undefined);
    } else {
      handleFilterChange("location", undefined);
      handleFilterChange("locations", newSelectedCities);
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
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

        {/* Property Class - Residential/Commercial */}
        <div>
          <label className="block text-[10px] text-stone-500 mb-1.5 uppercase tracking-wide font-medium">
            Class
          </label>
          <select
            value={filters.propertyClass || "residential"}
            onChange={(e) => handleFilterChange("propertyClass", e.target.value ? (e.target.value as PropertyClass) : undefined)}
            className="w-full h-9 px-3 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
          >
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
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

        {/* Area - Multi-Select */}
        <div className="col-span-2 sm:col-span-1 relative">
          <label className="block text-[10px] text-stone-500 mb-1.5 uppercase tracking-wide font-medium">
            Area
          </label>
          <button
            ref={areaButtonRef}
            type="button"
            onClick={() => setIsAreaDropdownOpen(!isAreaDropdownOpen)}
            className="w-full h-9 px-3 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer flex items-center justify-between text-left"
          >
            <span className="truncate">
              {selectedCities.length === 0
                ? "All Areas"
                : selectedCities.join(", ")}
            </span>
            <svg
              className={`w-4 h-4 text-stone-400 transition-transform ${isAreaDropdownOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown */}
          {isAreaDropdownOpen && dropdownPosition && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-[100]"
                onClick={() => setIsAreaDropdownOpen(false)}
              />
              {/* Dropdown content */}
              <div
                className="fixed bg-white border border-stone-200 rounded-lg shadow-lg z-[101] max-h-60 overflow-y-auto"
                style={{
                  top: `${dropdownPosition.top}px`,
                  left: `${dropdownPosition.left}px`,
                  width: `${dropdownPosition.width}px`,
                }}
              >
                {allCities.map((city) => (
                  <label
                    key={city}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-stone-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCities.includes(city)}
                      onChange={() => handleCityToggle(city)}
                      className="w-4 h-4 text-primary border-stone-300 rounded focus:ring-2 focus:ring-primary/20"
                    />
                    <span className="text-sm text-stone-700">{city}</span>
                  </label>
                ))}
              </div>
            </>
          )}
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
