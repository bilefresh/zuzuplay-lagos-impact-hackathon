import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
// import { questions } from "@/data/questions";
import { appConfig } from "@/constants";
import { apiCaller, apiService } from "@/middleware/apiService";
import { Question } from "@/data/questions";

export type Weather = "sunny" | "rainy" | "winter";
export type GameRecord = {
  positions: number[];
  timestamps: number[];
};

export const useGameState = () => {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  // Start both cars at the same position
  const [playerPosition, setPlayerPosition] = useState(0);
  const [ghostPosition, setGhostPosition] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(questions[0]);
  const [weather, setWeather] = useState<Weather>("sunny");
  const [gameStartTime, setGameStartTime] = useState(Date.now());
  const [gameRecord, setGameRecord] = useState<GameRecord>({
    positions: [],
    timestamps: [],
  });
  const [highScoreRecord, setHighScoreRecord] = useState<GameRecord | null>(
    null
  );
  const [isRecording, setIsRecording] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  // Start player with base speed (making it harder initially)
  const [speed, setSpeed] = useState(appConfig.startSpeed);

  // Set ghost speed to consistent 2x base speed
  const baseSpeed = 0.1; //appConfig.startSpeed;
  const ghostSpeed = baseSpeed;

  const navigate = useRouter().push;

  // Load high score from localStorage
  useEffect(() => {
    const storedHighScore = localStorage.getItem("highScore");
    const storedHighScoreRecord = localStorage.getItem("highScoreRecord");

    if (storedHighScore && storedHighScoreRecord) {
      setHighScoreRecord(JSON.parse(storedHighScoreRecord));
    }
  }, []);

  useEffect(() => {
    apiCaller.get(`quiz/all/1`).then((res: any) => {
      setQuestions(res.data.data);
      setCurrentQuestion(res.data.data[0]);
      setIsPlaying(true);
    });
    const params = new URLSearchParams(window.location.search);
    const scoreParam = params.get("score");
    setScore(scoreParam ? Number(scoreParam) : 0);
  }, []);

  // Change weather randomly every 90 seconds
  useEffect(() => {
    const weatherOptions: Weather[] = ["sunny", "rainy", "winter"];
    const weatherInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * weatherOptions.length);
      setWeather(weatherOptions[randomIndex]);
    }, 90000);

    return () => clearInterval(weatherInterval);
  }, []);

  // Combined movement effect for both player and ghost cars
  // This ensures they move in sync with proper relative speeds
  useEffect(() => {
    if (!isPlaying) return;

    const moveInterval = setInterval(() => {
      // Move player according to current speed
      setPlayerPosition((prevPos) => {
        const newPos = prevPos + speed;
        return newPos;
      });

      // Record position for ghost racer if needed for future features
      if (isRecording) {
        setGameRecord((prev) => ({
          positions: [...prev.positions, playerPosition],
          timestamps: [...prev.timestamps, Date.now() - gameStartTime],
        }));
      }
    }, 100);

    return () => clearInterval(moveInterval);
  }, [
    isPlaying,
    speed,
    ghostSpeed,
    isRecording,
    playerPosition,
    gameStartTime,
  ]);

  useEffect(() => {
    const ghostMoveInterval = setInterval(() => {
      // Move ghost at fixed speed
      setGhostPosition((prevPos) => {
        return prevPos + 1;
      });
    }, appConfig.timePerQuestion);

    return () => clearInterval(ghostMoveInterval);
  }, [ghostPosition]);

  // Get a new random question
  const getNewQuestion = () => {
    const randomIndex = Math.floor(Math.random() * questions.length);
    setCurrentQuestion(questions[randomIndex]);
    console.log(questions[randomIndex]);
  };

  // useCallback(() => {
  //   const randomIndex = Math.floor(Math.random() * questions.length);
  //   setCurrentQuestion(questions[randomIndex]);
  //   console.log(questions[randomIndex]);
  // }, []);

  // Answer a question
  const answerQuestion = useCallback(
    (answer: string) => {
      if (answer === currentQuestion.correctAnswer) {
        // Correct answer - boost player speed significantly
        // This allows catching up to and passing the ghost after a few correct answers
        setSpeed((prev) => {
          // Calculate new speed - make boost strong enough to catch ghost
          const newSpeed = Math.min(prev + appConfig.speedIncrement, 3);
          // Log for debugging
          console.log(
            `Speed increased: ${prev} -> ${newSpeed}, ghost speed: ${ghostSpeed}`
          );
          return newSpeed;
        });
        setGhostPosition((prevPos) => {
          // Move ghost to the right to catch up
          return prevPos - 1;
        });
        setScore((prev) => prev + appConfig.coinsPerQuestion);
        toast.success("Correct! Speed boost activated!");
      } else {
        // Wrong answer - slow down player & lose a life
        console.log(`Speed reset from ${speed} to ${baseSpeed}`);
        setSpeed(baseSpeed);
        setLives((prev) => prev - 1);
        toast.error("Wrong answer! Slowing down...");

        // Check for game over
        if (lives <= 1) {
          endGame();
        }
        setGhostPosition((prevPos) => {
          // Move ghost to the right to catch up
          return prevPos + 2;
        });
      }

      // Get new question
      getNewQuestion();
    },
    [currentQuestion, lives, getNewQuestion, speed, baseSpeed, ghostSpeed]
  );

  // End game function
  const endGame = useCallback(() => {
    setIsPlaying(false);
    setIsRecording(false);

    // Check if current score is higher than stored high score
    const highScore = parseInt(localStorage.getItem("highScore") || "0");

    if (score > highScore) {
      localStorage.setItem("highScore", score.toString());
      localStorage.setItem("highScoreRecord", JSON.stringify(gameRecord));
      toast.success("New high score!");
    }

    // Navigate to game over screen after a short delay
    setTimeout(() => {
      navigate(`/game/racer/game-over?score=${score}`);
    }, 200);
  }, [score, gameRecord, navigate]);

  // Reset game state
  const resetGame = useCallback(() => {
    setScore(0);
    setLives(appConfig.lives);
    // Start both cars at the same position
    setPlayerPosition(0);
    setGhostPosition(0);
    setGameStartTime(Date.now());
    setGameRecord({ positions: [], timestamps: [] });
    setIsRecording(true);
    setIsPlaying(true);
    setSpeed(baseSpeed);
    getNewQuestion();
  }, [getNewQuestion, baseSpeed]);

  return {
    score,
    lives,
    playerPosition,
    ghostPosition,
    currentQuestion,
    weather,
    answerQuestion,
    resetGame,
    endGame,
    isPlaying,
    speed,
  };
};
