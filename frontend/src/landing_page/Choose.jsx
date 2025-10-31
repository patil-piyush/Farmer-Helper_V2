import React from "react";
import useReveal from "../hooks/useReveal";

export default function Choose({ steps = [] }) {
  // using hook-based reveal animations (useReveal + .reveal CSS)
  const sample = steps.length
    ? steps
    : [
        {
          icon: "rocket",
          title: "Increased Productivity",
          desc: "Boost your farm's productivity by up to 40% with our AI-powered recommendations and precise farming techniques.",
        },
        {
          icon: "coins",
          title: "Cost Reduction",
          desc: "Minimize resource wastage and reduce operational costs by up to 30% through smart resource management.",
        },
        {
          icon: "shield",
          title: "Risk Management",
          desc: "Protect your crops with early disease detection and weather alerts, reducing crop loss by up to 45%.",
        },
        {
          icon: "docs",
          title: "Data-Driven Decisions",
          desc: "Make informed decisions based on real-time data analytics and market intelligence reports.",
        },
        {
          icon: "leaf",
          title: "Sustainable Farming",
          desc: "Implement eco-friendly practices while maintaining high yields through optimized resource utilization.",
        },
        {
          icon: "headset",
          title: "24/7 Expert Support",
          desc: "Get round-the-clock assistance from our team of agricultural experts and technical support staff.",
        },
      ];

  const Icon = ({ name }) => {
    const cls = "w-8 h-8 text-green-500";
    switch (name) {
      case "rocket":
        return (
          <svg
            className={cls}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2s1 2 2 3 3 2 3 2-1 2-2 3-3 2-3 2-2-1-3-2-2-3-2-3 2-1 3-2 2-3 2-3z"
              fill="#22c55e"
            />
          </svg>
        );
      case "coins":
        return (
          <svg
            className={cls}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M4 10c4-3 12-3 16 0v6c-4 3-12 3-16 0v-6z" fill="#22c55e" />
          </svg>
        );
      case "shield":
        return (
          <svg
            className={cls}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2l7 4v5c0 5-3 9-7 11-4-2-7-6-7-11V6l7-4z"
              fill="#22c55e"
            />
          </svg>
        );
      case "docs":
        return (
          <svg
            className={cls}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M7 2h6l4 4v14H7V2z" fill="#22c55e" />
          </svg>
        );
      case "leaf":
        return (
          <svg
            className={cls}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M5 20c5-4 7-8 15-11-2 8-6 11-15 11z" fill="#22c55e" />
          </svg>
        );
      case "headset":
        return (
          <svg
            className={cls}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 12v4a3 3 0 003 3h1v-7H6a3 3 0 00-3-0zM21 12v4a3 3 0 01-3 3h-1v-7h1a3 3 0 013 0zM7 9a5 5 0 0110 0v2H7V9z"
              fill="#22c55e"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  function ChooseCard({ it, idx }) {
    const [ref, visible] = useReveal();

    return (
      <div
        ref={ref}
        className={`flex gap-6 items-start bg-white rounded-2xl p-6 shadow-lg card-interactive reveal ${
          visible ? "visible" : ""
        }`}
        style={{ animationDelay: `${idx * 160}ms` }}
      >
        <div className="flex-shrink-0 bg-green-50 p-3 rounded-lg">
          <Icon name={it.icon} />
        </div>

        <div>
          <h3 className="text-slate-800 font-semibold mb-2">{it.title}</h3>
          <p className="text-sm text-slate-500">{it.desc}</p>
        </div>
      </div>
    );
  }

  const [hdrRef, hdrVisible] = useReveal();

  return (
    <section id="choose" className="py-20 px-6 bg-[#fefeff]">
      <div className="max-w-6xl mx-auto">
        <div
          ref={hdrRef}
          className={`text-center mb-12 reveal ${hdrVisible ? "visible" : ""}`}
          style={{ animationDelay: `180ms` }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800">
            Why Choose Farmer Helper
          </h2>
          <p className="mt-3 text-slate-500">
            Experience the benefits that make us the preferred choice for modern
            farmers
          </p>
          <div className="mt-4 flex justify-center">
            <span className="block w-16 h-1 bg-green-500 rounded" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sample.map((it, i) => (
            <ChooseCard key={i} it={it} idx={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
