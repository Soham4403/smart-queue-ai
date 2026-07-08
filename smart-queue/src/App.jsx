import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import Home from "./pages/home";
import Register from "./pages/register";
import Login from "./pages/login";
import Patient from "./pages/patient";
import Doctor from "./pages/doctor";
import BookAppointment from "./pages/bookAppointment";
import Checkout from "./pages/checkout";
import BookingSuccess from "./pages/bookingSuccess";
import Appointments from "./pages/appointments";
import About from "./pages/about";
import QrVerify from "./pages/qrVerify";
import AdminLogin from "./pages/adminLogin";
import AdminDashboard from "./pages/adminDashboard";
import Profile from "./pages/profile";
import AssistantWidget from "./components/assistant/assistantWidget";
import { Slide, ToastContainer } from "react-toastify";
import { pageTransition } from "./components/motion/motionPresets";

function AnimatedRoutes() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={reduceMotion ? false : pageTransition.initial}
        animate={pageTransition.animate}
        exit={reduceMotion ? undefined : pageTransition.exit}
      >
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/patient" element={<Patient />} />
          <Route path="/dashboard" element={<Patient />} />
          <Route path="/doctors" element={<Doctor />} />
          <Route path="/book/:doctorId" element={<BookAppointment />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/booking/success" element={<BookingSuccess />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/qr-verify" element={<QrVerify />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="bottom-right"
        autoClose={2800}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
        transition={Slide}
        limit={3}
      />
      <AssistantWidget />
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;
