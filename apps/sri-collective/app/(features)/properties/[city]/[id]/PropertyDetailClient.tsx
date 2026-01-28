"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PropertyDetailClientProps {
  description: string;
}

const PREVIEW_LENGTH = 150;

export function PropertyDetailClient({ description }: PropertyDetailClientProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = description.length > PREVIEW_LENGTH;

  // On desktop, always show full description
  // On mobile, show truncated with "Read more"
  return (
    <>
      {/* Desktop: Full description */}
      <p className="hidden md:block text-text-secondary text-sm md:text-base leading-relaxed break-words whitespace-pre-line">
        {description}
      </p>

      {/* Mobile: Expandable description */}
      <div className="md:hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={isExpanded ? "expanded" : "collapsed"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-text-secondary text-sm leading-relaxed break-words whitespace-pre-line"
          >
            {isExpanded || !shouldTruncate
              ? description
              : `${description.slice(0, PREVIEW_LENGTH).trim()}...`}
          </motion.p>
        </AnimatePresence>

        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-primary font-medium text-sm hover:text-primary/80 transition-colors inline-flex items-center gap-1"
          >
            {isExpanded ? (
              <>
                Read less
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </>
            ) : (
              <>
                Read more
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </button>
        )}
      </div>
    </>
  );
}
