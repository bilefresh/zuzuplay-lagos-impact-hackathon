"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import BackButton from "@/components/common/BackButton";
import { useEffect, useState } from "react";
import { apiCaller } from "@/middleware/apiService";
import activeStar from "@/assets/icons/activeStar.svg";
import Star from "@/assets/icons/inactive-star.svg";
import { useUserInfo } from "@/hooks/useUserInfo";
import coin from "@/assets/images/coin.png";
import ThreeJSRacingGame from "@/components/game/ThreeJSRacingGame";
import ThreeJSCarRacingGame from "@/components/game/ThreeJSCarRacingGame";
import MagicalAdventureGame from "@/components/game/MagicalAdventureGame";
import StellaGardenGame from "@/components/game/stella-garden/StellaGardenGame";
import { ProgressionService } from "@/services/progressionService";
import { toast } from "sonner";
import ProgressionDebugPanel from "@/components/ProgressionDebugPanel";
import { LearningHeader } from "@/components/design-system/LearningHeader";
import { LessonPath } from "@/components/design-system/LessonPath";
import { UpNextSection } from "@/components/design-system/UpNextSection";
import { LearningCard } from "@/components/design-system/LearningCard";
import { LearningButton } from "@/components/design-system/LearningButton";
import { AnimatedContainer } from "@/components/design-system/AnimatedContainer";

// Type definition for the Unit and Lesson
type Lesson = {
  id: number;
  name: string;
  status: 'completed' | 'in_progress' | 'locked';
  progress?: number;
};

type Unit = {
  id: number;
  name: string;
  Units?: any;
  Lessons?: any;
  completed?: boolean;
  inProgress?: boolean;
};

const SubjectScreenClient = ({
  params,
}: {
  params: { subjectId: string };
}) => {
  const router = useRouter();
  const { subjectId } = params;

  const { coins } = useUserInfo();

  // States to handle units and chapter data
  const [units, setUnits] = useState<Unit[]>([]);
  const [lessonContent, setLessonContents] = useState<Unit[]>([]);
  const [showGame, setShowGame] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [gameType, setGameType] = useState<'original' | 'car-racing' | 'magical'>('original');

  // Helper function to determine lesson status using progression service
  const getLessonStatus = (lessonId: number): 'completed' | 'in_progress' | 'locked' => {
    if (!subjectId) return 'locked';

    // Convert subject name to ID for progression service
    const subjectIdForProgress = getSubjectId(subjectId);
    const lessonProgress = ProgressionService.getLessonProgress(lessonId, subjectIdForProgress);

    return lessonProgress.status;
  };

  // Function to calculate global lesson index across all units
  const getGlobalLessonIndex = (mainUnitIndex: number, unitIndex: number, lessonIndex: number) => {
    let globalIndex = 0;

    // Add lessons from all previous main units
    for (let i = 0; i < mainUnitIndex && i < units.length; i++) {
      if (units[i].Units && units[i].Units.length > 0) {
        for (const unit of units[i].Units) {
          if (unit.Lessons) {
            globalIndex += unit.Lessons.length;
          }
        }
      }
    }

    // Add lessons from previous units in current main unit
    if (units[mainUnitIndex] && units[mainUnitIndex].Units) {
      const currentMainUnit = units[mainUnitIndex];
      for (let j = 0; j < unitIndex && j < currentMainUnit.Units.length; j++) {
        const unit = currentMainUnit.Units[j];
        if (unit.Lessons) {
          globalIndex += unit.Lessons.length;
        }
      }

      // Add current lesson index
      globalIndex += lessonIndex;
    }

    return globalIndex;
  };

  // Function to calculate winding path position using global index
  const calculateLessonPosition = (globalIndex: number) => {
    const amplitude = 35; // How far left/right the path goes (percentage)
    const frequency = 0.5; // How tight the curves are (reduced for smoother flow)
    const centerOffset = 50; // Center position (percentage)

    // Create a sine wave pattern for smooth winding
    const xPosition = centerOffset + amplitude * Math.sin(globalIndex * frequency);

    // Clamp position to stay within reasonable bounds
    const clampedX = Math.max(15, Math.min(85, xPosition));

    return {
      left: `${clampedX}%`,
      transform: 'translateX(-50%)', // Center the circle on the calculated position
    };
  };

  // Fetching the chapter data from local JSON
  useEffect(() => {
    const loadLessonData = async () => {
      let subject = "all";
      if (subjectId == "Mathematics") {
        subject = "1";
      } else if (subjectId == "English") {
        subject = "2";
      } else if (subjectId == "Science") {
        subject = "3";
      } else {
        subject = "1";
      }

      console.log('Loading lesson data for subject:', subject);

      try {
        // Load from local JSON instead of API
        const response = await fetch('/data/lessons-complete.json');
        const lessonData = await response.json();

        // Transform the data to match expected format
        const transformedData = lessonData.chapters.map((chapter: any) => ({
          ...chapter,
          Units: chapter.units?.map((unit: any) => ({
            ...unit,
            Lessons: unit.lessons?.map((lesson: any) => ({
              ...lesson,
              LessonContents: lesson.lesson_contents || []
            })) || []
          })) || []
        }));

        setUnits(transformedData);
        setLessonContents(transformedData);

        // Initialize progression - ensure first lesson is always unlocked
        if (transformedData && transformedData.length > 0) {
          initializeSubjectProgression(subject, transformedData);
        }

        console.log('Loaded lessons:', transformedData);
      } catch (error) {
        console.error('Failed to load lesson data:', error);

        // Fallback to API if local JSON fails
        try {
          const res: any = await apiCaller.get(`chapters?subject=${subject}`);
          const unitData = res.data.data;
          setUnits(unitData);
          setLessonContents(unitData);

          if (unitData && unitData.length > 0) {
            initializeSubjectProgression(subject, unitData);
          }
        } catch (apiError) {
          console.error('API fallback also failed:', apiError);
          toast.error('Failed to load lesson data');
        }
      }
    };

    loadLessonData();
  }, [subjectId]);

  // Initialize subject progression when first loaded
  const initializeSubjectProgression = (subjectIdNum: string, unitData: any[]) => {
    // Find all lessons that should be available as first lessons
    const firstLessonIds: number[] = [];

    for (const mainUnit of unitData) {
      if (mainUnit.Units) {
        for (const unit of mainUnit.Units) {
          if (unit.Lessons && unit.Lessons.length > 0) {
            // Get the first lesson of each unit as potentially unlockable
            const firstLessonInUnit = unit.Lessons[0];
            if (firstLessonInUnit && firstLessonInUnit.id) {
              firstLessonIds.push(firstLessonInUnit.id);
            }
          }
        }
      }
    }

    // Ensure at least the very first lesson is unlocked
    if (firstLessonIds.length > 0) {
      const firstLessonId = firstLessonIds[0]; // Start with the very first lesson
      const lessonProgress = ProgressionService.getLessonProgress(firstLessonId, subjectIdNum);

      if (lessonProgress.status === 'locked') {
        ProgressionService.updateLessonProgress(firstLessonId, subjectIdNum, {
          status: 'in_progress'
        });
        console.log(`Unlocked first lesson: ${firstLessonId} for subject ${subjectIdNum}`);
      }
    }

    // For Mathematics specifically, ensure only the first lesson (4) is unlocked initially
    if (subjectIdNum === '1') {
      // Only unlock the very first lesson - others will unlock through progression
      const firstLessonId = 4;
      const firstLessonProgress = ProgressionService.getLessonProgress(firstLessonId, subjectIdNum);

      if (firstLessonProgress.status === 'locked') {
        ProgressionService.updateLessonProgress(firstLessonId, subjectIdNum, {
          status: 'in_progress'
        });
        console.log(`Unlocked first lesson ${firstLessonId} for Mathematics`);
      }
    }
  };

  // Handle lesson click to open Africa game
  const handleLessonClick = (lesson: any, mainUnit: any, unit: any, subject: string) => {
    const subjectIdForProgress = getSubjectId(subject);
    const lessonStatus = getLessonStatus(lesson.id);

    // Check if lesson is unlocked
    if (lessonStatus === 'locked') {
      // Find the previous lesson in sequence to give specific guidance
      const allLessons = ProgressionService.getAllLessonsForSubject(subjectIdForProgress);
      const currentIndex = allLessons.indexOf(lesson.id);
      const previousLessonId = currentIndex > 0 ? allLessons[currentIndex - 1] : null;

      if (previousLessonId) {
        toast.error(`Lesson "${lesson.title || lesson.name || 'Unknown'}" is locked. Complete lesson ${previousLessonId} first!`);
      } else {
        toast.error(`Lesson "${lesson.title || lesson.name || 'Unknown'}" is locked. Complete previous lessons to unlock it!`);
      }
      return;
    }

    setSelectedLesson({
      lesson,
      mainUnit,
      unit,
      subject,
      lessonId: lesson.id,
      lessonName: lesson.name || unit.name,
      unitName: unit.name,
      chapterName: mainUnit.name,
      subjectId: subjectIdForProgress
    });
    // Show game selection dialog instead of directly starting game
    setShowGame(true);
  };

  // Helper function to get subject ID
  const getSubjectId = (subjectName: string) => {
    if (subjectName === "Mathematics") return "1";
    if (subjectName === "English") return "2";
    if (subjectName === "Science") return "3";
    return "1"; // Default to Mathematics
  };

  // Handle closing the game
  const handleCloseGame = () => {
    setShowGame(false);
    setSelectedLesson(null);
    // Force re-render to update lesson statuses
    forceUpdate();
  };

  // Force component re-render to update lesson statuses
  const [updateKey, setUpdateKey] = useState(0);
  const forceUpdate = () => setUpdateKey(prev => prev + 1);

  // Handle locked lesson click
  const handleLockedLessonClick = (lesson: any) => {
    alert(`This lesson "${lesson.name || 'Lesson'}" is locked. Complete previous lessons to unlock it!`);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header Section with Design System */}
      <AnimatedContainer animation="slideUp" delay={0}>
        <LearningHeader
          title={`${units.length > 0 && subjectId}`}
          subtitle={units.length > 0 ? `${units.length} unit(s)` : "Loading...."}
          coins={coins}
          showBackButton={true}
        />
      </AnimatedContainer>
      {/* <div className="space-y-2 mt-2 font-bold">
        <p className="text-[#291B13]">
          Chapter {chapterId} - Subject {subjectId}
        </p>
        <p className="text-[#58514D]">Units</p>
      </div> */}

      {/* Content Area with Design System */}
      <AnimatedContainer animation="fadeIn" delay={200}>
        <div className="flex flex-col mt-6 pb-32">
          {units.length > 0
            ? units.map((mainUnit, mainUnitIndex) =>
                mainUnit.Units.map((unit: any, unitIndex: any) => {
                  // Prepare lessons data for the LessonPath component
                  const lessonsData = unit.Lessons.map((lessonUnit: any, lessonIndex: any) => {
                    const status = getLessonStatus(lessonUnit.id);
                    const globalIndex = getGlobalLessonIndex(mainUnitIndex, unitIndex, lessonIndex);
                    const position = calculateLessonPosition(globalIndex);

                    return {
                      id: lessonUnit.id,
                      name: lessonUnit.name,
                      status,
                      position,
                      lessonUnit,
                      mainUnit,
                      unit
                    };
                  });

                  return (
                    <AnimatedContainer
                      key={unit.id}
                      animation="slideUp"
                      delay={300 + (unitIndex * 100)}
                      className="flex flex-col"
                    >
                      {unit.Lessons.length > 0 && (
                        <LessonPath
                          unitName={unit.name}
                          lessons={lessonsData}
                          onLessonClick={(lesson) => handleLessonClick(lesson.lessonUnit, lesson.mainUnit, lesson.unit, subjectId)}
                          onLockedLessonClick={(lesson) => handleLockedLessonClick(lesson.lessonUnit)}
                        />
                      )}
                    </AnimatedContainer>
                  );
                })
              )
            : (
              <LearningCard className="flex items-center justify-center py-8">
                <p className="text-gray-500">Loading...</p>
              </LearningCard>
            )}
        </div>
      </AnimatedContainer>

      {/* Bottom Up Next Section with Design System */}
      <AnimatedContainer animation="slideUp" delay={500}>
        <UpNextSection
          title="Up Next"
          subtitle="SECTION 2"
          description="Learn factors, prime factors, normal factors"
          onJumpToNext={() => {
            // Handle jump to next session logic
            console.log('Jump to next session clicked');
          }}
        />
      </AnimatedContainer>

      {/* Africa Racing Game Modal */}
      {showGame && selectedLesson && (
        <div className="fixed inset-0 z-50 bg-black">
          {/* Game Header */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-y-4 md:gap-y-0 absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
            <div className="flex items-center md:space-x-4">
              <button
                onClick={handleCloseGame}
                className="text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-lg"
              >
                ✕ Close Game
              </button>
              <h1 className="hidden md:flex text-xl font-bold text-white text-center bg-black/20 backdrop-blur-sm rounded-xl px-6 py-3">
                🏁 {selectedLesson.subject || selectedLesson.lessonName || selectedLesson.unitName} Racing Challenge 🌍
              </h1>
            </div>
            {/* <p className="hidden md:flex text-center text-white/90 mt-2 text-sm">
              Master {selectedLesson.chapterName} - {selectedLesson.unitName} while racing through Africa!
            </p> */}
            <div className="text-center text-yellow-200 mt-5 md:mt-1 text-xs bg-black/10 rounded-lg px-3 py-1 inline-block">
              Subject: {selectedLesson.subject} | Lesson ID: {selectedLesson.lessonId}
            </div>
          </div>

          {/* Game Container */}
          <div className="w-full h-full bg-gradient-to-b from-orange-600 via-red-500 to-yellow-400">
            <LessonGameWrapper
              lessonData={selectedLesson}
              onGameComplete={handleCloseGame}
            />
          </div>
        </div>
      )}

      {/* Debug Panel for Development */}
      <ProgressionDebugPanel
        subjectId={getSubjectId(subjectId)}
        lessonId={selectedLesson?.lessonId}
        isVisible={false}
      />
    </div>
  );
};

// Wrapper component for the game with lesson-specific data
interface LessonGameWrapperProps {
  lessonData: any;
  onGameComplete: () => void;
}

const LessonGameWrapper: React.FC<LessonGameWrapperProps> = ({ lessonData, onGameComplete }) => {
  const [gameType, setGameType] = useState<'original' | 'car-racing' | 'magical' | 'stella-garden'>('original');
  const router = useRouter();
  const [showGameSelection, setShowGameSelection] = useState(true);

  if (showGameSelection) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <LearningCard className="max-w-md mx-4 text-center" variant="elevated" padding="lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Choose Your Game Mode</h2>
          <p className="text-gray-600 mb-6">Select how you want to play this lesson:</p>

          <div className="space-y-4">
            {/* <LearningButton
              onClick={() => {
                setGameType('original');
                setShowGameSelection(false);
              }}
              variant="primary"
              size="lg"
              fullWidth
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              🏎️ Formula Racing Game
            </LearningButton>

            <LearningButton
              onClick={() => {
                setGameType('magical');
                setShowGameSelection(false);
              }}
              variant="secondary"
              size="lg"
              fullWidth
              className="bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white border-none"
            >
              🦄 Magical Unicorn Adventure
            </LearningButton>

            <LearningButton
              onClick={() => {
                setGameType('stella-garden');
                setShowGameSelection(false);
              }}
              variant="secondary"
              size="lg"
              fullWidth
              className="bg-gradient-to-r from-indigo-400 to-violet-500 hover:from-indigo-500 hover:to-violet-600 text-white border-none"
            >
              🌸 Stella's Garden Galaxy
            </LearningButton> */}

            <LearningButton
              onClick={() => {
                window.location.href = `/games/mathracer?lessonId=${lessonData.lessonId}&subjectId=${lessonData.subjectId}`;
                // setShowGameSelection(false);
              }}
              variant="secondary"
              size="lg"
              fullWidth
              className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
            >
              🚗 Math Racer Car Racing Challenge
            </LearningButton>
          </div>

          <LearningButton
            onClick={onGameComplete}
            variant="ghost"
            className="mt-4"
          >
            Cancel
          </LearningButton>
        </LearningCard>
      </div>
    );
  }

  if (gameType === 'car-racing') {
    return (
      <ThreeJSCarRacingGame
        lessonId={lessonData.lessonId}
        subjectId={lessonData.subjectId}
        lessonName={lessonData.lessonName}
        onGameComplete={onGameComplete}
      />
    );
  }

  if (gameType === 'magical') {
    return (
      <MagicalAdventureGame
        lessonId={lessonData.lessonId}
        subjectId={lessonData.subjectId}
        lessonName={lessonData.lessonName}
        onGameComplete={onGameComplete}
      />
    );
  }

  if (gameType === 'stella-garden') {
    return (
      <StellaGardenGame
        lessonId={lessonData.lessonId}
        subjectId={lessonData.subjectId}
        lessonName={lessonData.lessonName}
        onGameComplete={onGameComplete}
      />
    );
  }

  return (
    <ThreeJSRacingGame
      lessonId={lessonData.lessonId}
      subjectId={lessonData.subjectId}
      lessonName={lessonData.lessonName}
      onGameComplete={onGameComplete}
    />
  );
};

export default SubjectScreenClient;
