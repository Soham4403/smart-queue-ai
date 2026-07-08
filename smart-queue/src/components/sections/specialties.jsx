import { motion } from "framer-motion";
import { SearchIcon, StethoscopeIcon } from "../ui/medicalIcons";
import { sectionReveal, staggerContainer, staggerItem } from "../motion/motionPresets";

const specialties = [
  ["Cardiology", "Heart care, chest discomfort, and follow-ups"],
  ["Neurology", "Headaches, dizziness, and nerve concerns"],
  ["Orthopedics", "Bones, joints, back pain, and injuries"],
  ["Pediatrics", "Childcare and family health support"],
  ["Dermatology", "Skin, acne, allergy, and rashes"],
  ["Dentistry", "Teeth, gums, and oral care"],
];

export default function Specialties() {
  return (
    <section className="px-6 py-14">
      <motion.div className="theme-container" {...sectionReveal}>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="theme-kicker">Medical specialties</p>
            <h2 className="theme-heading mt-2 text-4xl font-black">Find the right specialist faster</h2>
          </div>

          <div className="theme-chip text-sm font-semibold text-slate-200">
            <SearchIcon />
            Live doctor filtering
          </div>
        </div>

        <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {specialties.map(([name, desc]) => (
            <motion.div key={name} variants={staggerItem} whileHover={{ y: -7, scale: 1.01 }} className="glass-card rounded-[1.6rem] p-6 transition duration-300">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-black text-white">{name}</p>
                  <p className="theme-copy mt-2 leading-7">{desc}</p>
                </div>
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-linear-to-br from-violet-500 via-fuchsia-500 to-sky-500 text-white">
                  <StethoscopeIcon className="h-7 w-7" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
