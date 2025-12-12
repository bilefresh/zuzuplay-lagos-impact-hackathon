import React from "react";
import RaceTrack from "./RaceTrack";
import PlayerCar from "./PlayerCar";
import AiCar from "./AiCar";
import QuestionCard from "./QuestionCard";
import LivesIndicator from "./LivesIndicator";
import BoostIndicator from "./BoostIndicator";
import OilSpill from "./OilSpill";
import { useGameState } from "@/hooks/useGameState";
import {
  playStartSound,
  playCorrectSound,
  playIncorrectSound,
  playCarSound,
  playFinishSound,
  useAudioInit,
  startBackgroundMusic,
  stopBackgroundMusic,
  stopAllAudio,
  toggleBackgroundMusic,
  setBackgroundMusicVolume,
  skipToNextTrack,
  getCurrentTrackName,
  toggleShuffle,
  cycleRepeatMode,
  getRepeatMode,
  getShuffleMode,
} from "@/lib/sounds";

const GameContainer: React.FC = () => {
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
    cycleWeather,
  } = useGameState();

  // Life-saving system state
  const [showSaveMePrompt, setShowSaveMePrompt] = React.useState(false);
  const [hasUsedSaveMe, setHasUsedSaveMe] = React.useState(false);
  const [savedGameState, setSavedGameState] = React.useState<any>(null);
  const [failedQuestions, setFailedQuestions] = React.useState<any[]>([]);

  useAudioInit();

  // State for background music toggle and volume
  const [musicEnabled, setMusicEnabled] = React.useState(true);
  const [musicVolume, setMusicVolume] = React.useState(0.3);
  const [showMusicControls, setShowMusicControls] = React.useState(false);
  const [shuffleEnabled, setShuffleEnabled] = React.useState(true);
  const [repeatMode, setRepeatModeState] = React.useState<'off' | 'track' | 'playlist'>('playlist');

  // Start background music when game begins, stop when game ends
  React.useEffect(() => {
    if (isPlaying && musicEnabled) {
      startBackgroundMusic();
    } else {
      stopBackgroundMusic();
    }
  }, [isPlaying, musicEnabled]);

  // Handle game end - play finish sound and ensure music stops
  React.useEffect(() => {
    if (!isPlaying && !isLoading && (lives === 0 || questionsAnswered >= maxQuestions)) {
      // Game has ended (either completed or out of lives)
      playFinishSound();
      
      // Stop all audio after finish sound completes (2 seconds)
      setTimeout(() => {
        stopAllAudio();
      }, 2000);
    }
  }, [isPlaying, isLoading, lives, questionsAnswered, maxQuestions]);

  // Update volume when changed
  React.useEffect(() => {
    setBackgroundMusicVolume(musicVolume);
  }, [musicVolume]);

  // Cleanup: Stop all audio when component unmounts
  React.useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  // Handle the answer callback
  const handleAnswer = (answer: string) => {
    const correct = answer === currentQuestion?.correctAnswer;

    if (correct) {
      playCorrectSound();
    } else {
      playIncorrectSound();
      // Track failed questions for Save Me system
      if (currentQuestion) {
        setFailedQuestions(prev => [...prev, {
          question: currentQuestion.question,
          correctAnswer: currentQuestion.correctAnswer,
          userAnswer: answer,
          timestamp: new Date().toISOString()
        }]);
      }
    }

    answerQuestion(answer);
  };

  // Play car movement sound based on boost
  // React.useEffect(() => {
  //   if (!isPlaying) return;

  //   const carSoundInterval = setInterval(() => {
  //     const speed = Math.max(0.5, boost / 20); // Convert boost to speed
  //     playCarSound(speed);
  //   }, 300);

  //   return () => clearInterval(carSoundInterval);
  // }, [isPlaying, boost]);

  // Play start sound when game begins
  React.useEffect(() => {
    if (isPlaying && currentQuestion) {
      playStartSound();
    }
  }, [isPlaying, currentQuestion]);

  // Check for restored game state on component mount
  React.useEffect(() => {
    const restored = localStorage.getItem('restoredGameState');
    if (restored) {
      const restoredState = JSON.parse(restored);
      setHasUsedSaveMe(restoredState.hasUsedSaveMe || false);
      localStorage.removeItem('restoredGameState'); // Clear it after restoring
      
      // Note: The actual game state restoration would need to be implemented
      // in the useGameState hook to properly restore all game state values
      console.log('Game state restored:', restoredState);
    }
  }, []);

  // Check for game over and trigger Save Me prompt
  React.useEffect(() => {
    if (lives <= 0 && isPlaying && !hasUsedSaveMe && !showSaveMePrompt) {
      // Save current game state
      setSavedGameState({
        score,
        questionsAnswered,
        currentDifficulty,
        formattedTime,
        playerPosition,
        aiPosition,
        boost,
        failedQuestions
      });
      setShowSaveMePrompt(true);
    }
  }, [lives, isPlaying, hasUsedSaveMe, showSaveMePrompt, score, questionsAnswered, currentDifficulty, formattedTime, playerPosition, aiPosition, boost, failedQuestions]);

  // Handle Save Me action
  const handleSaveMe = () => {
    setHasUsedSaveMe(true);
    setShowSaveMePrompt(false);
    
    // Create query string with failed questions
    const questionsParam = encodeURIComponent(
      failedQuestions.map(q => q.question).join(', ')
    );
    
    // Store game state in localStorage for restoration
    localStorage.setItem('savedGameState', JSON.stringify(savedGameState));
    
    // Redirect to Ask Zuzuplay with failed questions
    window.location.href = `/ask?q=Please explain these math questions I got wrong: ${questionsParam}`;
  };

  // Handle No Thanks action
  const handleNoThanks = () => {
    setShowSaveMePrompt(false);
    // Continue with normal game over
  };

  // Debug logging
  React.useEffect(() => {
    console.log("Game State:", {
      isPlaying,
      isLoading,
      currentQuestion: currentQuestion?.question,
      lives,
      score,
      boost
    });
  }, [isPlaying, isLoading, currentQuestion, lives, score, boost]);

  return (
    <div className="game-container relative w-full h-screen overflow-hidden">
      {/* Enhanced 3D Racing Environment */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900 via-purple-600 to-orange-400">
        
        {/* Distant Mountains with atmospheric perspective */}
        <div className="absolute bottom-0 left-0 w-full h-2/3">
          {/* Far background mountains */}
          <svg className="absolute bottom-1/2 w-full h-1/2 opacity-40" viewBox="0 0 1000 200" preserveAspectRatio="none">
            <path d="M0,200 L0,120 L150,80 L300,100 L450,60 L600,90 L750,50 L900,70 L1000,40 L1000,200 Z" 
                  fill="rgba(88, 28, 135, 0.6)" />
          </svg>
          
          {/* Mid-distance hills */}
          <svg className="absolute bottom-1/3 w-full h-1/2 opacity-60" viewBox="0 0 1000 250" preserveAspectRatio="none">
            <path d="M0,250 L0,180 L120,140 L250,160 L400,120 L550,150 L700,110 L850,140 L1000,100 L1000,250 Z" 
                  fill="rgba(88, 28, 135, 0.7)" />
          </svg>
          
          {/* Close mountains silhouette */}
          <svg className="absolute bottom-0 w-full h-1/2" viewBox="0 0 1000 300" preserveAspectRatio="none">
            <path d="M0,300 L0,200 L100,150 L200,180 L300,120 L400,160 L500,100 L600,140 L700,110 L800,130 L900,90 L1000,120 L1000,300 Z" 
                  fill="rgba(88, 28, 135, 0.9)" />
            <path d="M0,300 L0,220 L150,180 L250,200 L350,160 L450,180 L550,140 L650,170 L750,150 L850,160 L950,130 L1000,150 L1000,300 Z" 
                  fill="rgba(59, 7, 100, 0.8)" />
          </svg>
        </div>
        
        {/* Rolling Hills on the sides */}
        <div className="absolute bottom-0 left-0 w-1/4 h-1/2">
          <svg className="w-full h-full" viewBox="0 0 250 200" preserveAspectRatio="none">
            <path d="M0,200 L0,120 L50,100 L100,110 L150,90 L200,100 L250,80 L250,200 Z" 
                  fill="rgba(34, 197, 94, 0.3)" />
          </svg>
        </div>
        <div className="absolute bottom-0 right-0 w-1/4 h-1/2">
          <svg className="w-full h-full" viewBox="0 0 250 200" preserveAspectRatio="none">
            <path d="M0,80 L50,100 L100,90 L150,110 L200,100 L250,120 L250,200 L0,200 Z" 
                  fill="rgba(34, 197, 94, 0.3)" />
          </svg>
        </div>
        
        {/* Dynamic Clouds with depth */}
        <div className="absolute top-0 left-0 w-full h-2/3 overflow-hidden">
          {/* Background clouds */}
          <div className="absolute top-5 left-5 w-48 h-24 bg-white/10 rounded-full blur-lg animate-float opacity-60"></div>
          <div className="absolute top-12 right-10 w-56 h-28 bg-white/8 rounded-full blur-lg animate-float-slow opacity-50"></div>
          
          {/* Mid-distance clouds */}
          <div className="absolute top-16 left-1/4 w-40 h-20 bg-white/15 rounded-full blur-md animate-float"></div>
          <div className="absolute top-8 right-1/3 w-44 h-22 bg-white/12 rounded-full blur-md animate-float-slow"></div>
          
          {/* Close clouds */}
          <div className="absolute top-20 left-1/2 w-36 h-18 bg-white/20 rounded-full blur-sm animate-float"></div>
          <div className="absolute top-28 right-1/4 w-32 h-16 bg-white/18 rounded-full blur-sm animate-float-slow"></div>
        </div>

        {/* Atmospheric effects */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black/10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
      </div>

      {/* 3D Racing Track Section with enhanced perspective */}
      <div className="absolute bottom-0 left-0 right-0 h-[80vh] perspective-[1200px] transform-style-preserve-3d">
        <div className="relative h-full">
          <RaceTrack weather={weather} />

          {/* Cars positioned in 3D space */}
          <PlayerCar position={playerPosition} boost={boost} />
          <AiCar position={aiPosition} />

          {/* Enhanced oil spill with 3D perspective */}
          {showOilSpill && (
            <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 z-5">
              <OilSpill />
            </div>
          )}
          
          {/* Roadside elements for depth */}
          <div className="absolute bottom-1/5 left-1/4 w-2 h-4 bg-yellow-500/60 rounded transform rotate-12 animate-pulse"></div>
          <div className="absolute bottom-1/6 right-1/4 w-1.5 h-3 bg-red-500/60 rounded transform -rotate-12 animate-pulse"></div>
        </div>
      </div>

      {/* UI Elements */}
      <LivesIndicator lives={lives} />
      <BoostIndicator boost={boost} />
      
      {/* Timer - Responsive */}
      <div className="absolute top-2 sm:top-4 left-1/2 transform -translate-x-1/2 bg-black/30 backdrop-blur-sm rounded-xl px-2 sm:px-4 py-1 sm:py-2 shadow-lg">
        <div className="text-sm sm:text-lg font-bold text-white flex items-center space-x-1 sm:space-x-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span>{formattedTime}</span>
        </div>
      </div>

      {/* Enhanced Music Controls - Responsive */}
      <div className="absolute top-2 sm:top-4 right-12 sm:right-16 z-50">
        {/* Main Music Toggle Button */}
        <button
          onClick={() => setShowMusicControls(!showMusicControls)}
          className="bg-black/30 backdrop-blur-sm rounded-xl p-2 sm:p-3 shadow-lg hover:bg-black/40 transition-colors mb-2"
          title="Music Controls"
        >
          <div className="text-white text-base sm:text-xl">
            {musicEnabled ? "🎵" : "🔇"}
          </div>
        </button>

        {/* Expanded Music Controls Panel */}
        {showMusicControls && (
          <div className="absolute top-full right-0 mt-2 bg-black/40 backdrop-blur-sm rounded-xl p-2 sm:p-4 shadow-lg min-w-[160px] sm:min-w-[200px]">
            {/* Track Info */}
            <div className="text-white text-sm mb-3 text-center">
              <div className="font-medium">Now Playing:</div>
              <div className="text-xs opacity-80">{getCurrentTrackName()}</div>
            </div>

            {/* Main Music Controls */}
            <div className="flex justify-center space-x-2 mb-3">
              <button
                onClick={() => {
                  setMusicEnabled(!musicEnabled);
                  toggleBackgroundMusic();
                }}
                className="bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-colors"
                title={musicEnabled ? "Pause music" : "Play music"}
              >
                <span className="text-white text-sm">
                  {musicEnabled ? "⏸️" : "▶️"}
                </span>
              </button>
              
              <button
                onClick={skipToNextTrack}
                className="bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-colors"
                title="Next track"
              >
                <span className="text-white text-sm">⏭️</span>
              </button>
            </div>

            {/* Shuffle and Repeat Controls */}
            <div className="flex justify-center space-x-2 mb-3">
              <button
                onClick={() => {
                  const newShuffle = toggleShuffle();
                  setShuffleEnabled(newShuffle);
                }}
                className={`rounded-lg p-2 transition-colors ${
                  shuffleEnabled 
                    ? 'bg-blue-500/30 text-blue-200' 
                    : 'bg-white/20 text-white/70'
                }`}
                title="Toggle shuffle"
              >
                <span className="text-sm">🔀</span>
              </button>
              
              <button
                onClick={() => {
                  const newMode = cycleRepeatMode();
                  setRepeatModeState(newMode);
                }}
                className="bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-colors"
                title={`Repeat: ${repeatMode}`}
              >
                <span className="text-white text-sm">
                  {repeatMode === 'off' ? '🔁' : 
                   repeatMode === 'track' ? '🔂' : '🔁'}
                </span>
              </button>
            </div>

            {/* Playback Mode Display */}
            <div className="text-white text-xs text-center mb-2 opacity-80">
              {shuffleEnabled ? '🔀 Shuffle' : '➡️ Sequential'} • 
              {repeatMode === 'off' ? ' No Repeat' :
               repeatMode === 'track' ? ' Repeat Track' : ' Repeat All'}
            </div>

            {/* Volume Slider */}
            <div className="space-y-2">
              <div className="text-white text-xs text-center">Volume</div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={musicVolume}
                onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${musicVolume * 100}%, rgba(255,255,255,0.2) ${musicVolume * 100}%, rgba(255,255,255,0.2) 100%)`
                }}
              />
              <div className="text-white text-xs text-center">{Math.round(musicVolume * 100)}%</div>
            </div>
          </div>
        )}
      </div>

      {/* Weather Controls - Responsive */}
      <div className="absolute top-16 sm:top-20 right-2 sm:right-4 z-50">
        <button
          onClick={cycleWeather}
          className="bg-black/30 backdrop-blur-sm rounded-xl p-2 sm:p-3 shadow-lg hover:bg-black/40 transition-colors"
          title="Change Weather"
        >
          <div className="text-white text-base sm:text-xl">
            {weather === "sunny" ? "☀️" : weather === "rainy" ? "🌧️" : "❄️"}
          </div>
        </button>
      </div>

      {/* Question counter - Responsive */}
      <div className="absolute top-12 sm:top-16 left-1/2 transform -translate-x-1/2 bg-black/20 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1 shadow-md">
        <div className="text-xs sm:text-sm font-medium text-white/90 text-center">
          Question {questionsAnswered + 1}/{maxQuestions}
        </div>
        <div className="text-xs text-white/70 text-center">
          {currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)}
        </div>
      </div>

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

      {/* Question Card positioned above the race track */}
      {isPlaying && currentQuestion && !isLoading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
          <QuestionCard
            question={currentQuestion}
            onAnswer={handleAnswer}
            difficulty={currentDifficulty}
          />
        </div>
      )}

      {/* Save Me Prompt - shown when user runs out of lives */}
      {showSaveMePrompt && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-60">
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-8 shadow-2xl text-center max-w-lg mx-4 border-4 border-yellow-400">
            <div className="text-4xl mb-4">🆘</div>
            <div className="text-2xl font-bold text-white mb-4">Oops! You{`'`}re out of lives!</div>
            <div className="text-lg text-yellow-100 mb-6">
              But don{`'`}t worry! I can help you learn from your mistakes and give you more lives to continue your racing adventure!
            </div>
            <div className="text-sm text-yellow-200 mb-6">
              Score: {score} | Time: {formattedTime} | Questions: {questionsAnswered}/{maxQuestions}
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleSaveMe}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-bold text-lg transition-colors shadow-lg"
              >
                🎓 Save Me! (Learn & Continue)
              </button>
              <button
                onClick={handleNoThanks}
                className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-xl font-bold text-lg transition-colors shadow-lg"
              >
                No Thanks
              </button>
            </div>
            <div className="text-xs text-yellow-200 mt-4 opacity-75">
              *This rescue can only be used once per game
            </div>
          </div>
        </div>
      )}

      {/* Game Over or Not Playing State */}
      {!isPlaying && !isLoading && !showSaveMePrompt && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <div className="text-2xl font-bold text-gray-800 mb-4">Game Over!</div>
            <div className="text-lg text-gray-600 mb-4">
              Final Score: {score} | Time: {formattedTime}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Music Attribution */}
      <div className="absolute bottom-4 left-4 bg-black/30 backdrop-blur-sm text-white p-2 rounded text-xs opacity-70">
        <div>♪ Music by Kevin MacLeod (incompetech.com)</div>
        <div>Licensed under Creative Commons: By Attribution 4.0</div>
      </div>

      {/* Debug info */}
      <div className="absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded text-xs">
        Debug: Playing={isPlaying ? 'Yes' : 'No'}, Loading={isLoading ? 'Yes' : 'No'}, Question={currentQuestion ? 'Yes' : 'No'}
      </div>
    </div>
  );
};

export default GameContainer;
