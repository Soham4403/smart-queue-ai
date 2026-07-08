import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api";
import Navbar from "../components/layout/navbar";
import Button from "../components/ui/button";
import Loader from "../components/ui/loader";
import { CalendarIcon, CreditCardIcon, SearchIcon, ShieldIcon, StethoscopeIcon } from "../components/ui/medicalIcons";
import { toast } from "react-toastify";
import ProfileSummaryCard from "../components/profile/ProfileSummaryCard";
import { sectionReveal, staggerContainer, staggerItem } from "../components/motion/motionPresets";

const initialDoctorForm = {
  name: "",
  qualification: "",
  specialized: "",
  experience: "",
  fees: "",
  is_available: true,
  profilePhoto: "",
};

const initialUserForm = {
  name: "",
  email: "",
  password: "",
  address: "",
  contact: "",
  age: "",
  gender: "male",
  role: "user",
};

const initialPatientForm = {
  userId: "",
  patientName: "",
  age: "",
  gender: "male",
  disease: "",
  medicalHistory: "",
  relation: "self",
};

const statMeta = [
  ["Doctors", "Live care network", "from-cyan-400/16 to-blue-500/16"],
  ["Users", "Registered accounts", "from-violet-400/16 to-fuchsia-500/16"],
  ["Patients", "Profile records", "from-emerald-400/16 to-cyan-500/16"],
  ["Appointments", "Bookings tracked", "from-amber-400/16 to-orange-500/16"],
  ["Collected", "Payment intake", "from-rose-400/16 to-pink-500/16"],
  ["Pending", "Revenue waiting", "from-slate-400/16 to-indigo-500/16"],
];

const formatCurrency = (value = 0) => `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctorForm, setDoctorForm] = useState(initialDoctorForm);
  const [userForm, setUserForm] = useState(initialUserForm);
  const [patientForm, setPatientForm] = useState(initialPatientForm);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState("");
  const [doctorQuery, setDoctorQuery] = useState("");
  const [appointmentQuery, setAppointmentQuery] = useState("");
  const [userQuery, setUserQuery] = useState("");

  const fetchAdminData = async () => {
    try {
      const [overviewResponse, doctorsResponse, usersResponse, appointmentsResponse] = await Promise.all([
        api.get("/admin/overview"),
        api.get("/admin/doctors"),
        api.get("/admin/users"),
        api.get("/admin/appointments"),
      ]);

      setOverview(overviewResponse.data.data);
      setDoctors(doctorsResponse.data.data || []);
      setUsers(usersResponse.data.data || []);
      setAppointments(appointmentsResponse.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load admin dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await api.get("/user/me");
      setProfile(response.data.user);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load admin profile");
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!token || user?.role !== "admin") {
      navigate("/admin/login");
      return;
    }

    fetchProfile();
    fetchAdminData();
  }, [navigate]);

  const stats = overview?.stats || {};

  const filteredDoctors = useMemo(() => {
    const text = doctorQuery.trim().toLowerCase();
    if (!text) {
      return doctors;
    }

    return doctors.filter((doctor) =>
      [doctor.name, doctor.specialized, doctor.qualification]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(text)
    );
  }, [doctorQuery, doctors]);

  const filteredAppointments = useMemo(() => {
    const text = appointmentQuery.trim().toLowerCase();
    if (!text) {
      return appointments;
    }

    return appointments.filter((appointment) =>
      [
        appointment.doctorId?.name,
        appointment.patientId?.patientName,
        appointment.appointmentDate,
        appointment.appointmentTime,
        appointment.status,
        appointment.paymentStatus,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(text)
    );
  }, [appointmentQuery, appointments]);

  const filteredUsers = useMemo(() => {
    const text = userQuery.trim().toLowerCase();
    if (!text) {
      return users;
    }

    return users.filter((user) =>
      [user.name, user.email, user.role]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(text)
    );
  }, [userQuery, users]);

  const createDoctor = async (event) => {
    event.preventDefault();
    setSubmitting("doctor");
    try {
      await api.post("/admin/doctors", {
        ...doctorForm,
        experience: Number(doctorForm.experience),
        fees: Number(doctorForm.fees),
      });
      setDoctorForm(initialDoctorForm);
      toast.success("Doctor added successfully");
      fetchAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to add doctor");
    } finally {
      setSubmitting("");
    }
  };

  const createUser = async (event) => {
    event.preventDefault();
    setSubmitting("user");
    try {
      await api.post("/admin/users", {
        ...userForm,
        age: Number(userForm.age),
      });
      setUserForm(initialUserForm);
      toast.success("User created successfully");
      fetchAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to create user");
    } finally {
      setSubmitting("");
    }
  };

  const createPatient = async (event) => {
    event.preventDefault();
    setSubmitting("patient");
    try {
      await api.post("/admin/patients", {
        ...patientForm,
        age: Number(patientForm.age),
      });
      setPatientForm(initialPatientForm);
      toast.success("Patient added successfully");
      fetchAdminData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to add patient");
    } finally {
      setSubmitting("");
    }
  };

  const deleteDoctor = async (id) => {
    await api.delete(`/admin/doctors/${id}`);
    toast.success("Doctor deleted");
    fetchAdminData();
  };

  const cancelAppointment = async (id) => {
    await api.patch(`/admin/appointments/${id}/cancel`);
    toast.success("Appointment cancelled");
    fetchAdminData();
  };

  const collectPayment = async (id) => {
    await api.patch(`/admin/appointments/${id}/payment`);
    toast.success("Payment marked as collected");
    fetchAdminData();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="theme-shell min-h-screen grid place-items-center">
        <Loader text="Loading admin dashboard..." />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="theme-shell min-h-screen px-6 pb-14 pt-8">
        <div className="theme-container space-y-8">
          <ProfileSummaryCard
            user={profile || JSON.parse(localStorage.getItem("user") || "null")}
            roleLabel="Administrator"
            lastLogin="Not tracked"
            loading={profileLoading}
            onEdit={() => navigate("/profile")}
          />

          <section className="glass-panel overflow-hidden rounded-4xl p-7 md:p-8">
            <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <div className="theme-chip mb-4 w-fit">
                  <ShieldIcon />
                  Admin command center
                </div>

                <h1 className="theme-heading text-4xl font-black leading-tight md:text-5xl">
                  Manage doctors, users, patients, and payments from one premium dashboard.
                </h1>

                <p className="theme-copy mt-5 max-w-2xl leading-8">
                  This control room keeps the clinic organized. You can create doctors, add patient records,
                  review bookings, mark payments, and cancel appointments without leaving the dashboard.
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Button onClick={fetchAdminData}>Refresh data</Button>
                  <Button variant="secondary" onClick={() => navigate("/doctors")}>
                    View public doctors
                  </Button>
                  <Button variant="secondary" onClick={() => navigate("/admin/qr-verify")}>
                    QR Verification
                  </Button>
                  <Button variant="darkOutline" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="glass-card rounded-[1.6rem] p-5">
                  <p className="text-sm text-slate-400">Live booking status</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400/15 text-cyan-200">
                      <CalendarIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-3xl font-black text-white">{stats.appointments || 0}</p>
                      <p className="text-sm text-slate-400">Appointments tracked</p>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-[1.6rem] p-5">
                  <p className="text-sm text-slate-400">Collection overview</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-400/15 text-emerald-200">
                      <CreditCardIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-3xl font-black text-white">{formatCurrency(stats.totalRevenue || 0)}</p>
                      <p className="text-sm text-slate-400">Payments collected</p>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-[1.6rem] p-5 sm:col-span-2">
                  <p className="text-sm text-slate-400">Care network</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-400/15 text-violet-200">
                      <StethoscopeIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-3xl font-black text-white">{stats.doctors || 0} doctors</p>
                      <p className="text-sm text-slate-400">Active specialists in the system</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <motion.section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6" {...sectionReveal}>
            {statMeta.map(([label, subtitle, gradient]) => (
              <motion.div key={label} whileHover={{ y: -5, scale: 1.01 }} className={`glass-card rounded-3xl bg-linear-to-br ${gradient} p-5`}>
                <p className="text-sm uppercase tracking-[0.18em] text-slate-200/75">{label}</p>
                <h2 className="mt-3 text-3xl font-black text-white">
                  {label === "Doctors" ? stats.doctors || 0 : null}
                  {label === "Users" ? stats.users || 0 : null}
                  {label === "Patients" ? stats.patients || 0 : null}
                  {label === "Appointments" ? stats.appointments || 0 : null}
                  {label === "Collected" ? formatCurrency(stats.totalRevenue || 0) : null}
                  {label === "Pending" ? formatCurrency(stats.pendingRevenue || 0) : null}
                </h2>
                <p className="mt-2 text-sm text-slate-200/80">{subtitle}</p>
              </motion.div>
            ))}
          </motion.section>

          <motion.section className="grid gap-8 xl:grid-cols-3" {...sectionReveal}>
            <motion.form onSubmit={createDoctor} className="glass-panel rounded-[1.8rem] p-6 space-y-4" whileHover={{ y: -4 }}>
              <div>
                <p className="theme-kicker">Doctors</p>
                <h2 className="mt-2 text-2xl font-black text-white">Add doctor</h2>
              </div>

              {Object.entries(doctorForm).map(([key, value]) =>
                key === "is_available" ? (
                  <select
                    key={key}
                    value={String(value)}
                    onChange={(event) =>
                      setDoctorForm({ ...doctorForm, [key]: event.target.value === "true" })
                    }
                    className="glass-input w-full rounded-xl p-3 text-white"
                  >
                    <option value="true">Available</option>
                    <option value="false">Unavailable</option>
                  </select>
                ) : (
                  <input
                    key={key}
                    type={key === "experience" || key === "fees" ? "number" : "text"}
                    placeholder={key.replace("_", " ")}
                    value={value}
                    onChange={(event) => setDoctorForm({ ...doctorForm, [key]: event.target.value })}
                    className="glass-input w-full rounded-xl p-3 text-white"
                    required={key !== "profilePhoto"}
                  />
                )
              )}

              <Button type="submit" className="w-full" disabled={submitting === "doctor"}>
                {submitting === "doctor" ? <Loader text="Adding doctor..." /> : "Add Doctor"}
              </Button>
            </motion.form>

            <motion.form onSubmit={createUser} className="glass-panel rounded-[1.8rem] p-6 space-y-4" whileHover={{ y: -4 }}>
              <div>
                <p className="theme-kicker">Users</p>
                <h2 className="mt-2 text-2xl font-black text-white">Create user</h2>
              </div>

              <input className="glass-input w-full rounded-xl p-3 text-white" placeholder="Name" value={userForm.name} onChange={(event) => setUserForm({ ...userForm, name: event.target.value })} required />
              <input className="glass-input w-full rounded-xl p-3 text-white" placeholder="Email" value={userForm.email} onChange={(event) => setUserForm({ ...userForm, email: event.target.value })} required />
              <input className="glass-input w-full rounded-xl p-3 text-white" placeholder="Password" value={userForm.password} onChange={(event) => setUserForm({ ...userForm, password: event.target.value })} required />
              <input className="glass-input w-full rounded-xl p-3 text-white" placeholder="Address" value={userForm.address} onChange={(event) => setUserForm({ ...userForm, address: event.target.value })} />
              <input className="glass-input w-full rounded-xl p-3 text-white" placeholder="Contact" value={userForm.contact} onChange={(event) => setUserForm({ ...userForm, contact: event.target.value })} />
              <input className="glass-input w-full rounded-xl p-3 text-white" type="number" placeholder="Age" value={userForm.age} onChange={(event) => setUserForm({ ...userForm, age: event.target.value })} />
              <select className="glass-input w-full rounded-xl p-3 text-white" value={userForm.gender} onChange={(event) => setUserForm({ ...userForm, gender: event.target.value })}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <select className="glass-input w-full rounded-xl p-3 text-white" value={userForm.role} onChange={(event) => setUserForm({ ...userForm, role: event.target.value })}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <Button type="submit" className="w-full" disabled={submitting === "user"}>
                {submitting === "user" ? <Loader text="Creating user..." /> : "Create User"}
              </Button>
            </motion.form>

            <motion.form onSubmit={createPatient} className="glass-panel rounded-[1.8rem] p-6 space-y-4" whileHover={{ y: -4 }}>
              <div>
                <p className="theme-kicker">Patients</p>
                <h2 className="mt-2 text-2xl font-black text-white">Add patient</h2>
              </div>

              <select className="glass-input w-full rounded-xl p-3 text-white" value={patientForm.userId} onChange={(event) => setPatientForm({ ...patientForm, userId: event.target.value })} required>
                <option value="">Select User</option>
                {users.filter((user) => user.role === "user").map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              <input className="glass-input w-full rounded-xl p-3 text-white" placeholder="Patient Name" value={patientForm.patientName} onChange={(event) => setPatientForm({ ...patientForm, patientName: event.target.value })} required />
              <input className="glass-input w-full rounded-xl p-3 text-white" type="number" placeholder="Age" value={patientForm.age} onChange={(event) => setPatientForm({ ...patientForm, age: event.target.value })} required />
              <select className="glass-input w-full rounded-xl p-3 text-white" value={patientForm.gender} onChange={(event) => setPatientForm({ ...patientForm, gender: event.target.value })}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <input className="glass-input w-full rounded-xl p-3 text-white" placeholder="Disease" value={patientForm.disease} onChange={(event) => setPatientForm({ ...patientForm, disease: event.target.value })} />
              <input className="glass-input w-full rounded-xl p-3 text-white" placeholder="Medical History" value={patientForm.medicalHistory} onChange={(event) => setPatientForm({ ...patientForm, medicalHistory: event.target.value })} />
              <select className="glass-input w-full rounded-xl p-3 text-white" value={patientForm.relation} onChange={(event) => setPatientForm({ ...patientForm, relation: event.target.value })}>
                <option value="self">Self</option>
                <option value="mother">Mother</option>
                <option value="father">Father</option>
                <option value="child">Child</option>
                <option value="grandmother">Grandmother</option>
                <option value="grandfather">Grandfather</option>
                <option value="other">Other</option>
              </select>
              <Button type="submit" className="w-full" disabled={submitting === "patient"}>
                {submitting === "patient" ? <Loader text="Adding patient..." /> : "Add Patient"}
              </Button>
            </motion.form>
          </motion.section>

          <motion.section className="grid gap-8 xl:grid-cols-2" {...sectionReveal}>
            <motion.div className="glass-panel rounded-[1.8rem] p-6" whileHover={{ y: -4 }}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="theme-kicker">Doctor directory</p>
                  <h2 className="mt-2 text-2xl font-black text-white">Manage doctors</h2>
                </div>
                <div className="glass-input flex items-center gap-2 rounded-full px-4 py-2">
                  <SearchIcon className="h-4 w-4 text-slate-400" />
                  <input
                    value={doctorQuery}
                    onChange={(event) => setDoctorQuery(event.target.value)}
                    placeholder="Search doctors"
                    className="w-40 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }} className="space-y-4">
                {filteredDoctors.map((doctor) => (
                  <motion.div key={doctor._id} variants={staggerItem} whileHover={{ y: -4, scale: 1.01 }} className="glass-card flex flex-wrap items-center justify-between gap-4 rounded-[1.4rem] p-4">
                    <div>
                      <h3 className="font-bold text-white">{doctor.name}</h3>
                      <p className="theme-copy">
                        {doctor.specialized || "General"} · {formatCurrency(doctor.fees || 0)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${doctor.is_available ? "bg-emerald-400/12 text-emerald-200" : "bg-rose-400/12 text-rose-200"}`}>
                        {doctor.is_available ? "Available" : "Unavailable"}
                      </span>
                      <Button variant="danger" onClick={() => deleteDoctor(doctor._id)}>
                        Delete
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div className="glass-panel rounded-[1.8rem] p-6" whileHover={{ y: -4 }}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="theme-kicker">Appointments</p>
                  <h2 className="mt-2 text-2xl font-black text-white">Review and collect</h2>
                </div>
                <div className="glass-input flex items-center gap-2 rounded-full px-4 py-2">
                  <SearchIcon className="h-4 w-4 text-slate-400" />
                  <input
                    value={appointmentQuery}
                    onChange={(event) => setAppointmentQuery(event.target.value)}
                    placeholder="Search appointments"
                    className="w-44 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }} className="space-y-4">
                {filteredAppointments.map((appointment) => (
                  <motion.div key={appointment._id} variants={staggerItem} whileHover={{ y: -4, scale: 1.01 }} className="glass-card rounded-[1.4rem] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold text-white">{appointment.doctorId?.name || "Doctor"}</h3>
                        <p className="theme-copy">Patient: {appointment.patientId?.patientName || "Patient"}</p>
                        <p className="theme-copy">{appointment.appointmentDate} · {appointment.appointmentTime}</p>
                        <div className="flex flex-wrap gap-2 pt-2">
                          <span className="rounded-full bg-white/6 px-3 py-1 text-xs font-semibold text-slate-200">
                            Status: {appointment.status}
                          </span>
                          <span className="rounded-full bg-white/6 px-3 py-1 text-xs font-semibold text-slate-200">
                            Payment: {appointment.paymentStatus}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => collectPayment(appointment._id)}
                          className="bg-emerald-500/90 text-white hover:bg-emerald-500"
                        >
                          <CreditCardIcon className="h-4 w-4" />
                          {appointment.paymentStatus === "paid" ? "Collected" : "Collect"}
                        </Button>
                        <Button variant="danger" onClick={() => cancelAppointment(appointment._id)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </motion.section>

          <motion.section className="glass-panel rounded-[1.8rem] p-6" {...sectionReveal}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="theme-kicker">Users</p>
                <h2 className="mt-2 text-2xl font-black text-white">Registered accounts</h2>
              </div>
              <div className="glass-input flex items-center gap-2 rounded-full px-4 py-2">
                <SearchIcon className="h-4 w-4 text-slate-400" />
                <input
                  value={userQuery}
                  onChange={(event) => setUserQuery(event.target.value)}
                  placeholder="Search users"
                  className="w-44 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredUsers.map((user) => (
                <motion.div key={user._id} variants={staggerItem} whileHover={{ y: -4, scale: 1.01 }} className="glass-card rounded-[1.4rem] p-4">
                  <p className="text-lg font-bold text-white">{user.name}</p>
                  <p className="theme-copy text-sm">{user.email}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-cyan-200">{user.role}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>
        </div>
      </main>
    </>
  );
}
