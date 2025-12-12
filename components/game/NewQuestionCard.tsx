import React, { useState } from "react";
import { Question } from "@/data/questions";
import { Difficulty } from "@/hooks/useGameState";

interface NewQuestionCardProps {
  question: Question;
  onAnswer: (answer: string) => void;
  difficulty: Difficulty;
  onExplain?: () => void;
}

const NewQuestionCard: React.FC<NewQuestionCardProps> = ({ question, onAnswer, difficulty, onExplain }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showExplainButton, setShowExplainButton] = useState(false);

  const handleSelectAnswer = (answer: string) => {
    if (isAnswered) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);
    setShowExplainButton(true);

    // Add slight delay for visual feedback
    setTimeout(() => {
      onAnswer(answer);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setShowExplainButton(false);
    }, 1000);
  };

  const getButtonStyle = (answer: string) => {
    if (!selectedAnswer) return "bg-white/20 hover:bg-white/40 border border-white/30";

    if (selectedAnswer === answer) {
      return answer === question.correctAnswer 
        ? "bg-green-500/80 border-green-400" 
        : "bg-red-500/80 border-red-400";
    }

    return "bg-white/20 border border-white/30";
  };

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl p-8 w-[600px] max-w-[90vw] text-white text-center font-orbitron relative">
      {/* Timer Container */}
      <div className="absolute -top-6 -left-6 w-[70px] h-[70px] bg-[#ff4d4d] clip-path-polygon flex justify-center items-center text-2xl font-bold">
        <span>15</span>
      </div>

      {/* Question Category */}
      <div className="text-sm opacity-70 mb-2">
        {question.category || "Math"}
      </div>

      {/* Question Text */}
      <div className="text-2xl font-bold mb-6 min-h-[50px] leading-relaxed">
        {question.question}
      </div>

      {/* Answer Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {question.options.map((option, index) => (
          <button
            key={index}
            className={`answer-btn p-4 rounded-xl text-xl font-semibold transition-all duration-200 ${getButtonStyle(option)} ${
              isAnswered ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105 hover:-translate-y-1'
            }`}
            onClick={() => handleSelectAnswer(option)}
            disabled={isAnswered}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Explain Button */}
      {showExplainButton && onExplain && (
        <button
          onClick={onExplain}
          className="bg-gradient-to-r from-[#8a2be2] to-[#4169e1] text-white px-6 py-3 rounded-xl font-orbitron transition-all duration-300 hover:scale-105"
        >
          ✨ Explain Concept
        </button>
      )}
    </div>
  );
};

export default NewQuestionCard; 