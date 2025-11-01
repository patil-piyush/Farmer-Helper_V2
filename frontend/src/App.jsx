import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./landing_page/landing_page";
import SignUp from "./SignUpPage/SignUp";
import Login from "./LoginPage/Login";
import Dashboard from "./Dashboard/Dashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
