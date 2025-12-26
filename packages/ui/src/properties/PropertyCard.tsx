"use client";

import { Property } from "@repo/types";
import { formatPrice, cn } from "@repo/lib";
import { trackPropertySelect } from "@repo/analytics";
import Link from "next/link";
import { motion } from "framer-motion";
import { PropertyCardCarousel } from "./PropertyCardCarousel";
import {
  cardHoverVariants,
  staggerContainerVariants,
  staggerItemVariants,
} from "../motion";

interface PropertyCardProps {
  property: Property;
  className?: string;
  index?: number; // For stagger delay when used in grids
  citySlug?: string; // For SEO-friendly URLs like /properties/toronto/123
}

// Helper to create city slug from city name
function createCitySlug(city: string): string {
  return city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// Map Toronto codes to display names
function getDisplayCity(city: string): string {
  // Toronto Central codes (C01-C15)
  if (/^Toronto C\d+$/i.test(city)) return 'Toronto Central';
  // Toronto East codes (E01-E11)
  if (/^Toronto E\d+$/i.test(city)) return 'Toronto East';
  // Toronto West codes (W01-W10)
  if (/^Toronto W\d+$/i.test(city)) return 'Toronto West';
  // Return as-is for other cities
  return city;
}

export function PropertyCard({ property, className, index = 0, citySlug }: PropertyCardProps) {
  // Use provided citySlug or generate from property city
  const slug = citySlug || createCitySlug(property.city);
  const propertyUrl = `/properties/${slug}/${property.id}`;

  // Track property selection for analytics
  const handleClick = () => {
    trackPropertySelect(
      {
        item_id: property.id,
        item_name: property.address,
        item_category: property.propertyType,
        item_category2: property.listingType === 'lease' ? 'For Lease' : 'For Sale',
        item_category3: property.city,
        price: property.price,
        index,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        square_feet: property.sqft,
      },
      { list_id: 'property_list', list_name: 'Properties' }
    );
  };

  return (
    <motion.div
      initial="initial"
      whileHover="hover"
      variants={cardHoverVariants}
      style={{ borderRadius: "0.75rem" }} // Required for shadow animation
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={propertyUrl}
        onClick={handleClick}
        className={cn(
          "group block luxury-card-premium rounded-xl overflow-hidden",
          className
        )}
      >
        {/* Image Carousel */}
        <div className="relative h-60 bg-gradient-to-br from-cream to-cream-dark overflow-hidden">
          <PropertyCardCarousel images={property.images} alt={property.title} />

          {/* Premium gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-secondary/70 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none" />

          {/* Status Badge - Left Side */}
          {property.status === "active" && (
            <div className={`absolute top-3 left-3 md:top-4 md:left-4 z-10 text-xs md:text-sm ${property.listingType === 'lease' ? 'badge-lease' : 'badge-sale'}`}>
              <svg className="w-2.5 h-2.5 md:w-3 md:h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="hidden sm:inline">{property.listingType === 'lease' ? 'For Lease' : 'For Sale'}</span>
              <span className="sm:hidden">{property.listingType === 'lease' ? 'Lease' : 'Sale'}</span>
            </div>
          )}
          {property.status === "pending" && (
            <div className="absolute top-3 left-3 md:top-4 md:left-4 badge-pending text-xs md:text-sm z-10">
              <svg className="w-2.5 h-2.5 md:w-3 md:h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Pending
            </div>
          )}
          {property.status === "sold" && (
            <div className="absolute top-3 left-3 md:top-4 md:left-4 badge-sold text-xs md:text-sm z-10">
              <svg className="w-2.5 h-2.5 md:w-3 md:h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Sold
            </div>
          )}

          {/* Property Type Badge - hidden on mobile to reduce clutter */}
          <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 badge-type text-xs md:text-sm z-10 hidden sm:flex">
            {property.propertyType}
          </div>

          {/* Top Right - City Badge */}
          <div className="absolute top-3 right-3 md:top-4 md:right-4 z-10">
            <div className="badge-info text-xs md:text-sm">
              <svg className="w-2.5 h-2.5 md:w-3 md:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {getDisplayCity(property.city)}
            </div>
          </div>

          {/* Bottom Right - Bedrooms Badge (or Featured if featured) */}
          <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 z-10 flex flex-col gap-1.5 md:gap-2 items-end">
            {property.featured && (
              <div className="badge-premium text-xs md:text-sm">
                <svg className="w-2.5 h-2.5 md:w-3 md:h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="hidden sm:inline">Featured</span>
              </div>
            )}
            <div className="badge-info text-xs md:text-sm">
              <svg className="w-2.5 h-2.5 md:w-3 md:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {property.bedrooms} Bed
            </div>
          </div>

          {/* View Details overlay on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <span className="bg-white/95 backdrop-blur-sm text-secondary px-4 md:px-5 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-medium shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              View Details
            </span>
          </div>
        </div>

        {/* Content with staggered animations */}
        <motion.div
          className="p-5 md:p-6"
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          {/* Price and Type */}
          <motion.div
            variants={staggerItemVariants}
            className="flex items-baseline justify-between mb-3"
          >
            <h3 className="text-xl md:text-2xl font-bold text-gradient-primary">
              {formatPrice(property.price)}
            </h3>
            <span className="text-xs text-primary capitalize uppercase tracking-wider font-medium sm:hidden">
              {property.propertyType}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h4
            variants={staggerItemVariants}
            className="text-base md:text-lg font-semibold text-secondary mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300"
          >
            {property.title}
          </motion.h4>

          {/* Location */}
          <motion.p
            variants={staggerItemVariants}
            className="text-text-secondary text-xs md:text-sm mb-4 md:mb-5 flex items-center gap-2"
          >
            <svg
              className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0 text-primary"
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
          </motion.p>

          {/* Property Details */}
          <motion.div
            variants={staggerItemVariants}
            className="flex items-center gap-4 md:gap-5 text-xs md:text-sm text-text-secondary border-t border-primary/20 pt-4 md:pt-5"
          >
            {/* Bedrooms */}
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-cream flex items-center justify-center">
                <svg
                  className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary"
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
              <span className="font-medium">{property.bedrooms} <span className="hidden sm:inline">bed</span></span>
            </div>

            {/* Bathrooms */}
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-cream flex items-center justify-center">
                <svg
                  className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary"
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
              <span className="font-medium">{property.bathrooms} <span className="hidden sm:inline">bath</span></span>
            </div>

            {/* Square Feet */}
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-cream flex items-center justify-center">
                <svg
                  className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary"
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
              <span className="font-medium">
                {property.sqft.toLocaleString()} <span className="hidden sm:inline">sqft</span>
              </span>
            </div>
          </motion.div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
