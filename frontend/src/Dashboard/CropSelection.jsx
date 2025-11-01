import React, { useState } from "react";

export default function CropSelection() {
  const [form, setForm] = useState({
    soilType: "",
    soilPh: "",
    annualRainfall: "",
    avgTemp: "",
  });

  const [results, setResults] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function buildSoilAnalysis() {
    // Use provided soilPh when available, otherwise default to 6.5
    const pH = form.soilPh ? Number(form.soilPh) : 6.5;

    // Mock nutrient values based on soil type
    let N = 45.5,
      P = 32.8,
      K = 28.4,
      OM = 2.5;

    if (form.soilType === "sandy") {
      N = 20.1;
      P = 12.5;
      K = 15.2;
      OM = 1.2;
    } else if (form.soilType === "clay") {
      N = 55.2;
      P = 40.1;
      K = 35.0;
      OM = 3.1;
    }

    return {
      pH,
      nitrogen: `${N.toFixed(1)} mg/kg`,
      phosphorus: `${P.toFixed(1)} mg/kg`,
      potassium: `${K.toFixed(1)} mg/kg`,
      organicMatter: `${OM.toFixed(1)}%`,
    };
  }

  function buildCropRecommendations(rawCrops = []) {
    // Map simple crop names into detailed objects with confidence, yield and market value
    const map = {
      Wheat: {
        confidence: 0.85,
        yield: "3.5 tons/hectare",
        market: "₹2500/ton",
      },
      Rice: { confidence: 0.75, yield: "4 tons/hectare", market: "₹3000/ton" },
      Millet: {
        confidence: 0.7,
        yield: "2.2 tons/hectare",
        market: "₹1800/ton",
      },
      Maize: {
        confidence: 0.6,
        yield: "3.0 tons/hectare",
        market: "₹2000/ton",
      },
    };

    return rawCrops.map((name) => ({ name, ...(map[name] || {}) }));
  }

  function buildRecommendationsList(soil) {
    const recs = [];
    if (soil.pH < 5.5)
      recs.push("Consider liming to raise soil pH to optimal levels");
    if (soil.nitrogen && parseFloat(soil.nitrogen) < 30)
      recs.push("Apply organic fertilizers to increase soil fertility");
    recs.push("Consider crop rotation to improve soil health");
    recs.push("Monitor soil moisture levels regularly");
    return recs;
  }

  function handleSubmit(e) {
    e.preventDefault();

    const raw = [];
    if (form.soilType === "loamy" || form.soilType === "all") raw.push("Wheat");
    if (form.soilType === "sandy" || form.soilType === "all")
      raw.push("Millet");
    if (form.annualRainfall && Number(form.annualRainfall) > 800)
      raw.push("Rice");
    if (raw.length === 0) raw.push("Maize");

    const soil = buildSoilAnalysis();
    const crops = buildCropRecommendations(raw);
    const recs = buildRecommendationsList(soil);

    setResults({ crops, soil, recommendations: recs });
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Crop Selection</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form className="bg-white rounded shadow p-4" onSubmit={handleSubmit}>
          <h3 className="font-medium mb-3">Get Crop Recommendations</h3>

          <label className="block text-sm text-gray-600 mb-2">Soil Type</label>
          <select
            name="soilType"
            value={form.soilType}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mb-3"
          >
            <option value="">Select soil type</option>
            <option value="loamy">Loamy</option>
            <option value="sandy">Sandy</option>
            <option value="clay">Clay</option>
            <option value="all">All-purpose</option>
          </select>

          <label className="block text-sm text-gray-600 mb-2">Soil pH</label>
          <input
            name="soilPh"
            value={form.soilPh}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mb-3"
            placeholder=""
          />

          <label className="block text-sm text-gray-600 mb-2">
            Annual Rainfall (mm)
          </label>
          <input
            name="annualRainfall"
            value={form.annualRainfall}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mb-3"
            placeholder=""
          />

          <label className="block text-sm text-gray-600 mb-2">
            Average Temperature (°C)
          </label>
          <input
            name="avgTemp"
            value={form.avgTemp}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 mb-3"
            placeholder=""
          />

          <button className="bg-blue-600 text-white rounded px-4 py-2">
            Get Recommendations
          </button>
        </form>

        <div className="bg-white rounded shadow p-4">
          <h3 className="font-medium mb-3">Recommended Crops</h3>

          {results && results.crops.length > 0 ? (
            <div className="space-y-3">
              {results.crops.map((c) => (
                <div key={c.name} className="border rounded p-3 bg-gray-50">
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-sm text-gray-700 mt-1">
                    Confidence: {(c.confidence * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-700 mt-1">
                    Expected Yield: {c.yield}
                  </div>
                  <div className="text-sm text-gray-700 mt-1">
                    Market Value: {c.market}
                  </div>
                </div>
              ))}

              <div className="mt-4">
                <h4 className="font-medium mb-2">Soil Analysis:</h4>
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
                    Organic Matter: {results.soil.organicMatter}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-medium mb-2">Recommendations:</h4>
                <div className="border rounded bg-white">
                  {results.recommendations.map((r, idx) => (
                    <div key={idx} className="px-3 py-2 border-b">
                      {r}
                    </div>
                  ))}
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
