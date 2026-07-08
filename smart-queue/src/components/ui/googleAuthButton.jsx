import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithGoogle } from "../../auth/firebase";
import Loader from "./loader";
import api from "../../api";
import { toast } from "react-toastify";

export default function GoogleAuthButton() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);

    try {
      // Firebase Google Login
      const result = await signInWithGoogle();

      // Firebase ID Token
      const firebaseToken = await result.user.getIdToken();

      // Send token to backend
      const response = await api.post("/user/google-login", { firebaseToken });
      const data = response.data;

      // Store backend JWT
      localStorage.setItem("token", data.token);

      // Store user data
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard");

    } catch (error) {
      console.error(error);
      toast.error(error.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={loading}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 disabled:opacity-60"
    >
      {loading ? (
        <Loader text="Connecting Google..." />
      ) : (
        <>
          <span className="grid h-6 w-6 place-items-center rounded-full bg-linear-to-br from-blue-500 via-red-500 to-yellow-400 text-xs font-black text-white">
            G
          </span>

          Continue with Google
        </>
      )}
    </button>
  );
}
