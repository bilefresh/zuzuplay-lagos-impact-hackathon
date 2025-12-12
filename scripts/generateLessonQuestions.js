// Question Generation Script for Zuzuplay App
// This script generates lesson-specific questions based on actual lesson content

const fs = require('fs');
const path = require('path');

// The lesson data structure provided by the user
const lessonData = {
  "data": [
    {
      "id": 11,
      "name": "Open Sentences",
      "description": null,
      "subject_id": 1,
      "Units": []
    },
    {
      "id": 3,
      "name": "Notation and Place Value",
      "subject_id": 1,
      "Units": [
        {
          "id": 2,
          "name": "Idea of a thousand",
          "chapter_id": 3,
          "Lessons": [
            {
              "id": 4,
              "title": "Idea of a thousand",
              "unit_id": 2,
              "chapter_id": 3,
              "LessonContents": [
                {
                  "id": 61,
                  "title": "Idea of a thousand",
                  "content": "<p>1000, we leave a space between 1 and the 3 zeros Or a comma between 1 and the three zeros thus, 1 ,OOO. There is now a change in writing numbers. Whereas in the 20th, numbers would be separated by, and in group of three digits, now the comma is</p>"
                },
                {
                  "id": 60,
                  "title": "Idea of a thousand",
                  "content": "<p>One large square has 100 small squares. Five large Squares have 500 small square. The number 500 comes from 5 x 100. Ten large squares have 1000 small squares. The number 1000 comes from 10 x 100. 1000 is read as one thousand. When writing the number</p>"
                }
              ]
            },
            {
              "id": 10,
              "title": "Idea of a thousand",
              "unit_id": 2,
              "chapter_id": 3,
              "LessonContents": [
                {
                  "id": 10,
                  "title": "Idea of a thousand",
                  "content": "One large square has 100 small squares. Five large Squares have 500 small square. The number 500 comes from 5 x 100. Ten large squares have 1000 small squares. The number 1000 comes from 10 x 100. 1000 is read as one thousand. When writing the number"
                }
              ]
            },
            {
              "id": 9,
              "title": "Idea of a thousand",
              "unit_id": 2,
              "chapter_id": 3,
              "LessonContents": [
                {
                  "id": 9,
                  "title": "Idea of a thousand",
                  "content": "One large square has 100 small squares. Five large Squares have 500 small square. The number 500 comes from 5 x 100. Ten large squares have 1000 small squares. The number 1000 comes from 10 x 100. 1000 is read as one thousand. When writing the number"
                }
              ]
            }
          ]
        },
        {
          "id": 5,
          "name": "Place Value",
          "chapter_id": 3,
          "Lessons": [
            {
              "id": 5,
              "title": "Place Value",
              "unit_id": 5,
              "chapter_id": 3,
              "LessonContents": [
                {
                  "id": 18,
                  "title": "Place Value",
                  "content": "Placing the value."
                }
              ]
            },
            {
              "id": 8,
              "title": "Place Value",
              "unit_id": 5,
              "chapter_id": 3,
              "LessonContents": [
                {
                  "id": 8,
                  "title": "Place Value",
                  "content": "Placing the value"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": 9,
      "name": "Squares and Square roots",
      "subject_id": 1,
      "Units": [
        {
          "id": 7,
          "name": "Squares of numbers up to 50",
          "chapter_id": 9,
          "Lessons": [
            {
              "id": 28,
              "title": "Squares of numbers up to 50",
              "unit_id": 7,
              "chapter_id": 9,
              "LessonContents": [
                {
                  "id": 50,
                  "title": "Squares of numbers up to 50",
                  "content": "Have you ever heard of square numbers? Don't worry—it's not about shapes! When we talk about square numbers, we're talking about multiplying a number by itself. 2 squared (written as 2²) means 2 × 2 = 4. 3 squared (written as 3²) means 3 × 3 = 9."
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": 4,
      "name": "Factors, Prime Numbers and Prime Factors",
      "subject_id": 1,
      "Units": [
        {
          "id": 10,
          "name": "Factors",
          "chapter_id": 4,
          "Lessons": [
            {
              "id": 17,
              "title": "Factors",
              "unit_id": 10,
              "chapter_id": 4,
              "LessonContents": [
                {
                  "id": 19,
                  "title": "Factors",
                  "content": "A factor of a given number divides the number exactly without leaving a remainder. For example, Find the factors of 64. 64/1 = 64, 64/2 = 32, 64/4 = 16, 64/8 = 8 - The factors of 64 are 1, 2, 4, 8, 16, 32 and 64"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

// Question templates based on mathematical concepts
const questionTemplates = {
  // Notation and Place Value Questions
  placeValue: {
    easy: [
      {
        type: "basic_place_value",
        question: "What is the place value of 5 in the number 1,523?",
        options: ["ones", "tens", "hundreds", "thousands"],
        correctAnswer: "hundreds"
      },
      {
        type: "thousand_concept",
        question: "How many hundreds make one thousand?",
        options: ["10", "100", "1000", "5"],
        correctAnswer: "10"
      },
      {
        type: "number_writing",
        question: "How do you write one thousand in numbers?",
        options: ["100", "1000", "10000", "10"],
        correctAnswer: "1000"
      },
      {
        type: "basic_multiplication",
        question: "What is 10 × 100?",
        options: ["100", "1000", "10000", "500"],
        correctAnswer: "1000"
      },
      {
        type: "place_value_2",
        question: "What is the place value of 8 in the number 2,834?",
        options: ["ones", "tens", "hundreds", "thousands"],
        correctAnswer: "hundreds"
      },
      {
        type: "basic_counting",
        question: "What number comes after 999?",
        options: ["1000", "990", "1001", "900"],
        correctAnswer: "1000"
      },
      {
        type: "number_recognition",
        question: "Which number is one thousand?",
        options: ["100", "1000", "10000", "10"],
        correctAnswer: "1000"
      },
      {
        type: "simple_addition",
        question: "What is 500 + 500?",
        options: ["900", "1000", "1100", "1500"],
        correctAnswer: "1000"
      }
    ],
    medium: [
      {
        type: "place_value_expanded",
        question: "In the number 3,456, what digit is in the hundreds place?",
        options: ["3", "4", "5", "6"],
        correctAnswer: "4"
      },
      {
        type: "thousand_operations",
        question: "Which of these equals 1000?",
        options: ["5 × 200", "10 × 100", "20 × 40", "100 × 5"],
        correctAnswer: "10 × 100"
      },
      {
        type: "number_comparison",
        question: "Which number is greater than 1000?",
        options: ["999", "1001", "900", "100"],
        correctAnswer: "1001"
      },
      {
        type: "place_value_calculation",
        question: "What is the value of 5 in the number 5,432?",
        options: ["5", "50", "500", "5000"],
        correctAnswer: "5000"
      },
      {
        type: "tens_place",
        question: "In the number 4,729, what digit is in the tens place?",
        options: ["4", "7", "2", "9"],
        correctAnswer: "2"
      },
      {
        type: "thousands_place",
        question: "In the number 8,156, what digit is in the thousands place?",
        options: ["8", "1", "5", "6"],
        correctAnswer: "8"
      },
      {
        type: "number_value",
        question: "What is the value of 7 in the number 1,782?",
        options: ["7", "70", "700", "7000"],
        correctAnswer: "700"
      },
      {
        type: "place_value_multiple",
        question: "How many tens are in 1000?",
        options: ["10", "100", "1000", "50"],
        correctAnswer: "100"
      }
    ],
    hard: [
      {
        type: "complex_place_value",
        question: "In the number 7,835, what is the value of the digit 8?",
        options: ["8", "80", "800", "8000"],
        correctAnswer: "800"
      },
      {
        type: "number_decomposition",
        question: "Which shows 2,345 in expanded form?",
        options: ["2000 + 300 + 40 + 5", "2 + 3 + 4 + 5", "23 + 45", "2345 + 0"],
        correctAnswer: "2000 + 300 + 40 + 5"
      },
      {
        type: "place_value_reasoning",
        question: "If you have 15 hundreds, how many thousands do you have?",
        options: ["1.5", "15", "150", "1500"],
        correctAnswer: "1.5"
      },
      {
        type: "number_patterns",
        question: "What comes next in the pattern: 1000, 2000, 3000, ?",
        options: ["3500", "4000", "5000", "3100"],
        correctAnswer: "4000"
      },
      {
        type: "expanded_form_complex",
        question: "Which shows 6,742 in expanded form?",
        options: ["6000 + 700 + 40 + 2", "600 + 70 + 4 + 2", "6 + 7 + 4 + 2", "67 + 42"],
        correctAnswer: "6000 + 700 + 40 + 2"
      },
      {
        type: "place_value_word_problem",
        question: "A number has 4 thousands, 5 hundreds, 2 tens, and 8 ones. What is the number?",
        options: ["4528", "5428", "4582", "8254"],
        correctAnswer: "4528"
      },
      {
        type: "rounding_thousands",
        question: "Round 3,678 to the nearest thousand.",
        options: ["3000", "4000", "3700", "3680"],
        correctAnswer: "4000"
      },
      {
        type: "comparing_large_numbers",
        question: "Which number is the largest?",
        options: ["3,456", "3,546", "3,465", "3,564"],
        correctAnswer: "3,564"
      }
    ]
  },

  // Squares and Square Roots Questions
  squares: {
    easy: [
      {
        type: "basic_squares",
        question: "What is 3²?",
        options: ["6", "9", "12", "8"],
        correctAnswer: "9"
      },
      {
        type: "square_definition",
        question: "What does 4² mean?",
        options: ["4 + 4", "4 × 4", "4 ÷ 4", "4 - 4"],
        correctAnswer: "4 × 4"
      },
      {
        type: "basic_square_roots",
        question: "What is √9?",
        options: ["3", "9", "18", "81"],
        correctAnswer: "3"
      },
      {
        type: "square_identification",
        question: "Which of these is a square number?",
        options: ["15", "16", "17", "18"],
        correctAnswer: "16"
      },
      {
        type: "squares_2",
        question: "What is 2²?",
        options: ["2", "4", "6", "8"],
        correctAnswer: "4"
      },
      {
        type: "squares_5",
        question: "What is 5²?",
        options: ["10", "15", "20", "25"],
        correctAnswer: "25"
      },
      {
        type: "basic_square_roots_2",
        question: "What is √16?",
        options: ["3", "4", "5", "6"],
        correctAnswer: "4"
      },
      {
        type: "square_identification_2",
        question: "Which of these is a square number?",
        options: ["20", "25", "30", "35"],
        correctAnswer: "25"
      }
    ],
    medium: [
      {
        type: "medium_squares",
        question: "What is 7²?",
        options: ["14", "49", "42", "35"],
        correctAnswer: "49"
      },
      {
        type: "square_patterns",
        question: "What is the next square number after 25?",
        options: ["30", "36", "35", "49"],
        correctAnswer: "36"
      },
      {
        type: "square_root_medium",
        question: "What is √64?",
        options: ["6", "7", "8", "9"],
        correctAnswer: "8"
      },
      {
        type: "square_comparison",
        question: "Which is larger: 6² or 5² + 10?",
        options: ["6²", "5² + 10", "They are equal", "Cannot determine"],
        correctAnswer: "6²"
      },
      {
        type: "squares_6",
        question: "What is 6²?",
        options: ["32", "34", "36", "38"],
        correctAnswer: "36"
      },
      {
        type: "squares_8",
        question: "What is 8²?",
        options: ["60", "62", "64", "66"],
        correctAnswer: "64"
      },
      {
        type: "square_root_36",
        question: "What is √36?",
        options: ["5", "6", "7", "8"],
        correctAnswer: "6"
      },
      {
        type: "square_patterns_2",
        question: "What is the square number before 16?",
        options: ["8", "9", "12", "15"],
        correctAnswer: "9"
      }
    ],
    hard: [
      {
        type: "large_squares",
        question: "What is 12²?",
        options: ["144", "124", "164", "134"],
        correctAnswer: "144"
      },
      {
        type: "square_root_large",
        question: "What is √121?",
        options: ["10", "11", "12", "13"],
        correctAnswer: "11"
      },
      {
        type: "square_word_problem",
        question: "A square garden has an area of 144 square meters. What is the length of one side?",
        options: ["12 meters", "14 meters", "16 meters", "18 meters"],
        correctAnswer: "12 meters"
      },
      {
        type: "square_calculation",
        question: "If n² = 169, what is n?",
        options: ["11", "13", "15", "17"],
        correctAnswer: "13"
      },
      {
        type: "squares_9",
        question: "What is 9²?",
        options: ["72", "81", "90", "99"],
        correctAnswer: "81"
      },
      {
        type: "squares_10",
        question: "What is 10²?",
        options: ["90", "100", "110", "120"],
        correctAnswer: "100"
      },
      {
        type: "square_root_100",
        question: "What is √100?",
        options: ["9", "10", "11", "12"],
        correctAnswer: "10"
      },
      {
        type: "square_word_problem_2",
        question: "A square tile has an area of 81 square cm. What is the length of one side?",
        options: ["8 cm", "9 cm", "10 cm", "11 cm"],
        correctAnswer: "9 cm"
      }
    ]
  },

  // Factors Questions
  factors: {
    easy: [
      {
        type: "basic_factors",
        question: "Which number is a factor of 12?",
        options: ["3", "5", "7", "11"],
        correctAnswer: "3"
      },
      {
        type: "factor_definition",
        question: "What is a factor?",
        options: ["A number that divides exactly", "A number that adds", "A number that subtracts", "A number that multiplies"],
        correctAnswer: "A number that divides exactly"
      },
      {
        type: "simple_division",
        question: "Does 3 divide 12 exactly?",
        options: ["Yes", "No", "Sometimes", "Cannot tell"],
        correctAnswer: "Yes"
      },
      {
        type: "factor_identification",
        question: "Which is NOT a factor of 8?",
        options: ["1", "2", "4", "3"],
        correctAnswer: "3"
      },
      {
        type: "basic_factors_2",
        question: "Which number is a factor of 10?",
        options: ["2", "3", "4", "6"],
        correctAnswer: "2"
      },
      {
        type: "simple_division_2",
        question: "Does 4 divide 16 exactly?",
        options: ["Yes", "No", "Sometimes", "Cannot tell"],
        correctAnswer: "Yes"
      },
      {
        type: "factor_identification_2",
        question: "Which is NOT a factor of 6?",
        options: ["1", "2", "3", "4"],
        correctAnswer: "4"
      },
      {
        type: "basic_factors_3",
        question: "Which number is a factor of 20?",
        options: ["3", "4", "6", "7"],
        correctAnswer: "4"
      }
    ],
    medium: [
      {
        type: "multiple_factors",
        question: "How many factors does 12 have?",
        options: ["4", "5", "6", "7"],
        correctAnswer: "6"
      },
      {
        type: "common_factors",
        question: "What is a common factor of 12 and 18?",
        options: ["2", "5", "7", "8"],
        correctAnswer: "2"
      },
      {
        type: "highest_common_factor",
        question: "What is the highest common factor of 8 and 12?",
        options: ["2", "4", "6", "8"],
        correctAnswer: "4"
      },
      {
        type: "factor_pairs",
        question: "Which pair of numbers multiply to give 24?",
        options: ["3 × 8", "5 × 5", "2 × 11", "7 × 4"],
        correctAnswer: "3 × 8"
      },
      {
        type: "multiple_factors_2",
        question: "How many factors does 16 have?",
        options: ["3", "4", "5", "6"],
        correctAnswer: "5"
      },
      {
        type: "common_factors_2",
        question: "What is a common factor of 16 and 24?",
        options: ["3", "6", "8", "12"],
        correctAnswer: "8"
      },
      {
        type: "factor_pairs_2",
        question: "Which pair of numbers multiply to give 18?",
        options: ["2 × 9", "4 × 5", "3 × 5", "2 × 8"],
        correctAnswer: "2 × 9"
      },
      {
        type: "highest_common_factor_2",
        question: "What is the highest common factor of 15 and 20?",
        options: ["3", "4", "5", "10"],
        correctAnswer: "5"
      }
    ],
    hard: [
      {
        type: "prime_factors",
        question: "Express 12 as a product of prime factors",
        options: ["2 × 2 × 3", "2 × 6", "3 × 4", "1 × 12"],
        correctAnswer: "2 × 2 × 3"
      },
      {
        type: "factor_word_problem",
        question: "Sarah has 36 stickers. She wants to arrange them in equal rows. How many different ways can she do this?",
        options: ["6", "8", "9", "12"],
        correctAnswer: "9"
      },
      {
        type: "lcm_problem",
        question: "What is the least common multiple of 4 and 6?",
        options: ["12", "24", "10", "8"],
        correctAnswer: "12"
      },
      {
        type: "factor_reasoning",
        question: "If a number has exactly 3 factors, what type of number is it?",
        options: ["Prime number", "Square of a prime", "Composite number", "Even number"],
        correctAnswer: "Square of a prime"
      },
      {
        type: "prime_factors_2",
        question: "Express 18 as a product of prime factors",
        options: ["2 × 3 × 3", "3 × 6", "2 × 9", "1 × 18"],
        correctAnswer: "2 × 3 × 3"
      },
      {
        type: "factor_word_problem_2",
        question: "Tom has 24 marbles. In how many ways can he arrange them in equal groups?",
        options: ["6", "7", "8", "9"],
        correctAnswer: "8"
      },
      {
        type: "lcm_problem_2",
        question: "What is the least common multiple of 8 and 12?",
        options: ["20", "24", "32", "48"],
        correctAnswer: "24"
      },
      {
        type: "gcf_problem",
        question: "What is the greatest common factor of 18 and 30?",
        options: ["3", "6", "9", "15"],
        correctAnswer: "6"
      }
    ]
  }
};

// Helper functions
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Main question generation function
function generateQuestionsForLesson(lesson, chapterName, unitName) {
  const questions = [];
  let questionId = 1000 + lesson.id * 100; // Unique ID scheme
  
  // Determine the lesson topic based on content
  const content = lesson.LessonContents?.map(lc => lc.content).join(' ') || '';
  const title = lesson.title || '';
  
  let category = 'math';
  let questionType = 'placeValue'; // default
  
  // Determine question type based on lesson content
  if (title.toLowerCase().includes('thousand') || content.includes('thousand')) {
    questionType = 'placeValue';
  } else if (title.toLowerCase().includes('square') || content.includes('square')) {
    questionType = 'squares';
  } else if (title.toLowerCase().includes('factor') || content.includes('factor')) {
    questionType = 'factors';
  } else if (title.toLowerCase().includes('place value')) {
    questionType = 'placeValue';
  }
  
  const templates = questionTemplates[questionType];
  
  // Generate 20 questions total: 6 easy, 7 medium, 7 hard
  const questionCounts = {
    easy: 6,
    medium: 7,
    hard: 7
  };
  
  ['easy', 'medium', 'hard'].forEach(difficulty => {
    const difficultyTemplates = templates[difficulty];
    const count = questionCounts[difficulty];
    
    for (let i = 0; i < count; i++) {
      const template = difficultyTemplates[i % difficultyTemplates.length];
      
      // All questions are now predefined - just use them directly
      questions.push({
        id: questionId++,
        question: template.question,
        options: template.options,
        correctAnswer: template.correctAnswer,
        category: category,
        difficulty: difficulty,
        lessonId: lesson.id,
        chapterTitle: chapterName,
        unitTitle: unitName,
        lessonTitle: lesson.title
      });
    }
  });
  
  return questions;
}

// Generate all questions
function generateAllQuestions() {
  const allQuestions = [];
  
  lessonData.data.forEach(chapter => {
    if (chapter.Units && chapter.Units.length > 0) {
      chapter.Units.forEach(unit => {
        if (unit.Lessons && unit.Lessons.length > 0) {
          unit.Lessons.forEach(lesson => {
            const lessonQuestions = generateQuestionsForLesson(
              lesson, 
              chapter.name, 
              unit.name
            );
            allQuestions.push(...lessonQuestions);
          });
        }
      });
    }
  });
  
  return allQuestions;
}

// Generate and save questions
const generatedQuestions = generateAllQuestions();

const output = {
  metadata: {
    generatedAt: new Date().toISOString(),
    totalQuestions: generatedQuestions.length,
    lessonsProcessed: lessonData.data.reduce((count, chapter) => {
      return count + (chapter.Units ? chapter.Units.reduce((unitCount, unit) => {
        return unitCount + (unit.Lessons ? unit.Lessons.length : 0);
      }, 0) : 0);
    }, 0),
    questionsByDifficulty: {
      easy: generatedQuestions.filter(q => q.difficulty === 'easy').length,
      medium: generatedQuestions.filter(q => q.difficulty === 'medium').length,
      hard: generatedQuestions.filter(q => q.difficulty === 'hard').length
    }
  },
  questions: generatedQuestions
};

// Save to JSON file
const outputPath = path.join(__dirname, '..', 'data', 'generated-questions.json');
const outputDir = path.dirname(outputPath);

// Create directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log('✅ Questions generated successfully!');
console.log(`📊 Total questions: ${output.metadata.totalQuestions}`);
console.log(`📚 Lessons processed: ${output.metadata.lessonsProcessed}`);
console.log(`📝 Questions by difficulty:`, output.metadata.questionsByDifficulty);
console.log(`💾 Saved to: ${outputPath}`);

module.exports = { generateAllQuestions, questionTemplates };
