import { Link } from "react-router-dom";
import { HeartPulseIcon, MailIcon, SearchIcon, ShieldIcon } from "../ui/medicalIcons";

export default function Footer() {
  return (
    <footer className="px-6 pb-12 pt-6 text-slate-200">
      <div className="theme-container glass-panel grid gap-8 rounded-[2rem] px-8 py-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="theme-chip mb-4 w-fit">
            <HeartPulseIcon />
            SmartQueue AI
          </div>
          <h2 className="text-2xl font-black text-white">
            Smart<span className="gradient-text">Queue</span>
          </h2>
          <p className="mt-3 max-w-md leading-7 text-slate-300/75">
            A modern healthcare booking platform with protected appointments, doctor filters,
            patient profiles, email confirmations, and AI guidance.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-white">Explore</h3>
          <div className="mt-4 flex flex-col gap-2">
            <Link to="/doctors" className="inline-flex items-center gap-2 text-slate-300/75 hover:text-white">
              <SearchIcon className="h-4 w-4" />
              Doctors
            </Link>
            <Link to="/about" className="inline-flex items-center gap-2 text-slate-300/75 hover:text-white">
              <ShieldIcon className="h-4 w-4" />
              About Us
            </Link>
            <Link to="/appointments" className="inline-flex items-center gap-2 text-slate-300/75 hover:text-white">
              <MailIcon className="h-4 w-4" />
              Appointments
            </Link>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-white">Contact</h3>
          <p className="mt-4 text-slate-300/75">support@smartqueue.local</p>
          <p className="text-slate-300/75">Kolkata, India</p>
        </div>

        <div className="md:col-span-3 border-t border-white/10 pt-6 text-sm text-slate-400/70">
          © 2026 SmartQueue. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
