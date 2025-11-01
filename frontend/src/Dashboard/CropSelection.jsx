import React, { useState } from "react";
import axios from "axios";
import backendUrl from "../backend.js";

export default function CropSelection() {
  const [form, setForm] = useState({
    soilPh: "",
    annualRainfall: "",
    avgTemp: "",
    nitrogen: "",
    phosphorus: "",
    potassium: "",
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setResults(null);

    try {
      const payload = {
        N: Number(form.nitrogen) || 0,
        P: Number(form.phosphorus) || 0,
        K: Number(form.potassium) || 0,
        temperature: Number(form.avgTemp) || 25,
        humidity: 60,
        ph: Number(form.soilPh) || 6.5,
        rainfall: Number(form.annualRainfall) || 800,
      };

      const token = localStorage.getItem("token");

      const res = await axios.post(`${backendUrl}/api/crop`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      // Combine crops and probs into one array
      const crops = res.data.crops || [];
      const probs = res.data.probs || [];
      const combined = crops.map((crop, i) => ({
        name: crop,
        confidence: probs[i] || 0,
      }));

      setResults({
        crops: combined,
        soil: {
          pH: payload.ph,
          nitrogen: `${payload.N} mg/kg`,
          phosphorus: `${payload.P} mg/kg`,
          potassium: `${payload.K} mg/kg`,
          rainfall: `${payload.rainfall} mm`,
        },
      });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to fetch crop recommendation");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Crop Selection</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <form className="bg-white rounded shadow p-4" onSubmit={handleSubmit}>
          <h3 className="font-medium mb-3">Get Crop Recommendations</h3>

          <label className="block text-sm text-gray-600 mb-2">Soil pH</label>
          <input
            name="soilPh"
            value={form.soilPh}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mb-3"
            placeholder="e.g. 6.5"
          />

          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Nitrogen (N)
              </label>
              <input
                name="nitrogen"
                value={form.nitrogen}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                placeholder="mg/kg"
                inputMode="decimal"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Phosphorus (P)
              </label>
              <input
                name="phosphorus"
                value={form.phosphorus}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                placeholder="mg/kg"
                inputMode="decimal"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Potassium (K)
              </label>
              <input
                name="potassium"
                value={form.potassium}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                placeholder="mg/kg"
                inputMode="decimal"
              />
            </div>
          </div>

          <label className="block text-sm text-gray-600 mb-2">
            Annual Rainfall (mm)
          </label>
          <input
            name="annualRainfall"
            value={form.annualRainfall}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mb-3"
            placeholder="e.g. 800"
          />

          <label className="block text-sm text-gray-600 mb-2">
            Average Temperature (°C)
          </label>
          <input
            name="avgTemp"
            value={form.avgTemp}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mb-3"
            placeholder="e.g. 25"
          />

          <button
            className="bg-blue-600 text-white rounded px-4 py-2"
            disabled={loading}
          >
            {loading ? "Loading..." : "Get Recommendations"}
          </button>
        </form>

        {/* Results Section */}
        <div className="bg-white rounded shadow p-4">
          <h3 className="font-medium mb-3">Recommended Crops</h3>

          {results ? (
            <div className="space-y-5">
              {/* Crop Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.crops.map((c, index) => (
                  <div
                    key={index}
                    className="border rounded-xl p-4 bg-gray-50 shadow-sm hover:shadow-md transition"
                  >
                    <div className="font-semibold text-lg text-blue-700 capitalize">
                      {c.name}
                    </div>
                    <div className="text-sm text-gray-700 mt-2">
                      Confidence: {(c.confidence * 100).toFixed(2)}%
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 h-2 rounded mt-2">
                      <div
                        className="bg-green-500 h-2 rounded"
                        style={{ width: `${c.confidence * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Soil Details */}
              <div className="mt-6">
                <h4 className="font-medium mb-2">Soil Details:</h4>
                <div className="border rounded bg-white">
                  <div className="px-3 py-2 border-b">
                    pH: {results.soil.pH}
                  </div>
                  <div className="px-3 py-2 border-b">
                    Nitrogen: {results.soil.nitrogen}
                  </div>
                  <div className="px-3 py-2 border-b">
                    Phosphorus: {results.soil.phosphorus}
                  </div>
                  <div className="px-3 py-2 border-b">
                    Potassium: {results.soil.potassium}
                  </div>
                  <div className="px-3 py-2">
                    Rainfall: {results.soil.rainfall}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              Fill out the form to get crop recommendations.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
