import { Link } from "react-router-dom";
import { HeartPulseIcon } from "../ui/medicalIcons";

export default function Navbar() {
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const navLinks = [
    ["Doctors", "/doctors"],
    ["About", "/about"],
  ];

  if (token) {
    navLinks.push(["Patients", "/patient"], ["Appointments", "/appointments"]);
  }

  return (
    <nav className="sticky top-0 z-50 px-4 pt-4 md:px-6">
      <div className="theme-container glass-panel grid items-center gap-4 rounded-4xl px-5 py-4 md:grid-cols-[1fr_auto_1fr]">
        <Link to="/" className="group flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-linear-to-br from-violet-500 via-fuchsia-500 to-sky-400 text-white shadow-[0_14px_34px_rgba(124,92,255,0.32)] transition duration-300 group-hover:-translate-y-0.5 group-hover:rotate-3">
            <HeartPulseIcon className="h-6 w-6" />
          </span>
          <span>
            <span className="block text-2xl font-black tracking-tight text-white">
              Smart<span className="gradient-text">Queue</span>
            </span>
            <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Clinic Care
            </span>
          </span>
        </Link>

        <div className="flex flex-wrap items-center justify-center gap-2 rounded-full border border-white/10 bg-white/6 p-1.5 text-sm font-semibold text-slate-200 backdrop-blur-xl">
          {navLinks.map(([label, to]) => (
            <Link key={to} to={to} className="rounded-full px-4 py-2 transition hover:bg-white/12 hover:text-white">
              {label}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-start gap-3 md:justify-end">
          {token ? (
            <>
              <Link to="/dashboard" className="rounded-full border border-white/15 bg-linear-to-r from-violet-500 via-fuchsia-500 to-sky-500 px-5 py-2.5 font-bold text-white shadow-[0_18px_40px_rgba(124,92,255,0.34)] transition hover:-translate-y-0.5 hover:brightness-110">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="rounded-full border border-white/12 bg-white/6 px-5 py-2.5 font-bold text-slate-100 transition hover:border-red-300/40 hover:bg-red-500/12 hover:text-white">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 font-bold text-slate-100 transition hover:bg-white/10">
                Login
              </Link>
              <Link to="/register" className="rounded-full border border-white/15 bg-linear-to-r from-violet-500 via-fuchsia-500 to-sky-500 px-5 py-2.5 font-bold text-white shadow-[0_18px_40px_rgba(124,92,255,0.34)] transition hover:-translate-y-0.5 hover:brightness-110">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
