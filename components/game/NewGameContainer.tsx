import React, { useEffect, useState } from "react";
import NewRaceTrack from "./NewRaceTrack";
import NewPlayerCar from "./NewPlayerCar";
import NewAiCar from "./NewAiCar";
import NewQuestionCard from "./NewQuestionCard";
import NewLivesIndicator from "./NewLivesIndicator";
import NewBoostIndicator from "./NewBoostIndicator";
import NewOilSpill from "./NewOilSpill";
import NewTimer from "./NewTimer";
import NewStars from "./NewStars";
import NewMountains from "./NewMountains";
import NewClouds from "./NewClouds";
import { useGameState } from "@/hooks/useGameState";
import {
  playStartSound,
  playCorrectSound,
  playIncorrectSound,
  playCarSound,
  playFinishSound,
  useAudioInit,
} from "@/lib/sounds";

interface NewGameContainerProps {
  lessonId?: number;
  subjectId?: string;
}

const NewGameContainer: React.FC<NewGameContainerProps> = ({ lessonId, subjectId }) => {
  const {
    score,
    lives,
    playerPosition,
    aiPosition,
    currentQuestion,
    weather,
    isPlaying,
    boost,
    currentDifficulty,
    questionsAnswered,
    maxQuestions,
    showOilSpill,
    isLoading,
    answerQuestion,
    gameDuration,
    formattedTime,
  } = useGameState(lessonId, subjectId);

  const [showExplanation, setShowExplanation] = useState(false);
  const [explanationData, setExplanationData] = useState<{ title: string; text: string } | null>(null);

  useAudioInit();

  // Handle the answer callback
  const handleAnswer = (answer: string) => {
    const correct = answer === currentQuestion?.correctAnswer;

    if (correct) {
      playCorrectSound();
    } else {
      playIncorrectSound();
    }

    answerQuestion(answer);
  };

  // Handle explanation request
  const handleExplainConcept = async () => {
    if (!currentQuestion) return;
    
    setShowExplanation(true);
    setExplanationData({
      title: `Explaining: ${currentQuestion.category || 'Math'}`,
      text: `This is a ${currentDifficulty} level question about ${currentQuestion.category || 'mathematics'}. The concept involves understanding the mathematical principles needed to solve: "${currentQuestion.question}".`
    });
  };

  // Play car movement sound based on boost
  React.useEffect(() => {
    if (!isPlaying) return;

    const carSoundInterval = setInterval(() => {
      const speed = Math.max(0.5, boost / 20); // Convert boost to speed
      playCarSound(speed);
    }, 300);

    return () => clearInterval(carSoundInterval);
  }, [isPlaying, boost]);

  // Play start sound when game begins
  React.useEffect(() => {
    if (isPlaying && currentQuestion) {
      playStartSound();
    }
  }, [isPlaying, currentQuestion]);

  return (
    <div className="new-game-container relative w-full h-screen overflow-hidden">
      {/* Enhanced Background - 3D Perspective */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a0c2e] via-[#4a2a6c] to-[#f77b5a]">
        {/* Stars Layer */}
        <NewStars />
        
        {/* Sky with Clouds */}
        <NewClouds />
        
        {/* Mountains */}
        <NewMountains />
      </div>

      {/* 3D Track section */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 transform-gpu perspective-500">
        <div className="relative h-full transform-style-preserve-3d">
          <NewRaceTrack playerPosition={playerPosition} aiPosition={aiPosition} />

          {/* Cars positioned on the road */}
          <NewPlayerCar position={playerPosition} boost={boost} />
          <NewAiCar position={aiPosition} />

          {/* Oil spill only appears for hard questions */}
          {showOilSpill && <NewOilSpill />}
        </div>
      </div>

      {/* Enhanced UI Elements */}
      <NewLivesIndicator lives={lives} />
      <NewTimer time={formattedTime} />
      <NewBoostIndicator boost={boost} />

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="text-lg font-bold text-gray-800 mb-2">Loading Game...</div>
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 animate-pulse rounded-full"></div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Question Card */}
      {isPlaying && currentQuestion && !isLoading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
          <NewQuestionCard
            question={currentQuestion}
            onAnswer={handleAnswer}
            difficulty={currentDifficulty}
            onExplain={handleExplainConcept}
          />
        </div>
      )}

      {/* Game Over Screen */}
      {!isPlaying && !isLoading && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-[#2b2d42] to-[#1a0c2e] rounded-2xl p-8 shadow-2xl text-center border border-[#f77b5a]/30">
            <h2 className="text-4xl font-bold text-white mb-4 font-orbitron">
              {lives > 0 ? "YOU WIN!" : "TRY AGAIN!"}
            </h2>
            <div className="text-lg text-gray-300 mb-6">
              Final Score: {score} | Time: {formattedTime}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#f77b5a] text-white px-8 py-3 rounded-xl hover:bg-[#e66a49] transition-colors font-bold text-lg"
            >
              Race Again
            </button>
          </div>
        </div>
      )}

      {/* Explanation Modal */}
      {showExplanation && explanationData && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-60">
          <div className="bg-[#2b2d42] text-white p-6 rounded-2xl w-11/12 max-w-2xl max-h-[80vh] overflow-y-auto border border-[#f77b5a]/30">
            <h3 className="text-2xl font-bold mb-4 text-[#f77b5a] font-orbitron">
              {explanationData.title}
            </h3>
            <div className="text-gray-300 leading-relaxed mb-6">
              {explanationData.text}
            </div>
            <button
              onClick={() => setShowExplanation(false)}
              className="bg-[#f77b5a] text-white px-4 py-2 rounded-lg hover:bg-[#e66a49] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewGameContainer; 