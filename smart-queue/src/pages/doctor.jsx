import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Navbar from "../components/layout/navbar";
import Button from "../components/ui/button";
import { SkeletonCard } from "../components/ui/skeleton";
import { SearchIcon, StethoscopeIcon } from "../components/ui/medicalIcons";
import CarouselRail from "../components/sections/carouselRail";

const doctorPhotos = [
  "https://images.pexels.com/photos/5998474/pexels-photo-5998474.jpeg?auto=compress&cs=tinysrgb&w=700",
  "https://images.pexels.com/photos/8460093/pexels-photo-8460093.jpeg?auto=compress&cs=tinysrgb&w=700",
  "https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=700",
  "https://images.pexels.com/photos/5214958/pexels-photo-5214958.jpeg?auto=compress&cs=tinysrgb&w=700",
];

const specialtySpotlight = [
  {
    id: "spot-cardiology",
    title: "Cardiology",
    text: "For chest pain, heart health, follow-up visits, and preventive checkups.",
    image: "https://images.pexels.com/photos/6129509/pexels-photo-6129509.jpeg?auto=compress&cs=tinysrgb&w=900",
  },
  {
    id: "spot-orthopedics",
    title: "Orthopedics",
    text: "For joint pain, injury recovery, posture support, and movement issues.",
    image: "https://images.pexels.com/photos/8376233/pexels-photo-8376233.jpeg?auto=compress&cs=tinysrgb&w=900",
  },
  {
    id: "spot-dermatology",
    title: "Dermatology",
    text: "For skin concerns, acne, allergies, and treatment planning.",
    image: "https://images.pexels.com/photos/5214957/pexels-photo-5214957.jpeg?auto=compress&cs=tinysrgb&w=900",
  },
  {
    id: "spot-pediatrics",
    title: "Pediatrics",
    text: "For child-focused support, fever concerns, and regular care.",
    image: "https://images.pexels.com/photos/7089224/pexels-photo-7089224.jpeg?auto=compress&cs=tinysrgb&w=900",
  },
];

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [specialized, setSpecialized] = useState("");
  const [availability, setAvailability] = useState("");
  const [minFees, setMinFees] = useState("");
  const [maxFees, setMaxFees] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const params = {};

        if (search) {
          params.search = search;
        }

        if (specialized) {
          params.specialized = specialized;
        }

        if (availability) {
          params.is_available = availability;
        }

        if (minFees) {
          params.minFees = minFees;
        }

        if (maxFees) {
          params.maxFees = maxFees;
        }

        const response = await api.get("/doctor/get", {
          params,
        });
        setDoctors(response.data.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [search, specialized, availability, minFees, maxFees]);

  const clearFilters = () => {
    setSearch("");
    setSpecialized("");
    setAvailability("");
    setMinFees("");
    setMaxFees("");
  };

  return (
    <>
      <Navbar />
      <div className="theme-shell min-h-screen px-6 pb-12 pt-8 md:pt-10">
        <div className="theme-container max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <div>
              <p className="theme-kicker">Specialist directory</p>
              <h1 className="theme-heading text-4xl font-black">Find Doctors</h1>
              <p className="theme-copy mt-2">Search specialists, compare fees, and book an available appointment slot.</p>
            </div>
          </div>

          <CarouselRail
            eyebrow="Specialty spotlight"
            title="Browse the main care lanes"
            description="A carousel here makes the doctors page feel like a real browsing experience instead of just a grid of cards."
            items={specialtySpotlight}
            renderItem={(item) => (
              <div className="glass-card overflow-hidden rounded-[1.7rem] border border-white/10">
                <div className="relative h-60">
                  <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,20,0.05),rgba(5,8,20,0.9))]" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="text-2xl font-black">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-100/80">{item.text}</p>
                  </div>
                </div>
              </div>
            )}
          />

          <div className="glass-panel rounded-[1.8rem] p-5 mb-8">
            <div className="grid md:grid-cols-5 gap-4">
              <div className="relative">
                <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search doctor or specialty"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="glass-input w-full rounded-xl p-3 pl-11"
                />
              </div>

              <input
                type="text"
                placeholder="Specialization"
                value={specialized}
                onChange={(e) => setSpecialized(e.target.value)}
                className="glass-input rounded-xl p-3"
              />

              <select value={availability} onChange={(e) => setAvailability(e.target.value)} className="glass-input rounded-xl p-3">
                <option value="">Any Availability</option>
                <option value="true">Available Only</option>
                <option value="false">Unavailable Only</option>
              </select>

              <input
                type="number"
                placeholder="Min fees"
                value={minFees}
                onChange={(e) => setMinFees(e.target.value)}
                className="glass-input rounded-xl p-3"
              />

              <input
                type="number"
                placeholder="Max fees"
                value={maxFees}
                onChange={(e) => setMaxFees(e.target.value)}
                className="glass-input rounded-xl p-3"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-4">
              {["Cardiologist", "Orthopedic", "Dermatologist", "Pediatrician", "ENT", "Gynecologist"].map((item) => (
                <button
                  key={item}
                  onClick={() => setSpecialized(item)}
                  className={`px-4 py-2 rounded-full border ${specialized === item ? "border-cyan-300/20 bg-linear-to-r from-violet-500 to-sky-500 text-white" : "border-white/12 bg-white/6 text-slate-200"}`}
                >
                  {item}
                </button>
              ))}

              <button onClick={clearFilters} className="px-4 py-2 rounded-full border border-red-300/30 bg-red-500/10 text-red-200 transition hover:bg-red-500/16">
                Clear Filters
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <SkeletonCard key={item} />
              ))}
            </div>
          ) : doctors.length === 0 ? (
            <div className="glass-panel p-8 rounded-2xl">
              <h2 className="text-2xl font-bold mb-2 text-white">No doctors found</h2>
              <p className="theme-copy">Add doctors from the backend doctor create API, then refresh this page.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor, index) => (
                <div key={doctor._id} className="glass-card overflow-hidden rounded-3xl text-white transition duration-300 hover:-translate-y-1">
                  <div className="relative h-56 bg-slate-900">
                    <img src={doctor.profilePhoto || doctorPhotos[index % doctorPhotos.length]} alt={doctor.name} className="h-full w-full object-cover object-top" />
                    <span className={`absolute left-4 top-4 rounded-full px-4 py-2 text-sm font-bold ${doctor.is_available ? "bg-emerald-400/16 text-emerald-200" : "bg-red-400/16 text-red-200"}`}>
                      {doctor.is_available ? "Available" : "Unavailable"}
                    </span>
                  </div>

                  <div className="p-6">
                    <h2 className="text-2xl font-black mb-2 text-white">{doctor.name}</h2>
                    <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-cyan-400/12 px-3 py-1 font-bold text-cyan-200">
                      <StethoscopeIcon /> {doctor.specialized || "General"}
                    </p>
                    <p className="theme-copy mb-2"><span className="font-semibold text-slate-100">Qualification:</span> {doctor.qualification || "Not added"}</p>
                    <p className="theme-copy mb-2"><span className="font-semibold text-slate-100">Experience:</span> {doctor.experience || 0} years</p>
                    <p className="text-lg font-black text-white">Rs. {doctor.fees || 0}</p>

                    <Button onClick={() => navigate(`/book/${doctor._id}`)} disabled={!doctor.is_available} className="mt-5 w-full">
                      Book Appointment
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
