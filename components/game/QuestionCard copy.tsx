import React, { useEffect, useState } from "react";
import { Question } from "@/data/questions";

interface QuestionCardProps {
  question: Question;
  onAnswer: (answer: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onAnswer }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleSelectAnswer = (answer: string) => {
    if (isAnswered) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);

    // Add slight delay for visual feedback
    setTimeout(() => {
      onAnswer(answer);
      setSelectedAnswer(null);
      setIsAnswered(false);
    }, 1000);
  };

  const getCategoryBadge = () => {
    const categoryColors: Record<string, string> = {
      math: "bg-blue-500",
      science: "bg-green-500",
      english: "bg-purple-500",
      history: "bg-amber-500",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs text-white ${categoryColors["math"]}`}
      >
        {"Math"}
      </span>
    );
  };

  const getButtonStyle = (answer: string) => {
    if (!selectedAnswer) return "neutral-btn";

    if (selectedAnswer === answer) {
      return answer === question.correctAnswer ? "success-btn" : "wrong-btn";
    }

    return "neutral-btn";
  };

  // const timer = question.difficulty === "easy" ? 10 : 20;
  const [timer, setTimer] = useState(10);

  useEffect(() => {
    setTimeout(() => {
      if (timer <= 0) {
        handleSelectAnswer(
          "you are a failure, you can never make it, you know you can never make it, you supposed to be selling dinner in mcdonanld"
        );
      } else {
        setTimer((prev) => prev - 1);
      }
    }, 1000);
  }, [timer]);

  return (
    <div className="question-card animate-scale-up">
      <div className="flex justify-between items-center mb-4">
        {getCategoryBadge()}
        <span className="text-lg font-medium text-gray-600">Testing Girls</span>
        <span className="text-xs font-medium text-gray-600">{timer}</span>
      </div>

      <h3 className="text-xl font-bold mb-4 text-gray-800">
        {question.question}
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {question.options.map((option, index) => (
          <button
            key={index}
            className={`answer-btn ${getButtonStyle(option)}`}
            onClick={() => handleSelectAnswer(option)}
            disabled={isAnswered}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;
