import React from "react";
import Hero from "./Hero";
import Features from "./Features";
import Choose from "./Choose";
import Stats from "./Stats";
import Feedback from "./Feedback";
import End from "./End";

const DEFAULT_BG =
  "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80";

export default function LandingPage({ background = DEFAULT_BG }) {
  return (
    <div className="relative min-h-screen w-full">
      {/* fixed background */}
      <div
        className="fixed inset-0 -z-10 bg-center bg-cover bg-no-repeat"
        style={{ backgroundImage: `url('${background}')` }}
        aria-hidden="true"
      />

      {/* darker overlay for stronger contrast */}
      <div className="fixed inset-0 -z-5 bg-black/60" aria-hidden="true" />

      {/* page content scrolls normally over the fixed background */}
      <main className="relative z-10">
        <Hero />
        <Features />
        <Choose />
        <Stats />
        <Feedback />
        <End />
      </main>
    </div>
  );
}
