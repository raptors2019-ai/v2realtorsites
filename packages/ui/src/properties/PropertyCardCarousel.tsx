"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@repo/lib";
import { carouselSlideVariants } from "../motion";

interface PropertyCardCarouselProps {
  images: string[];
  alt: string;
  className?: string;
}

export function PropertyCardCarousel({
  images,
  alt,
  className,
}: PropertyCardCarouselProps) {
  const [[currentIndex, direction], setCurrentIndex] = useState([0, 0]);

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

  if (images.length === 0) return null;

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={images[currentIndex]}
          custom={direction}
          variants={carouselSlideVariants}
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
            src={images[currentIndex]}
            alt={`${alt} - Image ${currentIndex + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={currentIndex === 0}
          />
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows - always visible */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              paginate(-1);
            }}
            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-85 hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 shadow-md"
            aria-label="Previous image"
          >
            <svg
              className="w-4 h-4 text-secondary"
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
              e.preventDefault();
              e.stopPropagation();
              paginate(1);
            }}
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-85 hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 shadow-md"
            aria-label="Next image"
          >
            <svg
              className="w-4 h-4 text-secondary"
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

          {/* Pagination dots - improved touch targets for mobile */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {images.slice(0, 6).map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentIndex([index, index > currentIndex ? 1 : -1]);
                }}
                className={cn(
                  "p-1.5 rounded-full transition-all duration-300",
                  "min-w-[20px] min-h-[20px] flex items-center justify-center"
                )}
                aria-label={`Go to image ${index + 1}`}
              >
                <span className={cn(
                  "block h-2 rounded-full transition-all duration-300",
                  currentIndex === index
                    ? "w-4 bg-white"
                    : "w-2 bg-white/50 hover:bg-white/75"
                )} />
              </button>
            ))}
            {images.length > 6 && (
              <div className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded-full min-w-[20px] min-h-[20px] flex items-center justify-center">
                +{images.length - 6}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
