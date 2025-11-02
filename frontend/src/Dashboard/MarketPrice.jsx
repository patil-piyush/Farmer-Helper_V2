import React, { useState } from "react";
import unique from "../unique_values.json";
import axios from "axios";
import backendUrl from "../backend.js";

const MOCK_PRICES = [
  { crop: "Wheat", price: "₹2500/ton", trend: "Upward" },
  { crop: "Rice", price: "₹3000/ton", trend: "Upward" },
];

const HISTORY = {
  Wheat: [
    { date: "2/20/2024", price: "₹2400/ton" },
    { date: "3/1/2024", price: "₹2450/ton" },
  ],
  Rice: [
    { date: "2/20/2024", price: "₹2900/ton" },
    { date: "3/1/2024", price: "₹2950/ton" },
  ],
};

export default function MarketPrice() {
  const [stateSel, setStateSel] = useState("");
  const [districtSel, setDistrictSel] = useState("");
  const [districtOptions, setDistrictOptions] = useState([]);
  const [commodity, setCommodity] = useState("");
  const [arrivalDate, setArrivalDate] = useState(""); // ISO date (yyyy-mm-dd) from date picker
  const [prediction, setPrediction] = useState(null);
  const [historyCrop, setHistoryCrop] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  function formatIsoToDdMmYyyy(iso) {
    // iso expected as yyyy-mm-dd
    const m = iso && iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    return `${m[3]}/${m[2]}/${m[1]}`;
  }

  // When a state is selected, fetch market records for that state and extract districts
  React.useEffect(() => {
    let cancelled = false;
    async function fetchDistricts() {
      if (!stateSel) {
        setDistrictOptions([]);
        return;
      }
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${backendUrl}/api/market`, {
          params: { state: stateSel, limit: 500 },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (cancelled) return;
        const districts = Array.from(
          new Set(
            (res.data.records || []).map((r) => r.District).filter(Boolean)
          )
        ).sort();
        setDistrictOptions(districts);
        // if current district not in new list, clear it
        if (districtSel && !districts.includes(districtSel)) setDistrictSel("");
      } catch (err) {
        console.warn(
          "Failed to fetch districts for state",
          stateSel,
          err.message || err
        );
        setDistrictOptions([]);
      }
    }

    fetchDistricts();
    return () => {
      cancelled = true;
    };
  }, [stateSel]);

  async function handlePredict(e) {
    e.preventDefault();
    setPrediction(null);
    if (!commodity) {
      alert("Please select a commodity");
      return;
    }
    if (!arrivalDate) {
      alert("Please choose an arrival date from the calendar");
      return;
    }

    // validate ISO date format yyyy-mm-dd
    const isoMatch = arrivalDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!isoMatch) {
      alert("Please choose a valid date from the calendar");
      return;
    }

    // Call backend API to fetch market records
    try {
      setLoading(true);
      setApiError(null);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${backendUrl}/api/market`, {
        params: {
          state: stateSel,
          district: districtSel,
          commodity: commodity,
          arrivalDate: formatIsoToDdMmYyyy(arrivalDate) || arrivalDate,
          limit: 500,
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      // res.data expected shape: { count, latestDate, records: [...] }
      setPrediction(res.data);
      // record activity and persist so Overview can pick it up
      try {
        const title = `Market query: ${commodity || "All commodities"}`;
        const subtitle = `${stateSel || ""}${
          stateSel && districtSel ? ", " : ""
        }${districtSel || ""}`;
        const item = {
          id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          title,
          subtitle,
          timestamp: Date.now(),
        };
        try {
          const raw = localStorage.getItem("recentActivities");
          const arr = raw ? JSON.parse(raw) : [];
          const next = [item, ...arr].slice(0, 10);
          localStorage.setItem("recentActivities", JSON.stringify(next));
        } catch (e) {}
        try {
          window.dispatchEvent(
            new CustomEvent("activityAdded", { detail: item })
          );
        } catch (e) {
          const evt = document.createEvent("CustomEvent");
          evt.initCustomEvent("activityAdded", true, true, item);
          window.dispatchEvent(evt);
        }
      } catch (e) {}
    } catch (err) {
      console.error("Market API error", err);
      setApiError(
        err.response?.data?.error ||
          err.message ||
          "Failed to fetch market data"
      );
      setPrediction(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Market Prices</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded shadow p-4">
          <h3 className="font-medium mb-3">Price Predictions</h3>
          <form onSubmit={handlePredict} className="space-y-3">
            <div>
              <label className="text-sm text-gray-600 block mb-1">State</label>
              <input
                list="state-list"
                value={stateSel}
                onChange={(e) => setStateSel(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Select or type state"
              />
              <datalist id="state-list">
                {(unique?.State || []).map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="text-sm text-gray-600 block mb-1">
                District
              </label>
              <input
                list="district-list"
                value={districtSel}
                onChange={(e) => setDistrictSel(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Select or type district"
              />
              <datalist id="district-list">
                {(districtOptions.length
                  ? districtOptions
                  : unique?.District || []
                ).map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="text-sm text-gray-600 block mb-1">
                Commodity
              </label>
              <input
                list="commodity-list"
                value={commodity}
                onChange={(e) => setCommodity(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Select or type commodity"
              />
              <datalist id="commodity-list">
                {(unique?.Commodity || []).map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="text-sm text-gray-600 block mb-1">
                Arrival Date
              </label>
              <input
                type="date"
                value={arrivalDate}
                onChange={(e) => setArrivalDate(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <button className="bg-blue-600 text-white rounded px-4 py-2">
              Get Prices
            </button>
          </form>

          {loading && (
            <div className="mt-4 p-3 bg-gray-50 rounded">
              Loading market data...
            </div>
          )}

          {apiError && (
            <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">
              {apiError}
            </div>
          )}

          {prediction && prediction.records && (
            <div className="mt-4">
              <div className="mb-3 text-sm text-gray-600">
                Showing <strong>{prediction.count}</strong> records (latest:{" "}
                <strong>{prediction.latestDate}</strong>)
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-gray-600">
                      <th className="py-2">Arrival Date</th>
                      <th className="py-2">Market</th>
                      <th className="py-2">Commodity</th>
                      <th className="py-2">Variety</th>
                      <th className="py-2">Grade</th>
                      <th className="py-2">Min Price</th>
                      <th className="py-2">Max Price</th>
                      <th className="py-2">Modal Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prediction.records.map((r, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="py-2">{r.Arrival_Date}</td>
                        <td className="py-2">{r.Market}</td>
                        <td className="py-2">{r.Commodity}</td>
                        <td className="py-2">{r.Variety}</td>
                        <td className="py-2">{r.Grade}</td>
                        <td className="py-2">{r.Min_Price}</td>
                        <td className="py-2">{r.Max_Price}</td>
                        <td className="py-2">{r.Modal_Price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* fallback for older mocked prediction shape (kept for compatibility) */}
          {prediction && !prediction.records && (
            <div className="mt-4 space-y-3">
              <div className="bg-cyan-100 rounded p-3">
                Current Price:{" "}
                <div className="font-semibold">{prediction.current}</div>
              </div>
              <div className="bg-yellow-100 rounded p-3">
                Predicted Price:{" "}
                <div className="font-semibold">{prediction.predicted}</div>
                <div className="text-sm">Trend: {prediction.trend}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
