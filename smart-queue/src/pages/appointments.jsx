import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Navbar from "../components/layout/navbar";
import Button from "../components/ui/button";
import Loader from "../components/ui/loader";
import { ShieldIcon } from "../components/ui/medicalIcons";
import { toast } from "react-toastify";
import AppointmentQrCard from "../components/qr/AppointmentQrCard";

export default function Appointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loadingId, setLoadingId] = useState("");

  const fetchAppointments = async () => {
    try {
      const response = await api.get("/appointment/get");
      setAppointments(response.data.data);
    } catch (error) {
      console.log(error);
      toast.error("Unable to load appointments");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    fetchAppointments();
  }, [navigate]);

  const cancelAppointment = async (id) => {
    setLoadingId(id);
    try {
      await api.patch(`/appointment/cancel/${id}`);
      toast.success("Appointment cancelled");
      fetchAppointments();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Unable to cancel appointment");
    } finally {
      setLoadingId("");
    }
  };

  return (
    <>
      <Navbar />
      <div className="theme-shell min-h-screen p-6 md:p-10 text-slate-100">
        <div className="theme-container max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <p className="theme-kicker">Appointment history</p>
              <h1 className="theme-heading text-4xl font-bold">My Appointments</h1>
              <p className="theme-copy mt-2">Track upcoming and cancelled appointment bookings.</p>
            </div>

            <Button onClick={() => navigate("/doctors")}>
              Book More
            </Button>
          </div>

          {appointments.length === 0 ? (
            <div className="glass-panel p-8 rounded-2xl">
              <h2 className="text-2xl font-bold mb-2 text-white">No appointments yet</h2>
              <p className="theme-copy">Book a doctor appointment and it will appear here.</p>
            </div>
          ) : (
            <div className="grid gap-5">
              {appointments.map((appointment) => (
                <div key={appointment._id} className="glass-panel p-6 rounded-2xl flex flex-wrap justify-between gap-5">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{appointment.doctorId?.name || "Doctor"}</h2>
                    <p className="theme-copy">Patient: {appointment.patientId?.patientName || "Patient"}</p>
                    <p className="theme-copy">Date: {appointment.appointmentDate}</p>
                    <p className="theme-copy">Time: {appointment.appointmentTime}</p>
                    <p className="theme-copy">Status: <span className="font-semibold text-white">{appointment.status}</span></p>
                    <p className="theme-copy">Check-in: <span className="font-semibold text-white">{appointment.checkInStatus || "pending"}</span></p>
                  </div>

                  <div className="flex flex-col gap-4 self-start">
                    {appointment.qrToken || appointment.qrPayload ? (
                      <div className="w-full max-w-[330px]">
                        <AppointmentQrCard
                          value={appointment.qrPayload || appointment.qrToken}
                          title="Appointment QR"
                          subtitle="Use this pass for check-in"
                          filename={`smartqueue-${appointment._id}-qr.png`}
                          compact
                        />
                      </div>
                    ) : null}

                    {appointment.status === "booked" && (
                    <div className="flex flex-wrap gap-3 self-start">
                      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/12 px-4 py-3 text-sm font-semibold text-emerald-100">
                        <ShieldIcon className="h-4 w-4" />
                        {appointment.razorpayPaymentId || appointment.paymentStatus === "paid" ? "Payment verified" : "Payment completed"}
                      </div>
                      <Button
                        onClick={() => cancelAppointment(appointment._id)}
                        disabled={loadingId === appointment._id}
                        variant="danger"
                      >
                        {loadingId === appointment._id ? <Loader text="Cancelling..." /> : "Cancel"}
                      </Button>
                    </div>
                    )}
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
