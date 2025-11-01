import React from "react";

export default function Overview() {
  return (
    <div>
      {/* Top stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <span className="text-blue-500">☁️</span>
                Weather
              </div>
              <div className="text-2xl font-semibold mt-2">28°C</div>
              <div className="text-sm text-gray-500 mt-1">Partly Cloudy</div>
              <div className="text-xs text-gray-400 mt-1">
                40% chance of rain
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <div>
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <span className="text-green-600">🌱</span>
              Crop Health
            </div>
            <div className="text-2xl font-semibold mt-2">Good</div>
            <div className="text-sm text-gray-500 mt-1">No issues detected</div>
            <div className="text-xs text-gray-400 mt-1">
              Last checked: Today
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <div>
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <span className="text-cyan-600">📈</span>
              Market Prices
            </div>
            <div className="text-2xl font-semibold mt-2">₹2,400/q</div>
            <div className="text-sm text-gray-500 mt-1">
              Wheat (Trending Up)
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Updated: 2 hours ago
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <div>
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <span className="text-yellow-600">🏡</span>
              Farm Stats
            </div>
            <div className="text-2xl font-semibold mt-2">1 acres</div>
            <div className="text-sm text-gray-500 mt-1">Pune</div>
            <div className="text-xs text-gray-400 mt-1">2 crops growing</div>
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
