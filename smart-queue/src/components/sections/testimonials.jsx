import { motion } from "framer-motion";
import { sectionReveal, staggerContainer, staggerItem } from "../motion/motionPresets";

const testimonials = [
  {
    quote:
      "The booking flow feels clean and trustworthy. The assistant makes it much easier to find the right doctor quickly.",
    name: "Aditi Roy",
    role: "Patient",
  },
  {
    quote:
      "The dashboard and admin controls are organized in a way that feels much more professional than a normal class project.",
    name: "Rahul Sen",
    role: "Clinic staff",
  },
  {
    quote:
      "The UI is attractive, readable, and consistent. It already looks like something we could demo in an interview.",
    name: "Priya Das",
    role: "Mentor feedback",
  },
];

export default function Testimonials() {
  return (
    <section className="px-6 py-14">
      <motion.div className="theme-container" {...sectionReveal}>
        <div className="mb-10 text-center">
          <p className="theme-kicker">Testimonials</p>
          <h2 className="theme-heading mt-2 text-4xl font-black">
            Why people like the flow
          </h2>
        </div>

        <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} className="grid gap-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <motion.div key={item.name} variants={staggerItem} whileHover={{ y: -6, scale: 1.01 }} className="glass-card rounded-[1.6rem] p-7">
              <p className="text-5xl leading-none text-cyan-300/70">"</p>
              <p className="theme-copy -mt-2 leading-8">{item.quote}</p>
              <div className="mt-6 border-t border-white/10 pt-5">
                <p className="font-black text-white">{item.name}</p>
                <p className="text-sm text-slate-400">{item.role}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
