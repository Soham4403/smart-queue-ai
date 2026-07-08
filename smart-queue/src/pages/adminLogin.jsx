import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Button from "../components/ui/button";
import Loader from "../components/ui/loader";
import { toast } from "react-toastify";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/user/admin-login", { email, password });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      toast.success("Admin login successful");
      navigate("/admin/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Admin login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="theme-shell min-h-screen p-6 text-slate-900">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 md:grid-cols-[1fr_430px]">
        <div className="hidden text-white md:block">
          <p className="theme-kicker">Admin access</p>
          <h1 className="theme-heading mt-3 text-5xl font-bold leading-tight">
            Manage doctors, appointments, and payment collection.
          </h1>
          <p className="theme-copy mt-5 max-w-xl leading-8">
            This login is restricted to admin-role users only. From here, the
            clinic can control doctors, users, patients, and booking operations.
          </p>
        </div>

        <div className="glass-panel w-full rounded-3xl p-8">
          <h1 className="mb-2 text-center text-4xl font-bold text-blue-400">Admin Login</h1>
          <p className="mb-8 text-center text-slate-400">Restricted dashboard access</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Admin email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="glass-input rounded-lg p-3 text-white"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="glass-input rounded-lg p-3 text-white"
              required
            />

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader text="Opening admin..." /> : "Enter Dashboard"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
