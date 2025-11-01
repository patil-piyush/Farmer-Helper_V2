import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import backendUrl from "../backend.js";

export default function SignUp() {
  const [form, setForm] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
    location: "",
    farmsize: "",
  });

  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      const res = await axios.post(`${backendUrl}/api/auth/register`, {
        fullname: form.fullname,
        email: form.email,
        password: form.password,
        location: form.location,
        farmsize: Number(form.farmsize),
      });

      navigate("/dashboard"); // 👈 redirect after success
      // store token and user info for sidebar
      if (res?.data?.token) localStorage.setItem("token", res.data.token);
      const user = {
        name: res.data.fullname || res.data.name || res.data.email || "",
        location: res.data.location || "",
      };
      localStorage.setItem("user", JSON.stringify(user));
      setSuccess("Registration successful!");
      setForm({
        fullname: "",
        email: "",
        password: "",
        confirmPassword: "",
        location: "",
        farmsize: "",
      });
    } catch (err) {
      console.error("❌ Error:", err);
      setError(err.response?.data?.message || "Registration failed");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Farmer Helper — Sign Up
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="fullname"
            value={form.fullname}
            onChange={handleChange}
            required
            placeholder="Full Name"
            className="w-full border rounded-lg px-4 py-3"
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="Email"
            className="w-full border rounded-lg px-4 py-3"
          />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            placeholder="Password"
            className="w-full border rounded-lg px-4 py-3"
          />
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            placeholder="Confirm Password"
            className="w-full border rounded-lg px-4 py-3"
          />
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Location (Optional)"
            className="w-full border rounded-lg px-4 py-3"
          />
          <input
            type="number"
            name="farmsize"
            value={form.farmsize}
            onChange={handleChange}
            placeholder="Farm Size (in acres)"
            className="w-full border rounded-lg px-4 py-3"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
          >
            Register
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
