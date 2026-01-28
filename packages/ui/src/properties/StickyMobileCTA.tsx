"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

interface StickyMobileCTAProps {
  address: string;
  mlsNumber: string | undefined;
  propertyId: string;
  price: string;
}

export function StickyMobileCTA({
  address,
  mlsNumber,
  propertyId,
  price,
}: StickyMobileCTAProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky CTA after scrolling 400px (past initial mobile CTA)
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-gray-200 shadow-lg px-4 py-3 safe-area-inset-bottom"
        >
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-primary truncate">{price}</p>
            </div>
            <Link
              href={`/contact?type=viewing&address=${encodeURIComponent(address)}&mls=${mlsNumber || propertyId}`}
              className="flex-shrink-0 btn-primary px-6 py-3 rounded-lg text-center font-semibold text-sm whitespace-nowrap"
            >
              Schedule Viewing
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
