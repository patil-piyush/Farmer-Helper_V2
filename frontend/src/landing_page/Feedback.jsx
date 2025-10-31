import React from "react";
import useReveal from "../hooks/useReveal";

export default function Feedback({ testimonials = [] }) {
  // using AOS attributes for reveal animations
  const sample = testimonials.length
    ? testimonials
    : [
        {
          name: "John Smith",
          role: "Wheat Farmer, Kansas",
          quote:
            "The crop disease detection feature saved my entire wheat harvest. This tool is a game-changer for modern farming.",
          avatar: "https://i.pravatar.cc/120?img=3",
        },
        {
          name: "Sarah Johnson",
          role: "Organic Farmer, California",
          quote:
            "The market insights helped me time my sales perfectly. My profits increased by 40% in just one season!",
          avatar: "https://i.pravatar.cc/120?img=5",
        },
        {
          name: "Michael Chen",
          role: "Rice Farmer, Texas",
          quote:
            "The AI recommendations for crop selection were spot on. I've never had better yields in 20 years of farming.",
          avatar: "https://i.pravatar.cc/120?img=12",
        },
      ];

  function Testimonial({ t, idx }) {
    const [ref, visible] = useReveal();

    return (
      <div
        ref={ref}
        className={`relative bg-white rounded-2xl p-10 pt-16 shadow-xl card-interactive reveal ${
          visible ? "visible" : ""
        }`}
        style={{ animationDelay: `${idx * 160}ms` }}
      >
        <div className="-mt-12 flex justify-center">
          <img
            src={t.avatar}
            alt={t.name}
            className="w-24 h-24 rounded-full ring-4 ring-white object-cover shadow-md"
          />
        </div>

        <blockquote className="mt-6 text-center text-slate-600 italic">
          “{t.quote}”
        </blockquote>

        <div className="mt-6 text-center">
          <div className="font-semibold text-slate-800">{t.name}</div>
          <div className="text-sm text-slate-500 mt-1">{t.role}</div>
        </div>
      </div>
    );
  }

  const [hdrRef, hdrVisible] = useReveal();

  return (
    <section id="testimonials" className="py-20 px-6 bg-[#fefeff]">
      <div className="max-w-6xl mx-auto">
        <div
          ref={hdrRef}
          className={`text-center mb-12 reveal ${hdrVisible ? "visible" : ""}`}
          style={{ animationDelay: `180ms` }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800">
            What Farmers Say
          </h2>
          <p className="mt-3 text-slate-500">
            Success stories from our community
          </p>
          <div className="mt-4 flex justify-center">
            <span className="block w-16 h-1 bg-green-500 rounded" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {sample.map((t, i) => (
            <Testimonial key={i} t={t} idx={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
