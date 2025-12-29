"use client";

import {
  Property,
  PropertyFilters as PropertyFiltersType,
  SortOption,
} from "@repo/types";
import { sortProperties } from "@repo/lib";
import { useState, useCallback, useEffect, useRef } from "react";
import { PropertyFilters as PropertyFiltersComponent } from "./PropertyFilters";
import { PropertyGrid } from "./PropertyGrid";
import { trackPropertyListView, type PropertyItem } from "@repo/analytics";

interface PropertiesPageClientProps {
  initialProperties: Property[];
  initialCities?: string[];
  total: number;
  initialFilters?: Partial<PropertyFiltersType>;
}

const PAGE_SIZE = 20;
const STORAGE_KEY = 'propertyPreferences';

export function PropertiesPageClient({
  initialProperties,
  initialCities = [],
  total: initialTotal,
  initialFilters,
}: PropertiesPageClientProps) {
  // Properties state
  const [properties, setProperties] = useState<Property[]>(initialProperties.slice(0, PAGE_SIZE));
  const [filteredTotal, setFilteredTotal] = useState(initialTotal);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Filter state - initialize from URL params or default to sale
  const [filters, setFilters] = useState<PropertyFiltersType>(
    initialFilters || { listingType: ['sale'] }
  );
  const [sortBy, setSortBy] = useState<SortOption>("price-desc");

  // Cities for the dropdown (from initial server-side fetch)
  const [cities] = useState<string[]>(initialCities);

  // Track if filters have changed from initial
  const isInitialMount = useRef(true);
  const currentFiltersRef = useRef<PropertyFiltersType>(filters);

  // Helper to safely convert to array and join
  const toCommaSeparated = <T,>(value: T | T[] | undefined): string | undefined => {
    if (!value) return undefined;
    const arr = Array.isArray(value) ? value : [value];
    return arr.length > 0 ? arr.join(',') : undefined;
  };

  // Build user-facing URL from filters
  const buildUserURL = useCallback((currentFilters: PropertyFiltersType) => {
    const params = new URLSearchParams();

    // Listing type (array)
    const listingType = toCommaSeparated(currentFilters.listingType);
    if (listingType) params.set('listingType', listingType);

    // Property class (array)
    const propertyClass = toCommaSeparated(currentFilters.propertyClass);
    if (propertyClass) params.set('propertyClass', propertyClass);

    // Price range
    if (currentFilters.priceRange?.min) {
      params.set('budgetMin', String(currentFilters.priceRange.min));
    }
    if (currentFilters.priceRange?.max) {
      params.set('budgetMax', String(currentFilters.priceRange.max));
    }

    // Cities
    const cities = toCommaSeparated(currentFilters.locations);
    if (cities) params.set('cities', cities);

    // Property types (array)
    const propertyType = toCommaSeparated(currentFilters.type);
    if (propertyType) params.set('propertyType', propertyType);

    // Bedrooms (array)
    const bedrooms = toCommaSeparated(currentFilters.bedrooms);
    if (bedrooms) params.set('bedrooms', bedrooms);

    // Bathrooms (array)
    const bathrooms = toCommaSeparated(currentFilters.bathrooms);
    if (bathrooms) params.set('bathrooms', bathrooms);

    return `/properties?${params.toString()}`;
  }, []);

  // Save preferences to sessionStorage
  const savePreferences = useCallback((currentFilters: PropertyFiltersType) => {
    try {
      const url = buildUserURL(currentFilters);

      // Try to build survey-compatible format for backwards compatibility
      const survey = {
        listingType: currentFilters.listingType?.[0] || 'sale',
        budgetRange: (() => {
          // min not currently used in budget range logic
          const max = currentFilters.priceRange?.max || 5000000;
          if (max <= 500000) return '0-500k';
          if (max <= 1000000) return '500k-1m';
          if (max <= 2000000) return '1m-2m';
          return '2m+';
        })(),
        locations: currentFilters.locations || [],
      };

      const preferences = {
        filters: currentFilters,
        survey,
        url,
        timestamp: Date.now(),
      };

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      console.log('[properties.preferences.save]', { preferences });
    } catch (error) {
      console.error('[properties.preferences.save.error]', error);
    }
  }, [buildUserURL]);

  // Build API query string from filters
  const buildQueryString = useCallback((offset = 0) => {
    const params = new URLSearchParams();
    params.set('limit', String(PAGE_SIZE));
    params.set('offset', String(offset));

    // Multiple cities (region) or single city
    if (filters.locations && filters.locations.length > 0) {
      params.set('cities', filters.locations.join(','));
    } else if (filters.location) {
      params.set('city', filters.location);
    }

    if (filters.priceRange?.min) {
      params.set('minPrice', String(filters.priceRange.min));
    }
    if (filters.priceRange?.max) {
      params.set('maxPrice', String(filters.priceRange.max));
    }
    if (filters.bedrooms) {
      params.set('bedrooms', String(filters.bedrooms));
    }
    if (filters.bathrooms) {
      params.set('bathrooms', String(filters.bathrooms));
    }
    if (filters.type?.[0]) {
      params.set('propertyType', filters.type[0]);
    }
    if (filters.listingType && filters.listingType.length > 0) {
      params.set('listingType', filters.listingType.join(','));
    }

    return params.toString();
  }, [filters]);

  // Fetch properties from API
  const fetchProperties = useCallback(async (offset = 0, append = false) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const queryString = buildQueryString(offset);
      console.log('[properties.fetch]', { offset, append, query: queryString });

      const response = await fetch(`/api/properties?${queryString}`);
      const data = await response.json();

      if (data.success) {
        let newProperties = data.properties || [];

        // Apply client-side sorting
        newProperties = sortProperties(newProperties, sortBy);

        if (append) {
          setProperties(prev => [...prev, ...newProperties]);
        } else {
          setProperties(newProperties);
        }

        setFilteredTotal(data.total || 0);
      } else {
        console.error('[properties.fetch.error]', data.error);
        if (!append) {
          setProperties([]);
          setFilteredTotal(0);
        }
      }
    } catch (error) {
      console.error('[properties.fetch.error]', error);
      if (!append) {
        setProperties([]);
        setFilteredTotal(0);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [buildQueryString, sortBy]);

  // Fetch when filters change (with debounce for price slider)
  useEffect(() => {
    // Skip the initial mount - we already have server-side data
    if (isInitialMount.current) {
      isInitialMount.current = false;
      currentFiltersRef.current = filters;
      return;
    }

    // Check if filters actually changed
    const filtersChanged = JSON.stringify(filters) !== JSON.stringify(currentFiltersRef.current);
    if (!filtersChanged) return;

    // Check if only price changed (for debounce)
    const oldFilters = currentFiltersRef.current;
    const priceChanged = JSON.stringify(filters.priceRange) !== JSON.stringify(oldFilters.priceRange);
    const otherChanged = Object.keys(filters).some(key => {
      if (key === 'priceRange') return false;
      return JSON.stringify(filters[key as keyof PropertyFiltersType]) !==
             JSON.stringify(oldFilters[key as keyof PropertyFiltersType]);
    });

    currentFiltersRef.current = filters;

    // Save updated preferences to sessionStorage
    savePreferences(filters);

    // Debounce price changes, immediate for other filters
    if (priceChanged && !otherChanged) {
      const timer = setTimeout(() => {
        fetchProperties(0, false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      fetchProperties(0, false);
      return;
    }
  }, [filters, fetchProperties, savePreferences]);

  // Re-sort when sort changes (client-side only)
  useEffect(() => {
    if (properties.length > 0) {
      setProperties(prev => sortProperties([...prev], sortBy));
    }
  }, [sortBy]);

  // Track property list view when properties change
  useEffect(() => {
    if (properties.length > 0 && !isLoading) {
      const propertyItems: PropertyItem[] = properties.map((p, index) => ({
        item_id: p.id,
        item_name: p.address,
        item_category: p.propertyType,
        item_category2: p.listingType === 'lease' ? 'For Lease' : 'For Sale',
        item_category3: p.city,
        price: p.price,
        index,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        square_feet: p.sqft,
      }));

      const listName = filters.location
        ? `${filters.location} Properties`
        : filters.listingType?.includes('lease')
        ? 'Properties For Lease'
        : 'Properties For Sale';

      trackPropertyListView(propertyItems, {
        list_id: 'search_results',
        list_name: listName,
      });
    }
  }, [properties, isLoading, filters.location, filters.listingType]);

  // Handle filter change
  const handleFilterChange = useCallback((newFilters: PropertyFiltersType) => {
    setFilters(newFilters);
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((newSort: SortOption) => {
    setSortBy(newSort);
  }, []);

  // Load more properties
  const handleLoadMore = useCallback(() => {
    const currentOffset = properties.length;
    fetchProperties(currentOffset, true);
  }, [properties.length, fetchProperties]);

  // Check if there are more to load
  const hasMore = properties.length < filteredTotal;

  // Check if any meaningful filters are active
  const hasActiveFilters = Object.keys(filters).some((key) => {
    const value = filters[key as keyof typeof filters];
    if (key === 'listingType' && value === 'sale') return false;
    return value !== undefined;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <PropertyFiltersComponent
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        initialFilters={filters}
        initialSort={sortBy}
        cities={cities}
      />

      {/* Results Count */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-text-secondary text-sm">
          {isLoading ? (
            <span className="text-stone-400">Searching...</span>
          ) : (
            <>
              Showing{" "}
              <span className="font-semibold text-secondary">
                {properties.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-secondary">
                {filteredTotal >= 1000 ? `${Math.floor(filteredTotal / 1000)}K+` : filteredTotal.toLocaleString()}
              </span>{" "}
              {hasActiveFilters ? "matching properties" : "properties"}
            </>
          )}
        </p>
        {!hasActiveFilters && filteredTotal > 1000 && (
          <p className="text-xs text-primary/80 italic">
            Use filters to narrow results
          </p>
        )}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="luxury-card-premium rounded-xl overflow-hidden animate-pulse">
              <div className="h-60 bg-stone-200" />
              <div className="p-6 space-y-3">
                <div className="h-6 bg-stone-200 rounded w-1/2" />
                <div className="h-4 bg-stone-200 rounded w-3/4" />
                <div className="h-4 bg-stone-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Properties Grid */
        <PropertyGrid
          properties={properties}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          onLoadMore={handleLoadMore}
        />
      )}
    </div>
  );
}
