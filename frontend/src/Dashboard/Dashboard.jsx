import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidbar from "./Sidebar";
import Overview from "./Overview";
import CropSelection from "./CropSelection";
import DiseasesDetection from "./DiseasesDetection";
import Weather from "./Weather";
import MarketPrice from "./MarketPrice";
import Profile from "./Profile";

export default function Dashboard() {
  const [active, setActive] = useState("overview");
  const navigate = useNavigate();

  // 🚫 Redirect to login if not authenticated
  useEffect(() => {
    const token = localStorage.getItem("token"); // or "auth" depending on your setup
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  function handleSelect(key) {
    // 🧹 Handle logout
    if (key === "logout") {
      try {
        localStorage.removeItem("token"); // clear token
      } catch (e) {
        console.error("Error clearing token:", e);
      }
      navigate("/"); // redirect to landing page
      return;
    }

    // Switch active section
    setActive(key);
    console.log("Sidebar selected:", key);
  }

  return (
    <div className="flex">
      <Sidbar active={active} onSelect={handleSelect} />

      <main className="flex-1 bg-gray-50 min-h-screen p-8">
        {active === "overview" && (
          <header className="mb-6">
            <h1 className="text-2xl font-semibold">Welcome, MortalX!</h1>
            <p className="text-gray-600">Here's your farming overview</p>
          </header>
        )}

        <section>
          {active === "overview" ? (
            <Overview />
          ) : active === "crop-selection" ? (
            <CropSelection />
          ) : active === "diseases-detection" ? (
            <DiseasesDetection />
          ) : active === "weather" ? (
            <Weather />
          ) : active === "market-price" ? (
            <MarketPrice />
          ) : active === "profile" ? (
            <Profile />
          ) : (
            <a href="/"></a>
          )}
        </section>
      </main>
    </div>
  );
}
