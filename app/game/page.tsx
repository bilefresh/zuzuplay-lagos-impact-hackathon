"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trophy, Info, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

const Index = () => {
  const navigate = useRouter();
  const [highScore, setHighScore] = useState(0);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    // Get high score from localStorage
    const storedHighScore = parseInt(localStorage.getItem("highScore") || "0");
    setHighScore(storedHighScore);

    // Show intro animation
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const startGame = () => {
    navigate.push("/game/racer");
  };

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-game-sky-blue to-game-sand overflow-hidden">
      {/* Background desert elements */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-game-sand"></div>
      <div className="absolute bottom-1/2 left-0 right-0 h-16 bg-game-sand rounded-t-[100%]"></div>

      {/* Desert hills in background */}
      <div className="absolute bottom-1/4 left-0 right-0 h-24 bg-game-sand-dark rounded-t-[100%] opacity-70"></div>
      <div className="absolute bottom-1/3 left-1/4 right-0 h-32 bg-game-sand-dark rounded-tl-[100%] opacity-50"></div>

      {/* Content container */}
      <div
        className={`relative z-10 w-full min-h-screen flex flex-col items-center justify-center p-6 transition-all duration-1000 ${
          showIntro ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        <div className="glass-card rounded-2xl p-8 max-w-lg w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-3 text-gray-800">
              Knowledge Racers
            </h1>
            <p className="text-gray-600">
              Race through the desert by answering questions correctly!
            </p>
          </div>

          {highScore > 0 && (
            <div className="mb-8 flex items-center justify-center gap-2">
              <Trophy className="text-yellow-500 w-6 h-6" />
              <span className="text-lg font-semibold">
                High Score:{" "}
                <span className="text-blue-600">
                  {highScore.toLocaleString()}
                </span>
              </span>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <Button
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6"
              onClick={startGame}
            >
              🏁 Start Classic Racing!
            </Button>

            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white text-lg py-6"
              onClick={() => navigate.push("/game/africa")}
            >
              🌍 African Heritage Racing (3D)
            </Button>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="flex items-center justify-center gap-2"
              >
                <Info className="w-5 h-5" />
                How to Play
              </Button>

              <Button
                variant="outline"
                className="flex items-center justify-center gap-2"
              >
                <Settings className="w-5 h-5" />
                Settings
              </Button>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>🏎️ <strong>Classic Racing:</strong> 2D perspective racing experience</p>
            <p>🌍 <strong>African Heritage:</strong> Full 3D racing through African landscapes</p>
            <p>🎯 Answer questions correctly to speed up and race to victory!</p>
            <p>❤️ You have 5 lives total - make them count!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
