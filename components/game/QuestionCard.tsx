import React, { useEffect, useState } from "react";
import { Question } from "@/data/questions";
import { Difficulty } from "@/hooks/useGameState";
import Link from "next/link";

interface QuestionCardProps {
  question: Question;
  onAnswer: (answer: string) => void;
  difficulty: Difficulty;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onAnswer, difficulty }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

  // Track screen size for responsive scaling
  useEffect(() => {
    const updateScreenSize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  // Calculate responsive sizing
  const getResponsiveStyles = () => {
    const isMobile = screenSize.width < 768;
    const isTablet = screenSize.width >= 768 && screenSize.width < 1024;
    
    return {
      containerWidth: isMobile ? '95vw' : isTablet ? '80vw' : '600px',
      padding: isMobile ? '16px' : isTablet ? '20px' : '24px',
      fontSize: {
        title: isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl',
        button: isMobile ? 'text-sm' : isTablet ? 'text-base' : 'text-lg',
        badge: isMobile ? 'text-xs' : 'text-xs',
        category: isMobile ? 'text-sm' : isTablet ? 'text-base' : 'text-lg'
      },
      gridCols: isMobile ? 'grid-cols-1' : 'grid-cols-2',
      gap: isMobile ? 'gap-2' : isTablet ? 'gap-3' : 'gap-4',
      timerSize: isMobile ? '48px' : isTablet ? '56px' : '64px'
    };
  };

  const responsiveStyles = getResponsiveStyles();

  const handleSelectAnswer = (answer: string) => {
    if (isAnswered) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);

    // Show correct answer if wrong
    if (answer !== question.correctAnswer) {
      setShowCorrectAnswer(true);
    }

    // Add slight delay for visual feedback
    setTimeout(() => {
      onAnswer(answer);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setShowCorrectAnswer(false);
    }, 1500);
  };

  const getCategoryBadge = () => {
    const categoryColors: Record<string, string> = {
      math: "bg-blue-500",
      science: "bg-green-500",
      english: "bg-purple-500",
      history: "bg-amber-500",
    };

    const category = question.category || "math";
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs text-white ${
          categoryColors[category.toLowerCase()]
        }`}
      >
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </span>
    );
  };

  const getDifficultyBadge = () => {
    const difficultyColors: Record<Difficulty, string> = {
      easy: "bg-green-500",
      medium: "bg-yellow-500",
      hard: "bg-red-500",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs text-white ${
          difficultyColors[difficulty]
        }`}
      >
        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
      </span>
    );
  };

  const getButtonStyle = (answer: string) => {
    if (!selectedAnswer) return "bg-white/20 hover:bg-white/30 border border-white/30 text-white";

    if (selectedAnswer === answer) {
      return answer === question.correctAnswer 
        ? "bg-green-500/80 border-green-400 text-white" 
        : "bg-red-500/80 border-red-400 text-white";
    }

    // Highlight the correct answer when user selects wrong answer
    if (showCorrectAnswer && answer === question.correctAnswer) {
      return "bg-green-500/80 border-green-400 text-white";
    }

    return "bg-white/20 border border-white/30 text-white";
  };

  return (
    <div 
      className="question-card animate-scale-up bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl mx-auto"
      style={{
        width: responsiveStyles.containerWidth,
        padding: responsiveStyles.padding,
        maxHeight: '90vh',
        overflow: 'auto'
      }}
    >
      {/* Timer diamond indicator - responsive */}
      <div className="absolute -top-6 sm:-top-8 left-1/2 transform -translate-x-1/2">
        <div 
          className="bg-red-500 rotate-45 flex items-center justify-center shadow-lg"
          style={{
            width: responsiveStyles.timerSize,
            height: responsiveStyles.timerSize
          }}
        >
          <span className={`text-white font-bold ${screenSize.width < 768 ? 'text-sm' : 'text-lg'} -rotate-45`}>15</span>
        </div>
      </div>

      <div className={`${screenSize.width < 768 ? 'flex-col space-y-2' : 'flex justify-between items-center'} mb-3 sm:mb-4`}>
        <div className="flex space-x-2 justify-center sm:justify-start">
          {getCategoryBadge()}
          {getDifficultyBadge()}
        </div>
        <span className={`${responsiveStyles.fontSize.category} font-medium text-white/90 text-center sm:text-right`}>
          {question.lessonTitle || "Racing Challenge"}
        </span>
      </div>

      <h3 className={`${responsiveStyles.fontSize.title} font-bold mb-4 sm:mb-6 text-white text-center flex items-center justify-center`}
          style={{ minHeight: screenSize.width < 768 ? '40px' : '60px' }}>
        {question.question}
      </h3>
      
      <div className={`grid ${responsiveStyles.gridCols} ${responsiveStyles.gap}`}>
        {question.options.map((option, index) => (
          <button
            key={index}
            className={`${getButtonStyle(option)} p-3 sm:p-4 rounded-xl ${responsiveStyles.fontSize.button} font-semibold transition-all duration-200 ${
              isAnswered ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105 transform'
            }`}
            onClick={() => handleSelectAnswer(option)}
            disabled={isAnswered}
          >
            {option}
          </button>
        ))}
      </div>

      {showCorrectAnswer && (
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-green-500/20 backdrop-blur-sm rounded-xl border border-green-400/30">
          <p className={`${responsiveStyles.fontSize.badge} font-medium text-green-200`}>
            The correct answer is: {question.correctAnswer}
          </p>
          <div className="mt-3 flex justify-center sm:justify-end">
            <Link href={`/ask/zuzuplay?q=${encodeURIComponent(question.question)}`}>
              <span className={`${responsiveStyles.fontSize.badge} px-3 sm:px-4 py-2 bg-[#4fc3f7] hover:bg-orange-600 text-white rounded-full transition-colors`}>
                Learn More
              </span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
