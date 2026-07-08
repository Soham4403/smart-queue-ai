import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import Button from "../components/ui/button";
import Loader from "../components/ui/loader";
import GoogleAuthButton from "../components/ui/googleAuthButton";
import { toast } from "react-toastify";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    contact: "",
    age: "",
    gender: "",
  });

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
      const response = await api.post("/user/register", formData);
      toast.success(response.data.message || "Registration successful");
      navigate("/login");
    } catch (error) {
      console.log(error);
      const message = error.response?.data?.message || error.response?.data?.error || "Registration failed. Please make sure the backend server is running.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="theme-shell min-h-screen p-6 text-slate-900">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 md:grid-cols-[1fr_460px]">
        <div className="hidden text-white md:block">
          <p className="theme-kicker">Join SmartQueue</p>
          <h1 className="theme-heading mt-3 text-5xl font-bold leading-tight">Create your account and start booking smarter.</h1>
          <p className="theme-copy mt-5 max-w-xl leading-8">
            Register first, then login to access your JWT-protected dashboard,
            patient profiles, and appointment booking.
          </p>
        </div>

      <div className="glass-panel w-full rounded-3xl p-8">
        <h1 className="text-4xl font-bold text-center text-blue-600 mb-2">Register</h1>
        <p className="mb-8 text-center text-slate-400">Create your patient account</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} className="glass-input p-3 rounded-lg text-white" required />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="glass-input p-3 rounded-lg text-white" required />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="glass-input p-3 rounded-lg text-white" required />
          <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} className="glass-input p-3 rounded-lg text-white" required />
          <input type="text" name="contact" placeholder="Contact" value={formData.contact} onChange={handleChange} className="glass-input p-3 rounded-lg text-white" required />
          <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} className="glass-input p-3 rounded-lg text-white" required />

          <select name="gender" value={formData.gender} onChange={handleChange} className="glass-input p-3 rounded-lg text-white" required>
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Loader text="Creating account..." /> : "Register"}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-sm font-semibold text-slate-400">or</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <GoogleAuthButton />

        <p className="text-center text-slate-300 mt-5">
          Already have an account? <Link to="/login" className="text-blue-600 font-semibold">Login</Link>
        </p>
      </div>
      </div>
    </div>
  );
}
