import Button from "../ui/button";

const fieldClass = "rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm";

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

const valueOrFallback = (value, fallback = "Not available") => value || fallback;

function SkeletonLine({ className = "" }) {
  return <div className={`animate-pulse rounded-xl bg-white/8 ${className}`} />;
}

export default function ProfileSummaryCard({
  user,
  roleLabel,
  welcomeLabel = "Welcome back",
  lastLogin,
  loading = false,
  onEdit,
}) {
  const roleText = roleLabel || (user?.role === "admin" ? "Administrator" : "User");
  const name = user?.name || "Guest";
  const initials = getInitials(name);

  if (loading) {
    return (
      <section className="glass-panel overflow-hidden rounded-[2rem] border border-white/10 p-6 md:p-7">
        <div className="grid gap-5 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <div className="flex items-center gap-4">
            <SkeletonLine className="h-20 w-20 rounded-full" />
            <div className="space-y-3">
              <SkeletonLine className="h-4 w-28" />
              <SkeletonLine className="h-7 w-52" />
              <SkeletonLine className="h-4 w-40" />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <SkeletonLine className="h-16 w-full" />
            <SkeletonLine className="h-16 w-full" />
            <SkeletonLine className="h-16 w-full" />
            <SkeletonLine className="h-16 w-full" />
          </div>
          <SkeletonLine className="h-11 w-36 rounded-full" />
        </div>
      </section>
    );
  }

  return (
    <section className="glass-panel overflow-hidden rounded-[2rem] border border-white/10 p-6 md:p-7 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/30 hover:shadow-[0_24px_80px_rgba(57,255,245,0.10)]">
      <div className="grid gap-6 lg:grid-cols-[auto_1fr_auto] lg:items-center">
        <div className="flex items-center gap-4">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full border border-cyan-300/25 bg-linear-to-br from-cyan-400/25 via-white/10 to-violet-500/25 text-2xl font-black text-white shadow-[0_18px_50px_rgba(56,189,248,0.18)]">
            {user?.profilePhoto ? (
              <img
                src={user.profilePhoto}
                alt={name}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              initials
            )}
          </div>

          <div className="space-y-1">
            <p className="theme-kicker text-cyan-200/90">{welcomeLabel},</p>
            <h2 className="text-2xl font-black text-white md:text-3xl">{name}</h2>
            <p className="text-sm text-slate-300">{valueOrFallback(user?.email, "Email not available")}</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className={fieldClass}>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Age</p>
            <p className="mt-1 text-base font-semibold text-white">{valueOrFallback(user?.age)}</p>
          </div>
          <div className={fieldClass}>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Gender</p>
            <p className="mt-1 text-base font-semibold text-white">{valueOrFallback(user?.gender)}</p>
          </div>
          <div className={fieldClass}>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Contact</p>
            <p className="mt-1 text-base font-semibold text-white">{valueOrFallback(user?.contact, "Add contact")}</p>
          </div>
          <div className={fieldClass}>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Role</p>
            <p className="mt-1 text-base font-semibold text-white">{roleText}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:items-end">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left backdrop-blur-sm">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Last login</p>
            <p className="mt-1 text-sm font-semibold text-white">{valueOrFallback(lastLogin, "Not tracked")}</p>
          </div>

          {onEdit ? (
            <Button onClick={onEdit} className="w-full lg:w-auto">
              Edit Profile
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
