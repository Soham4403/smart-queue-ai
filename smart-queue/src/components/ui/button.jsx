export default function Button({
  children,
  type = "button",
  variant = "primary",
  className = "",
  disabled = false,
  onClick,
}) {
  const variants = {
    primary: "border border-white/15 bg-linear-to-r from-violet-500 via-fuchsia-500 to-sky-500 text-white shadow-[0_18px_40px_rgba(124,92,255,0.34)] hover:brightness-110",
    secondary: "border border-white/15 bg-white/10 text-white backdrop-blur-xl hover:bg-white/14",
    danger: "border border-red-400/20 bg-linear-to-r from-rose-500 to-red-500 text-white shadow-[0_16px_32px_rgba(239,68,68,0.24)] hover:brightness-110",
    outline: "border border-white/15 bg-white/6 text-slate-100 backdrop-blur-xl hover:bg-white/12",
    darkOutline: "border border-white/20 bg-transparent text-white hover:bg-white/10",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl px-5 py-3
        font-semibold transition-all duration-300
        transform-gpu hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(92,184,255,0.18)]
        disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0
        ${variants[variant]}
        ${className}
      `}
    >
      <span className="absolute inset-0 -translate-x-full bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.18),transparent)] transition-transform duration-700 group-hover:translate-x-full" />
      {children}
    </button>
  );
}
