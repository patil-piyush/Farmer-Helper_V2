import React from "react";
import useReveal from "../hooks/useReveal";

export default function Stats({ stats = [] }) {
  // use hook-based reveal animations (useReveal + .reveal CSS)
  const sample = stats.length
    ? stats
    : [
        { label: "Active Farmers", value: "10,000+" },
        { label: "Accuracy Rate", value: "95%" },
        { label: "Yield Increase", value: "30%" },
      ];

  function StatItem({ s, idx }) {
    const [ref, visible] = useReveal();

    return (
      <div
        ref={ref}
        className={`reveal ${visible ? "visible" : ""}`}
        style={{ animationDelay: `${idx * 160}ms` }}
      >
        <div className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
          {s.value}
        </div>
        <div className="text-lg md:text-xl mt-2 opacity-90">{s.label}</div>
      </div>
    );
  }

  const [hdrRef, hdrVisible] = useReveal();

  return (
    <section className="py-0">
      <div className="w-full bg-gradient-to-r from-green-400 to-green-600">
        <div
          ref={hdrRef}
          className={`max-w-6xl mx-auto px-6 py-14 text-white reveal ${
            hdrVisible ? "visible" : ""
          }`}
          style={{ animationDelay: `180ms` }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 text-center items-center">
            {sample.map((s, i) => (
              <StatItem key={i} s={s} idx={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
