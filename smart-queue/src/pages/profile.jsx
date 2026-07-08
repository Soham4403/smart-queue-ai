import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Navbar from "../components/layout/navbar";
import Button from "../components/ui/button";
import Loader from "../components/ui/loader";
import ProfileSummaryCard from "../components/profile/ProfileSummaryCard";
import { toast } from "react-toastify";

const initialForm = {
  name: "",
  address: "",
  contact: "",
  age: "",
  gender: "",
};

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/user/me");
      const currentUser = response.data.user;
      setUser(currentUser);
      setFormData({
        name: currentUser?.name || "",
        address: currentUser?.address || "",
        contact: currentUser?.contact || "",
        age: currentUser?.age || "",
        gender: currentUser?.gender || "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load profile");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    fetchProfile();
  }, [navigate]);

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await api.put("/user/me", formData);
      const updatedUser = response.data.user;
      setUser(updatedUser);
      setFormData({
        name: updatedUser?.name || "",
        address: updatedUser?.address || "",
        contact: updatedUser?.contact || "",
        age: updatedUser?.age || "",
        gender: updatedUser?.gender || "",
      });

      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      if (storedUser) {
        localStorage.setItem("user", JSON.stringify({ ...storedUser, ...updatedUser }));
      }

      toast.success(response.data.message || "Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="theme-shell min-h-screen px-6 py-8">
        <div className="theme-container mx-auto max-w-5xl space-y-8">
          <div>
            <p className="theme-kicker">Account center</p>
            <h1 className="theme-heading text-4xl font-black">Profile</h1>
            <p className="theme-copy mt-2">Keep your personal details up to date for smoother bookings.</p>
          </div>

          <ProfileSummaryCard
            user={user}
            roleLabel={user?.role === "admin" ? "Administrator" : "User"}
            lastLogin="Not tracked"
            loading={loading}
          />

          <section className="glass-panel rounded-4xl p-6 md:p-7">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="theme-kicker">Edit profile</p>
                <h2 className="mt-2 text-2xl font-black text-white">Update your details</h2>
              </div>
              <Button variant="secondary" onClick={() => navigate(-1)}>
                Back
              </Button>
            </div>

            {loading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="h-12 animate-pulse rounded-2xl bg-white/8" />
                ))}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                <input
                  className="glass-input rounded-2xl p-4 text-white"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full name"
                />
                <input
                  className="glass-input rounded-2xl p-4 text-white"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="Contact number"
                />
                <input
                  className="glass-input rounded-2xl p-4 text-white"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Age"
                />
                <select
                  className="glass-input rounded-2xl p-4 text-white"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <textarea
                  className="glass-input min-h-32 rounded-2xl p-4 text-white md:col-span-2"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Address"
                />

                <div className="md:col-span-2 flex flex-wrap gap-3">
                  <Button type="submit" disabled={saving}>
                    {saving ? <Loader text="Saving profile..." /> : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(user?.role === "admin" ? "/admin/dashboard" : "/dashboard")}
                  >
                    Return to dashboard
                  </Button>
                </div>
              </form>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
