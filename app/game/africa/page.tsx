"use client";
import React from "react";
import ThreeJSRacingGame from "@/components/game/ThreeJSRacingGame";

const AfricaRacingGame: React.FC = () => {
  return (
    <div className="w-full min-h-screen overflow-hidden bg-gradient-to-b from-orange-600 via-red-500 to-yellow-400">
      {/* Header with African theme */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
        <h1 className="text-2xl font-bold text-white text-center bg-black/20 backdrop-blur-sm rounded-xl px-6 py-3">
          🏁 African Math Racing Championship 🌍
        </h1>
        <p className="text-center text-white/90 mt-2 text-sm">
          Race through Africa while mastering mathematics!
        </p>
      </div>

      <ThreeJSRacingGame />
    </div>
  );
};

export default AfricaRacingGame;

