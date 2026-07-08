import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/navbar";
import Button from "../components/ui/button";
import { CalendarIcon, CreditCardIcon, ShieldIcon, StethoscopeIcon } from "../components/ui/medicalIcons";
import AppointmentQrCard from "../components/qr/AppointmentQrCard";
import { toast } from "react-toastify";

const statBlocks = [
  ["Verified", "Payment confirmed"],
  ["Protected", "Booking saved after checkout"],
  ["Ready", "Appointment now in your history"],
];

export default function BookingSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const booking = location.state?.booking || JSON.parse(sessionStorage.getItem("smartqueue-last-booking") || "null");
  const appointmentDate =
    booking?.appointmentDate || booking?.appointment?.appointmentDate || booking?.booking?.appointmentDate || "Not available";
  const appointmentTime =
    booking?.appointmentTime || booking?.appointment?.appointmentTime || booking?.booking?.appointmentTime || "Not available";
  const doctorName = booking?.doctor?.name || booking?.appointment?.doctorId?.name || "Doctor";
  const specialization = booking?.doctor?.specialized || booking?.appointment?.doctorId?.specialized || "General";
  const paymentAmount = booking?.paymentAmount || booking?.doctor?.fees || booking?.appointment?.doctorId?.fees || 0;
  const qrValue = booking?.qrPayload || booking?.appointment?.qrPayload || booking?.appointment?.qrToken || booking?.qrToken || "";

  useEffect(() => {
    if (!booking) {
      return;
    }

    const toastFlag = sessionStorage.getItem("smartqueue-booking-success-toast");
    if (!toastFlag) {
      toast.success("Appointment booked successfully");
      sessionStorage.setItem("smartqueue-booking-success-toast", "1");
    }
  }, [booking]);

  return (
    <>
      <Navbar />
      <main className="theme-shell min-h-screen px-6 py-12 text-slate-100">
        <div className="theme-container max-w-5xl">
          <div className="glass-panel relative overflow-hidden rounded-[2.2rem] border border-white/10 p-8 md:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(125,211,252,0.18),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(217,70,239,0.18),transparent_26%)]" />

            <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <section>
                <div className="theme-chip w-fit">
                  <ShieldIcon />
                  Appointment booked
                </div>

                <h1 className="theme-heading mt-5 text-4xl font-black leading-tight md:text-5xl">
                  Appointment Booked Successfully
                </h1>

                <p className="theme-copy mt-4 max-w-2xl leading-8">
                  Your payment was verified and the appointment has been secured in SmartQueue. You can review it
                  anytime from your appointment history.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {statBlocks.map(([label, caption]) => (
                    <div key={label} className="glass-card rounded-[1.4rem] p-4">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200/80">{label}</p>
                      <p className="mt-2 text-sm text-slate-300">{caption}</p>
                    </div>
                  ))}
                </div>

                {booking ? (
                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div className="glass-card rounded-[1.4rem] p-4">
                      <p className="text-sm text-slate-400">Doctor</p>
                      <p className="mt-2 text-lg font-bold text-white">{doctorName}</p>
                    </div>
                    <div className="glass-card rounded-[1.4rem] p-4">
                      <p className="text-sm text-slate-400">Specialization</p>
                      <p className="mt-2 text-lg font-bold text-white">{specialization}</p>
                    </div>
                    <div className="glass-card rounded-[1.4rem] p-4">
                      <p className="text-sm text-slate-400">Date</p>
                      <p className="mt-2 text-lg font-bold text-white">{appointmentDate}</p>
                    </div>
                    <div className="glass-card rounded-[1.4rem] p-4">
                      <p className="text-sm text-slate-400">Time</p>
                      <p className="mt-2 text-lg font-bold text-white">{appointmentTime}</p>
                    </div>
                    <div className="glass-card rounded-[1.4rem] p-4">
                      <p className="text-sm text-slate-400">Consultation fee</p>
                      <p className="mt-2 text-lg font-bold text-white">Rs. {paymentAmount}</p>
                    </div>
                    <div className="glass-card rounded-[1.4rem] p-4">
                      <p className="text-sm text-slate-400">Payment</p>
                      <p className="mt-2 text-lg font-bold text-emerald-300">Verified</p>
                    </div>
                  </div>
                ) : null}

                {qrValue ? (
                  <div className="mt-8">
                    <AppointmentQrCard
                      value={qrValue}
                      title="Digital Appointment Pass"
                      subtitle="Show this QR at the reception desk"
                      filename={`smartqueue-${doctorName}-appointment-qr.png`}
                    />
                  </div>
                ) : null}
              </section>

              <aside className="glass-card relative overflow-hidden rounded-4xl border border-white/10 p-6 md:p-7">
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))]" />
                <div className="relative space-y-5">
                  <div className="theme-chip w-fit">
                    <StethoscopeIcon />
                    Next actions
                  </div>

                  <h2 className="text-3xl font-black text-white">Your slot is locked in</h2>
                  <p className="theme-copy leading-8">
                    The clinic has the booking details and the payment receipt is already verified. Keep this page as a quick reference.
                  </p>

                  <div className="glass-panel rounded-[1.6rem] p-5">
                    <p className="text-sm text-slate-400">Appointment summary</p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {doctorName} - {appointmentDate} - {appointmentTime}
                    </p>
                    <p className="mt-2 text-sm text-slate-300">Amount paid: Rs. {paymentAmount}</p>
                  </div>

                  <div className="grid gap-3">
                    <Button onClick={() => navigate("/appointments")} className="w-full">
                      <CalendarIcon className="h-4 w-4" />
                      View Appointments
                    </Button>
                    <Button variant="secondary" onClick={() => navigate("/doctors")} className="w-full">
                      <StethoscopeIcon className="h-4 w-4" />
                      Book Another
                    </Button>
                    <Button variant="darkOutline" onClick={() => navigate("/")} className="w-full">
                      <CreditCardIcon className="h-4 w-4" />
                      Back to Home
                    </Button>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
