import React from "react";
import { Link } from "react-router-dom";
import useReveal from "../hooks/useReveal";

export default function End({
  ctaText = "GET STARTED NOW",
  ctaHref = "/signup",
}) {
  const [ref, visible] = useReveal();

  return (
    <section className="bg">
      <div
        ref={ref}
        className={`max-w-6xl mx-auto px-6 py-24 text-center reveal ${
          visible ? "visible" : ""
        }`}
        style={{ animationDelay: `180ms` }}
      >
        <h2
          className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-800"
          style={{ color: "#fefeff" }}
        >
          Ready to Transform Your Farm?
        </h2>

        <p
          className="mt-4 text-base md:text-lg text-slate-600"
          style={{ color: "#fefeff" }}
        >
          Join thousands of successful farmers who are already using our
          platform
        </p>

        <div className="mt-10">
          <Link
            to={ctaHref}
            className="inline-block bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full text-sm md:text-base shadow-lg"
          >
            {ctaText}
          </Link>
        </div>
      </div>
    </section>
  );
}
