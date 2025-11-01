import React from "react";

// Sidebar component for the dashboard
// Props:
// - active: string (key of active menu)
// - onSelect: function(menuKey) called when an item is clicked

const menuItems = [
  { key: "overview", label: "Overview" },
  { key: "crop-selection", label: "Crop Selection" },
  { key: "diseases-detection", label: "Diseases Detection" },
  { key: "weather", label: "Weather" },
  { key: "market-price", label: "Market Price" },
  { key: "profile", label: "Profile" },
  { key: "logout", label: "Logout" },
];

export default function Sidbar({ active = "overview", onSelect = () => {} }) {
  return (
    <aside className="w-64 bg-gray-800 text-gray-100 min-h-screen">
      <div className="p-4 border-b border-gray-700 flex items-center gap-3">
        <div className="rounded-full bg-gray-600 w-10 h-10 flex items-center justify-center font-bold">
          M
        </div>
        <div className="text-sm">
          <div className="font-semibold">MortalX</div>
          <div className="text-xs text-gray-400">Pune</div>
        </div>
      </div>

      <nav className="p-3">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = item.key === active;
            return (
              <li key={item.key}>
                <button
                  onClick={() => onSelect(item.key)}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-150 focus:outline-none ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-200 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  {/* simple indicator */}
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      isActive
                        ? "bg-white"
                        : "bg-transparent border border-gray-600"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
