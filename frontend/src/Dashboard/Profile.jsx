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

        setProfile({
          fullName: res.data.fullName || "",
          email: res.data.email || "",
          location: res.data.location || "",
          farmSize: res.data.farmSize || "",
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
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`${backendUrl}/api/user/profile`, profile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Profile updated successfully!");
      setProfile(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
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
        `${backendUrl}/api/user/change-password`,
        {
          currentPassword: passwords.current,
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
              readOnly
              className="w-full bg-gray-100 border rounded px-3 py-2 mb-1"
            />
            <div className="text-xs text-gray-500 mb-2">
              Email cannot be changed
            </div>

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
              className="bg-blue-600 text-white rounded px-4 py-2"
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
