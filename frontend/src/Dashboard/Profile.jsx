import React, { useState, useEffect } from "react";
import axios from "axios";
import backendUrl from "../backend.js";

export default function Profile() {
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    location: "",
    farmSize: "",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  const [emailError, setEmailError] = useState("");

  const [loading, setLoading] = useState(true);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("Please log in first");
          return;
        }

        const res = await axios.get(`${backendUrl}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Map backend fields (fullname, farmsize) to frontend state keys
        setProfile({
          fullName: res.data.fullname || "",
          email: res.data.email || "",
          location: res.data.location || "",
          farmSize: res.data.farmsize != null ? String(res.data.farmsize) : "",
        });
      } catch (err) {
        console.error(err);
        alert("Failed to fetch user profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  function handleProfileChange(e) {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));

    // Validate email format on change
    if (name === "email") {
      if (!validateEmail(value))
        setEmailError("Please enter a valid email address");
      else setEmailError("");
    }
  }

  function validateEmail(email) {
    // Basic RFC 5322-ish email regex (reasonable client-side check)
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  async function handleSave(e) {
    e.preventDefault();
    // final validation before sending
    if (profile.email && !validateEmail(profile.email)) {
      return alert("Please provide a valid email address before saving.");
    }

    try {
      const token = localStorage.getItem("token");

      // Map frontend keys to backend expected keys
      const payload = {
        fullname: profile.fullName,
        email: profile.email,
        location: profile.location,
        farmsize: profile.farmSize ? Number(profile.farmSize) : undefined,
      };

      const res = await axios.put(`${backendUrl}/api/user/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert(res.data?.message || "Profile updated successfully!");

      // Update local state from backend response (res.data.user)
      const updated = res.data?.user || {};
      setProfile({
        fullName: updated.fullname || profile.fullName,
        email: updated.email || profile.email,
        location: updated.location || profile.location,
        farmSize:
          updated.farmsize != null
            ? String(updated.farmsize)
            : profile.farmSize,
      });
      // Update shared local storage so other components can read the latest name/location
      const userForStorage = {
        name: updated.fullname || profile.fullName,
        location: updated.location || profile.location,
      };
      try {
        localStorage.setItem("user", JSON.stringify(userForStorage));
      } catch (e) {
        // ignore storage errors
      }

      // Dispatch a custom event so other components (e.g. Sidebar) can update immediately
      try {
        window.dispatchEvent(
          new CustomEvent("profileUpdated", { detail: userForStorage })
        );
      } catch (e) {
        // older browsers may not support CustomEvent constructor
        const evt = document.createEvent("CustomEvent");
        evt.initCustomEvent("profileUpdated", true, true, userForStorage);
        window.dispatchEvent(evt);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update profile");
    }
  }

  function handlePasswordChange(e) {
    const { name, value } = e.target;
    setPasswords((p) => ({ ...p, [name]: value }));
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (passwords.next !== passwords.confirm)
      return alert("New passwords do not match");

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${backendUrl}/api/user/password`,
        {
          oldPassword: passwords.current,
          newPassword: passwords.next,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Password changed successfully!");
      setPasswords({ current: "", next: "", confirm: "" });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to change password");
    }
  }

  if (loading) return <div>Loading profile...</div>;

  return (
    <div className="max-w-3xl">
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>

        {/* PERSONAL INFO */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Personal Information</h3>

            <label className="text-sm block mb-1">Full Name</label>
            <input
              name="fullName"
              value={profile.fullName}
              onChange={handleProfileChange}
              className="w-full border rounded px-3 py-2 mb-2"
            />

            <label className="text-sm block mb-1">Email address</label>
            <input
              name="email"
              value={profile.email}
              onChange={handleProfileChange}
              type="email"
              className={`w-full border rounded px-3 py-2 mb-1 ${
                emailError ? "border-red-500" : ""
              }`}
            />
            {emailError ? (
              <div className="text-xs text-red-600 mb-2">{emailError}</div>
            ) : (
              <div className="text-xs text-gray-500 mb-2">
                You can change your email
              </div>
            )}

            <label className="text-sm block mb-1">Location</label>
            <input
              name="location"
              value={profile.location}
              onChange={handleProfileChange}
              className="w-full border rounded px-3 py-2 mb-2"
            />

            <label className="text-sm block mb-1">Farm Size (in acres)</label>
            <input
              name="farmSize"
              value={profile.farmSize}
              onChange={handleProfileChange}
              className="w-full border rounded px-3 py-2 mb-2"
            />

            <button
              type="submit"
              disabled={!!emailError}
              className={`bg-blue-600 text-white rounded px-4 py-2 ${
                emailError ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Save Changes
            </button>
          </div>
        </form>

        {/* PASSWORD SECTION */}
        <div className="mt-6">
          <h3 className="font-medium mb-2">Change Password</h3>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="text-sm block mb-1">Current Password</label>
              <input
                name="current"
                value={passwords.current}
                onChange={handlePasswordChange}
                type="password"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm block mb-1">New Password</label>
              <input
                name="next"
                value={passwords.next}
                onChange={handlePasswordChange}
                type="password"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm block mb-1">Confirm New Password</label>
              <input
                name="confirm"
                value={passwords.confirm}
                onChange={handlePasswordChange}
                type="password"
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <button
              type="submit"
              className="bg-yellow-400 text-black rounded px-4 py-2"
            >
              Change Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
