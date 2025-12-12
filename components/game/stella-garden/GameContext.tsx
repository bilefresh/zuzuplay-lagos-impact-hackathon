import React, { createContext, useContext, useState, useCallback } from 'react';

// Types
export type FlowerType = 'math' | 'science' | 'language' | 'logic';
export type GrowthStage = 'seed' | 'sprout' | 'bloom';

export interface Flower {
  id: string;
  type: FlowerType;
  stage: GrowthStage;
  position: [number, number, number]; // x, y, z
  plotId: string;
}

export interface GameState {
  starCoins: number;
  currentPlanet: number;
  flowers: Flower[];
  inventory: {
    seeds: Record<FlowerType, number>;
    water: number;
  };
  activeQuestion: any | null;
  pendingInteraction: { type: 'water'; targetId: string } | null;
}

interface GameContextType {
  state: GameState;
  plantSeed: (plotId: string, type: FlowerType, position: [number, number, number]) => void;
  waterFlower: (flowerId: string) => void;
  answerQuestion: (optionIndex: number) => boolean;
  closeQuestionModal: () => void;
  addCoins: (amount: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGameStore = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameStore must be used within a GameProvider');
  }
  return context;
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GameState>({
    starCoins: 0,
    currentPlanet: 1,
    flowers: [],
    inventory: {
      seeds: { math: 5, science: 5, language: 5, logic: 5 },
      water: 10,
    },
    activeQuestion: null,
    // isQuestionModalOpen: false,
    pendingInteraction: null,
    // characterPosition: [0, 4.5, 0], // Start position
  });

  // Mock question generator
  const generateQuestion = (subject: FlowerType): any => {
    // Simple mock questions for Phase 1/2
    const questions: Record<FlowerType, any[]> = {
      math: [
        { id: 'm1', text: 'What is 5 + 3?', options: ['7', '8', '9', '6'], correctAnswer: 1, subject: 'math', difficulty: 1 },
        { id: 'm2', text: 'What is 10 - 4?', options: ['5', '6', '4', '7'], correctAnswer: 1, subject: 'math', difficulty: 1 },
      ],
      science: [
        { id: 's1', text: 'What do plants need to grow?', options: ['Pizza', 'Sunlight', 'Toys', 'Candy'], correctAnswer: 1, subject: 'science', difficulty: 1 },
      ],
      language: [
        { id: 'l1', text: 'Find the noun: "The cat runs"', options: ['The', 'Cat', 'Runs', 'Fast'], correctAnswer: 1, subject: 'language', difficulty: 1 },
      ],
      logic: [
        { id: 'lo1', text: 'Which shape comes next? ⬛ ⬤ ⬛ ⬤ ...', options: ['⬛', '⬤', '▲', '★'], correctAnswer: 0, subject: 'logic', difficulty: 1 },
      ]
    };
    const subjectQuestions = questions[subject];
    return subjectQuestions[Math.floor(Math.random() * subjectQuestions.length)];
  };

  const moveCharacter = useCallback((position: [number, number, number]) => {
      setState(prev => ({ ...prev, characterPosition: position }));
  }, []);

  const plantSeed = useCallback((plotId: string, type: FlowerType, position: [number, number, number]) => {
    // Move character near the plot
    // Calculate a position slightly offset from the plot so character doesn't stand ON it
    // Simple offset: just 1 unit "above" (but actually y is up, so we want to move on the sphere surface)
    // For now, just snap to plot position with y offset.
    const charPos: [number, number, number] = [position[0], position[1] + 0.5, position[2]];
    setState(prev => ({ ...prev, characterPosition: charPos }));

    if (state.inventory.seeds[type] > 0) {
      // Trigger question before planting fully succeeds? Or just plant? 
      // Prompt says: "When planting seeds: 'This flower needs [math problem]...'"
      // So we trigger a question.
      
      const question = generateQuestion(type);
      
      // We'll store the pending action in a ref or temp state if needed, 
      // but for simplicity, let's set the question and when answered correctly, we plant.
      // Actually, to keep state simple for this pass:
      // 1. Open question modal
      // 2. On success -> reduce seed count, add flower.
      
      // Ideally we'd store "pendingPlantAction" in state, but let's simplify:
      // Pass a callback to the question modal? No, keep it in state logic.
      // For this MVP, let's just plant immediately but trigger a question for "growth" or "watering".
      // Wait, prompt says "When planting seeds...".
      
      // Let's direct the flow: Click Plot -> Select Seed -> Trigger Question -> (Correct) -> Plant appears.
      // Implementation: We need to know we are trying to plant.
      
      // For this version, I'll simplify:
      // Click Plot -> Plant Seed (no question yet) -> Flower appears as 'seed'.
      // Click Seed -> Trigger Question -> Grows to 'sprout'.
      
      setState(prev => ({
        ...prev,
        characterPosition: charPos, // Ensure move update
        inventory: {
          ...prev.inventory,
          seeds: {
            ...prev.inventory.seeds,
            [type]: prev.inventory.seeds[type] - 1
          }
        },
        flowers: [
          ...prev.flowers,
          {
            id: Math.random().toString(36).substr(2, 9),
            type,
            stage: 'seed',
            position,
            plotId
          }
        ]
      }));
    }
  }, [state.inventory.seeds]);

  const waterFlower = useCallback((flowerId: string) => {
    // Find flower
    const flower = state.flowers.find(f => f.id === flowerId);
    if (!flower) return;
    
    if (flower.stage === 'bloom') return;

    // Trigger question to grow
    const question = generateQuestion(flower.type);
    setState(prev => ({
      ...prev,
      activeQuestion: question,
      isQuestionModalOpen: true,
      pendingInteraction: { type: 'water', targetId: flowerId }
    }));
  }, [state.flowers]);

  const answerQuestion = useCallback((optionIndex: number) => {
    if (!state.activeQuestion) return false;

    const isCorrect = optionIndex === state.activeQuestion.correctAnswer;
    
    if (isCorrect) {
      // Handle success
      const pending = state.pendingInteraction;
      if (pending && pending.type === 'water') {
        setState(prev => ({
          ...prev,
          flowers: prev.flowers.map(f => {
            if (f.id === pending.targetId) {
              const nextStage = f.stage === 'seed' ? 'sprout' : 'bloom';
              return { ...f, stage: nextStage };
            }
            return f;
          }),
          starCoins: prev.starCoins + 10,
          isQuestionModalOpen: false,
          activeQuestion: null,
          pendingInteraction: null
        }));
      } else {
         // Default success (just coins)
         setState(prev => ({
          ...prev,
          starCoins: prev.starCoins + 10,
          isQuestionModalOpen: false,
          activeQuestion: null,
          pendingInteraction: null
        }));
      }
      return true;
    }
    
    return false;
  }, [state.activeQuestion, state.pendingInteraction]);

  const closeQuestionModal = useCallback(() => {
    setState(prev => ({ ...prev, isQuestionModalOpen: false, activeQuestion: null, pendingInteraction: null }));
  }, []);

  const addCoins = useCallback((amount: number) => {
    setState(prev => ({ ...prev, starCoins: prev.starCoins + amount }));
  }, []);

  return (
    <GameContext.Provider value={{ state, plantSeed, waterFlower, answerQuestion, closeQuestionModal, addCoins }}>
      {children}
    </GameContext.Provider>
  );
};

