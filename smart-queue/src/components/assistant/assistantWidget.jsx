import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import api from "../../api";
import Button from "../ui/button";
import Loader from "../ui/loader";
import MarkdownText from "../ui/markdownText";
import {
  CalendarIcon,
  CreditCardIcon,
  SearchIcon,
  ShieldIcon,
  StethoscopeIcon,
} from "../ui/medicalIcons";
import { toast } from "react-toastify";

const starterPrompts = [
  "I have chest pain",
  "Find a cardiologist",
  "Book tomorrow after 6 PM",
  "Show available doctors",
];

const BOOKING_WORDS = /(book|appointment|schedule|reserve|consult)/i;

function BotIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v2" />
      <rect x="4" y="6" width="16" height="12" rx="4" />
      <path d="M8 10h.01M16 10h.01" />
      <path d="M9 15c1 .7 2.1 1 3 1s2-.3 3-1" />
    </svg>
  );
}

function MicIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Z" />
      <path d="M19 12a7 7 0 0 1-14 0" />
      <path d="M12 19v3" />
    </svg>
  );
}

function VolumeIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5 6 9H3v6h3l5 4Z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18 6a9 9 0 0 1 0 12" />
    </svg>
  );
}

function SparkIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2Z" />
    </svg>
  );
}

function CloseIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <path d="M18 6 6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          className="h-2.5 w-2.5 rounded-full bg-cyan-200/90 shadow-[0_0_14px_rgba(119,242,255,0.9)]"
          style={{ animation: `assistant-wave 1.1s ease-in-out ${dot * 0.14}s infinite` }}
        />
      ))}
    </div>
  );
}

function VoiceBars() {
  const heights = ["h-2", "h-4", "h-6", "h-3", "h-5", "h-2.5"];
  return (
    <div className="flex h-7 items-end gap-1">
      {heights.map((height, index) => (
        <span
          key={index}
          className={`assistant-wave-bar ${height} w-1.5 rounded-full bg-linear-to-t from-cyan-300 via-blue-400 to-fuchsia-400 shadow-[0_0_14px_rgba(92,184,255,0.55)]`}
          style={{ animationDelay: `${index * 0.08}s` }}
        />
      ))}
    </div>
  );
}

export default function AssistantWidget() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [checkoutDraft, setCheckoutDraft] = useState(null);
  const [bookingContext, setBookingContext] = useState({
    doctorId: "",
    patientId: "",
    appointmentDate: "",
    appointmentTime: "",
  });
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi, I'm SmartQueue AI. Tell me your symptom, doctor name, or preferred time and I'll help you move faster.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(true);
  const viewportRef = useRef(null);
  const recognitionRef = useRef(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("smartqueue:open-ai", handler);
    return () => window.removeEventListener("smartqueue:open-ai", handler);
  }, []);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      setInput(transcript);
      setListening(false);
      if (transcript) {
        sendMessage(transcript);
      }
    };

    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
  }, []);

  const speakReply = (text) => {
    if (!speaking || !window.speechSynthesis) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/\*\*/g, ""));
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.lang = "en-IN";
    window.speechSynthesis.speak(utterance);
  };

  const pushMessage = (role, content) => {
    setMessages((current) => [...current, { role, content }]);
  };

  const saveCheckoutDraft = (draft) => {
    if (!draft) return;

    setCheckoutDraft(draft);
    sessionStorage.setItem("smartqueue-checkout-draft", JSON.stringify(draft));
    toast.info("Checkout details are ready");
  };

  const updateBookingContext = (payload = {}) => {
    setBookingContext((current) => ({
      doctorId: payload.doctorId || payload.doctor?._id || current.doctorId || "",
      patientId: payload.patientId || current.patientId || "",
      appointmentDate: payload.appointmentDate || payload.analysis?.appointmentDate || current.appointmentDate || "",
      appointmentTime: payload.appointmentTime || payload.analysis?.appointmentTime || current.appointmentTime || "",
    }));
  };

  const sendMessage = async (rawMessage) => {
    const message = (rawMessage || input).trim();
    if (!message || loading) {
      return;
    }

    setInput("");
    pushMessage("user", message);
    setLoading(true);

    try {
      if (BOOKING_WORDS.test(message) && !token) {
        const reply =
          "Please register or login first. After that I can help you book the appointment and keep the booking protected.";
        pushMessage("assistant", reply);
        speakReply(reply);
        return;
      }

      const endpoint = BOOKING_WORDS.test(message) && token ? "/ai/book" : "/ai/chat";
      const response = await api.post(endpoint, {
        message,
        transcript: message,
        history: messages.slice(-8),
        ...bookingContext,
      });
      const payload = response.data?.data || {};

      if (payload.analysis || payload.doctorId || payload.patientId) {
        updateBookingContext(payload);
      }

      const assistantMessage =
        payload.reply ||
        payload.message ||
        (payload.booking?.appointment
          ? "Your booking request was processed."
          : "I'm ready to help you find the right doctor.");

      pushMessage("assistant", assistantMessage);
      speakReply(assistantMessage);

      if (payload.needs === "payment" || payload.paymentRequired) {
        const draft = {
          doctorId: payload.doctorId || payload.doctor?._id,
          doctor: payload.doctor || null,
          patientId: payload.patientId,
          appointmentDate: payload.appointmentDate || payload.analysis?.appointmentDate,
          appointmentTime: payload.appointmentTime || payload.analysis?.appointmentTime,
          sourcePath: "/assistant",
          paymentAmount: payload.paymentAmount,
          paymentCurrency: payload.paymentCurrency,
          razorpayOrder: payload.razorpayOrder || null,
        };
        saveCheckoutDraft(draft);
        pushMessage(
          "assistant",
          "Your booking is ready for payment. Tap the checkout button below to review the details and continue."
        );
      }

      if (payload.booking?.appointment) {
        const finalAppointment = payload.booking?.appointment || payload.booking;
        sessionStorage.setItem("smartqueue-last-booking", JSON.stringify({
          doctor: payload.doctor || null,
          appointment: finalAppointment,
          appointmentDate: payload.appointmentDate || payload.analysis?.appointmentDate,
          appointmentTime: payload.appointmentTime || payload.analysis?.appointmentTime,
          paymentAmount: payload.paymentAmount || payload.doctor?.fees || 0,
          paymentVerified: true,
        }));
        pushMessage(
          "assistant",
          `Booking confirmed for ${payload.analysis?.appointmentDate || "your selected date"} at ${
            payload.analysis?.appointmentTime || "your selected time"
          }.`
        );
        toast.success("Appointment booked successfully");
        navigate("/booking/success", {
          state: {
            booking: {
              doctor: payload.doctor || null,
              appointment: finalAppointment,
              appointmentDate: payload.appointmentDate || payload.analysis?.appointmentDate,
              appointmentTime: payload.appointmentTime || payload.analysis?.appointmentTime,
              paymentAmount: payload.paymentAmount || payload.doctor?.fees || 0,
              paymentVerified: true,
            },
          },
        });
      }
    } catch (error) {
      const reply = error.response?.data?.message || "I hit a snag. Please try again in a moment.";
      pushMessage("assistant", reply);
      speakReply(reply);
      toast.error(reply);
    } finally {
      setLoading(false);
    }
  };

  const startVoice = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      pushMessage("assistant", "Voice input is not available in this browser.");
      toast.error("Voice input is not available in this browser.");
      return;
    }

    if (listening) {
      return;
    }

    setListening(true);
    try {
      recognition.start();
    } catch (error) {
      setListening(false);
      toast.error("Unable to start voice input right now.");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open AI assistant"
        className="assistant-glow fixed bottom-6 right-6 z-50 overflow-hidden rounded-full border border-cyan-300/30 bg-[linear-gradient(135deg,rgba(92,184,255,0.96),rgba(124,92,255,0.95),rgba(213,109,255,0.92))] px-4 py-3 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_20px_50px_rgba(92,184,255,0.35),0_0_40px_rgba(213,109,255,0.26)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_24px_60px_rgba(92,184,255,0.5),0_0_60px_rgba(213,109,255,0.35)]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.35),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(77,230,255,0.22),transparent_30%)]" />
        <div className="relative flex items-center gap-3">
          <span className="relative grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/12 shadow-[0_0_25px_rgba(255,255,255,0.12)]">
            <span className="absolute inset-0 rounded-full border border-cyan-200/30 animate-ping" />
            <SparkIcon className="h-5 w-5" />
          </span>
          <span className="pr-2 text-left">
            <span className="block text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-white/75">AI Assistant</span>
            <span className="block text-sm font-bold">Talk to AI</span>
          </span>
        </div>
      </button>

      <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.96, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: 18, scale: 0.96, filter: "blur(10px)" }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="assistant-pop fixed bottom-5 right-5 z-50 w-[min(94vw,520px)] overflow-hidden rounded-4xl border border-white/12 bg-[rgba(7,11,24,0.94)] shadow-[0_35px_120px_rgba(0,0,0,0.72)] backdrop-blur-3xl"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(119,242,255,0.22),transparent_24%),radial-gradient(circle_at_top_right,rgba(213,109,255,0.2),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(92,184,255,0.14),transparent_28%)]" />
          <div className="assistant-spin absolute -right-20 top-10 h-44 w-44 rounded-full border border-cyan-400/12 bg-[conic-gradient(from_180deg,rgba(92,184,255,0.14),rgba(124,92,255,0.08),rgba(213,109,255,0.14),rgba(92,184,255,0.14))] opacity-70 blur-2xl" />
          <div className="assistant-float absolute -left-10 top-16 h-28 w-28 rounded-full bg-cyan-400/12 blur-3xl" />
          <div className="assistant-float absolute bottom-12 right-10 h-24 w-24 rounded-full bg-fuchsia-400/12 blur-3xl" />

          <div className="relative border-b border-white/10 bg-[linear-gradient(135deg,rgba(9,14,32,0.96),rgba(13,20,45,0.86),rgba(42,18,74,0.9))] px-4 py-4">
            <div className="absolute inset-0 border-b border-cyan-300/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" />
            <div className="relative flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative grid h-12 w-12 place-items-center rounded-[1.1rem] border border-cyan-200/20 bg-[linear-gradient(145deg,rgba(58,196,255,0.95),rgba(107,92,255,0.9),rgba(213,109,255,0.94))] text-white shadow-[0_0_30px_rgba(92,184,255,0.34),0_0_80px_rgba(213,109,255,0.18)]">
                  <span className="absolute inset-0 rounded-[1.1rem] border border-white/10 animate-pulse" />
                  <BotIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-black tracking-wide text-white">SmartQueue AI</p>
                  <p className="text-xs text-cyan-100/70">Voice, doctor search, and booking flow</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.24em] text-emerald-200 sm:inline-flex">
                  Live
                </span>
                <button
                  type="button"
                  onClick={() => setSpeaking((value) => !value)}
                  className={`grid h-10 w-10 place-items-center rounded-full border transition ${
                    speaking
                      ? "border-cyan-300/35 bg-cyan-400/14 text-cyan-100 shadow-[0_0_18px_rgba(92,184,255,0.25)]"
                      : "border-white/10 bg-white/5 text-slate-400"
                  }`}
                  title="Toggle voice reply"
                  aria-label="Toggle voice reply"
                >
                  <VolumeIcon className={speaking ? "h-5 w-5" : "h-5 w-5 opacity-80"} />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setOpen(false);
                  }}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
                  aria-label="Close AI assistant"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>
          </div>

          <div className="relative border-b border-white/10 px-4 py-3">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-slate-400">Suggested prompts</p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 ${listening ? "text-pink-200" : ""}`}>
                  {listening ? <VoiceBars /> : <ShieldIcon className="h-4 w-4 text-cyan-200" />}
                  {listening ? "Listening" : "Secure"}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-100 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-cyan-400/10 hover:text-white"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div ref={viewportRef} className="relative max-h-[58vh] space-y-4 overflow-y-auto px-4 py-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-up`}
              >
                <div
                  className={`max-w-[88%] rounded-[1.4rem] px-4 py-3 text-sm leading-7 shadow-[0_14px_40px_rgba(0,0,0,0.28)] ${
                    message.role === "user"
                      ? "border border-cyan-200/20 bg-[linear-gradient(135deg,rgba(92,184,255,0.9),rgba(124,92,255,0.94),rgba(213,109,255,0.92))] text-white"
                      : "border border-white/10 bg-[rgba(255,255,255,0.05)] text-slate-100 backdrop-blur-xl"
                  }`}
                >
                  <MarkdownText text={message.content} />
                </div>
              </div>
            ))}

            {loading ? (
              <div className="flex justify-start">
                <div className="flex items-center gap-3 rounded-[1.4rem] border border-cyan-300/15 bg-[rgba(255,255,255,0.06)] px-4 py-3 text-sm text-slate-200 backdrop-blur-xl">
                  <span className="grid h-10 w-10 place-items-center rounded-full border border-cyan-300/15 bg-cyan-400/10 text-cyan-100 shadow-[0_0_20px_rgba(92,184,255,0.2)]">
                    <BotIcon className="h-5 w-5" />
                  </span>
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/70">SmartQueue AI</p>
                    <div className="flex items-center gap-3">
                      <Loader text={listening ? "Listening..." : "Thinking..."} />
                      <TypingDots />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="relative border-t border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-4 py-4">
            <div className="mb-3 grid gap-2 sm:grid-cols-2">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
                <ShieldIcon className="h-4 w-4 text-cyan-200" />
                Medical disclaimer active
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
                <StethoscopeIcon className="h-4 w-4 text-fuchsia-200" />
                Real doctors from MongoDB
              </div>
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <button
                type="button"
                onClick={() => navigate("/doctors")}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 font-semibold text-slate-200 transition duration-300 hover:-translate-y-0.5 hover:bg-white/10"
              >
                <SearchIcon className="h-4 w-4" />
                Browse doctors
              </button>
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 font-semibold text-slate-200 transition duration-300 hover:-translate-y-0.5 hover:bg-white/10"
              >
                <CalendarIcon className="h-4 w-4" />
                Start booking
              </button>
              {checkoutDraft ? (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    navigate("/checkout", { state: checkoutDraft });
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-[linear-gradient(135deg,rgba(77,230,255,0.18),rgba(124,92,255,0.18),rgba(213,109,255,0.18))] px-3 py-2 font-semibold text-cyan-100 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-200/35 hover:bg-cyan-400/18"
                >
                  <CreditCardIcon className="h-4 w-4" />
                  Proceed to checkout
                </button>
              ) : null}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage();
              }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={startVoice}
                className={`grid h-12 w-12 flex-none place-items-center rounded-2xl border transition duration-300 ${
                  listening
                    ? "border-pink-300/30 bg-[linear-gradient(135deg,rgba(236,72,153,0.24),rgba(124,92,255,0.16))] text-pink-100 shadow-[0_0_24px_rgba(236,72,153,0.22)] animate-pulse"
                    : "border-white/10 bg-white/6 text-slate-200 hover:border-cyan-300/20 hover:bg-white/10"
                }`}
                title="Voice input"
                aria-label="Voice input"
              >
                <MicIcon />
              </button>

              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about symptoms, specialists, or booking..."
                className="glass-input min-w-0 flex-1 rounded-2xl px-4 py-3 text-sm text-white"
              />

              <Button type="submit" disabled={loading || !input.trim()} className="h-12 px-4">
                Send
              </Button>
            </form>
          </div>
        </motion.div>
      ) : null}
      </AnimatePresence>
    </>
  );
}
