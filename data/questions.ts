export type Question = {
  id?: number;
  question: string;
  options: string[];
  correctAnswer: string;
  category?: "math" | "science" | "english" | "history";
  difficulty?: "easy" | "medium" | "hard";
  chapterTitle?: string;
  unitTitle?: string;
  lessonTitle?: string;
  lessonId?: number;
};

export const questions: Question[] = [
  // Math Questions
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
    difficulty: "easy",
  },
  {
    id: 4,
    question: "What is 20 ÷ 4?",
    options: ["4", "5", "6", "8"],
    correctAnswer: "5",
    category: "math",
    difficulty: "easy",
  },
  {
    id: 5,
    question: "What is 3² + 4²?",
    options: ["7", "25", "49", "56"],
    correctAnswer: "25",
    category: "math",
    difficulty: "medium",
  },

  // Science Questions
  {
    id: 6,
    question: "Which of these is a mammal?",
    options: ["Snake", "Fish", "Dolphin", "Spider"],
    correctAnswer: "Dolphin",
    category: "science",
    difficulty: "easy",
  },
  {
    id: 7,
    question: "What do plants need to make their own food?",
    options: ["Meat", "Sunlight", "Darkness", "Salt"],
    correctAnswer: "Sunlight",
    category: "science",
    difficulty: "easy",
  },
  {
    id: 8,
    question: "What is the largest planet in our solar system?",
    options: ["Earth", "Mars", "Jupiter", "Venus"],
    correctAnswer: "Jupiter",
    category: "science",
    difficulty: "easy",
  },
  {
    id: 9,
    question: "What is water made of?",
    options: [
      "Hydrogen and Oxygen",
      "Hydrogen and Nitrogen",
      "Oxygen and Carbon",
      "Hydrogen and Carbon",
    ],
    correctAnswer: "Hydrogen and Oxygen",
    category: "science",
    difficulty: "medium",
  },
  {
    id: 10,
    question: "Which of these is NOT a state of matter?",
    options: ["Solid", "Liquid", "Gas", "Element"],
    correctAnswer: "Element",
    category: "science",
    difficulty: "medium",
  },

  // English Questions
  {
    id: 11,
    question: "Which of these is a noun?",
    options: ["Run", "Happy", "Book", "Quickly"],
    correctAnswer: "Book",
    category: "english",
    difficulty: "easy",
  },
  {
    id: 12,
    question: "What is the past tense of 'eat'?",
    options: ["Eated", "Eaten", "Ate", "Eating"],
    correctAnswer: "Ate",
    category: "english",
    difficulty: "easy",
  },
  {
    id: 13,
    question: "Which word is spelled correctly?",
    options: ["Beleive", "Recieve", "Achieve", "Freind"],
    correctAnswer: "Achieve",
    category: "english",
    difficulty: "medium",
  },
  {
    id: 14,
    question: "Which is the correct sentence?",
    options: [
      "Me and Tom went swimming.",
      "Tom and I went swimming.",
      "Tom and me went swimming.",
      "Tom and myself went swimming.",
    ],
    correctAnswer: "Tom and I went swimming.",
    category: "english",
    difficulty: "medium",
  },
  {
    id: 15,
    question: "What is an antonym for 'happy'?",
    options: ["Joyful", "Sad", "Excited", "Pleased"],
    correctAnswer: "Sad",
    category: "english",
    difficulty: "easy",
  },

  // History Questions
  {
    id: 16,
    question: "Who was the first President of the United States?",
    options: [
      "Abraham Lincoln",
      "Thomas Jefferson",
      "George Washington",
      "John Adams",
    ],
    correctAnswer: "George Washington",
    category: "history",
    difficulty: "easy",
  },
  {
    id: 17,
    question: "In which year did World War II end?",
    options: ["1939", "1942", "1945", "1950"],
    correctAnswer: "1945",
    category: "history",
    difficulty: "medium",
  },
  {
    id: 18,
    question: "What ancient civilization built the pyramids?",
    options: ["Romans", "Greeks", "Egyptians", "Chinese"],
    correctAnswer: "Egyptians",
    category: "history",
    difficulty: "easy",
  },
  {
    id: 19,
    question: "Who wrote the Declaration of Independence?",
    options: [
      "George Washington",
      "Thomas Jefferson",
      "Benjamin Franklin",
      "John Adams",
    ],
    correctAnswer: "Thomas Jefferson",
    category: "history",
    difficulty: "medium",
  },
  {
    id: 20,
    question: "What was the name of the first dog in space?",
    options: ["Fido", "Laika", "Pluto", "Rover"],
    correctAnswer: "Laika",
    category: "history",
    difficulty: "medium",
  },
];
