import React, { useState } from "react";

export default function Profile() {
  const [profile, setProfile] = useState({
    fullName: "MortalX",
    email: "rohanpatil712002@gmail.com",
    location: "Pune",
    farmSize: "1",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  function handleProfileChange(e) {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  }

  function handleSave(e) {
    e.preventDefault();
    // TODO: wire up to backend
    alert("Profile saved (mock)");
  }

  function handlePasswordChange(e) {
    const { name, value } = e.target;
    setPasswords((p) => ({ ...p, [name]: value }));
  }

  function handleChangePassword(e) {
    e.preventDefault();
    if (passwords.next !== passwords.confirm)
      return alert("New passwords do not match");
    // TODO: call backend to change password
    alert("Password changed (mock)");
    setPasswords({ current: "", next: "", confirm: "" });
  }

  return (
    <div className="max-w-3xl">
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>

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
