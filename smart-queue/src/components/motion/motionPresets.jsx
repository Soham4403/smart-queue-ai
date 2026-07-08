import { motion } from "framer-motion";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const pageTransition = {
  initial: { opacity: 0, y: 16, filter: "blur(10px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -10,
    filter: "blur(10px)",
    transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
  },
};

export const sectionReveal = {
  initial: { opacity: 0, y: 22 },
  whileInView: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
  viewport: { once: true, amount: 0.18 },
};

export const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.08 },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

export const cardMotion = {
  rest: { y: 0, scale: 1, rotateX: 0, rotateY: 0 },
  hover: {
    y: -6,
    scale: 1.01,
    rotateX: 1.2,
    rotateY: -1.2,
    transition: { type: "spring", stiffness: 240, damping: 20 },
  },
};

export const glowMotion = {
  animate: {
    opacity: [0.55, 0.95, 0.55],
    scale: [1, 1.03, 1],
    transition: { duration: 4.8, repeat: Infinity, ease: "easeInOut" },
  },
};

export const MotionCard = motion.div;
export const MotionSection = motion.section;
export const MotionButton = motion.button;
