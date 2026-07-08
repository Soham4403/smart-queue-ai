import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import Navbar from "../components/layout/navbar";
import Button from "../components/ui/button";
import Loader from "../components/ui/loader";
import { CalendarIcon, CreditCardIcon, ShieldIcon, StethoscopeIcon } from "../components/ui/medicalIcons";
import { toast } from "react-toastify";

const fallbackDoctorPhoto =
  "https://images.pexels.com/photos/6762862/pexels-photo-6762862.jpeg?auto=compress&cs=tinysrgb&w=1200";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const formatRupee = (value = 0) => `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  const draft = useMemo(() => {
    const stored = sessionStorage.getItem("smartqueue-checkout-draft");
    return location.state || (stored ? JSON.parse(stored) : null);
  }, [location.state]);

  useEffect(() => {
    if (draft) {
      sessionStorage.setItem("smartqueue-checkout-draft", JSON.stringify(draft));
      return;
    }

    setError("Checkout details are missing. Please select a doctor and time slot again.");
  }, [draft]);

  useEffect(() => {
    const hydrateSummary = async () => {
      if (!draft) {
        return;
      }

      try {
        const [doctorResponse, patientResponse] = await Promise.all([
          api.get("/doctor/get"),
          api.get("/patient/get"),
        ]);

        const doctor =
          draft.doctor ||
          doctorResponse.data.data.find((item) => String(item._id) === String(draft.doctorId));
        const patient =
          draft.patient ||
          patientResponse.data.data.find((item) => String(item._id) === String(draft.patientId));

        setSummary({
          doctor,
          patient,
          appointmentDate: draft.appointmentDate,
          appointmentTime: draft.appointmentTime,
          sourcePath: draft.sourcePath || (draft.doctorId ? `/book/${draft.doctorId}` : "/doctors"),
        });
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load checkout details");
      }
    };

    hydrateSummary();
  }, [draft]);

  const openRazorpay = async () => {
    if (!summary || loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Unable to load Razorpay checkout script");
      }

      const orderResponse = await api.post("/payment/order", {
        doctorId: summary.doctor._id,
        patientId: summary.patient._id,
        appointmentDate: summary.appointmentDate,
        appointmentTime: summary.appointmentTime,
      });

      const orderData = orderResponse.data.data;
      if (!orderData?.order?.id || !orderData?.order?.amount) {
        throw new Error(orderResponse.data?.message || "Razorpay order is missing. Check backend payment environment variables.");
      }

      const keyId = orderData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID;

      if (!keyId) {
        throw new Error("Missing VITE_RAZORPAY_KEY_ID in frontend .env");
      }

      const options = {
        key: keyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "SmartQueue",
        description: `Consultation with ${orderData.doctor.name}`,
        order_id: orderData.order.id,
        prefill: {
          name: orderData.patient.patientName || "",
        },
        theme: {
          color: "#7c5cff",
        },
        handler: async (response) => {
          try {
            const verifyResponse = await api.post("/payment/verify", {
              doctorId: summary.doctor._id,
              patientId: summary.patient._id,
              appointmentDate: summary.appointmentDate,
              appointmentTime: summary.appointmentTime,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            sessionStorage.removeItem("smartqueue-checkout-draft");
            sessionStorage.setItem(
              "smartqueue-last-booking",
              JSON.stringify(verifyResponse.data.data)
            );
            toast.success("Payment verified. Appointment booked successfully.");
            navigate("/booking/success", {
              state: {
                booking: verifyResponse.data.data,
              },
            });
          } catch (verifyError) {
            setError(verifyError.response?.data?.message || "Payment verification failed");
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to start payment");
      setLoading(false);
    }
  };

  const cancelCheckout = () => {
    sessionStorage.removeItem("smartqueue-checkout-draft");
    navigate(summary?.sourcePath || "/doctors");
  };

  if (error && !summary) {
    return (
      <>
        <Navbar />
        <main className="theme-shell min-h-screen px-6 py-12 text-slate-100">
          <div className="theme-container max-w-3xl">
            <div className="glass-panel rounded-[1.8rem] p-8">
              <p className="theme-kicker">Checkout</p>
              <h1 className="mt-3 text-3xl font-black text-white">Checkout unavailable</h1>
              <p className="theme-copy mt-4">{error}</p>
              <div className="mt-6">
                <Button onClick={() => navigate("/doctors")}>Go to doctors</Button>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="theme-shell min-h-screen px-6 pb-12 pt-10 text-slate-100">
        <div className="theme-container max-w-5xl">
          <div className="mb-8">
            <p className="theme-kicker">Checkout</p>
            <h1 className="theme-heading mt-2 text-4xl font-black">Review and pay to confirm your appointment</h1>
            <p className="theme-copy mt-3 max-w-2xl">
              Your appointment will only be created after Razorpay payment succeeds and the signature is verified.
            </p>
          </div>

          {summary ? (
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <section className="glass-panel overflow-hidden rounded-4xl">
                <img
                  src={summary.doctor?.profilePhoto || fallbackDoctorPhoto}
                  alt={summary.doctor?.name || "Doctor"}
                  className="h-72 w-full object-cover object-top"
                />

                <div className="space-y-6 p-7">
                  <div>
                    <p className="theme-chip w-fit text-sm font-bold">
                      <StethoscopeIcon />
                      {summary.doctor?.specialized || "General"}
                    </p>
                    <h2 className="mt-4 text-3xl font-black text-white">
                      {summary.doctor?.name || "Selected doctor"}
                    </h2>
                    <p className="theme-copy mt-2">{summary.doctor?.qualification || "Qualification not added"}</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="glass-card rounded-[1.4rem] p-4">
                      <p className="text-sm text-slate-400">Patient</p>
                      <p className="mt-2 text-lg font-bold text-white">
                        {summary.patient?.patientName || "Selected patient"}
                      </p>
                    </div>
                    <div className="glass-card rounded-[1.4rem] p-4">
                      <p className="text-sm text-slate-400">Consultation fee</p>
                      <p className="mt-2 text-lg font-bold text-white">
                        {formatRupee(summary.doctor?.fees || 0)}
                      </p>
                    </div>
                    <div className="glass-card rounded-[1.4rem] p-4">
                      <p className="text-sm text-slate-400">Date</p>
                      <p className="mt-2 text-lg font-bold text-white">{summary.appointmentDate}</p>
                    </div>
                    <div className="glass-card rounded-[1.4rem] p-4">
                      <p className="text-sm text-slate-400">Time</p>
                      <p className="mt-2 text-lg font-bold text-white">{summary.appointmentTime}</p>
                    </div>
                  </div>
                </div>
              </section>

              <aside className="glass-panel rounded-4xl p-7">
                <p className="theme-kicker">Payment summary</p>
                <h2 className="mt-3 text-3xl font-black text-white">Total amount</h2>
                <p className="mt-3 text-5xl font-black text-transparent bg-linear-to-r from-cyan-200 via-white to-fuchsia-200 bg-clip-text">
                  {formatRupee(summary.doctor?.fees || 0)}
                </p>

                <div className="mt-8 space-y-4">
                  <div className="glass-card rounded-[1.4rem] p-4">
                    <p className="text-sm text-slate-400">Appointment details</p>
                    <p className="mt-2 font-semibold text-white">
                      {summary.doctor?.name} - {summary.appointmentDate} - {summary.appointmentTime}
                    </p>
                  </div>

                  <div className="glass-card rounded-[1.4rem] p-4">
                    <p className="text-sm text-slate-400">Payment security</p>
                    <div className="mt-3 flex items-center gap-3">
                      <ShieldIcon className="h-5 w-5 text-cyan-200" />
                      <p className="text-sm text-slate-200">
                        Razorpay signature verification is required before booking is saved.
                      </p>
                    </div>
                  </div>
                </div>

                {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button onClick={openRazorpay} disabled={loading} className="min-w-35">
                    {loading ? <Loader text="Opening payment..." /> : (
                      <>
                        <CreditCardIcon className="h-4 w-4" />
                        Pay Now
                      </>
                    )}
                  </Button>
                  <Button variant="secondary" onClick={cancelCheckout}>
                    Cancel
                  </Button>
                </div>
              </aside>
            </div>
          ) : (
            <div className="glass-panel rounded-[1.8rem] p-8">
              <Loader text="Loading checkout..." />
            </div>
          )}
        </div>
      </main>
    </>
  );
}
