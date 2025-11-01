import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    // redirect to login, preserve where the user was going
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
