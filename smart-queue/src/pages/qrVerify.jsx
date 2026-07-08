import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Navbar from "../components/layout/navbar";
import Button from "../components/ui/button";
import Loader from "../components/ui/loader";
import { toast } from "react-toastify";
import { CalendarIcon, ShieldIcon, StethoscopeIcon } from "../components/ui/medicalIcons";

export default function QrVerify() {
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [scanSupport, setScanSupport] = useState(true);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const authToken = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!authToken || user?.role !== "admin") {
      navigate("/admin/login");
    }
  }, [navigate]);

  useEffect(() => {
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopScanner = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setScannerActive(false);
  };

  const fetchAppointment = async (qrToken) => {
    const cleanToken = qrToken.trim();
    if (!cleanToken) {
      toast.warning("Please enter or scan a QR token first");
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/admin/qr/${encodeURIComponent(cleanToken)}`);
      setAppointment(response.data.data);
      setToken(cleanToken);
      toast.success("Appointment loaded");
    } catch (error) {
      setAppointment(null);
      toast.error(error.response?.data?.message || "Appointment not found");
    } finally {
      setLoading(false);
    }
  };

  const checkInAppointment = async () => {
    if (!appointment?.qrToken) return;

    setCheckingIn(true);
    try {
      const response = await api.patch(`/admin/qr/${encodeURIComponent(appointment.qrToken)}/check-in`);
      setAppointment(response.data.data);
      toast.success("Appointment checked in successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to check in");
    } finally {
      setCheckingIn(false);
    }
  };

  const startScanner = async () => {
    try {
      if (!("BarcodeDetector" in window) || !navigator.mediaDevices?.getUserMedia) {
        setScanSupport(false);
        toast.error("Camera scanning is not supported in this browser. Use manual token lookup.");
        return;
      }

      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setScannerActive(true);

      const scanFrame = async () => {
        try {
          if (!videoRef.current) return;
          const codes = await detector.detect(videoRef.current);
          if (codes?.length) {
            const rawValue = codes[0].rawValue;
            stopScanner();
            await fetchAppointment(rawValue);
            return;
          }
        } catch (scanError) {
          console.log(scanError);
        }

        rafRef.current = requestAnimationFrame(scanFrame);
      };

      rafRef.current = requestAnimationFrame(scanFrame);
    } catch (error) {
      setScanSupport(false);
      stopScanner();
      toast.error(error.message || "Unable to start scanner");
    }
  };

  return (
    <>
      <Navbar />
      <main className="theme-shell min-h-screen px-6 py-12 text-slate-100">
        <div className="theme-container max-w-6xl space-y-8">
          <section className="glass-panel rounded-4xl p-8 md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <div className="theme-chip w-fit">
                  <ShieldIcon />
                  Admin QR verification
                </div>
                <h1 className="theme-heading mt-5 text-4xl font-black md:text-5xl">
                  Scan the appointment QR and check the patient in
                </h1>
                <p className="theme-copy mt-4 max-w-2xl leading-8">
                  Use the QR code from the patient pass or appointment history. Once the QR is verified, the appointment can be checked in only once.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button onClick={() => navigate("/admin/dashboard")}>Back to dashboard</Button>
                </div>
              </div>

              <div className="glass-card rounded-[1.7rem] p-6">
                <p className="theme-kicker">Quick lookup</p>
                <h2 className="mt-2 text-2xl font-black text-white">Enter QR token manually</h2>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <input
                    value={token}
                    onChange={(event) => setToken(event.target.value)}
                    placeholder="Paste qrToken here"
                    className="glass-input w-full rounded-2xl px-4 py-3 text-white"
                  />
                  <Button onClick={() => fetchAppointment(token)} disabled={loading}>
                    {loading ? <Loader text="Looking up..." /> : "Lookup"}
                  </Button>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Button variant="secondary" onClick={startScanner}>
                    Start Scanner
                  </Button>
                  {scannerActive ? (
                    <Button variant="darkOutline" onClick={stopScanner}>
                      Stop Scanner
                    </Button>
                  ) : null}
                </div>

                {!scanSupport ? (
                  <p className="mt-4 text-sm text-amber-200">
                    Camera scan is not available here. Manual lookup still works.
                  </p>
                ) : null}
              </div>
            </div>
          </section>

          {scannerActive ? (
            <section className="glass-panel rounded-4xl p-6">
              <div className="mb-4 flex items-center gap-3">
                <CalendarIcon className="h-5 w-5 text-cyan-200" />
                <p className="theme-kicker">Live scanner</p>
              </div>
              <video
                ref={videoRef}
                className="h-90 w-full rounded-3xl bg-black object-cover"
                playsInline
                muted
              />
            </section>
          ) : null}

          {appointment ? (
            <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="glass-panel rounded-4xl p-7">
                <p className="theme-kicker">Appointment details</p>
                <h2 className="mt-2 text-3xl font-black text-white">Verified pass</h2>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="glass-card rounded-[1.2rem] p-4">
                    <p className="text-sm text-slate-400">Patient</p>
                    <p className="mt-2 text-lg font-bold text-white">{appointment.patientId?.patientName || "Patient"}</p>
                  </div>
                  <div className="glass-card rounded-[1.2rem] p-4">
                    <p className="text-sm text-slate-400">Doctor</p>
                    <p className="mt-2 text-lg font-bold text-white">{appointment.doctorId?.name || "Doctor"}</p>
                  </div>
                  <div className="glass-card rounded-[1.2rem] p-4">
                    <p className="text-sm text-slate-400">Date & Time</p>
                    <p className="mt-2 text-lg font-bold text-white">
                      {appointment.appointmentDate} - {appointment.appointmentTime}
                    </p>
                  </div>
                  <div className="glass-card rounded-[1.2rem] p-4">
                    <p className="text-sm text-slate-400">Payment status</p>
                    <p className="mt-2 text-lg font-bold text-emerald-300">{appointment.paymentStatus || "pending"}</p>
                  </div>
                  <div className="glass-card rounded-[1.2rem] p-4">
                    <p className="text-sm text-slate-400">Appointment status</p>
                    <p className="mt-2 text-lg font-bold text-white">{appointment.status}</p>
                  </div>
                  <div className="glass-card rounded-[1.2rem] p-4">
                    <p className="text-sm text-slate-400">Check-in status</p>
                    <p className="mt-2 text-lg font-bold text-cyan-200">{appointment.checkInStatus || "pending"}</p>
                  </div>
                </div>
              </div>

              <div className="glass-panel rounded-4xl p-7">
                <div className="mb-4 flex items-center gap-3">
                  <StethoscopeIcon className="h-5 w-5 text-cyan-200" />
                  <p className="theme-kicker">Action</p>
                </div>
                <h3 className="text-2xl font-black text-white">Reception check-in</h3>
                <p className="theme-copy mt-3 leading-8">
                  Press check-in once the patient arrives. Duplicate check-ins are blocked by the backend.
                </p>

                <div className="mt-6">
                  <Button onClick={checkInAppointment} disabled={checkingIn || appointment.checkInStatus === "checked_in"}>
                    {checkingIn ? <Loader text="Checking in..." /> : appointment.checkInStatus === "checked_in" ? "Already Checked In" : "Check-In"}
                  </Button>
                </div>

                {appointment.checkInStatus === "checked_in" ? (
                  <div className="mt-5 rounded-[1.4rem] border border-emerald-300/15 bg-emerald-400/10 p-4 text-emerald-100">
                    This appointment is already checked in.
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}
        </div>
      </main>
    </>
  );
}
