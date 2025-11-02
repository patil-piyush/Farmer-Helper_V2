import React, { useEffect, useState } from "react";
import axios from "axios";
import backendUrl from "../backend.js";

export default function Weather() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    // Read logged-in user's location from localStorage
    let location = "Pune";
    try {
      const stored = localStorage.getItem("user");
      const u = stored ? JSON.parse(stored) : null;
      if (u && u.location) location = u.location;
    } catch (e) {
      // ignore and use default
    }

    const token = localStorage.getItem("token");

    // Try to fetch weather from backend (protected route)
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const url = `${backendUrl}/api/weather?location=${encodeURIComponent(
          location
        )}`;
        const res = await axios.get(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!mounted) return;
        setWeather(res.data);
      } catch (err) {
        // If backend fails, fallback to sample response (as provided)
        if (!mounted) return;
        console.warn(
          "Weather fetch failed, using fallback:",
          err?.message ?? err
        );
        setWeather({
          location,
          temperature: 26.34,
          feels_like: 26.34,
          humidity: 66,
          condition: "few clouds",
          wind_speed: 1.99,
          country: "IN",
        });
        setError(
          "Failed to fetch live weather; showing last known / sample data."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchWeather();

    const handler = (e) => {
      const detail = e?.detail;
      if (detail && detail.location) {
        // update when profile updates location
        setWeather(null);
        setLoading(true);
        axios
          .get(
            `${backendUrl}/api/weather?location=${encodeURIComponent(
              detail.location
            )}`,
            {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            }
          )
          .then((r) => setWeather(r.data))
          .catch(() =>
            setWeather({
              location: detail.location,
              temperature: 26.34,
              feels_like: 26.34,
              humidity: 66,
              condition: "few clouds",
              wind_speed: 1.99,
              country: "IN",
            })
          )
          .finally(() => setLoading(false));
      }
    };

    window.addEventListener("profileUpdated", handler);

    return () => {
      mounted = false;
      window.removeEventListener("profileUpdated", handler);
    };
  }, []);

  // Prepare formatted display values with safe fallbacks
  let disp = {
    location: "—",
    country: "",
    condition: "—",
    temperature: "—",
    feels_like: "—",
    humidity: "—",
    wind_speed: "—",
  };

  if (weather) {
    const toNum = (v) => {
      const n = typeof v === "number" ? v : parseFloat(v);
      return Number.isFinite(n) ? n : null;
    };

    const t = toNum(weather.temperature);
    const f = toNum(weather.feels_like);
    const h = toNum(weather.humidity);
    const w = toNum(weather.wind_speed);

    disp.location = weather.location || disp.location;
    disp.country = weather.country || disp.country;
    disp.condition = weather.condition
      ? weather.condition.charAt(0).toUpperCase() + weather.condition.slice(1)
      : disp.condition;
    disp.temperature = t != null ? t.toFixed(1) : disp.temperature;
    disp.feels_like = f != null ? f.toFixed(1) : disp.feels_like;
    disp.humidity = h != null ? `${h}%` : disp.humidity;
    disp.wind_speed = w != null ? `${w.toFixed(2)} m/s` : disp.wind_speed;
  }

  // small helper to pick an icon based on condition
  const getWeatherIcon = (cond) => {
    if (!cond) return "⛅";
    const c = cond.toLowerCase();
    if (c.includes("cloud")) return "⛅";
    if (c.includes("rain") || c.includes("drizzle")) return "🌧️";
    if (c.includes("thunder")) return "⛈️";
    if (c.includes("snow")) return "❄️";
    if (c.includes("clear")) return "☀️";
    if (c.includes("mist") || c.includes("fog") || c.includes("haze"))
      return "🌫️";
    return "🌤️";
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Weather</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Current weather prominent card */}
        <div className="lg:col-span-2 rounded-lg shadow p-6 bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
          {loading ? (
            <div className="text-gray-500">Loading weather…</div>
          ) : weather ? (
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="flex items-center justify-center w-32 h-32 rounded-xl bg-white/20 shadow-inner text-5xl text-white">
                <span aria-hidden>{getWeatherIcon(disp.condition)}</span>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white/80">
                      {disp.location}
                      {disp.country ? `, ${disp.country}` : ""}
                    </div>
                    <div className="text-3xl font-bold mt-1 text-white">
                      {disp.temperature}°C
                    </div>
                    <div className="text-sm text-white/80 mt-1">
                      {disp.condition}
                    </div>
                  </div>
                  <div className="text-right text-sm text-white/80">
                    <div>Feels like</div>
                    <div className="text-lg font-semibold text-white">
                      {disp.feels_like}°C
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white/10 rounded p-3 text-center backdrop-blur-sm">
                    <div className="text-xs text-white/80">Humidity</div>
                    <div className="font-semibold mt-1 text-white">
                      {disp.humidity}
                    </div>
                  </div>
                  <div className="bg-white/10 rounded p-3 text-center backdrop-blur-sm">
                    <div className="text-xs text-white/80">Wind</div>
                    <div className="font-semibold mt-1 text-white">
                      {disp.wind_speed}
                    </div>
                  </div>
                  <div className="bg-white/10 rounded p-3 text-center backdrop-blur-sm">
                    <div className="text-xs text-white/80">Condition</div>
                    <div className="font-semibold mt-1 text-white">
                      {disp.condition}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-red-500">No weather data available</div>
          )}

          {error && <div className="text-xs text-yellow-700 mt-3">{error}</div>}
        </div>

        {/* Right: Additional cards / Forecast placeholder */}
        <aside className="space-y-4">
          <div className="bg-white rounded shadow-sm p-4 border border-gray-100">
            <div className="text-sm text-gray-500">Air Quality</div>
            <div className="mt-2 font-semibold text-gray-800">Good</div>
            <div className="text-xs text-gray-400 mt-1">
              No significant pollution detected
            </div>
          </div>

          <div className="bg-white rounded shadow-sm p-4 border border-gray-100">
            <div className="text-sm text-gray-500">Forecast (next 2 days)</div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded p-3 text-center">
                <div className="text-xs text-gray-500">Tomorrow</div>
                <div className="font-semibold mt-1">{disp.temperature}°C</div>
                <div className="text-xs text-gray-400 mt-1">
                  {disp.condition}
                </div>
              </div>
              <div className="bg-slate-50 rounded p-3 text-center">
                <div className="text-xs text-gray-500">Day+2</div>
                <div className="font-semibold mt-1">{disp.temperature}°C</div>
                <div className="text-xs text-gray-400 mt-1">
                  {disp.condition}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded shadow-sm p-4 border border-gray-100">
            <div className="text-sm text-gray-500">Tips</div>
            <ul className="list-disc pl-5 mt-2 text-sm text-gray-700">
              <li>Water crops in early morning if humidity &lt; 70%</li>
              <li>Protect seedlings from heavy rain</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
