import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api";
import Navbar from "../components/layout/navbar";
import Button from "../components/ui/button";
import Loader from "../components/ui/loader";
import { toast } from "react-toastify";
import AppointmentQrCard from "../components/qr/AppointmentQrCard";
import ProfileSummaryCard from "../components/profile/ProfileSummaryCard";
import { sectionReveal, staggerContainer, staggerItem } from "../components/motion/motionPresets";

export default function Patient() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    patientName: "",
    age: "",
    gender: "",
    disease: "",
    medicalHistory: "",
    relation: "",
  });

  const fetchPatients = async () => {
    try {
      const [patientsResponse, appointmentsResponse] = await Promise.all([
        api.get("/patient/get"),
        api.get("/appointment/get"),
      ]);
      setPatients(patientsResponse.data.data);
      setAppointments(appointmentsResponse.data.data || []);
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Unable to load patients");
    } finally {
      setFetching(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await api.get("/user/me");
      setProfile(response.data.user);
    } catch (error) {
      console.log(error);
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      if (storedUser) {
        setProfile(storedUser);
      } else {
        toast.error(error.response?.data?.message || "Unable to load profile");
      }
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    fetchProfile();
    fetchPatients();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/patient/create", formData);
      toast.success(response.data.message || "Patient created successfully");
      setFormData({
        patientName: "",
        age: "",
        gender: "",
        disease: "",
        medicalHistory: "",
        relation: "",
      });
      fetchPatients();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Patient creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="theme-shell min-h-screen p-6 md:p-10 text-slate-100">
      <motion.div className="theme-container max-w-6xl mx-auto mb-8" {...sectionReveal}>
        <ProfileSummaryCard
          user={profile}
          roleLabel="User"
          loading={profileLoading}
          onEdit={() => navigate("/profile")}
        />

        <p className="theme-kicker">Patient workspace</p>
        <h1 className="theme-heading text-4xl font-black">Dashboard</h1>
        <p className="theme-copy mt-2">Create patient profiles, then book appointments with available doctors.</p>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="grid md:grid-cols-3 gap-4 mt-6">
            <motion.div variants={staggerItem} whileHover={{ y: -5, scale: 1.01 }} className="glass-card rounded-3xl p-5">
              <p className="text-slate-400">Patient Profiles</p>
              <h2 className="text-3xl font-black text-blue-600">{patients.length}</h2>
            </motion.div>
            <motion.div variants={staggerItem} whileHover={{ y: -5, scale: 1.01 }} className="glass-card rounded-3xl p-5">
              <p className="text-slate-400">Next Step</p>
              <h2 className="text-xl font-black text-cyan-600">Book Doctor</h2>
            </motion.div>
            <motion.div variants={staggerItem} whileHover={{ y: -5, scale: 1.01 }} className="glass-card rounded-3xl p-5">
              <p className="text-slate-400">Account Status</p>
              <h2 className="text-xl font-black text-emerald-600">Logged In</h2>
            </motion.div>
        </motion.div>
      </motion.div>

        {appointments.length > 0 ? (
          <div className="theme-container max-w-6xl mx-auto mb-8">
            <div className="glass-panel rounded-3xl p-6 md:p-7">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="theme-kicker">Digital passes</p>
                  <h2 className="mt-2 text-2xl font-black text-white">Your appointment QR passes</h2>
                </div>
                <p className="theme-copy">Show this at reception for check-in.</p>
              </div>

              <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} className="grid gap-5 xl:grid-cols-2">
                {appointments
                  .filter((appointment) => appointment.qrToken || appointment.qrPayload)
                  .slice(0, 2)
                  .map((appointment) => (
                    <motion.div key={appointment._id} variants={staggerItem}>
                      <AppointmentQrCard
                        value={appointment.qrPayload || appointment.qrToken}
                        title={`${appointment.doctorId?.name || "Doctor"} pass`}
                        subtitle={`${appointment.appointmentDate} - ${appointment.appointmentTime}`}
                        filename={`smartqueue-${appointment._id}-qr.png`}
                        compact
                      />
                    </motion.div>
                  ))}
              </motion.div>
            </div>
          </div>
        ) : null}

        <motion.div className="theme-container grid max-w-6xl mx-auto gap-8 lg:grid-cols-[420px_1fr]" {...sectionReveal}>
          <motion.div className="glass-panel p-8 rounded-3xl" whileHover={{ y: -4 }}>
            <h2 className="text-3xl font-black text-center text-blue-600 mb-8">
              Create Patient
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input type="text" name="patientName" placeholder="Patient Name" value={formData.patientName} onChange={handleChange} className="glass-input p-3 rounded-lg text-white" required />
              <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} className="glass-input p-3 rounded-lg text-white" required />

              <select name="gender" value={formData.gender} onChange={handleChange} className="glass-input p-3 rounded-lg text-white" required>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>

              <input type="text" name="disease" placeholder="Disease" value={formData.disease} onChange={handleChange} className="glass-input p-3 rounded-lg text-white" />
              <input type="text" name="medicalHistory" placeholder="Medical History" value={formData.medicalHistory} onChange={handleChange} className="glass-input p-3 rounded-lg text-white" />

              <select name="relation" value={formData.relation} onChange={handleChange} className="glass-input p-3 rounded-lg text-white" required>
                <option value="">Select Relation</option>
                <option value="self">Self</option>
                <option value="mother">Mother</option>
                <option value="father">Father</option>
                <option value="child">Child</option>
                <option value="grandmother">Grandmother</option>
                <option value="grandfather">Grandfather</option>
                <option value="other">Other</option>
              </select>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? <Loader text="Creating patient..." /> : "Create Patient"}
              </Button>
            </form>
          </motion.div>

          <motion.div className="glass-panel p-8 rounded-3xl" whileHover={{ y: -4 }}>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <h2 className="text-3xl font-bold text-white">Your Patients</h2>
              <Button onClick={() => navigate("/doctors")}>
                Book Appointment
              </Button>
            </div>

            {fetching ? (
              <div className="grid md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="h-32 animate-pulse rounded-xl bg-slate-100" />
                ))}
              </div>
            ) : patients.length === 0 ? (
              <p className="theme-copy">Create a patient profile first, then you can book an appointment.</p>
            ) : (
              <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.12 }} className="grid md:grid-cols-2 gap-4">
                {patients.map((patient) => (
                  <motion.div key={patient._id} variants={staggerItem} whileHover={{ y: -4, scale: 1.01 }} className="glass-card rounded-xl p-4">
                    <h3 className="font-bold text-lg text-white">{patient.patientName}</h3>
                    <p className="theme-copy">Age: {patient.age}</p>
                    <p className="theme-copy">Gender: {patient.gender}</p>
                    <p className="theme-copy">Relation: {patient.relation}</p>
                    <p className="theme-copy">Disease: {patient.disease || "Not provided"}</p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
