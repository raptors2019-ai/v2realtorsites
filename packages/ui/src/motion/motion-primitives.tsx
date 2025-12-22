"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

// Re-export motion components as client components
export const MotionDiv = motion.div;
export const MotionSection = motion.section;
export const MotionArticle = motion.article;
export const MotionLi = motion.li;
export const MotionButton = motion.button;
export const MotionSpan = motion.span;
export const MotionImg = motion.img;
export const MotionUl = motion.ul;
export const MotionNav = motion.nav;
export const MotionHeader = motion.header;
export const MotionFooter = motion.footer;
export const MotionAside = motion.aside;
export const MotionMain = motion.main;
export const MotionFigure = motion.figure;
export const MotionA = motion.a;
export const MotionP = motion.p;
export const MotionH1 = motion.h1;
export const MotionH2 = motion.h2;
export const MotionH3 = motion.h3;
export const MotionH4 = motion.h4;

// Typed wrapper types for custom motion components
export type MotionDivProps = HTMLMotionProps<"div">;
export type MotionSectionProps = HTMLMotionProps<"section">;
export type MotionArticleProps = HTMLMotionProps<"article">;
export type MotionLiProps = HTMLMotionProps<"li">;
export type MotionButtonProps = HTMLMotionProps<"button">;
export type MotionSpanProps = HTMLMotionProps<"span">;
export type MotionImgProps = HTMLMotionProps<"img">;
export type MotionUlProps = HTMLMotionProps<"ul">;
export type MotionAProps = HTMLMotionProps<"a">;
