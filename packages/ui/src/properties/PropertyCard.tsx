"use client";

import { Property } from "@repo/types";
import { formatPrice, cn } from "@repo/lib";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface PropertyCardProps {
  property: Property;
  className?: string;
}

export function PropertyCard({ property, className }: PropertyCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const primaryImage = property.images[0];

  return (
    <Link
      href={`/properties/${property.id}`}
      className={cn(
        "group block luxury-card-premium rounded-xl overflow-hidden transition-all duration-500",
        className
      )}
    >
      {/* Image */}
      <div className="relative h-60 bg-gradient-to-br from-cream to-cream-dark overflow-hidden">
        {primaryImage && (
          <Image
            src={primaryImage}
            alt={property.title}
            fill
            className={cn(
              "object-cover transition-all duration-700 ease-out",
              "group-hover:scale-110",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setImageLoaded(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}

        {/* Premium gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/70 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

        {/* Status Badge */}
        {property.status === "active" && (
          <div className="absolute top-4 left-4 badge-sale">
            For Sale
          </div>
        )}

        {/* Featured Badge */}
        {property.featured && (
          <div className="absolute top-4 right-4 badge-premium">
            Premium
          </div>
        )}

        {/* View Details overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <span className="bg-white/95 backdrop-blur-sm text-secondary px-5 py-2.5 rounded-lg text-sm font-medium shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
            View Details
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Price and Type */}
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-2xl font-bold text-gradient-primary">
            {formatPrice(property.price)}
          </h3>
          <span className="text-xs text-primary capitalize uppercase tracking-wider font-medium">
            {property.propertyType}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-lg font-semibold text-secondary mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300">
          {property.title}
        </h4>

        {/* Location */}
        <p className="text-text-secondary text-sm mb-5 flex items-center gap-2">
          <svg
            className="w-4 h-4 flex-shrink-0 text-primary"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="line-clamp-1">
            {property.address}, {property.city}
          </span>
        </p>

        {/* Property Details */}
        <div className="flex items-center gap-5 text-sm text-text-secondary border-t border-primary/20 pt-5">
          {/* Bedrooms */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cream flex items-center justify-center">
              <svg
                className="w-4 h-4 text-primary"
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
            <span className="font-medium">{property.bedrooms} bed</span>
          </div>

          {/* Bathrooms */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cream flex items-center justify-center">
              <svg
                className="w-4 h-4 text-primary"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="font-medium">{property.bathrooms} bath</span>
          </div>

          {/* Square Feet */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cream flex items-center justify-center">
              <svg
                className="w-4 h-4 text-primary"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </div>
            <span className="font-medium">{property.sqft.toLocaleString()} sqft</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
