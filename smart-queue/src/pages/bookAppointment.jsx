import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import Navbar from "../components/layout/navbar";
import Button from "../components/ui/button";
import Loader from "../components/ui/loader";
import { CalendarIcon, StethoscopeIcon } from "../components/ui/medicalIcons";
import { toast } from "react-toastify";
const fallbackDoctorPhoto = "https://images.pexels.com/photos/6762862/pexels-photo-6762862.jpeg?auto=compress&cs=tinysrgb&w=800";

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotData, setSlotData] = useState({
    allSlots: [],
    bookedSlots: [],
    availableSlots: [],
  });
  const [formData, setFormData] = useState({
    patientId: "",
    appointmentDate: "",
    appointmentTime: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const loadPageData = async () => {
      try {
        const [doctorResponse, patientResponse] = await Promise.all([
          api.get("/doctor/get"),
          api.get("/patient/get"),
        ]);

        const selectedDoctor = doctorResponse.data.data.find((item) => item._id === doctorId);
        setDoctor(selectedDoctor);
        setPatients(patientResponse.data.data);
      } catch (error) {
        console.log(error);
        toast.error("Unable to load booking page");
      }
    };

    loadPageData();
  }, [doctorId, navigate]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!formData.appointmentDate) {
        setSlotData({
          allSlots: [],
          bookedSlots: [],
          availableSlots: [],
        });
        return;
      }

      setSlotsLoading(true);
      try {
        const response = await api.get(`/appointment/slots/${doctorId}`, {
          params: {
            appointmentDate: formData.appointmentDate,
          },
        });
        setSlotData(response.data.data);
      } catch (error) {
        toast.error(error.response?.data?.message || "Unable to fetch time slots");
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [doctorId, formData.appointmentDate]);

  useEffect(() => {
    if (formData.appointmentTime && !slotData.availableSlots.includes(formData.appointmentTime)) {
      setFormData((current) => ({
        ...current,
        appointmentTime: "",
      }));
    }
  }, [slotData.availableSlots, formData.appointmentTime]);

  const morningSlots = useMemo(
    () => slotData.availableSlots.filter((slot) => slot.includes("AM")),
    [slotData.availableSlots]
  );

  const afternoonSlots = useMemo(
    () => slotData.availableSlots.filter((slot) => slot.includes("PM")),
    [slotData.availableSlots]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.appointmentTime) {
      toast.warning("Please select an available time slot");
      return;
    }

    setLoading(true);

    try {
      const selectedPatient = patients.find((patient) => patient._id === formData.patientId);
      const checkoutDraft = {
        doctorId,
        doctor,
        patientId: formData.patientId,
        patient: selectedPatient || null,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        sourcePath: `/book/${doctorId}`,
      };

      sessionStorage.setItem("smartqueue-checkout-draft", JSON.stringify(checkoutDraft));
      toast.info("Checkout is ready. Complete payment to confirm the appointment.");
      navigate("/checkout", { state: checkoutDraft });
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Unable to prepare checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="theme-shell min-h-screen p-6 md:p-10 text-slate-100">
        <div className="theme-container max-w-4xl mx-auto grid gap-8 md:grid-cols-[1fr_1.2fr]">
          <div className="glass-panel overflow-hidden rounded-3xl">

            {!doctor ? (
              <p className="p-8 text-slate-300">Loading doctor...</p>
            ) : (
              <>
                <img src={doctor.profilePhoto || fallbackDoctorPhoto} alt={doctor.name} className="h-72 w-full object-cover object-top" />
                <div className="p-8">
                  <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-cyan-400/12 px-3 py-1 font-bold text-cyan-200">
                    <StethoscopeIcon /> {doctor.specialized || "General"}
                  </p>
                  <h2 className="text-3xl font-black text-white">{doctor.name}</h2>
                  <p className="theme-copy mt-2">{doctor.qualification || "Qualification not added"}</p>
                  <p className="theme-copy">{doctor.experience || 0} years experience</p>
                  <p className="text-xl font-black mt-3 text-white">Fees: Rs. {doctor.fees || 0}</p>
                </div>
              </>
            )}
          </div>

          <div className="glass-panel p-8 rounded-3xl">
            <p className="theme-kicker">Appointment request</p>
            <h1 className="theme-heading text-3xl font-black mb-5">Book Appointment</h1>

            {patients.length === 0 ? (
              <div>
                <p className="theme-copy mb-4">You need to create a patient profile before booking.</p>
                <Button onClick={() => navigate("/patient")}>
                  Create Patient
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <select value={formData.patientId} onChange={(e) => setFormData({ ...formData, patientId: e.target.value })} className="glass-input p-3 rounded-lg text-white" required>
                  <option value="">Select Patient</option>
                  {patients.map((patient) => (
                    <option key={patient._id} value={patient._id}>
                      {patient.patientName} ({patient.relation})
                    </option>
                  ))}
                </select>

                <div className="relative">
                  <CalendarIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input type="date" value={formData.appointmentDate} onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })} className="glass-input w-full p-3 pl-11 rounded-lg text-white" required />
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="mb-2 text-sm font-bold text-cyan-200">Morning Slots</p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {morningSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setFormData({ ...formData, appointmentTime: slot })}
                          className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${formData.appointmentTime === slot ? "border-cyan-300 bg-cyan-400/16 text-white" : "border-white/10 bg-white/6 text-slate-200 hover:bg-white/10"}`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-bold text-cyan-200">Afternoon Slots</p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {afternoonSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setFormData({ ...formData, appointmentTime: slot })}
                          className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${formData.appointmentTime === slot ? "border-cyan-300 bg-cyan-400/16 text-white" : "border-white/10 bg-white/6 text-slate-200 hover:bg-white/10"}`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  {slotsLoading && <p className="theme-copy">Loading available slots...</p>}
                  {!slotsLoading && formData.appointmentDate && slotData.availableSlots.length === 0 && (
                    <p className="text-sm font-semibold text-rose-300">No slots left for this date.</p>
                  )}
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? <Loader text="Preparing checkout..." /> : "Book Appointment"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
