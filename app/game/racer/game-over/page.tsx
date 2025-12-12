"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import { Suspense } from "react";

const GameOver: React.FC = () => {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const scoreParam = params.get("score");
      setScore(scoreParam ? Number(scoreParam) : 0);
      const highScore = parseInt(localStorage.getItem("highScore") || "0");
      setHighScore(highScore);
    }
  }, []);

  // To navigate with a score
  const navigate = (path: any, score?: any) => {
    router.push(`${path}`);
  };
  //   const score = location.state?.score || 0;

  // Get high score from localStorage
  const isNewHighScore = score >= highScore;

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-game-sky-blue to-game-sand flex flex-col items-center justify-center p-6">
      <div className="glass-card rounded-2xl p-12 max-w-lg w-full text-center">
        <h1 className="text-4xl font-bold mb-2 text-gray-800">Game Over</h1>

        <div className="my-8">
          <div className="text-2xl font-semibold mb-4">Your Coins:</div>
          <div className="text-5xl font-bold text-blue-600 mb-6">
            {score.toLocaleString()}
          </div>

          {isNewHighScore ? (
            <div className="flex flex-col items-center">
              <Trophy className="text-yellow-500 w-16 h-16 mb-2" />
              <p className="text-xl font-bold text-yellow-600">
                New High Score!
              </p>
            </div>
          ) : (
            <div>
              <p className="text-lg text-gray-600">
                High Score:{" "}
                <span className="font-semibold">
                  {highScore.toLocaleString()}
                </span>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                You need {highScore - score} more coins to beat the high score!
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 mt-8">
          <Button
            size="lg"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => navigate("/game/racer")}
          >
            Play Again
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => navigate("/learning/dashboard")}
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameOver;
