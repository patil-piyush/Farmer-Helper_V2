import React from "react";
import useReveal from "../hooks/useReveal";

export default function Features({ items = [] }) {
  const [hdrRef, hdrVisible] = useReveal();
  const sample = items.length
    ? items
    : [
        {
          title: "Smart Crop Selection",
          body: "Get AI-powered recommendations for optimal crop selection based on soil conditions, climate data, and market demand.",
          icon: "leaf",
        },
        {
          title: "Disease Detection",
          body: "Early detection of crop diseases using advanced image recognition technology. Protect your yield before it's too late.",
          icon: "bug",
          featured: true,
        },
        {
          title: "Weather Prediction",
          body: "Get accurate weather forecasts and alerts to plan your farming activities effectively and protect your crops.",
          icon: "weather",
        },
        {
          title: "Market Insights",
          body: "Access real-time market prices and trends. Make data-driven decisions to maximize your profits.",
          icon: "chart",
        },
      ];

  const Icon = ({ name }) => {
    const common = "w-10 h-10 text-green-500";
    switch (name) {
      case "leaf":
        return (
          <svg
            className={common}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M5 20c5-4 7-8 15-11-2 8-6 11-15 11z" fill="#22c55e" />
            <path d="M19 5c-4 4-8 6-15 5 6-4 10-6 15-5z" fill="#22c55e" />
          </svg>
        );
      case "bug":
        return (
          <svg
            className={common}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13 7h6"
              stroke="#16a34a"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5 7h6"
              stroke="#16a34a"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 22c4-2 6-4 6-10S16 2 12 2 6 6 6 12s2 8 6 10z"
              fill="#ecf0f1"
              stroke="#16a34a"
            />
          </svg>
        );
      case "weather":
        return (
          <svg
            className={common}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 15a4 4 0 014-4h1"
              stroke="#16a34a"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M7 11a5 5 0 0110 0"
              stroke="#16a34a"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21 16h-2v4"
              stroke="#16a34a"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "chart":
        return (
          <svg
            className={common}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 3v18h18"
              stroke="#16a34a"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M7 13l4-4 4 6 4-8"
              stroke="#16a34a"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  function FeatureCard({ it, idx }) {
    const [ref, visible] = useReveal();
    const featured = it.featured;
    return (
      <div
        ref={ref}
        key={idx}
        className={`relative p-8 rounded-2xl bg-white shadow-lg transition-transform duration-300 card-interactive ${
          featured ? "bg-green-50 shadow-2xl -mt-6 scale-100" : ""
        } reveal ${visible ? "visible" : ""}`}
        style={{ minHeight: 220, animationDelay: `${idx * 160}ms` }}
      >
        <div className="flex flex-col items-center text-center h-full">
          <div
            className={`mb-6 p-3 rounded-full ${
              featured ? "bg-green-100" : "bg-white"
            }`}
          >
            <Icon name={it.icon} />
          </div>

          <h3 className="text-xl font-semibold text-slate-800 mb-3">
            {it.title}
          </h3>
          <p className="text-sm text-slate-500">{it.body}</p>
        </div>
      </div>
    );
  }

  return (
    <section id="features" className="py-20 px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div
          ref={hdrRef}
          className={`text-center mb-12 reveal ${hdrVisible ? "visible" : ""}`}
          style={{ animationDelay: "180ms" }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800">
            Powerful Features
          </h2>
          <p className="mt-3 text-slate-500">
            Everything you need to optimize your farming operations
          </p>
          <div className="mt-4 flex justify-center">
            <span className="block w-16 h-1 bg-green-500 rounded" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {sample.map((it, idx) => (
            <FeatureCard key={idx} it={it} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
