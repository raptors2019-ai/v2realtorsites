"use client";

import {
  PropertyFilters as PropertyFiltersType,
  PropertyType,
  SortOption,
  ListingType,
  PropertyClass,
} from "@repo/types";
import { cn, getAllCities } from "@repo/lib";
import { useState, useCallback, useRef, useEffect } from "react";

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
  initialSort = "price-desc",
  className,
}: PropertyFiltersProps) {
  const [filters, setFilters] = useState<PropertyFiltersType>(initialFilters);
  const [sortBy, setSortBy] = useState<SortOption>(initialSort);
  const propertyTypes: PropertyType[] = ["detached", "semi-detached", "townhouse", "condo"];

  // More Filters panel state
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false);

  // All GTA cities for the dropdown (from shared city-matcher)
  const allCities = getAllCities().map(c => c.name);

  // City search filter state
  const [citySearchFilter, setCitySearchFilter] = useState('');

  // Price range state
  const MIN_PRICE = 0;
  const MAX_PRICE = 5000000;
  const STEP = 50000;
  const [priceRange, setPriceRange] = useState<[number, number]>([
    initialFilters.priceRange?.min ?? MIN_PRICE,
    initialFilters.priceRange?.max ?? MAX_PRICE,
  ]);

  // Advanced filter constants
  const SQFT_MIN = 0;
  const SQFT_MAX = 10000;
  const SQFT_STEP = 100;
  const LOT_SIZE_MIN = 0;
  const LOT_SIZE_MAX = 50000;
  const LOT_SIZE_STEP = 500;
  const DAYS_ON_MARKET_OPTIONS = [
    { value: 7, label: 'Last 7 days' },
    { value: 14, label: 'Last 14 days' },
    { value: 30, label: 'Last 30 days' },
    { value: 90, label: 'Last 90 days' },
  ];

  // Advanced filter state
  const [keywords, setKeywords] = useState<string>(initialFilters.keywords || '');
  const [sqftRange, setSqftRange] = useState<[number, number]>([
    initialFilters.sqftRange?.min ?? SQFT_MIN,
    initialFilters.sqftRange?.max ?? SQFT_MAX,
  ]);
  const [lotSizeRange, setLotSizeRange] = useState<[number, number]>([
    initialFilters.lotSizeRange?.min ?? LOT_SIZE_MIN,
    initialFilters.lotSizeRange?.max ?? LOT_SIZE_MAX,
  ]);
  const [daysOnMarket, setDaysOnMarket] = useState<number | undefined>(
    initialFilters.daysOnMarket
  );

  // Helper to ensure array format
  const ensureArray = <T,>(value: T | T[] | undefined): T[] => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  };

  // Multi-select state for each filter
  const [selectedListingTypes, setSelectedListingTypes] = useState<ListingType[]>(
    ensureArray(initialFilters.listingType)
  );
  const [selectedPropertyClasses, setSelectedPropertyClasses] = useState<PropertyClass[]>(
    ensureArray(initialFilters.propertyClass)
  );
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<PropertyType[]>(
    ensureArray(initialFilters.type)
  );
  const [selectedBedrooms, setSelectedBedrooms] = useState<number[]>(
    ensureArray(initialFilters.bedrooms)
  );
  const [selectedBathrooms, setSelectedBathrooms] = useState<number[]>(
    ensureArray(initialFilters.bathrooms)
  );
  const [selectedCities, setSelectedCities] = useState<string[]>(
    initialFilters.locations || []
  );

  // Dropdown open states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);

  // Refs for positioning
  const listingTypeRef = useRef<HTMLButtonElement>(null);
  const propertyClassRef = useRef<HTMLButtonElement>(null);
  const propertyTypeRef = useRef<HTMLButtonElement>(null);
  const bedroomsRef = useRef<HTMLButtonElement>(null);
  const bathroomsRef = useRef<HTMLButtonElement>(null);
  const areaRef = useRef<HTMLButtonElement>(null);

  // Track initial mount
  const isInitialMount = useRef(true);

  // Update dropdown position when it opens or on scroll
  useEffect(() => {
    const updatePosition = () => {
      const refMap: Record<string, React.RefObject<HTMLButtonElement | null>> = {
        listingType: listingTypeRef,
        propertyClass: propertyClassRef,
        propertyType: propertyTypeRef,
        bedrooms: bedroomsRef,
        bathrooms: bathroomsRef,
        area: areaRef,
      };

      const currentRef = openDropdown ? refMap[openDropdown]?.current : null;
      if (currentRef) {
        const rect = currentRef.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width,
        });
      }
    };

    if (openDropdown) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    } else {
      setDropdownPosition(null);
    }

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [openDropdown]);

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
    setFilters({});
    setSortBy("price-desc");
    setPriceRange([MIN_PRICE, MAX_PRICE]);
    setSelectedListingTypes([]);
    setSelectedPropertyClasses([]);
    setSelectedPropertyTypes([]);
    setSelectedBedrooms([]);
    setSelectedBathrooms([]);
    setSelectedCities([]);
    // Clear advanced filters
    setKeywords('');
    setSqftRange([SQFT_MIN, SQFT_MAX]);
    setLotSizeRange([LOT_SIZE_MIN, LOT_SIZE_MAX]);
    setDaysOnMarket(undefined);
    setIsMoreFiltersOpen(false);
    onSortChange("price-desc");
  };

  // Generic toggle handler for multi-select
  const handleToggle = <T,>(
    current: T[],
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    filterKey: keyof PropertyFiltersType,
    value: T
  ) => {
    const newValues = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];

    setter(newValues);
    handleFilterChange(filterKey, newValues.length > 0 ? newValues : undefined);
  };

  const handleCityToggle = (city: string) => {
    const newSelectedCities = selectedCities.includes(city)
      ? selectedCities.filter(c => c !== city)
      : [...selectedCities, city];

    setSelectedCities(newSelectedCities);
    handleFilterChange("locations", newSelectedCities.length > 0 ? newSelectedCities : undefined);
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

  // Advanced filter handlers
  const handleKeywordsChange = useCallback((value: string) => {
    setKeywords(value);
    handleFilterChange("keywords", value || undefined);
  }, [handleFilterChange]);

  const handleSqftRangeChange = useCallback((index: 0 | 1, value: number) => {
    const newRange: [number, number] = [...sqftRange] as [number, number];
    newRange[index] = value;

    if (index === 0 && value > sqftRange[1]) newRange[1] = value;
    if (index === 1 && value < sqftRange[0]) newRange[0] = value;

    setSqftRange(newRange);

    const sqftFilter = {
      min: newRange[0] > SQFT_MIN ? newRange[0] : undefined,
      max: newRange[1] < SQFT_MAX ? newRange[1] : undefined,
    };

    handleFilterChange("sqftRange", sqftFilter.min || sqftFilter.max ? sqftFilter : undefined);
  }, [sqftRange, handleFilterChange]);

  const handleLotSizeRangeChange = useCallback((index: 0 | 1, value: number) => {
    const newRange: [number, number] = [...lotSizeRange] as [number, number];
    newRange[index] = value;

    if (index === 0 && value > lotSizeRange[1]) newRange[1] = value;
    if (index === 1 && value < lotSizeRange[0]) newRange[0] = value;

    setLotSizeRange(newRange);

    const lotFilter = {
      min: newRange[0] > LOT_SIZE_MIN ? newRange[0] : undefined,
      max: newRange[1] < LOT_SIZE_MAX ? newRange[1] : undefined,
    };

    handleFilterChange("lotSizeRange", lotFilter.min || lotFilter.max ? lotFilter : undefined);
  }, [lotSizeRange, handleFilterChange]);

  const handleDaysOnMarketChange = useCallback((value: number | undefined) => {
    setDaysOnMarket(value);
    handleFilterChange("daysOnMarket", value);
  }, [handleFilterChange]);

  // Check if advanced filters are active
  const hasAdvancedFilters = keywords ||
    sqftRange[0] > SQFT_MIN || sqftRange[1] < SQFT_MAX ||
    lotSizeRange[0] > LOT_SIZE_MIN || lotSizeRange[1] < LOT_SIZE_MAX ||
    daysOnMarket !== undefined;

  const hasActiveFilters = Object.keys(filters).some((key) => {
    const value = filters[key as keyof PropertyFiltersType];
    return value !== undefined && (Array.isArray(value) ? value.length > 0 : true);
  });

  // Check if price range is active (not at defaults)
  const isPriceActive = priceRange[0] > MIN_PRICE || priceRange[1] < MAX_PRICE;

  // Helper functions for sliders
  const getPercent = (value: number) => ((value - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;
  const getSqftPercent = (value: number) => ((value - SQFT_MIN) / (SQFT_MAX - SQFT_MIN)) * 100;
  const getLotSizePercent = (value: number) => ((value - LOT_SIZE_MIN) / (LOT_SIZE_MAX - LOT_SIZE_MIN)) * 100;

  // Format price for display in compact input (e.g., 500000 -> "500K", 1500000 -> "1.5M")
  const formatPriceInputDisplay = (value: number): string => {
    if (value === 0 || value === MIN_PRICE) return '';
    if (value >= MAX_PRICE) return '5M+';
    if (value >= 1000000) {
      const millions = value / 1000000;
      return millions % 1 === 0 ? `${millions}M` : `${millions.toFixed(1)}M`;
    }
    return `${Math.round(value / 1000)}K`;
  };

  // Helper to format display text for multi-select
  const getDisplayText = <T,>(selected: T[], allLabel: string, formatter?: (item: T) => string): string => {
    if (selected.length === 0) return allLabel;
    const formatted = selected.map(item => formatter ? formatter(item) : String(item));
    return formatted.join(', ');
  };

  // Multi-select dropdown component
  const MultiSelectDropdown = <T,>({
    label,
    dropdownKey,
    buttonRef,
    selected,
    options,
    onToggle,
    formatter,
    allLabel,
  }: {
    label: string;
    dropdownKey: string;
    buttonRef: React.RefObject<HTMLButtonElement | null>;
    selected: T[];
    options: { value: T; label: string }[];
    onToggle: (value: T) => void;
    formatter?: (item: T) => string;
    allLabel: string;
  }) => {
    const isOpen = openDropdown === dropdownKey;

    return (
      <div className="relative">
        <label className="block text-[10px] text-stone-500 mb-1.5 uppercase tracking-wide font-medium">
          {label}
        </label>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpenDropdown(isOpen ? null : dropdownKey)}
          className={cn(
            "w-full h-9 px-3 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer flex items-center justify-between text-left",
            selected.length > 0
              ? "bg-primary/5 border-2 border-primary text-primary font-medium"
              : "bg-stone-50 border border-stone-200 text-stone-700"
          )}
        >
          <span className="truncate">
            {getDisplayText(selected, allLabel, formatter)}
          </span>
          <svg
            className={cn(
              "w-4 h-4 transition-transform flex-shrink-0",
              selected.length > 0 ? "text-primary" : "text-stone-400",
              isOpen && "rotate-180"
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && dropdownPosition && (
          <>
            <div
              className="fixed inset-0 z-[100]"
              onClick={() => setOpenDropdown(null)}
            />
            <div
              className="fixed bg-white border border-stone-200 rounded-lg shadow-lg z-[101] max-h-60 overflow-y-auto"
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                width: `${dropdownPosition.width}px`,
              }}
            >
              {options.map((option) => (
                <label
                  key={String(option.value)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-stone-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(option.value)}
                    onChange={() => onToggle(option.value)}
                    className="w-4 h-4 text-primary border-stone-300 rounded focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="text-sm text-stone-700">{option.label}</span>
                </label>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className={cn("bg-white rounded-xl shadow-sm border border-stone-200 p-4", className)}>
      {/* Row 1: Primary Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Listing Type - Multi-Select */}
        <MultiSelectDropdown
          label="Listing"
          dropdownKey="listingType"
          buttonRef={listingTypeRef}
          selected={selectedListingTypes}
          options={[
            { value: 'sale' as ListingType, label: 'For Sale' },
            { value: 'lease' as ListingType, label: 'For Lease' },
            { value: 'sold' as ListingType, label: 'Sold' },
          ]}
          onToggle={(value) => handleToggle(selectedListingTypes, setSelectedListingTypes, 'listingType', value)}
          formatter={(type) => type === 'sale' ? 'For Sale' : type === 'lease' ? 'For Lease' : 'Sold'}
          allLabel="All Listings"
        />

        {/* Property Class - Multi-Select */}
        <MultiSelectDropdown
          label="Class"
          dropdownKey="propertyClass"
          buttonRef={propertyClassRef}
          selected={selectedPropertyClasses}
          options={[
            { value: 'residential' as PropertyClass, label: 'Residential' },
            { value: 'commercial' as PropertyClass, label: 'Commercial' },
          ]}
          onToggle={(value) => handleToggle(selectedPropertyClasses, setSelectedPropertyClasses, 'propertyClass', value)}
          formatter={(cls) => cls.charAt(0).toUpperCase() + cls.slice(1)}
          allLabel="All Classes"
        />

        {/* Property Type - Multi-Select */}
        <MultiSelectDropdown
          label="Property"
          dropdownKey="propertyType"
          buttonRef={propertyTypeRef}
          selected={selectedPropertyTypes}
          options={propertyTypes.map(type => ({
            value: type,
            label: type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')
          }))}
          onToggle={(value) => handleToggle(selectedPropertyTypes, setSelectedPropertyTypes, 'type', value)}
          formatter={(type) => type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
          allLabel="All Types"
        />

        {/* Area - Multi-Select with Search */}
        <div className="relative">
          <label className="block text-[10px] text-stone-500 mb-1.5 uppercase tracking-wide font-medium">
            Area
          </label>
          <button
            ref={areaRef}
            type="button"
            onClick={() => {
              setOpenDropdown(openDropdown === 'area' ? null : 'area');
              setCitySearchFilter('');
            }}
            className={cn(
              "w-full h-9 px-3 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer flex items-center justify-between text-left",
              selectedCities.length > 0
                ? "bg-primary/5 border-2 border-primary text-primary font-medium"
                : "bg-stone-50 border border-stone-200 text-stone-700"
            )}
          >
            <span className="truncate">
              {selectedCities.length === 0 ? 'All Areas' : selectedCities.join(', ')}
            </span>
            <svg
              className={cn(
                "w-4 h-4 transition-transform flex-shrink-0",
                selectedCities.length > 0 ? "text-primary" : "text-stone-400",
                openDropdown === 'area' && "rotate-180"
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {openDropdown === 'area' && dropdownPosition && (
            <>
              <div
                className="fixed inset-0 z-[100]"
                onClick={() => {
                  setOpenDropdown(null);
                  setCitySearchFilter('');
                }}
              />
              <div
                className="fixed bg-white border border-stone-200 rounded-lg shadow-lg z-[101] flex flex-col"
                style={{
                  top: `${dropdownPosition.top}px`,
                  left: `${dropdownPosition.left}px`,
                  width: `${Math.max(dropdownPosition.width, 200)}px`,
                  maxHeight: '320px',
                }}
              >
                {/* Search Input */}
                <div className="p-2 border-b border-stone-100">
                  <div className="relative">
                    <svg
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      value={citySearchFilter}
                      onChange={(e) => setCitySearchFilter(e.target.value)}
                      placeholder="Filter cities..."
                      className="w-full h-8 pl-8 pr-3 text-sm bg-stone-50 border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                {/* City List - Scrollable */}
                <div className="overflow-y-auto flex-1" style={{ maxHeight: '250px' }}>
                  {allCities
                    .filter(city => city.toLowerCase().includes(citySearchFilter.toLowerCase()))
                    .map((city) => (
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
                  {allCities.filter(city => city.toLowerCase().includes(citySearchFilter.toLowerCase())).length === 0 && (
                    <p className="px-3 py-4 text-sm text-stone-500 text-center">No cities match "{citySearchFilter}"</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Row 2: Price + Secondary Filters + Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-3">
        {/* Price Range Slider - Compact */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-1">
            <label className={cn(
              "text-[10px] uppercase tracking-wide font-medium",
              isPriceActive ? "text-primary" : "text-stone-500"
            )}>
              Price Range
            </label>
            <span className={cn(
              "text-[10px] font-medium",
              isPriceActive ? "text-primary" : "text-stone-600"
            )}>
              {formatPriceInputDisplay(priceRange[0]) || '$0'} — {priceRange[1] >= MAX_PRICE ? '$5M+' : `$${formatPriceInputDisplay(priceRange[1])}`}
            </span>
          </div>
          <div className={cn(
            "relative h-10 flex items-center rounded-lg px-3",
            isPriceActive
              ? "bg-primary/5 border-2 border-primary"
              : "bg-stone-50 border border-stone-200"
          )}>
            {/* Track container */}
            <div className="absolute left-3 right-3 h-2">
              {/* Background track */}
              <div className="absolute inset-0 bg-stone-300 rounded-full shadow-inner" />
              {/* Active/colored track */}
              <div
                className="absolute h-full bg-primary rounded-full shadow-sm"
                style={{
                  left: `${getPercent(priceRange[0])}%`,
                  width: `${getPercent(priceRange[1]) - getPercent(priceRange[0])}%`,
                }}
              />
              {/* Tick marks */}
              {[0, 20, 40, 60, 80, 100].map((percent) => (
                <div
                  key={percent}
                  className="absolute top-1/2 -translate-y-1/2 w-px h-2.5 bg-stone-400"
                  style={{ left: `${percent}%`, marginLeft: percent === 0 ? 0 : percent === 100 ? '-1px' : '-0.5px' }}
                />
              ))}
            </div>
            <input
              type="range"
              min={MIN_PRICE}
              max={MAX_PRICE}
              step={STEP}
              value={priceRange[0]}
              onChange={(e) => handlePriceRangeChange(0, parseInt(e.target.value))}
              className="absolute left-3 right-3 h-2 appearance-none bg-transparent pointer-events-none z-10
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
              className="absolute left-3 right-3 h-2 appearance-none bg-transparent pointer-events-none z-20
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
          {/* Price tick labels */}
          <div className="flex justify-between px-2 mt-0.5">
            <span className="text-[9px] text-stone-500">$0</span>
            <span className="text-[9px] text-stone-500">$1M</span>
            <span className="text-[9px] text-stone-500">$2M</span>
            <span className="text-[9px] text-stone-500">$3M</span>
            <span className="text-[9px] text-stone-500">$4M</span>
            <span className="text-[9px] text-stone-500">$5M+</span>
          </div>
        </div>

        {/* Bedrooms - Multi-Select */}
        <MultiSelectDropdown
          label="Beds"
          dropdownKey="bedrooms"
          buttonRef={bedroomsRef}
          selected={selectedBedrooms}
          options={[
            { value: 1, label: '1+' },
            { value: 2, label: '2+' },
            { value: 3, label: '3+' },
            { value: 4, label: '4+' },
            { value: 5, label: '5+' },
          ]}
          onToggle={(value) => handleToggle(selectedBedrooms, setSelectedBedrooms, 'bedrooms', value)}
          formatter={(num) => `${num}+`}
          allLabel="Any"
        />

        {/* Bathrooms - Multi-Select */}
        <MultiSelectDropdown
          label="Baths"
          dropdownKey="bathrooms"
          buttonRef={bathroomsRef}
          selected={selectedBathrooms}
          options={[
            { value: 1, label: '1+' },
            { value: 2, label: '2+' },
            { value: 3, label: '3+' },
            { value: 4, label: '4+' },
          ]}
          onToggle={(value) => handleToggle(selectedBathrooms, setSelectedBathrooms, 'bathrooms', value)}
          formatter={(num) => `${num}+`}
          allLabel="Any"
        />

        {/* Sort - Single Select */}
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

        {/* More Filters Button */}
        <div>
          <label className="block text-[10px] text-stone-500 mb-1.5 uppercase tracking-wide font-medium invisible">
            More
          </label>
          <button
            type="button"
            onClick={() => setIsMoreFiltersOpen(!isMoreFiltersOpen)}
            className={cn(
              "w-full h-9 px-3 text-sm rounded-lg transition-all flex items-center justify-center gap-1.5",
              isMoreFiltersOpen
                ? "bg-primary text-white"
                : "bg-stone-50 border border-stone-200 text-stone-600 hover:bg-stone-100"
            )}
          >
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${isMoreFiltersOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span>More</span>
            {hasAdvancedFilters && !isMoreFiltersOpen && (
              <span className="w-1.5 h-1.5 bg-primary rounded-full" />
            )}
          </button>
        </div>

        {/* Clear Filters Button */}
        <div>
          <label className="block text-[10px] text-stone-500 mb-1.5 uppercase tracking-wide font-medium invisible">
            Clear
          </label>
          <button
            type="button"
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
            className={cn(
              "w-full h-9 px-3 text-sm rounded-lg transition-all flex items-center justify-center gap-1.5",
              hasActiveFilters
                ? "bg-stone-50 border border-stone-200 text-stone-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                : "bg-stone-50 border border-stone-100 text-stone-300 cursor-not-allowed"
            )}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Expandable Advanced Filters Panel */}
      {isMoreFiltersOpen && (
        <div className="mt-4 pt-4 border-t border-stone-100 space-y-6">
          {/* Keywords Search */}
          <div>
            <label className="block text-[10px] text-stone-500 mb-1.5 uppercase tracking-wide font-medium">
              Keywords
            </label>
            <div className="relative">
              <input
                type="text"
                value={keywords}
                onChange={(e) => handleKeywordsChange(e.target.value)}
                placeholder="e.g., pool, garage, waterfront"
                className="w-full h-9 px-3 pr-8 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="mt-1 text-[10px] text-stone-400">
              Search property descriptions
            </p>
          </div>

          {/* Two-column grid for range filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Square Footage Range */}
            <div>
              <label className="block text-[10px] text-stone-500 mb-2 uppercase tracking-wide font-medium">
                Square Footage
              </label>
              {/* Min/Max Input Fields */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1">
                  <input
                    type="number"
                    min={SQFT_MIN}
                    max={SQFT_MAX}
                    value={sqftRange[0] || ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? SQFT_MIN : parseInt(e.target.value);
                      if (!isNaN(val)) handleSqftRangeChange(0, Math.min(Math.max(val, SQFT_MIN), SQFT_MAX));
                    }}
                    placeholder="Min"
                    className="w-full h-9 px-3 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <span className="text-stone-400 text-sm">to</span>
                <div className="flex-1">
                  <input
                    type="number"
                    min={SQFT_MIN}
                    max={SQFT_MAX}
                    value={sqftRange[1] >= SQFT_MAX ? '' : sqftRange[1]}
                    onChange={(e) => {
                      const val = e.target.value === '' ? SQFT_MAX : parseInt(e.target.value);
                      if (!isNaN(val)) handleSqftRangeChange(1, Math.min(Math.max(val, SQFT_MIN), SQFT_MAX));
                    }}
                    placeholder="Max"
                    className="w-full h-9 px-3 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <span className="text-[10px] text-stone-400 whitespace-nowrap">sqft</span>
              </div>
              {/* Dual Range Slider */}
              <div className="relative h-6 flex items-center">
                <div className="absolute w-full h-2 bg-stone-200 rounded-full" />
                <div
                  className="absolute h-2 bg-primary rounded-full"
                  style={{
                    left: `${getSqftPercent(sqftRange[0])}%`,
                    width: `${getSqftPercent(sqftRange[1]) - getSqftPercent(sqftRange[0])}%`,
                  }}
                />
                <input
                  type="range"
                  min={SQFT_MIN}
                  max={SQFT_MAX}
                  step={SQFT_STEP}
                  value={sqftRange[0]}
                  onChange={(e) => handleSqftRangeChange(0, parseInt(e.target.value))}
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
                  min={SQFT_MIN}
                  max={SQFT_MAX}
                  step={SQFT_STEP}
                  value={sqftRange[1]}
                  onChange={(e) => handleSqftRangeChange(1, parseInt(e.target.value))}
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
                <span>0</span>
                <span>2.5K</span>
                <span>5K</span>
                <span>7.5K</span>
                <span>10K+</span>
              </div>
            </div>

            {/* Lot Size Range */}
            <div>
              <label className="block text-[10px] text-stone-500 mb-2 uppercase tracking-wide font-medium">
                Lot Size
              </label>
              {/* Min/Max Input Fields */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1">
                  <input
                    type="number"
                    min={LOT_SIZE_MIN}
                    max={LOT_SIZE_MAX}
                    value={lotSizeRange[0] || ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? LOT_SIZE_MIN : parseInt(e.target.value);
                      if (!isNaN(val)) handleLotSizeRangeChange(0, Math.min(Math.max(val, LOT_SIZE_MIN), LOT_SIZE_MAX));
                    }}
                    placeholder="Min"
                    className="w-full h-9 px-3 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <span className="text-stone-400 text-sm">to</span>
                <div className="flex-1">
                  <input
                    type="number"
                    min={LOT_SIZE_MIN}
                    max={LOT_SIZE_MAX}
                    value={lotSizeRange[1] >= LOT_SIZE_MAX ? '' : lotSizeRange[1]}
                    onChange={(e) => {
                      const val = e.target.value === '' ? LOT_SIZE_MAX : parseInt(e.target.value);
                      if (!isNaN(val)) handleLotSizeRangeChange(1, Math.min(Math.max(val, LOT_SIZE_MIN), LOT_SIZE_MAX));
                    }}
                    placeholder="Max"
                    className="w-full h-9 px-3 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <span className="text-[10px] text-stone-400 whitespace-nowrap">sqft</span>
              </div>
              {/* Dual Range Slider */}
              <div className="relative h-6 flex items-center">
                <div className="absolute w-full h-2 bg-stone-200 rounded-full" />
                <div
                  className="absolute h-2 bg-primary rounded-full"
                  style={{
                    left: `${getLotSizePercent(lotSizeRange[0])}%`,
                    width: `${getLotSizePercent(lotSizeRange[1]) - getLotSizePercent(lotSizeRange[0])}%`,
                  }}
                />
                <input
                  type="range"
                  min={LOT_SIZE_MIN}
                  max={LOT_SIZE_MAX}
                  step={LOT_SIZE_STEP}
                  value={lotSizeRange[0]}
                  onChange={(e) => handleLotSizeRangeChange(0, parseInt(e.target.value))}
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
                  min={LOT_SIZE_MIN}
                  max={LOT_SIZE_MAX}
                  step={LOT_SIZE_STEP}
                  value={lotSizeRange[1]}
                  onChange={(e) => handleLotSizeRangeChange(1, parseInt(e.target.value))}
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
                <span>0</span>
                <span>12.5K</span>
                <span>25K</span>
                <span>37.5K</span>
                <span>50K+</span>
              </div>
            </div>
          </div>

          {/* Days on Market Dropdown */}
          <div className="max-w-xs">
            <label className="block text-[10px] text-stone-500 mb-1.5 uppercase tracking-wide font-medium">
              Days on Market
            </label>
            <select
              value={daysOnMarket || ''}
              onChange={(e) => handleDaysOnMarketChange(e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full h-9 px-3 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
            >
              <option value="">Any time</option>
              {DAYS_ON_MARKET_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

    </div>
  );
}
