import { motion } from "framer-motion";
import AnimatedCounter from "../motion/AnimatedCounter";
import { sectionReveal, staggerContainer, staggerItem } from "../motion/motionPresets";

const stats = [
  { value: 50, suffix: "K+", label: "Happy patients", decimals: 0 },
  { value: 120, suffix: "K+", label: "Appointments handled", decimals: 0 },
  { value: 4.9, suffix: "", label: "User satisfaction", decimals: 1 },
  { value: "24/7", suffix: "", label: "Assistant support", staticValue: true },
];

export default function Stats() {
  return (
    <section className="px-6 py-6">
      <motion.div className="theme-container" {...sectionReveal}>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="glass-panel grid gap-4 rounded-4xl px-6 py-7 md:grid-cols-4"
        >
          {stats.map((item) => (
            <motion.div
              key={item.label}
              variants={staggerItem}
              whileHover={{ y: -4, scale: 1.01 }}
              className="rounded-[1.4rem] border border-white/8 bg-white/4 px-5 py-6 text-center transition"
            >
              <p className="bg-linear-to-r from-cyan-200 via-white to-fuchsia-200 bg-clip-text text-4xl font-black text-transparent">
                {item.staticValue ? (
                  item.value
                ) : (
                  <AnimatedCounter
                    value={item.value}
                    suffix={item.suffix}
                    duration={1.2}
                    decimals={item.decimals}
                    className="inline-block"
                  />
                )}
              </p>
              <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-300/80">
                {item.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
