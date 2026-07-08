import { motion } from "framer-motion";
import ProtectedAction from "../ui/protectedAction";
import Button from "../ui/button";
import { sectionReveal } from "../motion/motionPresets";

export default function CTA() {
  return (
    <section className="px-6 py-12 text-center">
      <motion.div className="theme-container glass-panel max-w-4xl rounded-4xl px-8 py-14 text-white" {...sectionReveal}>
        <h2 className="theme-heading mb-4 text-4xl font-bold">Ready to book smarter?</h2>

        <p className="theme-copy mx-auto mb-8 max-w-2xl">
          Start Now takes logged-in users directly to booking. New users are guided to register or login first.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <ProtectedAction to="/doctors" className="justify-center">
            Start Now
          </ProtectedAction>

          <Button
            variant="secondary"
            onClick={() => window.dispatchEvent(new Event("smartqueue:open-ai"))}
          >
          Talk to AI
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
