import { motion } from "framer-motion";
import { MailIcon, SearchIcon, ShieldIcon } from "../ui/medicalIcons";
import { sectionReveal, staggerContainer, staggerItem } from "../motion/motionPresets";

export default function Features() {
  const features = [
    {
      icon: <ShieldIcon className="h-7 w-7" />,
      title: "Protected Booking",
      desc: "Only logged-in users can create patient profiles and book appointments.",
    },
    {
      icon: <SearchIcon className="h-7 w-7" />,
      title: "Doctor Filters",
      desc: "Search by name, specialty, availability, and consultation fees.",
    },
    {
      icon: <MailIcon className="h-7 w-7" />,
      title: "Email Confirmation",
      desc: "Patients receive appointment details after successful booking.",
    },
  ];

  return (
    <section className="px-6 py-12">
      <motion.div className="theme-container" {...sectionReveal}>
        <div className="mb-12 text-center">
          <p className="theme-kicker">Features</p>
          <h2 className="theme-heading mt-2 text-4xl font-black">
            Built for a smooth clinic experience
          </h2>
        </div>

        <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={staggerItem}
              whileHover={{ y: -8, scale: 1.01 }}
              className="glass-card rounded-3xl p-7 text-slate-100 transition duration-300"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-violet-500 via-fuchsia-500 to-sky-500 text-white shadow-[0_18px_34px_rgba(124,92,255,0.28)]">
                {feature.icon}
              </div>
              <h3 className="mb-2 text-xl font-black text-white">{feature.title}</h3>
              <p className="theme-copy leading-7">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
