import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidbar from "./Sidbar";
import Overview from "./Overview";
import CropSelection from "./CropSelection";
import DiseasesDetection from "./DiseasesDetection";
import Weather from "./Weather";
import MarketPrice from "./MarketPrice";
import Profile from "./Profile";

export default function Dashboard() {
  const [active, setActive] = useState("overview");
  const navigate = useNavigate();

  function handleSelect(key) {
    // handle logout specially
    if (key === "logout") {
      // clear any stored auth (adjust key names as needed)
      try {
        localStorage.removeItem("token");
      } catch (e) {}
      // navigate back to landing page
      navigate("/");
      return;
    }

    // basic handler for switching panels
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
          {/* Simple content area that shows which panel is active. Replace with your real panels. */}
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
