"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@repo/lib";
import {
  bentoCardVariants,
  staggerContainerVariants,
  easings,
} from "../motion";

// Container component
interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <motion.div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6",
        className
      )}
      variants={staggerContainerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

// Card size variants
export type BentoCardSize = "default" | "wide" | "tall" | "large";

interface BentoCardProps {
  icon?: ReactNode;
  title: string;
  description: string;
  href?: string;
  cta?: string;
  size?: BentoCardSize;
  className?: string;
  children?: ReactNode;
}

const sizeClasses: Record<BentoCardSize, string> = {
  default: "",
  wide: "md:col-span-2",
  tall: "md:row-span-2",
  large: "md:col-span-2 lg:row-span-2",
};

export function BentoCard({
  icon,
  title,
  description,
  href,
  cta = "Learn more",
  size = "default",
  className,
  children,
}: BentoCardProps) {
  const content = (
    <motion.div
      variants={bentoCardVariants}
      whileHover={{
        scale: 1.02,
        transition: easings.spring,
      }}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-xl p-6 h-full min-h-[200px]",
        "bg-white dark:bg-secondary/80 border border-primary/10",
        "shadow-[0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05)]",
        "hover:shadow-[0_8px_30px_rgba(0,0,0,.12)] hover:border-primary/30",
        "transition-shadow duration-300",
        sizeClasses[size],
        className
      )}
    >
      {/* Icon */}
      {icon && (
        <div className="feature-icon mb-4 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
      )}

      {/* Content */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-secondary dark:text-white mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-text-secondary dark:text-gray-300 text-sm leading-relaxed">
          {description}
        </p>
      </div>

      {/* Custom content slot */}
      {children}

      {/* CTA - appears on hover */}
      {href && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <span className="inline-flex items-center text-sm font-medium text-primary">
            {cta}
            <svg
              className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform"
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
          </span>
        </motion.div>
      )}

      {/* Hover background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl" />
    </motion.div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    );
  }

  return content;
}

// Feature-specific card with centered layout (matching existing feature card style)
interface BentoFeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function BentoFeatureCard({
  icon,
  title,
  description,
  className,
}: BentoFeatureCardProps) {
  return (
    <motion.div
      variants={bentoCardVariants}
      whileHover={{
        scale: 1.02,
        transition: easings.spring,
      }}
      className={cn(
        "group luxury-card-premium rounded-xl p-8 text-center",
        "hover:shadow-[0_8px_30px_rgba(0,0,0,.12)]",
        "transition-shadow duration-300",
        className
      )}
    >
      <div className="feature-icon mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-secondary dark:text-white mb-3 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-text-secondary dark:text-gray-300 text-sm leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}
