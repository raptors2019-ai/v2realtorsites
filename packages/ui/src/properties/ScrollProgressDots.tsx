"use client";

import { cn } from "@repo/lib";

interface ScrollProgressDotsProps {
  total: number;
  activeIndex: number;
  onDotClick: (index: number) => void;
  className?: string;
}

export function ScrollProgressDots({
  total,
  activeIndex,
  onDotClick,
  className,
}: ScrollProgressDotsProps) {
  if (total <= 1) return null;

  return (
    <div className={cn("flex justify-center gap-2", className)}>
      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          onClick={() => onDotClick(index)}
          className={cn(
            "w-2.5 h-2.5 rounded-full transition-all duration-300",
            index === activeIndex
              ? "bg-primary scale-110"
              : "bg-primary/30 hover:bg-primary/50"
          )}
          aria-label={`Go to item ${index + 1}`}
          aria-current={index === activeIndex ? "true" : undefined}
        />
      ))}
    </div>
  );
}
