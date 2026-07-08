import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/footer";

const aboutImage =
  "https://images.pexels.com/photos/7089401/pexels-photo-7089401.jpeg?auto=compress&cs=tinysrgb&w=1200";

const doctorImage =
  "https://images.pexels.com/photos/6749778/pexels-photo-6749778.jpeg?auto=compress&cs=tinysrgb&w=900";

export default function About() {
  const doctors = [
    ["Dr. Ananya Sen", "Cardiology", "Heart care and preventive checkups"],
    ["Dr. Rohan Mehta", "Orthopedic", "Joint pain, injuries, and bone health"],
    ["Dr. Priya Sharma", "Gynecology", "Women health and appointment care"],
  ];

  return (
    <>
      <Navbar />

      <main className="theme-shell overflow-hidden text-slate-900">
        <section className="relative px-6 pb-20 pt-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(92,184,255,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(213,109,255,0.16),transparent_28%)]" />

          <div className="theme-container relative grid items-center gap-16 md:grid-cols-2">
            <div>
              <p className="theme-chip text-sm font-bold">About SmartQueue</p>

              <h1 className="theme-heading mt-6 text-5xl font-black leading-tight md:text-6xl">
                Healthcare booking made calm, clear, and reliable.
              </h1>

              <p className="theme-copy mt-7 max-w-xl text-lg leading-8">
                SmartQueue helps patients and clinics manage doctor appointments
                faster and more smoothly. Patients can register, create profiles,
                search doctors, book slots, and receive appointment confirmation
                emails instantly.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <div className="glass-card rounded-2xl px-6 py-5">
                  <p className="text-3xl font-black text-cyan-300">24/7</p>
                  <p className="mt-1 text-sm text-slate-300/75">Appointment access</p>
                </div>

                <div className="glass-card rounded-2xl px-6 py-5">
                  <p className="text-3xl font-black text-fuchsia-300">100+</p>
                  <p className="mt-1 text-sm text-slate-300/75">Active patients</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <img
                src={aboutImage}
                alt="Healthcare booking"
                className="h-137.5 w-full rounded-[3rem] object-cover shadow-2xl"
              />

              <div className="glass-card absolute -bottom-8 -left-8 rounded-3xl p-6">
                <div className="flex items-center gap-4">
                  <img
                    src={doctorImage}
                    alt="Doctor"
                    className="h-16 w-16 rounded-2xl object-cover"
                  />

                  <div>
                    <p className="text-sm text-slate-400">SmartQueue system</p>
                    <h3 className="text-lg font-black text-white">Faster booking flow</h3>
                    <p className="mt-1 text-sm font-semibold text-emerald-300">
                      Live appointment support
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-24">
          <div className="theme-container">
            <div className="mb-14 text-center">
              <p className="theme-kicker">Why SmartQueue</p>
              <h2 className="theme-heading mt-4 text-4xl font-black">
                Built for a smoother clinic experience
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                ["Less waiting time", "Patients can choose slots before visiting the clinic."],
                ["Better management", "Appointments, doctors, and patients stay organized together."],
                ["Secure access", "JWT-protected pages keep booking safe after login."],
              ].map(([title, desc]) => (
                <div
                  key={title}
                  className="glass-card rounded-3xl p-8 transition duration-300 hover:-translate-y-2"
                >
                  <div className="mb-5 h-14 w-14 rounded-2xl bg-linear-to-br from-violet-500 via-fuchsia-500 to-sky-500" />
                  <h3 className="text-2xl font-black text-white">{title}</h3>
                  <p className="theme-copy mt-4 leading-8">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-24">
          <div className="theme-container">
            <div className="mb-14 text-center">
              <p className="theme-kicker">Specialists</p>
              <h2 className="theme-heading mt-4 text-4xl font-black">
                Meet experienced doctors
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {doctors.map(([name, specialty, desc], index) => (
                <div
                  key={name}
                  className="glass-card overflow-hidden rounded-4xl transition duration-300 hover:-translate-y-2"
                >
                  <img
                    src={`https://images.pexels.com/photos/${
                      index === 0 ? "6129507" : index === 1 ? "8376233" : "5998476"
                    }/pexels-photo-${
                      index === 0 ? "6129507" : index === 1 ? "8376233" : "5998476"
                    }.jpeg?auto=compress&cs=tinysrgb&w=900`}
                    alt={name}
                    className="h-72 w-full object-cover"
                  />

                  <div className="p-7">
                    <h3 className="text-2xl font-black text-white">{name}</h3>
                    <p className="mt-2 font-bold text-cyan-300">{specialty}</p>
                    <p className="theme-copy mt-4 leading-7">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
