import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import doctorPhoto from "../../assets/hero-doctor.png";
import Button from "../ui/button";
import ProtectedAction from "../ui/protectedAction";
import { CalendarIcon, SearchIcon, StethoscopeIcon } from "../ui/medicalIcons";

const clinicBg =
  "https://images.pexels.com/photos/3259629/pexels-photo-3259629.jpeg?auto=compress&cs=tinysrgb&w=1600";

const fadeInUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { delay, duration: 0.42, ease: [0.22, 1, 0.36, 1] },
});

export default function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="px-6 pb-8 pt-5">
      <div
        className="theme-container spotlight-grid glass-panel relative overflow-hidden rounded-[2.2rem] bg-cover bg-center px-6 pb-10 pt-18 md:px-10 md:pb-12"
        style={{
          backgroundImage: `linear-gradient(112deg, rgba(8,12,28,0.97), rgba(14,18,42,0.92), rgba(12,26,66,0.58)), url(${clinicBg})`,
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_20%,rgba(119,242,255,0.12),transparent_18%),radial-gradient(circle_at_84%_34%,rgba(213,109,255,0.12),transparent_22%),radial-gradient(circle_at_50%_78%,rgba(92,184,255,0.08),transparent_30%)]" />

        <motion.div
          animate={reduceMotion ? undefined : { opacity: [0.38, 0.8, 0.38], scale: [1, 1.05, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[6%] top-[18%] h-60 w-60 rounded-full bg-cyan-400/10 blur-3xl"
        />
        <motion.div
          animate={reduceMotion ? undefined : { opacity: [0.3, 0.72, 0.3], x: [0, 12, 0], y: [0, -8, 0] }}
          transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-[12%] top-[14%] h-52 w-52 rounded-full bg-fuchsia-400/10 blur-3xl"
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[0.92fr_1.08fr] md:gap-12">
          <div className="relative z-10 text-white">
            <motion.p {...fadeInUp(0.05)} className="theme-chip mb-6 w-fit text-sm font-bold text-cyan-50">
              <StethoscopeIcon />
              Smart appointment booking
            </motion.p>

            <motion.h1 className="theme-heading max-w-[11ch] text-5xl font-black leading-[0.93] md:text-7xl">
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 22, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.12, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              >
                Healthcare
              </motion.span>
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 22, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.22, duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              >
                that feels
              </motion.span>
              <motion.span
                className="gradient-text block"
                initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.32, duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
              >
                future-ready.
              </motion.span>
            </motion.h1>

            <motion.p
              {...fadeInUp(0.44)}
              className="theme-copy mt-6 max-w-xl text-lg leading-8"
            >
              Register securely, search trusted doctors, filter by specialty, book a slot, and keep every appointment organized in one smooth flow.
            </motion.p>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ delay: 0.56, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <motion.div whileHover={reduceMotion ? undefined : { scale: 1.02 }} whileTap={reduceMotion ? undefined : { scale: 0.97 }}>
                <ProtectedAction to="/doctors">Book Appointment</ProtectedAction>
              </motion.div>

              <motion.div whileHover={reduceMotion ? undefined : { scale: 1.02 }} whileTap={reduceMotion ? undefined : { scale: 0.97 }}>
                <Button
                  variant="secondary"
                  onClick={() => window.dispatchEvent(new Event("smartqueue:open-ai"))}
                >
                  Talk to AI
                </Button>
              </motion.div>

              <motion.div whileHover={reduceMotion ? undefined : { scale: 1.02 }} whileTap={reduceMotion ? undefined : { scale: 0.97 }}>
                <Link to="/about">
                  <Button variant="secondary">How It Works</Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            className="relative min-h-136 md:min-h-160"
            initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.98 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              animate={reduceMotion ? undefined : { y: [0, -7, 0] }}
              transition={{ duration: 7.2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-x-[14%] top-8 h-[80%] rounded-[2.8rem] bg-[radial-gradient(circle_at_50%_30%,rgba(92,184,255,0.18),transparent_40%),radial-gradient(circle_at_58%_58%,rgba(213,109,255,0.14),transparent_34%),radial-gradient(circle_at_42%_70%,rgba(119,242,255,0.1),transparent_30%)] blur-2xl"
            />

            <motion.div
              animate={reduceMotion ? undefined : { opacity: [0.7, 1, 0.7], scale: [1, 1.02, 1] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-x-[12%] top-6 h-[82%] rounded-[2.9rem] border border-white/10 bg-[radial-gradient(circle_at_50%_35%,rgba(124,92,255,0.16),transparent_58%)] backdrop-blur-[2px]"
            />

            <div className="absolute left-1/2 top-[12%] h-72 w-[18rem] -translate-x-1/2 rounded-full border border-cyan-300/18" />
            <div className="absolute left-1/2 top-[18%] h-56 w-56 -translate-x-1/2 rounded-full border border-fuchsia-300/18" />

            <motion.div
              animate={reduceMotion ? undefined : { opacity: [0.24, 0.55, 0.24] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-1/2 top-[46%] h-1 w-[16rem] -translate-x-1/2 rounded-full bg-linear-to-r from-transparent via-cyan-300/70 to-transparent blur-sm"
            />

            <motion.div
              animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
              transition={{ duration: 7.4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 flex items-end justify-center"
            >
              <div className="relative h-132 w-[min(33rem,94%)] md:h-156 md:w-[min(38rem,94%)]">
                <div className="absolute inset-x-10 inset-y-14 rounded-[2.8rem] bg-[radial-gradient(circle_at_50%_38%,rgba(255,255,255,0.16),transparent_18%),radial-gradient(circle_at_50%_64%,rgba(92,184,255,0.08),transparent_36%)] blur-2xl" />
                <div className="absolute inset-x-12 bottom-6 top-14 rounded-[2.4rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.012))] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-[2px]" />

                <div className="absolute inset-x-14 top-12 bottom-10 overflow-hidden rounded-[2.1rem] border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
                  <motion.img
                    src={doctorPhoto}
                    alt="Doctor ready for appointment"
                    className="h-full w-full object-cover object-[50%_12%]"
                    animate={reduceMotion ? undefined : { y: [0, -6, 0], x: [0, 2, 0] }}
                    transition={{ duration: 8.2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,12,28,0.02),rgba(8,12,28,0.14),rgba(8,12,28,0.34))]" />
                </div>

                <motion.div
                  animate={reduceMotion ? undefined : { opacity: [0.35, 0.9, 0.35], scale: [1, 1.05, 1] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute left-12 top-16 h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_24px_rgba(119,242,255,0.9)]"
                />
                <motion.div
                  animate={reduceMotion ? undefined : { opacity: [0.3, 0.8, 0.3], scale: [1, 1.05, 1] }}
                  transition={{ duration: 6.8, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute right-12 bottom-20 h-4 w-4 rounded-full bg-fuchsia-300 shadow-[0_0_24px_rgba(213,109,255,0.9)]"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ delay: 0.24, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="theme-container glass-panel relative z-20 -mt-12 w-[94%] max-w-6xl rounded-[1.8rem] p-5 md:p-6"
      >
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="theme-kicker">Quick search and booking</p>
            <h2 className="mt-1 text-2xl font-black text-white">Find a doctor and book a slot</h2>
          </div>
          <p className="theme-copy max-w-md text-sm leading-7">
            Search by doctor, specialization, date, and time, then continue into the secure booking flow.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_0.9fr_0.9fr_auto]">
          <div>
            <label className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-slate-400">Doctor search</label>
            <div className="glass-input mt-2 flex items-center gap-3 rounded-2xl px-4 py-3">
              <SearchIcon className="h-5 w-5 text-cyan-200" />
              <input
                type="text"
                placeholder="Search doctor or keyword"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-slate-400">Specialization</label>
            <select className="glass-input mt-2 w-full rounded-2xl px-4 py-3 text-sm text-white outline-none">
              <option value="">Select specialization</option>
              <option>Cardiology</option>
              <option>Neurology</option>
              <option>Orthopedics</option>
              <option>Pediatrics</option>
              <option>Dermatology</option>
            </select>
          </div>

          <div>
            <label className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-slate-400">Date</label>
            <div className="glass-input mt-2 flex items-center gap-3 rounded-2xl px-4 py-3">
              <CalendarIcon className="h-5 w-5 text-cyan-200" />
              <input
                type="date"
                className="w-full bg-transparent text-sm text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-slate-400">Time</label>
            <select className="glass-input mt-2 w-full rounded-2xl px-4 py-3 text-sm text-white outline-none">
              <option value="">Select time</option>
              <option>09:00 AM</option>
              <option>10:00 AM</option>
              <option>11:00 AM</option>
              <option>02:00 PM</option>
              <option>04:00 PM</option>
              <option>06:00 PM</option>
            </select>
          </div>

          <div className="flex items-end">
            <ProtectedAction to="/doctors" className="w-full">
              Search & Book
            </ProtectedAction>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
