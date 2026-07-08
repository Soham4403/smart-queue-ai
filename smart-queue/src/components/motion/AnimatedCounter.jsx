import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function AnimatedCounter({ value = 0, suffix = "", prefix = "", duration = 1.1, decimals = 0, className = "" }) {
  const reduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(reduceMotion ? value : 0);

  useEffect(() => {
    if (reduceMotion) {
      setDisplayValue(value);
      return undefined;
    }

    let frame = 0;
    const start = performance.now();
    const from = 0;
    const to = Number(value) || 0;

    const tick = (now) => {
      const progress = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextValue = from + (to - from) * eased;
      setDisplayValue(decimals > 0 ? Number(nextValue.toFixed(decimals)) : Math.round(nextValue));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [duration, reduceMotion, value]);

  return (
      <motion.span
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
      className={className}
    >
      {prefix}
      {typeof displayValue === "number" && decimals > 0
        ? displayValue.toFixed(decimals)
        : displayValue}
      {suffix}
    </motion.span>
  );
}
