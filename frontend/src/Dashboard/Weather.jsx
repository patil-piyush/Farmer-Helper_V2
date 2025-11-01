import React from "react";

export default function Weather() {
  // Mocked data similar to screenshot
  const current = {
    temp: 25,
    humidity: 65,
    rainfall: 0,
    wind: 12,
    icon: "⛅",
  };

  const forecast = [
    {
      date: "3/20/2024",
      temp: 26,
      humidity: 70,
      rainfall: 0.5,
      wind: 15,
      icon: "⛅",
    },
    {
      date: "3/21/2024",
      temp: 24,
      humidity: 75,
      rainfall: 2,
      wind: 18,
      icon: "⛅",
    },
  ];

  const risk = {
    level: "Low",
    concerns: ["Possible light rain in 2 days"],
    recommendations: ["Monitor soil moisture levels"],
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Weather Forecast</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-1 bg-white rounded shadow p-4">
          <h3 className="font-medium mb-3">Current Weather</h3>
          <div className="text-center py-6">
            <div className="text-4xl">{current.icon}</div>
            <div className="text-3xl font-semibold mt-2">{current.temp}°C</div>
            <div className="text-sm text-gray-600 mt-2">
              Humidity: {current.humidity}%
            </div>
            <div className="text-sm text-gray-600">
              Rainfall: {current.rainfall} mm
            </div>
            <div className="text-sm text-gray-600">
              Wind: {current.wind} km/h
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded shadow p-4">
          <h3 className="font-medium mb-3">Weather Forecast</h3>
          <div className="flex gap-4">
            {forecast.map((f) => (
              <div
                key={f.date}
                className="bg-white border rounded p-4 w-44 text-center"
              >
                <div className="text-sm text-gray-600">{f.date}</div>
                <div className="text-2xl mt-2">{f.icon}</div>
                <div className="font-semibold mt-2">{f.temp}°C</div>
                <div className="text-xs text-gray-600 mt-1">
                  Humidity: {f.humidity}%
                </div>
                <div className="text-xs text-gray-600">
                  Rainfall: {f.rainfall} mm
                </div>
                <div className="text-xs text-gray-600">Wind: {f.wind} km/h</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded shadow p-4">
        <h3 className="font-medium mb-3">Weather Risk Assessment</h3>
        <div className="space-y-3">
          <div className="bg-cyan-100 rounded p-4">
            <div className="font-semibold">Risk Level:</div>
            <div className="text-sm">{risk.level}</div>
          </div>

          <div className="bg-yellow-100 rounded p-4">
            <div className="font-semibold">Concerns:</div>
            <ul className="list-disc pl-5 text-sm mt-2">
              {risk.concerns.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>

          <div className="bg-green-100 rounded p-4">
            <div className="font-semibold">Recommendations:</div>
            <ul className="list-disc pl-5 text-sm mt-2">
              {risk.recommendations.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
