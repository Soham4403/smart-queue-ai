import { motion } from "framer-motion";
import { CalendarIcon, ShieldIcon, StethoscopeIcon } from "../ui/medicalIcons";
import { sectionReveal, staggerContainer, staggerItem } from "../motion/motionPresets";

export default function HowItWorks() {
  const steps = [
    [<CalendarIcon className="h-7 w-7" />, "Register", "Create your account with basic personal details."],
    [<ShieldIcon className="h-7 w-7" />, "Login", "JWT token protects dashboard and booking access."],
    [<StethoscopeIcon className="h-7 w-7" />, "Book", "Create a patient profile, choose a doctor, and confirm a slot."],
  ];

  return (
    <section className="px-6 py-12 text-center">
      <motion.div className="theme-container" {...sectionReveal}>
        <p className="theme-kicker">How it works</p>
        <h2 className="theme-heading mt-2 text-4xl font-bold">Three simple steps</h2>

        <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map(([icon, title, desc], index) => (
            <motion.div key={title} variants={staggerItem} whileHover={{ y: -8, scale: 1.01 }} className="glass-card rounded-3xl p-7 text-slate-100 transition duration-300">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-cyan-400 to-blue-600 text-3xl font-bold shadow-lg shadow-blue-600/30">
                {icon}
              </div>
              <p className="mb-2 text-sm font-bold text-cyan-200">Step {index + 1}</p>
              <h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
              <p className="theme-copy">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
