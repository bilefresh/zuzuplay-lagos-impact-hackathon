import React from "react";

interface ScoreIndicatorProps {
  score: number;
  speed?: number; // Make speed optional
}

const ScoreIndicator: React.FC<ScoreIndicatorProps> = ({
  score,
  speed = 1,
}) => {
  return (
    <div className="score-container flex flex-col items-start px-4 py-2 bg-white/80 rounded-lg shadow-md absolute top-4 right-4">
      <div className="text-lg font-bold text-gray-800">
        Coins: <span className="text-blue-600">{score.toLocaleString()}</span>
      </div>
      <div className="text-md text-gray-700">
        Speed:{" "}
        <span className="text-green-600 font-semibold">
          {speed.toFixed(1)}x
        </span>
      </div>
    </div>
  );
};

export default ScoreIndicator;
