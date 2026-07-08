import { motion } from "framer-motion";
import Button from "../ui/button";
import { CalendarIcon, HeartPulseIcon, SearchIcon, ShieldIcon } from "../ui/medicalIcons";
import { cardMotion, sectionReveal } from "../motion/motionPresets";

const doctorPhoto =
  "https://images.pexels.com/photos/8942251/pexels-photo-8942251.jpeg?auto=compress&cs=tinysrgb&w=1200";

export default function AIPreview() {
  return (
    <section className="px-6 py-14">
      <motion.div className="theme-container" {...sectionReveal}>
        <div className="grid items-center gap-8 overflow-hidden rounded-4xl border border-white/10 bg-[linear-gradient(135deg,rgba(10,16,36,0.96),rgba(15,20,46,0.9),rgba(29,16,60,0.9))] p-6 md:grid-cols-[1fr_0.95fr] md:p-8">
          <motion.div initial="rest" whileHover="hover" variants={cardMotion}>
            <p className="theme-kicker">AI assistant preview</p>
            <h2 className="theme-heading mt-3 text-4xl font-black">
              Talk, search, and book with one smart assistant
            </h2>
            <p className="theme-copy mt-5 max-w-xl leading-8">
              SmartQueue AI helps visitors find the right specialist, see real doctors from MongoDB, and move into the protected booking flow without guesswork.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <div className="theme-chip">
                <SearchIcon />
                Symptom-based doctor search
              </div>
              <div className="theme-chip">
                <ShieldIcon />
                Medical disclaimer built in
              </div>
              <div className="theme-chip">
                <CalendarIcon />
                Live slot awareness
              </div>
            </div>

            <div className="mt-8">
              <Button
                variant="primary"
                onClick={() => window.dispatchEvent(new Event("smartqueue:open-ai"))}
              >
                Talk to AI
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative min-h-105 overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/6 p-4"
          >
            <img
              src={doctorPhoto}
              alt="AI health assistant"
              className="absolute inset-0 h-full w-full object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,12,24,0.08),rgba(9,12,24,0.85))]" />

            <div className="relative flex h-full flex-col justify-between rounded-[1.4rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <div className="glass-card max-w-[85%] rounded-3xl p-4 text-sm text-white">
                I have chest pain and need to book tomorrow evening.
              </div>

              <div className="ml-auto max-w-[85%] rounded-3xl bg-linear-to-r from-violet-500 via-fuchsia-500 to-sky-500 p-4 text-sm text-white shadow-[0_18px_40px_rgba(124,92,255,0.24)]">
                The closest specialist is a Cardiologist. I can show available doctors and help you book a protected slot.
              </div>

              <div className="glass-card mt-6 rounded-3xl p-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400/15 text-cyan-200">
                    <HeartPulseIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">System status</p>
                    <p className="font-bold text-white">Live booking guidance ready</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
