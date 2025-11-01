import React, { useState } from "react";

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
  const [crop, setCrop] = useState("");
  const [date, setDate] = useState(""); // ISO date (yyyy-mm-dd) from date picker
  const [prediction, setPrediction] = useState(null);
  const [historyCrop, setHistoryCrop] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  function formatIsoToDdMmYyyy(iso) {
    // iso expected as yyyy-mm-dd
    const m = iso && iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    return `${m[3]}-${m[2]}-${m[1]}`;
  }

  function handlePredict(e) {
    e.preventDefault();
    setPrediction(null);
    if (!crop) {
      alert("Please select a crop");
      return;
    }
    if (!date) {
      alert("Please choose a date from the calendar");
      return;
    }

    // validate ISO date format yyyy-mm-dd
    const isoMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!isoMatch) {
      alert("Please choose a valid date from the calendar");
      return;
    }

    // simple mocked prediction based on current price + small increase
    const current = MOCK_PRICES.find((p) => p.crop === crop);
    const base = current ? Number(current.price.replace(/[^0-9]/g, "")) : 2000;
    const predicted = base + Math.round(base * 0.04); // +4%
    setPrediction({
      current: current ? current.price : "N/A",
      predicted: `₹${predicted}/ton`,
      trend: "Upward",
      date: formatIsoToDdMmYyyy(date),
    });
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Market Prices</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1 bg-white rounded shadow p-4">
          <h3 className="font-medium mb-3">Current Market Prices</h3>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-600">
                <th className="py-2">Crop</th>
                <th className="py-2">Current Price</th>
                <th className="py-2">Trend</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_PRICES.map((p) => (
                <tr key={p.crop} className="border-t">
                  <td className="py-2">{p.crop}</td>
                  <td className="py-2">{p.price}</td>
                  <td className="py-2">
                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                      {p.trend}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="lg:col-span-2 bg-white rounded shadow p-4">
          <h3 className="font-medium mb-3">Price Predictions</h3>
          <form onSubmit={handlePredict} className="space-y-3">
            <div>
              <label className="text-sm text-gray-600 block mb-1">
                Select Crop
              </label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select crop</option>
                {MOCK_PRICES.map((p) => (
                  <option key={p.crop} value={p.crop}>
                    {p.crop}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600 block mb-1">
                Prediction Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <button className="bg-blue-600 text-white rounded px-4 py-2">
              Get Prediction
            </button>
          </form>

          {prediction && (
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
              <div className="bg-green-100 rounded p-3">
                Recommendation:{" "}
                <div className="font-semibold">
                  Consider holding your stock for better prices
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded shadow p-4">
        <h3 className="font-medium mb-3">Historical Prices</h3>
        <div className="flex items-center gap-3 mb-3">
          <select
            value={historyCrop}
            onChange={(e) => setHistoryCrop(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="">Select crop</option>
            {Object.keys(HISTORY).map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <button
            onClick={(e) => {
              e.preventDefault();
              if (!historyCrop)
                return alert("Please select a crop to view history");
              setShowHistory(true);
            }}
            className="bg-blue-600 text-white rounded px-3 py-1"
          >
            View History
          </button>
        </div>

        {showHistory ? (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-600">
                <th className="py-2">Date</th>
                <th className="py-2">Price</th>
              </tr>
            </thead>
            <tbody>
              {(HISTORY[historyCrop] || []).map((h) => (
                <tr key={h.date} className="border-t">
                  <td className="py-2">{h.date}</td>
                  <td className="py-2">{h.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-sm text-gray-500">
            Select a crop and click "View History" to see historical prices.
          </div>
        )}
      </div>
    </div>
  );
}
