"use client";

import { Property } from "@repo/types";
import { cn } from "@repo/lib";
import { PropertyCard } from "./PropertyCard";
import { Spinner } from "../components/Spinner";

interface PropertyGridProps {
  properties: Property[];
  className?: string;
  emptyMessage?: string;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

export function PropertyGrid({
  properties,
  className,
  emptyMessage = "No properties found matching your criteria.",
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
}: PropertyGridProps) {
  if (properties.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto w-24 h-24 mb-4 rounded-xl border border-white/10 bg-[#111111] flex items-center justify-center">
          <svg
            className="w-12 h-12 text-gray-600"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        <h3 className="text-xl font-medium text-white mb-2">
          No Properties Found
        </h3>
        <p className="text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      <div
        className={cn(
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
          className
        )}
      >
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {/* Show More Button */}
      {hasMore && onLoadMore && (
        <div className="flex justify-center mt-10">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors shadow-md hover:shadow-lg"
          >
            {isLoadingMore ? (
              <>
                <Spinner size="sm" className="border-white/30 border-t-white" />
                Loading...
              </>
            ) : (
              'Show More Properties'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
