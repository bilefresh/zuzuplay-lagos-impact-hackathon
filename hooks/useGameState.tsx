import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { appConfig } from "@/constants";
import { apiCaller } from "@/middleware/apiService";
import { Question } from "@/data/questions";
import { playFinishSound } from "@/lib/sounds";
import { ProgressionService, GameStats } from "@/services/progressionService";
import { QuestionGenerationService } from "@/services/questionGenerationService";

export type Weather = "sunny" | "rainy" | "winter";

export type Difficulty = "easy" | "medium" | "hard";

interface GameState {
  score: number;
  lives: number;
  playerPosition: number;
  aiPosition: number;
  currentQuestion: Question | null;
  weather: Weather;
  isPlaying: boolean;
  boost: number;
  currentDifficulty: Difficulty;
  questionsAnswered: number;
  maxQuestions: number;
  showOilSpill: boolean;
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  isLoading: boolean;
  aiTimerDuration: number; // Configurable AI timer in seconds
  questionStartTime: number;
  usedQuestionIds: number[];
  correctAnswers: number;
  isGeneratingQuestions: boolean;
  lessonUnlocked: boolean;
  speedPenaltyUntil?: number; // timestamp until which player is slowed
}

// Fallback questions in case API fails
const fallbackQuestions: Question[] = [
  {
    id: 1,
    question: "What is 5 + 7?",
    options: ["10", "12", "13", "15"],
    correctAnswer: "12",
    category: "math",
    difficulty: "easy",
  },
  {
    id: 2,
    question: "What is 8 × 4?",
    options: ["28", "30", "32", "36"],
    correctAnswer: "32",
    category: "math",
    difficulty: "easy",
  },
  {
    id: 3,
    question: "What is 15 - 8?",
    options: ["5", "6", "7", "8"],
    correctAnswer: "7",
    category: "math",
    difficulty: "medium",
  },
  {
    id: 4,
    question: "What is 20 ÷ 4?",
    options: ["4", "5", "6", "8"],
    correctAnswer: "5",
    category: "math",
    difficulty: "medium",
  },
  {
    id: 5,
    question: "What is 3² + 4²?",
    options: ["7", "25", "49", "56"],
    correctAnswer: "25",
    category: "math",
    difficulty: "hard",
  },
  {
    id: 6,
    question: "Fill in the missing number: 400 + 100 + 200 + 300",
    options: ["1000", "2000", "800", "800"],
    correctAnswer: "1000",
    category: "math",
    difficulty: "hard",
  },
];

export const useGameState = (lessonId?: number, subjectId?: string) => {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    lives: 5,
    playerPosition: 0,
    aiPosition: 0, // Both start at same position
    currentQuestion: fallbackQuestions[0], // Start with fallback question
    weather: "sunny",
    isPlaying: true, // Start playing immediately
    boost: 0,
    currentDifficulty: "easy",
    questionsAnswered: 0,
    maxQuestions: 8,
    showOilSpill: false,
    consecutiveCorrect: 0,
    consecutiveIncorrect: 0,
    isLoading: false, // Start with false to allow movement
    aiTimerDuration: 15, // Default 15 seconds
    questionStartTime: Date.now(),
    usedQuestionIds: [],
    correctAnswers: 0,
    isGeneratingQuestions: false,
    lessonUnlocked: true, // Start unlocked for testing
    speedPenaltyUntil: 0,
  });

  const [questions, setQuestions] = useState<Question[]>(fallbackQuestions);
  const [gameStartTime, setGameStartTime] = useState(Date.now());
  const [gameDuration, setGameDuration] = useState(0);
  const navigate = useRouter().push;

  // Load questions and initialize progression tracking
  useEffect(() => {
    const initializeGame = async () => {
      if (!lessonId || !subjectId) {
        console.warn('Missing lessonId or subjectId for game initialization');
        setGameState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        // Load lesson progress
        const lessonProgress = ProgressionService.getLessonProgress(lessonId, subjectId);
        
        // Check if lesson is unlocked
        if (!ProgressionService.isLessonUnlocked(lessonId, subjectId)) {
          setGameState(prev => ({ 
            ...prev, 
            isLoading: false,
            lessonUnlocked: false 
          }));
          toast.error(`Lesson ${lessonId} is locked. Complete previous lessons to unlock.`);
          return;
        }

        console.log(`Loading questions from local JSON for lesson: ${lessonId}`);
        
        // Load questions from local JSON file instead of API
        let allQuestions: Question[] = [];
        
        try {
          // Import the generated questions (with cache busting)
          const cacheParam = `?v=${Date.now()}`;
          console.log('Attempting to fetch questions from /data/generated-questions.json');
          const response = await fetch(`/data/generated-questions.json${cacheParam}`);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const questionData = await response.json();
          console.log('Loaded question data:', questionData.metadata);
          
          // Filter questions for this specific lesson
          allQuestions = questionData.questions.filter((q: any) => q.lessonId === lessonId) as Question[];
          
          console.log(`Found ${allQuestions.length} questions for lesson ${lessonId} out of ${questionData.questions.length} total questions`);
          
          // Debug: Show available lesson IDs
          const lessonIds = questionData.questions.map((q: any) => q.lessonId);
          const availableLessonIds = Array.from(new Set(lessonIds));
          console.log('Available lesson IDs in JSON:', availableLessonIds);
          
          // If no questions found for this lesson, use fallback
          if (allQuestions.length === 0) {
            console.warn(`No questions found for lesson ${lessonId}, available lessons: ${availableLessonIds.join(', ')}`);
            allQuestions = fallbackQuestions;
          }
        } catch (error) {
          console.error('Failed to load local questions:', error);
          console.log('Using fallback questions instead');
          allQuestions = fallbackQuestions;
        }
        
        // Get unused questions
        const unusedQuestions = ProgressionService.getUnusedQuestions(lessonId, subjectId, allQuestions);
        
        // Check if we need to generate new questions
        if (QuestionGenerationService.shouldGenerateQuestions(allQuestions, lessonProgress.usedQuestionIds)) {
          setGameState(prev => ({ ...prev, isGeneratingQuestions: true }));
          toast.info("Generating new questions...");
          
          try {
            const generatedQuestions = await QuestionGenerationService.generateQuestions({
              lessonId,
              subjectId,
              difficulty: 'easy', // Start with easy
              count: 5,
              topic: QuestionGenerationService.getLessonTopic(lessonId, subjectId)
            });
            
            allQuestions = [...allQuestions, ...generatedQuestions];
            toast.success(`Generated ${generatedQuestions.length} new questions!`);
          } catch (error) {
            console.error('Failed to generate questions:', error);
            toast.warning("Using existing questions only.");
          }
          
          setGameState(prev => ({ ...prev, isGeneratingQuestions: false }));
        }
        
        setQuestions(allQuestions);
        
        // Set initial question
        const availableQuestions = ProgressionService.getUnusedQuestions(lessonId, subjectId, allQuestions);
        const easyQuestions = availableQuestions.filter((q: Question) => q.difficulty === "easy");
        
        let initialQuestion: Question;
        if (easyQuestions.length > 0) {
          initialQuestion = easyQuestions[0];
        } else if (availableQuestions.length > 0) {
          initialQuestion = availableQuestions[0];
        } else {
          // All questions used, start over
          initialQuestion = allQuestions[0] || fallbackQuestions[0];
          ProgressionService.resetLessonProgress(lessonId, subjectId);
        }
        
        setGameState(prev => ({
          ...prev,
          currentQuestion: initialQuestion,
          isLoading: false,
          lessonUnlocked: true,
          usedQuestionIds: [...lessonProgress.usedQuestionIds]
        }));
        
        toast.success(`Loaded ${allQuestions.length} questions for lesson ${lessonId}!`);
        
      } catch (error) {
        console.error('Failed to load questions:', error);
        setGameState(prev => ({
          ...prev,
          isLoading: false,
          lessonUnlocked: true
        }));
        toast.error("Failed to load questions. Using fallback questions.");
      }
    };

    initializeGame();
    setGameStartTime(Date.now());
  }, [lessonId, subjectId]);

  // Continuous car movement during race
  useEffect(() => {
    if (!gameState.isPlaying) return;

    const movementInterval = setInterval(() => {
      setGameState(prev => {
        // Player car moves continuously, with boost providing extra speed
        const underPenalty = prev.speedPenaltyUntil && Date.now() < prev.speedPenaltyUntil;
        const basePlayerMovement = underPenalty ? 0.6 : 1.0; // Slow during penalty
        const boostBonus = prev.boost > 0 ? (prev.boost / 100) * 2 : 0;
        const playerMovement = basePlayerMovement + boostBonus;
        
        // AI car moves at a steady pace
        const aiMovement = 1.2; // Slightly faster than player base speed
        
        const newPlayerPosition = prev.playerPosition + playerMovement;
        const newAiPosition = prev.aiPosition + aiMovement;
        
        
        return {
          ...prev,
          playerPosition: newPlayerPosition,
          aiPosition: newAiPosition
        };
      });
    }, 100); // Update every 100ms for smooth movement

    return () => clearInterval(movementInterval);
  }, [gameState.isPlaying]);

  // AI car movement timer - moves AI forward when player takes too long
  useEffect(() => {
    if (!gameState.isPlaying || !gameState.currentQuestion) return;

    const aiTimer = setInterval(() => {
      const timeSinceQuestionStart = (Date.now() - gameState.questionStartTime) / 1000;
      
      if (timeSinceQuestionStart >= gameState.aiTimerDuration) {
        setGameState(prev => ({
          ...prev,
          aiPosition: prev.aiPosition + 20, // AI gets significant boost when timer expires
          questionStartTime: Date.now() // Reset timer
        }));
        
        // Show feedback that AI is moving ahead
        toast.warning("Time's up! AI is pulling ahead!");
      }
    }, 1000); // Check every second

    return () => clearInterval(aiTimer);
  }, [gameState.isPlaying, gameState.currentQuestion, gameState.questionStartTime, gameState.aiTimerDuration]);

  // Update game duration
  useEffect(() => {
    if (!gameState.isPlaying) return;

    const durationTimer = setInterval(() => {
      setGameDuration(Math.floor((Date.now() - gameStartTime) / 1000));
    }, 1000);

    return () => clearInterval(durationTimer);
  }, [gameState.isPlaying, gameStartTime]);

  // Get next question based on current difficulty, avoiding used questions
  const getNextQuestion = useCallback(async (difficulty: Difficulty) => {
    if (!lessonId || !subjectId) return null;

    // Get unused questions of the specified difficulty
    const unusedQuestions = ProgressionService.getUnusedQuestions(lessonId, subjectId, questions);
    const difficultyQuestions = unusedQuestions.filter((q: Question) => q.difficulty === difficulty);
    
    if (difficultyQuestions.length > 0) {
      const randomIndex = Math.floor(Math.random() * difficultyQuestions.length);
      return difficultyQuestions[randomIndex];
    }
    
    // If no unused questions of this difficulty, try any unused questions
    if (unusedQuestions.length > 0) {
      const randomIndex = Math.floor(Math.random() * unusedQuestions.length);
      return unusedQuestions[randomIndex];
    }
    
    // If all questions are used, generate new ones
    if (QuestionGenerationService.shouldGenerateQuestions(questions, gameState.usedQuestionIds)) {
      try {
        setGameState(prev => ({ ...prev, isGeneratingQuestions: true }));
        
        const generatedQuestions = await QuestionGenerationService.generateQuestions({
          lessonId,
          subjectId,
          difficulty,
          count: 3,
          topic: QuestionGenerationService.getLessonTopic(lessonId, subjectId),
          excludeQuestionIds: gameState.usedQuestionIds
        });
        
        setQuestions(prev => [...prev, ...generatedQuestions]);
        setGameState(prev => ({ ...prev, isGeneratingQuestions: false }));
        
        if (generatedQuestions.length > 0) {
          return generatedQuestions[0];
        }
      } catch (error) {
        console.error('Failed to generate questions:', error);
        setGameState(prev => ({ ...prev, isGeneratingQuestions: false }));
      }
    }
    
    // Last resort: reset and start over
    if (questions.length > 0) {
      ProgressionService.resetLessonProgress(lessonId, subjectId);
      setGameState(prev => ({ ...prev, usedQuestionIds: [] }));
      const randomIndex = Math.floor(Math.random() * questions.length);
      return questions[randomIndex];
    }
    
    return null;
  }, [questions, lessonId, subjectId, gameState.usedQuestionIds]);

  // Update difficulty based on performance - EXACT SYSTEM FROM REQUIREMENTS
  const updateDifficulty = useCallback((isCorrect: boolean) => {
    setGameState(prev => {
      let newDifficulty = prev.currentDifficulty;
      let newConsecutiveCorrect = prev.consecutiveCorrect;
      let newConsecutiveIncorrect = prev.consecutiveIncorrect;

      if (isCorrect) {
        newConsecutiveCorrect = prev.consecutiveCorrect + 1;
        newConsecutiveIncorrect = 0;
        
        // Progress difficulty: easy -> medium -> hard
        if (prev.currentDifficulty === "easy" && newConsecutiveCorrect >= 1) {
          newDifficulty = "medium";
          newConsecutiveCorrect = 0;
        } else if (prev.currentDifficulty === "medium" && newConsecutiveCorrect >= 1) {
          newDifficulty = "hard";
          newConsecutiveCorrect = 0;
        }
        // Stay on hard if already on hard
      } else {
        newConsecutiveIncorrect = prev.consecutiveIncorrect + 1;
        newConsecutiveCorrect = 0;
        
        // Regress difficulty on failures
        if (prev.currentDifficulty === "hard" && newConsecutiveIncorrect >= 1) {
          newDifficulty = "medium";
          newConsecutiveIncorrect = 0;
        } else if (prev.currentDifficulty === "medium" && newConsecutiveIncorrect >= 1) {
          newDifficulty = "easy";
          newConsecutiveIncorrect = 0;
        }
        // Stay on easy if already on easy
      }

      return {
        ...prev,
        currentDifficulty: newDifficulty,
        consecutiveCorrect: newConsecutiveCorrect,
        consecutiveIncorrect: newConsecutiveIncorrect,
        showOilSpill: newDifficulty === "hard"
      };
    });
  }, []);

  // Handle answer submission with progression tracking
  const answerQuestion = useCallback((answer: string) => {
    if (!gameState.currentQuestion || !lessonId || !subjectId) return;

    const isCorrect = answer === gameState.currentQuestion.correctAnswer;
    const currentQuestionId = gameState.currentQuestion.id;
    
    // Mark question as used
    if (currentQuestionId) {
      ProgressionService.markQuestionAsUsed(lessonId, subjectId, currentQuestionId);
    }
    
    setGameState(prev => {
      const newQuestionsAnswered = prev.questionsAnswered + 1;
      const newCorrectAnswers = isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers;
      
      // Boost mechanics: increase on correct, decrease on incorrect
      const newBoost = isCorrect 
        ? Math.min(prev.boost + 25, 100) // Increase boost by 25, max 100
        : Math.max(prev.boost - 20, 0);  // Decrease boost by 20, min 0

      // Car movement mechanics: player gets boost on correct, AI gets boost on incorrect
      const newPlayerPosition = isCorrect
        ? prev.playerPosition + 15 // Player gets significant boost on correct
        : Math.max(0, prev.playerPosition - 10); // On incorrect, push player back

      const newAiPosition = isCorrect 
        ? prev.aiPosition // AI doesn't get extra movement on correct answer
        : prev.aiPosition + 12; // AI gets significant boost on wrong answer

      // Update score and lives
      const newScore = isCorrect ? prev.score + 2 : prev.score;
      const newLives = isCorrect ? prev.lives : prev.lives - 1;

      // Update used questions list
      const newUsedQuestionIds = currentQuestionId && !prev.usedQuestionIds.includes(currentQuestionId)
        ? [...prev.usedQuestionIds, currentQuestionId]
        : prev.usedQuestionIds;

      // Check if game should end
      if (newLives <= 0 || newQuestionsAnswered >= prev.maxQuestions) {
        setTimeout(() => {
          endGame(newScore, newQuestionsAnswered, newCorrectAnswers);
        }, 1000);
      }

      return {
        ...prev,
        score: newScore,
        lives: newLives,
        playerPosition: newPlayerPosition,
        aiPosition: newAiPosition,
        boost: newBoost,
        questionsAnswered: newQuestionsAnswered,
        correctAnswers: newCorrectAnswers,
        usedQuestionIds: newUsedQuestionIds,
        questionStartTime: Date.now(), // Reset timer for next question
        // Apply a temporary speed penalty when the answer is incorrect
        speedPenaltyUntil: isCorrect ? prev.speedPenaltyUntil : Date.now() + 3000,
      };
    });

    // Update difficulty
    updateDifficulty(isCorrect);

    // Get next question
    setTimeout(async () => {
      setGameState(prev => ({ ...prev, isLoading: true }));
      const nextQuestion = await getNextQuestion(gameState.currentDifficulty);
      setGameState(prev => ({
        ...prev,
        currentQuestion: nextQuestion,
        isLoading: false
      }));
    }, 1500);

    // Show feedback
    if (isCorrect) {
      toast.success("Correct! Boost increased!");
    } else {
      toast.error("Incorrect! Boost decreased!");
    }
  }, [gameState.currentQuestion, updateDifficulty, getNextQuestion, lessonId, subjectId, gameState.currentDifficulty]);

  // End game function with progression tracking and auto-unlock
  const endGame = useCallback((finalScore: number, questionsAnswered: number, correctAnswers: number) => {
    if (!lessonId || !subjectId) return;
    
    setGameState(prev => ({ ...prev, isPlaying: false }));
    playFinishSound();

    const finalDuration = Math.floor((Date.now() - gameStartTime) / 1000);
    const accuracy = questionsAnswered > 0 ? (correctAnswers / questionsAnswered) * 100 : 0;
    
    // Create game stats for progression tracking
    const gameStats: GameStats = {
      score: finalScore,
      questionsAnswered,
      correctAnswers,
      duration: finalDuration,
      difficulty: gameState.currentDifficulty,
      timestamp: new Date().toISOString()
    };
    
    // Record game completion and check for auto-unlock
    ProgressionService.recordGameCompletion(lessonId, subjectId, gameStats);
    
    // Get updated lesson progress to check if lesson was completed
    const updatedProgress = ProgressionService.getLessonProgress(lessonId, subjectId);
    
    // Show completion feedback
    if (updatedProgress.status === 'completed') {
      toast.success("🎉 Lesson completed! Next lesson unlocked!");
    } else {
      const averageScore = updatedProgress.averageScore;
      if (finalScore > averageScore) {
        toast.success("Great job! You scored above your average!");
      } else {
        toast.info("Keep practicing to improve your score!");
      }
    }
    
    // Send analytics
    const analyticsData = {
      gameStats: {
        duration: finalDuration,
        score: finalScore,
        lives: gameState.lives,
        questionsAnswered,
        correctAnswers,
        accuracy,
        finalBoost: gameState.boost,
        gameStartTime,
        gameEndTime: Date.now(),
        lessonId,
        subjectId,
        difficulty: gameState.currentDifficulty,
        lessonCompleted: updatedProgress.status === 'completed'
      }
    };

    apiCaller.post('quiz/analytics', {
      analysis: JSON.stringify(analyticsData)
    }).catch(error => {
      console.error('Failed to send analytics:', error);
    });

    // Navigate to game over screen with progression info
    // setTimeout(() => {
    //   navigate(`/game/racer/game-over?score=${finalScore}&time=${finalDuration}&lesson=${lessonId}&completed=${updatedProgress.status === 'completed'}`);
    // }, 200);
  }, [gameStartTime, gameState.lives, gameState.boost, gameState.currentDifficulty, navigate, lessonId, subjectId]);

  // Reset game with progression tracking
  const resetGame = useCallback(() => {
    if (lessonId && subjectId) {
      // Get current lesson progress to maintain used questions tracking
      const lessonProgress = ProgressionService.getLessonProgress(lessonId, subjectId);
      const unusedQuestions = ProgressionService.getUnusedQuestions(lessonId, subjectId, questions);
      
      setGameState({
        score: 0,
        lives: 5,
        playerPosition: 0,
        aiPosition: 0,
        currentQuestion: unusedQuestions[0] || questions[0] || fallbackQuestions[0],
        weather: "sunny",
        isPlaying: true,
        boost: 0,
        currentDifficulty: "easy",
        questionsAnswered: 0,
        maxQuestions: 8,
        showOilSpill: false,
        consecutiveCorrect: 0,
        consecutiveIncorrect: 0,
        isLoading: false,
        aiTimerDuration: 15,
        questionStartTime: Date.now(),
        usedQuestionIds: [...lessonProgress.usedQuestionIds], // Maintain used questions
        correctAnswers: 0,
        isGeneratingQuestions: false,
        lessonUnlocked: true,
      });
    } else {
      // Fallback for when lesson/subject info is missing
      setGameState({
        score: 0,
        lives: 5,
        playerPosition: 0,
        aiPosition: 0,
        currentQuestion: questions[0] || fallbackQuestions[0],
        weather: "sunny",
        isPlaying: true,
        boost: 0,
        currentDifficulty: "easy",
        questionsAnswered: 0,
        maxQuestions: 8,
        showOilSpill: false,
        consecutiveCorrect: 0,
        consecutiveIncorrect: 0,
        isLoading: false,
        aiTimerDuration: 15,
        questionStartTime: Date.now(),
        usedQuestionIds: [],
        correctAnswers: 0,
        isGeneratingQuestions: false,
        lessonUnlocked: true,
      });
    }

    setGameStartTime(Date.now());
    setGameDuration(0);
  }, [questions, lessonId, subjectId]);

  // Format time for display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Cycle weather
  const cycleWeather = useCallback(() => {
    const weatherOptions: Weather[] = ["sunny", "rainy", "winter"];
    setGameState(prev => {
      const currentIndex = weatherOptions.indexOf(prev.weather);
      const nextIndex = (currentIndex + 1) % weatherOptions.length;
      return { ...prev, weather: weatherOptions[nextIndex] };
    });
  }, []);

  // Update AI timer duration
  const updateAiTimerDuration = useCallback((duration: number) => {
    setGameState(prev => ({
      ...prev,
      aiTimerDuration: duration
    }));
  }, []);

  // Get current lesson progression info
  const getLessonProgressInfo = useCallback(() => {
    if (!lessonId || !subjectId) return null;
    return ProgressionService.getLessonProgress(lessonId, subjectId);
  }, [lessonId, subjectId]);

  // Clear lesson progress (for testing or admin purposes)
  const clearLessonProgress = useCallback(() => {
    if (!lessonId || !subjectId) return;
    ProgressionService.resetLessonProgress(lessonId, subjectId);
    setGameState(prev => ({ ...prev, usedQuestionIds: [] }));
    toast.success("Lesson progress cleared!");
  }, [lessonId, subjectId]);

  // Get subject progression info
  const getSubjectProgressInfo = useCallback(() => {
    if (!subjectId) return null;
    const progressionData = ProgressionService.getProgressionData();
    return progressionData[subjectId] || null;
  }, [subjectId]);

  // Check if next lesson is available
  const checkNextLessonAvailable = useCallback(() => {
    if (!lessonId || !subjectId) return false;
    return ProgressionService.isLessonUnlocked(lessonId + 1, subjectId);
  }, [lessonId, subjectId]);

  return {
    ...gameState,
    answerQuestion,
    resetGame,
    endGame,
    cycleWeather,
    updateAiTimerDuration,
    gameDuration,
    formattedTime: formatTime(gameDuration),
    // New progression-related functions and data
    getLessonProgressInfo,
    clearLessonProgress,
    getSubjectProgressInfo,
    checkNextLessonAvailable,
    totalQuestionsAvailable: questions.length,
    unusedQuestionsCount: lessonId && subjectId 
      ? ProgressionService.getUnusedQuestions(lessonId, subjectId, questions).length 
      : questions.length,
  };
};
