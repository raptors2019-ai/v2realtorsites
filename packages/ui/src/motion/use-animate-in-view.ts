"use client";

import { useRef } from "react";
import { useInView, type UseInViewOptions } from "framer-motion";

interface UseAnimateInViewOptions extends Omit<UseInViewOptions, "once" | "amount"> {
  /** Only animate once. Defaults to true */
  once?: boolean;
  /** Percentage of element visible before triggering. Defaults to 0.3 (30%) */
  amount?: number | "some" | "all";
}

/**
 * Custom hook for scroll-triggered animations using Framer Motion's useInView
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { ref, isInView } = useAnimateInView();
 *
 *   return (
 *     <motion.div
 *       ref={ref}
 *       initial="hidden"
 *       animate={isInView ? "visible" : "hidden"}
 *       variants={fadeInUpVariants}
 *     >
 *       Content appears on scroll
 *     </motion.div>
 *   );
 * }
 * ```
 */
export function useAnimateInView<T extends HTMLElement = HTMLDivElement>(
  options: UseAnimateInViewOptions = {}
) {
  const ref = useRef<T>(null);
  const { once = true, amount = 0.3, ...rest } = options;

  const isInView = useInView(ref, { once, amount, ...rest });

  return { ref, isInView };
}

/**
 * Hook variant specifically for generic HTMLElement refs
 */
export function useAnimateInViewGeneric(options: UseAnimateInViewOptions = {}) {
  const ref = useRef<HTMLElement>(null);
  const { once = true, amount = 0.3, ...rest } = options;

  const isInView = useInView(ref, { once, amount, ...rest });

  return { ref, isInView };
}
