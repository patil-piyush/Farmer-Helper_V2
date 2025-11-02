import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import backendUrl from "../backend.js";
import unique from "../unique_values.json";

export default function Overview() {
  const [name, setName] = useState("MortalX");
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);
  const [farmSize, setFarmSize] = useState(null);
  const [marketStat, setMarketStat] = useState(null);
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketError, setMarketError] = useState(null);

  useEffect(() => {
    // First try localStorage
    try {
      const stored = localStorage.getItem("user");
      const u = stored ? JSON.parse(stored) : null;
      if (u && u.name) {
        setName(u.name);
        if (u?.farmsize || typeof u?.farmsize === "number")
          setFarmSize(u.farmsize);
        return;
      }
    } catch (e) {
      // ignore
    }

    // Fallback: fetch profile from backend
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get(`${backendUrl}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const n =
          res.data.fullname || res.data.name || res.data.email || "MortalX";
        setName(n);
        if (typeof res.data.farmsize !== "undefined")
          setFarmSize(res.data.farmsize);
        try {
          localStorage.setItem(
            "user",
            JSON.stringify({
              name: n,
              location: res.data.location || "",
              farmsize: res.data.farmsize || 0,
            })
          );
        } catch (e) {}
      })
      .catch(() => {});

    const handler = (e) => {
      const detail = e?.detail;
      if (detail && detail.name) setName(detail.name);
      if (detail && typeof detail.farmsize !== "undefined")
        setFarmSize(detail.farmsize);
    };
    window.addEventListener("profileUpdated", handler);
    return () => window.removeEventListener("profileUpdated", handler);
  }, []);

  // Fetch weather for logged-in user's location and refresh on profile updates
  useEffect(() => {
    let cancelled = false;

    async function fetchWeatherForLocation(loc) {
      if (!loc) return;
      try {
        setWeatherLoading(true);
        setWeatherError(null);
        const token = localStorage.getItem("token");
        const res = await axios.get(`${backendUrl}/api/weather`, {
          params: { location: loc },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (cancelled) return;
        setWeather(res.data);
      } catch (err) {
        if (cancelled) return;
        console.warn("Failed to fetch weather", err.message || err);
        setWeatherError(
          err.response?.data?.error || err.message || "Failed to fetch weather"
        );
        setWeather(null);
      } finally {
        if (!cancelled) setWeatherLoading(false);
      }
    }

    // read initial location from localStorage.user
    try {
      const stored = localStorage.getItem("user");
      const u = stored ? JSON.parse(stored) : null;
      const loc = u?.location;
      if (loc) fetchWeatherForLocation(loc);
    } catch (e) {}

    // listen for profileUpdated events to refresh weather (profile updates may include location)
    const onProfileUpdated = (e) => {
      const loc = e?.detail?.location;
      if (loc) fetchWeatherForLocation(loc);
      else {
        // fallback to localStorage
        try {
          const stored = localStorage.getItem("user");
          const u = stored ? JSON.parse(stored) : null;
          if (u?.location) fetchWeatherForLocation(u.location);
        } catch (er) {}
      }
    };
    window.addEventListener("profileUpdated", onProfileUpdated);

    return () => {
      cancelled = true;
      window.removeEventListener("profileUpdated", onProfileUpdated);
    };
  }, []);

  // Market stat refresh logic (can be triggered by a button)
  const isMountedRef = useRef(true);

  async function refreshMarketStat() {
    try {
      setMarketLoading(true);
      setMarketError(null);

      const commodities = unique?.Commodity || [];
      if (!commodities.length) return;
      const rand = commodities[Math.floor(Math.random() * commodities.length)];
      const token = localStorage.getItem("token");
      const res = await axios.get(`${backendUrl}/api/market`, {
        params: { commodity: rand, limit: 500 },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!isMountedRef.current) return;
      const records = res.data.records || [];
      const latestDate = res.data.latestDate || null;

      const recordsForDate = latestDate
        ? records.filter((r) => r.Arrival_Date === latestDate)
        : records;

      const numericRecords = recordsForDate
        .map((r) => ({
          ...r,
          modal: Number(String(r.Modal_Price).replace(/[^0-9.-]+/g, "")) || 0,
        }))
        .filter((r) => !isNaN(r.modal));

      if (!numericRecords.length) {
        if (isMountedRef.current)
          setMarketStat({
            commodity: rand,
            latestDate: latestDate || "-",
            modalPrice: null,
            market: null,
          });
        return;
      }

      const top = numericRecords.reduce(
        (a, b) => (b.modal > a.modal ? b : a),
        numericRecords[0]
      );
      if (isMountedRef.current)
        setMarketStat({
          commodity: rand,
          latestDate: latestDate || top.Arrival_Date,
          modalPrice: top.modal,
          market: top.Market,
        });
    } catch (err) {
      console.warn("Failed to fetch market stat", err.message || err);
      if (isMountedRef.current) {
        setMarketError(
          err.response?.data?.error ||
            err.message ||
            "Failed to fetch market stat"
        );
        setMarketStat(null);
      }
    } finally {
      if (isMountedRef.current) setMarketLoading(false);
    }
  }

  useEffect(() => {
    isMountedRef.current = true;
    refreshMarketStat();
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return (
    <div>
      {/* Top stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <span className="text-blue-500">☁️</span>
                Weather
              </div>
              {weatherLoading ? (
                <div className="text-2xl font-semibold mt-2">Loading...</div>
              ) : weather ? (
                <>
                  <div className="text-2xl font-semibold mt-2">
                    {typeof weather.temperature === "number"
                      ? `${weather.temperature.toFixed(1)}°C`
                      : weather.temperature}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {weather.condition || "-"}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {weather.location ? weather.location : ""}
                    {weather.country ? ` • ${weather.country}` : ""}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-2xl font-semibold mt-2">28°C</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Partly Cloudy
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    40% chance of rain
                  </div>
                </>
              )}
              {weatherError && (
                <div className="text-xs text-red-600 mt-2">{weatherError}</div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <span className="text-cyan-600">📈</span>
                Market Prices
              </div>
              <div>
                <button
                  onClick={refreshMarketStat}
                  disabled={marketLoading}
                  title="Refresh market stat"
                  className="p-1 rounded hover:bg-gray-100 text-gray-600 disabled:opacity-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v6h6M20 20v-6h-6M20 8a8 8 0 11-4.906-7.355"
                    />
                  </svg>
                </button>
              </div>
            </div>
            {marketLoading ? (
              <div className="text-2xl font-semibold mt-2">Loading...</div>
            ) : marketStat && marketStat.modalPrice ? (
              <>
                <div className="text-2xl font-semibold mt-2">
                  ₹{marketStat.modalPrice.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {marketStat.commodity} (highest)
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {marketStat.market} • {marketStat.latestDate}
                </div>
              </>
            ) : (
              <>
                <div className="text-2xl font-semibold mt-2">₹-</div>
                <div className="text-sm text-gray-500 mt-1">No market data</div>
                <div className="text-xs text-gray-400 mt-1">Updated: --</div>
              </>
            )}
            {marketError && (
              <div className="text-xs text-red-600 mt-2">{marketError}</div>
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <div>
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <span className="text-yellow-600">🏡</span>
              Farm Stats
            </div>
            <div className="text-2xl font-semibold mt-2">
              {typeof farmSize === "number" && farmSize > 0
                ? `${farmSize} acres`
                : "0 acres"}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {(weather && weather.location) ||
                (localStorage.getItem("user")
                  ? JSON.parse(localStorage.getItem("user") || "{}").location ||
                    "—"
                  : "—")}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {farmSize && farmSize > 0 ? "Owned farm(s)" : "No farm data"}
            </div>
          </div>
        </div>
      </div>

      {/* Lower section: Recent Activities + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded shadow p-4">
          <h3 className="font-semibold mb-3">Recent Activities</h3>
          <ul className="divide-y divide-gray-100">
            <li className="py-3 flex justify-between items-start">
              <div>
                <div className="font-medium">Disease scan completed</div>
                <div className="text-sm text-gray-600">
                  No diseases detected in wheat crop
                </div>
              </div>
              <div className="text-xs text-gray-400">3 days ago</div>
            </li>

            <li className="py-3 flex justify-between items-start">
              <div>
                <div className="font-medium">Weather alert</div>
                <div className="text-sm text-gray-600">
                  Heavy rainfall expected next week
                </div>
              </div>
              <div className="text-xs text-gray-400">5 days ago</div>
            </li>

            <li className="py-3 flex justify-between items-start">
              <div>
                <div className="font-medium">Market price update</div>
                <div className="text-sm text-gray-600">
                  Wheat prices increased by 5%
                </div>
              </div>
              <div className="text-xs text-gray-400">1 week ago</div>
            </li>
          </ul>
        </div>

        <aside className="bg-white rounded shadow p-4">
          <h3 className="font-semibold mb-3">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-2">
              📷 Scan for Diseases
            </button>
            <button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white rounded py-2">
              ☁️ Check Weather
            </button>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white rounded py-2">
              📋 View Market Prices
            </button>
            <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black rounded py-2">
              🌾 Crop Advisory
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
