import React from "react";
import { Link } from "react-router-dom";
import useReveal from "../hooks/useReveal";

export default function Hero({
  image,
  title = "Transform Your Farming\nwith AI",
  subtitle = "Join thousands of farmers using cutting-edge technology for smarter crop management, disease detection, and market insights",
}) {
  const titleParts = title.split("\n");

  // reveal refs for heading, paragraph, ctas and image
  const [hRef, hVisible] = useReveal();
  const [pRef, pVisible] = useReveal();
  const [ctaRef, ctaVisible] = useReveal();
  const [imgRef, imgVisible] = useReveal();

  return (
    <>
      {/* Top navigation similar to the screenshot */}
      <nav className="fixed inset-x-0 top-0 z-30 bg-white/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* simple leaf SVG */}
              <span className="font-semibold text-green-600" style={{fontSize:23}}>
                <a
                  href="/"
                  className="text-green-600 hover:text-green-700 flex items-center gap-2"
                >
                  <i className="fas fa-seedling" aria-hidden="true" />
                  <span>Farmer Helper</span>
                </a>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-6 text-sm">
              <a
                href="#features"
                className="text-slate-700 hover:text-slate-900"
              >
                Features
              </a>
              <a
                href="#testimonials"
                className="text-slate-700 hover:text-slate-900"
              >
                Testimonials
              </a>
              <a href="/login" className="text-slate-700 hover:text-slate-900">
                Login
              </a>
              <a href="/signup" className="text-slate-700 hover:text-slate-900">
                Register
              </a>
            </div>
          </div>
        </div>
      </nav>

      <section className="min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-4xl text-center text-white">
          <h1
            ref={hRef}
            className={`text-4xl md:text-6xl font-extrabold drop-shadow-[0_8px_30px_rgba(0,0,0,0.6)] leading-tight reveal ${
              hVisible ? "visible" : ""
            }`}
            style={{ animationDelay: "80ms" }}
          >
            {titleParts.map((p, i) => (
              <span key={i} className="block">
                {p}
              </span>
            ))}
          </h1>

          <p
            ref={pRef}
            className={`mt-6 text-base md:text-lg max-w-2xl mx-auto opacity-95 reveal ${
              pVisible ? "visible" : ""
            }`}
            style={{ animationDelay: "260ms" }}
          >
            {subtitle}
          </p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <div
              ref={ctaRef}
              className={`flex items-center gap-4 reveal ${
                ctaVisible ? "visible" : ""
              }`}
              style={{ animationDelay: "440ms" }}
            >
              <Link
                to="/signup"
                className="inline-block bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full shadow-lg text-sm md:text-base"
              >
                START FREE TRIAL
              </Link>

              <a
                href="#features"
                className="inline-block border border-white/70 text-white px-6 py-3 rounded-full hover:bg-white/10 text-sm md:text-base"
              >
                EXPLORE FEATURES
              </a>
            </div>
          </div>

          {/* optional hero image under CTAs if provided (kept for flexibility) */}
          {image && (
            <div
              ref={imgRef}
              className={`mt-10 flex justify-center reveal ${
                imgVisible ? "visible" : ""
              }`}
              style={{ animationDelay: "620ms" }}
            >
              <img
                src={image}
                alt="hero-illustration"
                className="w-full max-w-2xl rounded-lg shadow-2xl"
              />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
