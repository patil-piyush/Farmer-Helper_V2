import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import backendUrl from "../backend.js";
import unique from "../unique_values.json";

const URL = "http://localhost:5001";

export default function Overview() {
  const [name, setName] = useState("MortalX");
  const [farmSize, setFarmSize] = useState(null);

  // Weather states
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);

  // Market stats states
  const [marketStat, setMarketStat] = useState(null);
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketError, setMarketError] = useState(null);

  // Chatbot states
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! 👋 I'm your AI farming assistant. How can I help you today?",
    },
  ]);
  const [loading, setLoading] = useState(false);

  // --- Load user info ---
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      const u = stored ? JSON.parse(stored) : null;
      if (u && u.name) {
        setName(u.name);
        if (u?.farmsize || typeof u?.farmsize === "number")
          setFarmSize(u.farmsize);
        return;
      }
    } catch (e) {}

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
  }, []);

  // --- Weather fetching ---
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
        setWeatherError(
          err.response?.data?.error || err.message || "Failed to fetch weather"
        );
        setWeather(null);
      } finally {
        if (!cancelled) setWeatherLoading(false);
      }
    }

    try {
      const stored = localStorage.getItem("user");
      const u = stored ? JSON.parse(stored) : null;
      const loc = u?.location;
      if (loc) fetchWeatherForLocation(loc);
    } catch (e) {}

    return () => {
      cancelled = true;
    };
  }, []);

  // --- Market data fetching ---
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

  // --- Chatbot send handler ---
  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMessage = { sender: "user", text: chatInput };
    setMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setLoading(true);

    try {
      const res = await axios.post(`${URL}/api/dialogflow/`, {
        message: chatInput,
      });
      const botReply = res.data.reply || "Sorry, I didn’t understand that.";
      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "⚠ Unable to connect to the server. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div>
      {/* Top stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Weather */}
        <div className="bg-white p-4 rounded shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <span className="text-blue-500">☁</span>Weather
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

        {/* Market */}
        <div className="bg-white p-4 rounded shadow">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <span className="text-cyan-600">📈</span>Market Prices
            </div>
            <button
              onClick={refreshMarketStat}
              disabled={marketLoading}
              title="Refresh market stat"
              className="p-1 rounded hover:bg-gray-100 text-gray-600 disabled:opacity-50"
            >
              🔄
            </button>
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

        {/* Crop Health */}
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <span className="text-green-600">🌱</span>Crop Health
          </div>
          <div className="text-2xl font-semibold mt-2">Good</div>
          <div className="text-sm text-gray-500 mt-1">No issues detected</div>
          <div className="text-xs text-gray-400 mt-1">Last checked: Today</div>
        </div>

        {/* Farm Stats */}
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <span className="text-yellow-600">🏡</span>Farm Stats
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

      {/* Lower section: Recent Activities + Quick Actions + Chatbot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
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

        {/* Quick Actions + Chatbot */}
        <aside className="bg-white rounded shadow p-4 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold mb-3">Quick Actions</h3>
            <div className="space-y-3 mb-6">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-2">
                📷 Scan for Diseases
              </button>
              <button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white rounded py-2">
                ☁ Check Weather
              </button>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white rounded py-2">
                📋 View Market Prices
              </button>
              <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black rounded py-2">
                🌾 Crop Advisory
              </button>
            </div>
          </div>

          {/* Chatbot */}
          <div className="border-t pt-4 mt-auto">
            <h3 className="font-semibold mb-3">💬 Chat Assistant</h3>
            <div className="h-64 overflow-y-auto bg-gray-50 p-2 rounded mb-2 border border-gray-200">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`my-1 p-2 rounded-lg text-sm ${
                    m.sender === "user"
                      ? "bg-blue-100 text-right ml-10"
                      : "bg-green-100 text-left mr-10"
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {loading && (
                <div className="text-gray-400 text-xs mt-1">Typing...</div>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-grow border border-gray-300 rounded px-2 py-1 text-sm"
              />
              <button
                onClick={sendMessage}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm"
              >
                Send
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
