import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import Button from "../components/ui/button";
import Loader from "../components/ui/loader";
import GoogleAuthButton from "../components/ui/googleAuthButton";
import { toast } from "react-toastify";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/user/login", { email, password });
      localStorage.setItem("token", response.data.token);
      toast.success("Login successful");
      navigate("/dashboard");
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="theme-shell min-h-screen p-6 text-slate-900">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 md:grid-cols-[1fr_430px]">
        <div className="hidden text-white md:block">
          <p className="theme-kicker">Welcome back</p>
          <h1 className="theme-heading mt-3 text-5xl font-bold leading-tight">Login to continue your appointment journey.</h1>
          <p className="theme-copy mt-5 max-w-xl leading-8">
            After login, your JWT token unlocks dashboard, patient creation,
            booking, and appointment history.
          </p>
        </div>

      <div className="glass-panel w-full rounded-3xl p-8">
        <h1 className="text-4xl font-bold text-center text-blue-600 mb-2">Login</h1>
        <p className="mb-8 text-center text-slate-400">Access your dashboard</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="glass-input p-3 rounded-lg text-white" required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="glass-input p-3 rounded-lg text-white" required />

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Loader text="Logging in..." /> : "Login"}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-sm font-semibold text-slate-400">or</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <GoogleAuthButton />

        <p className="text-center text-slate-300 mt-5">
          New user? <Link to="/register" className="text-green-600 font-semibold">Create account</Link>
        </p>
      </div>
      </div>
    </div>
  );
}
