import React from "react";
import { Routes, Route, Navigate } from "react-router-dom"; // ✅ added Navigate
import LandingPage from "./landing_page/landing_page";
import SignUp from "./SignUpPage/SignUp";
import Login from "./LoginPage/Login";
import Dashboard from "./Dashboard/Dashboard";

// ✅ Protected Route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />

      {/* ✅ Dashboard is now protected */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
