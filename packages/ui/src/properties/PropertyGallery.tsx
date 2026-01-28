"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@repo/lib";
import { PropertyGalleryLightbox } from "./PropertyGalleryLightbox";

// Fallback placeholder for failed images
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect fill='%23f5f5f4' width='800' height='600'/%3E%3Cpath fill='%23d4d4d4' d='M400 250c-27.6 0-50 22.4-50 50s22.4 50 50 50 50-22.4 50-50-22.4-50-50-50zm0 80c-16.5 0-30-13.5-30-30s13.5-30 30-30 30 13.5 30 30-13.5 30-30 30z'/%3E%3Cpath fill='%23d4d4d4' d='M550 200H250c-27.6 0-50 22.4-50 50v200c0 27.6 22.4 50 50 50h300c27.6 0 50-22.4 50-50V250c0-27.6-22.4-50-50-50zm30 250c0 16.5-13.5 30-30 30H250c-16.5 0-30-13.5-30-30V250c0-16.5 13.5-30 30-30h300c16.5 0 30 13.5 30 30v200z'/%3E%3C/svg%3E";

interface PropertyGalleryProps {
  images: string[];
  alt: string;
  className?: string;
  /** Price to overlay on gallery (mobile only) */
  priceOverlay?: string;
  /** Enable full-bleed mode for mobile (no padding/rounded corners) */
  fullBleed?: boolean;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
  }),
};

export function PropertyGallery({
  images,
  alt,
  className,
  priceOverlay,
  fullBleed = false,
}: PropertyGalleryProps) {
  const [[currentIndex, direction], setCurrentIndex] = useState([0, 0]);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const handleImageError = (index: number) => {
    setFailedImages(prev => new Set(prev).add(index));
  };

  const getImageSrc = (index: number) => {
    if (failedImages.has(index) || !images[index]) {
      return PLACEHOLDER_IMAGE;
    }
    return images[index];
  };

  const paginate = useCallback(
    (newDirection: number) => {
      setCurrentIndex(([prev]) => {
        let next = prev + newDirection;
        if (next < 0) next = images.length - 1;
        if (next >= images.length) next = 0;
        return [next, newDirection];
      });
    },
    [images.length]
  );

  const goToImage = useCallback((index: number) => {
    setCurrentIndex(([prev]) => [index, index > prev ? 1 : -1]);
  }, []);

  const openLightbox = useCallback(() => {
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  if (images.length === 0) {
    return (
      <div className={cn(
        "relative overflow-hidden bg-cream",
        fullBleed ? "aspect-[4/3] md:aspect-[16/10] md:rounded-xl" : "aspect-[16/10] rounded-xl",
        className
      )}>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={cn("space-y-4 w-full max-w-full", className)}>
        {/* Main Image */}
        <div
          className={cn(
            "relative overflow-hidden bg-cream w-full cursor-pointer group",
            fullBleed
              ? "aspect-[4/3] md:aspect-[16/10] md:rounded-xl"
              : "aspect-[16/10] rounded-xl"
          )}
          onClick={openLightbox}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && openLightbox()}
          aria-label="Open image gallery"
        >
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="absolute inset-0"
            >
              <Image
                src={getImageSrc(currentIndex)}
                alt={`${alt} - Image ${currentIndex + 1}`}
                fill
                className="object-cover"
                priority={currentIndex === 0}
                sizes="(max-width: 1024px) 100vw, 66vw"
                onError={() => handleImageError(currentIndex)}
                unoptimized={images[currentIndex]?.includes('ampre.ca')}
              />
            </motion.div>
          </AnimatePresence>

          {/* Price Overlay (Mobile only) */}
          {priceOverlay && (
            <div className="absolute bottom-4 left-4 z-10 md:hidden">
              <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
                <p className="text-xl font-bold text-primary">{priceOverlay}</p>
              </div>
            </div>
          )}

          {/* View All Photos button */}
          {images.length > 4 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                openLightbox();
              }}
              className="absolute bottom-4 right-4 z-10 hidden md:flex items-center gap-2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg text-sm font-medium text-secondary hover:bg-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              View All {images.length} Photos
            </button>
          )}

          {/* Expand icon overlay on hover (desktop) */}
          <div className="absolute inset-0 hidden md:flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-full p-3">
              <svg className="w-6 h-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  paginate(-1);
                }}
                className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-300"
                aria-label="Previous image"
              >
                <svg
                  className="w-6 h-6 text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  paginate(1);
                }}
                className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-300"
                aria-label="Next image"
              >
                <svg
                  className="w-6 h-6 text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              {/* Image Counter - centered on mobile to avoid arrow overlap */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 md:left-auto md:right-4 md:translate-x-0 z-10 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
                {currentIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>

      {/* Thumbnail Strip - larger touch targets on mobile */}
      {images.length > 1 && (
        <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide w-full max-w-full">
          {images.slice(0, 8).map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={cn(
                "relative flex-shrink-0 w-24 h-20 md:w-20 md:h-16 rounded-lg overflow-hidden transition-all duration-300",
                currentIndex === index
                  ? "ring-2 ring-primary ring-offset-2"
                  : "opacity-60 hover:opacity-100"
              )}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={getImageSrc(index)}
                alt={`${alt} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 96px, 80px"
                onError={() => handleImageError(index)}
                unoptimized={image?.includes('ampre.ca')}
              />
            </button>
          ))}
          {images.length > 8 && (
            <button
              onClick={() => {
                goToImage(8);
                openLightbox();
              }}
              className="relative flex-shrink-0 w-24 h-20 md:w-20 md:h-16 rounded-lg overflow-hidden bg-secondary/80 flex items-center justify-center text-white text-sm font-medium hover:bg-secondary transition-colors"
            >
              +{images.length - 8}
            </button>
          )}
        </div>
      )}

      {/* Mobile dot indicators (tappable) */}
      {images.length > 1 && images.length <= 8 && (
        <div className="flex justify-center gap-2 md:hidden">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all duration-300",
                currentIndex === index
                  ? "bg-primary scale-110"
                  : "bg-primary/30"
              )}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>

    {/* Lightbox */}
    <PropertyGalleryLightbox
      images={images.map((_, i) => getImageSrc(i))}
      currentIndex={currentIndex}
      isOpen={lightboxOpen}
      onClose={closeLightbox}
      onNavigate={goToImage}
      alt={alt}
    />
  </>
  );
}
