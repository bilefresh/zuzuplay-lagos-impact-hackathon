import { Question } from "@/data/questions";
import { apiService } from "@/middleware/apiService";

export interface QuestionGenerationOptions {
  lessonId?: number;
  subjectId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  count: number;
  topic?: string;
  excludeQuestionIds?: number[];
}

export interface GeneratedQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  id?: number;
}

export class QuestionGenerationService {
  private static nextTempId = 10000; // Start temp IDs from 10000 to avoid conflicts

  // Generate questions using OpenAI
  static async generateQuestions(options: QuestionGenerationOptions): Promise<Question[]> {
    try {
      const { subjectId, difficulty, count, topic, lessonId } = options;
      
      // Create a detailed prompt for question generation
      const prompt = this.createQuestionPrompt(options);
      
      // Call OpenAI through the existing service
      const response = await apiService.getChatbotResponse(prompt, "gpt-4");
      
      // Parse the response and convert to Question format
      const generatedQuestions = this.parseQuestionResponse(response, {
        category: this.getSubjectCategory(subjectId),
        difficulty,
        subjectId,
        lessonId
      });
      
      console.log(`Generated ${generatedQuestions.length} questions for lesson ${lessonId}`);
      return generatedQuestions;
      
    } catch (error) {
      console.error('Error generating questions:', error);
      // Return fallback questions if generation fails
      return this.getFallbackQuestions(options);
    }
  }

  // Create a structured prompt for question generation
  private static createQuestionPrompt(options: QuestionGenerationOptions): string {
    const { subjectId, difficulty, count, topic, lessonId } = options;
    const subjectName = this.getSubjectName(subjectId);
    
    const difficultyGuidelines = {
      easy: "simple, basic concepts appropriate for ages 8-10",
      medium: "intermediate concepts appropriate for ages 10-12", 
      hard: "challenging concepts appropriate for ages 12-14"
    };

    return `
You are an educational AI creating quiz questions for primary school students learning ${subjectName}.

REQUIREMENTS:
- Generate exactly ${count} multiple choice questions
- Difficulty level: ${difficulty} (${difficultyGuidelines[difficulty]})
- Subject: ${subjectName}
${topic ? `- Topic focus: ${topic}` : ''}
${lessonId ? `- For lesson ID: ${lessonId}` : ''}
- Age group: 8-12 years old
- Each question must have exactly 4 options
- Only ONE option should be correct
- Questions should be educational and engaging
- Avoid overly complex language
- Make sure answers are single words or short phrases when possible

OUTPUT FORMAT (JSON):
{
  "questions": [
    {
      "question": "What is 5 + 7?",
      "options": ["10", "12", "13", "15"],
      "correctAnswer": "12"
    }
  ]
}

Generate diverse, educational questions that help students learn ${subjectName} concepts. Make the questions clear, age-appropriate, and fun for children to answer.
`;
  }

  // Parse the OpenAI response into Question objects
  private static parseQuestionResponse(
    response: string, 
    metadata: { category: string; difficulty: string; subjectId: string; lessonId?: number }
  ): Question[] {
    try {
      // Clean the response - remove any markdown or extra text
      let cleanResponse = response.trim();
      
      // Extract JSON from response if it's wrapped in text
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanResponse = jsonMatch[0];
      }
      
      const parsed = JSON.parse(cleanResponse);
      const questions = parsed.questions || [parsed]; // Handle single question or array
      
      return questions.map((q: any) => ({
        id: this.nextTempId++, // Assign temporary ID
        question: q.question,
        options: Array.isArray(q.options) ? q.options : [q.options],
        correctAnswer: q.correctAnswer,
        category: metadata.category as any,
        difficulty: metadata.difficulty as any,
        chapterTitle: `Lesson ${metadata.lessonId || 'Generated'}`,
        unitTitle: `${this.getSubjectName(metadata.subjectId)} Unit`,
        lessonTitle: `Generated Questions - ${metadata.difficulty}`
      }));
      
    } catch (error) {
      console.error('Error parsing question response:', error);
      console.log('Raw response:', response);
      
      // Try to extract questions manually if JSON parsing fails
      return this.extractQuestionsManually(response, metadata);
    }
  }

  // Fallback method to extract questions if JSON parsing fails
  private static extractQuestionsManually(
    response: string, 
    metadata: { category: string; difficulty: string; subjectId: string; lessonId?: number }
  ): Question[] {
    const questions: Question[] = [];
    
    // Try to find question patterns in the text
    const questionPattern = /(?:Question:|Q:|\d+\.)\s*(.+?)\n.*?(?:A\)|a\)|\n)([^\n]+)\n.*?(?:B\)|b\)|\n)([^\n]+)\n.*?(?:C\)|c\)|\n)([^\n]+)\n.*?(?:D\)|d\)|\n)([^\n]+)\n.*?(?:Answer:|Correct:)\s*([^\n]+)/gi;
    
    let match;
    while ((match = questionPattern.exec(response)) !== null) {
      const [, question, optionA, optionB, optionC, optionD, answer] = match;
      
      if (question && optionA && optionB && optionC && optionD && answer) {
        questions.push({
          id: this.nextTempId++,
          question: question.trim(),
          options: [optionA.trim(), optionB.trim(), optionC.trim(), optionD.trim()],
          correctAnswer: answer.trim(),
          category: metadata.category as any,
          difficulty: metadata.difficulty as any,
          chapterTitle: `Lesson ${metadata.lessonId || 'Generated'}`,
          unitTitle: `${this.getSubjectName(metadata.subjectId)} Unit`,
          lessonTitle: `Generated Questions - ${metadata.difficulty}`
        });
      }
    }
    
    // If still no questions found, create a simple fallback
    if (questions.length === 0) {
      questions.push(this.createSimpleFallbackQuestion(metadata));
    }
    
    return questions;
  }

  // Get fallback questions if generation fails completely
  private static getFallbackQuestions(options: QuestionGenerationOptions): Question[] {
    const { subjectId, difficulty, count, lessonId } = options;
    const category = this.getSubjectCategory(subjectId);
    
    // Use proper fallback questions instead of generic templates
    const properFallbackQuestions = this.getProperFallbackQuestions(difficulty, category);
    const fallbackQuestions: Question[] = [];
    
    for (let i = 0; i < count && i < properFallbackQuestions.length; i++) {
      const question = properFallbackQuestions[i];
      fallbackQuestions.push({
        id: this.nextTempId++,
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        category: category as any,
        difficulty: difficulty as any,
        chapterTitle: `Lesson ${lessonId || 'Default'}`,
        unitTitle: `${this.getSubjectName(subjectId)} Unit`,
        lessonTitle: `Lesson Questions - ${difficulty}`
      });
    }
    
    return fallbackQuestions;
  }

  // Get proper fallback questions by difficulty and category
  private static getProperFallbackQuestions(difficulty: string, category: string) {
    const questionBank: { [key: string]: any } = {
      math: {
        easy: [
          { question: "What is 5 + 3?", options: ["6", "8", "9", "7"], correctAnswer: "8" },
          { question: "What is 4 × 2?", options: ["6", "8", "10", "12"], correctAnswer: "8" },
          { question: "What is 10 - 6?", options: ["3", "4", "5", "6"], correctAnswer: "4" },
          { question: "What is 12 ÷ 3?", options: ["3", "4", "5", "6"], correctAnswer: "4" },
          { question: "How many hundreds in 1000?", options: ["5", "10", "15", "20"], correctAnswer: "10" }
        ],
        medium: [
          { question: "What is 7 × 8?", options: ["54", "56", "58", "60"], correctAnswer: "56" },
          { question: "What is 144 ÷ 12?", options: ["10", "11", "12", "13"], correctAnswer: "12" },
          { question: "What is 25 + 37?", options: ["60", "62", "64", "66"], correctAnswer: "62" },
          { question: "What is 6²?", options: ["32", "34", "36", "38"], correctAnswer: "36" },
          { question: "What is √49?", options: ["6", "7", "8", "9"], correctAnswer: "7" }
        ],
        hard: [
          { question: "What is 15 × 23?", options: ["345", "355", "365", "375"], correctAnswer: "345" },
          { question: "What is 12² - 8²?", options: ["70", "75", "80", "85"], correctAnswer: "80" },
          { question: "What is 384 ÷ 16?", options: ["22", "24", "26", "28"], correctAnswer: "24" },
          { question: "Express 60 as prime factors", options: ["2² × 3 × 5", "2 × 3² × 5", "2³ × 3 × 5", "2 × 3 × 5²"], correctAnswer: "2² × 3 × 5" },
          { question: "What is √169?", options: ["11", "12", "13", "14"], correctAnswer: "13" }
        ]
      },
      english: [
        { question: "Which is a noun?", options: ["Run", "Happy", "Cat", "Quickly"], correctAnswer: "Cat" },
        { question: "Past tense of 'go'?", options: ["Goed", "Gone", "Went", "Going"], correctAnswer: "Went" },
        { question: "Which is correct?", options: ["Me and John", "John and I", "John and me", "I and John"], correctAnswer: "John and I" }
      ],
      science: [
        { question: "Which is a mammal?", options: ["Fish", "Bird", "Dog", "Snake"], correctAnswer: "Dog" },
        { question: "What do plants need?", options: ["Darkness", "Sunlight", "Cold", "Salt"], correctAnswer: "Sunlight" },
        { question: "Water is made of?", options: ["H2O", "CO2", "O2", "N2"], correctAnswer: "H2O" }
      ]
    };

    return questionBank[category]?.[difficulty] || questionBank.math.easy;
  }

  // Create a simple fallback question
  private static createSimpleFallbackQuestion(
    metadata: { category: string; difficulty: string; subjectId: string; lessonId?: number }
  ): Question {
    // Use the same proper fallback question system
    const questions = this.getProperFallbackQuestions(metadata.difficulty, metadata.category);
    const questionData = questions[0]; // Get the first question
    
    return {
      id: this.nextTempId++,
      question: questionData.question,
      options: questionData.options,
      correctAnswer: questionData.correctAnswer,
      category: metadata.category as any,
      difficulty: metadata.difficulty as any,
      chapterTitle: `Lesson ${metadata.lessonId || 'Default'}`,
      unitTitle: `${this.getSubjectName(metadata.subjectId)} Unit`,
      lessonTitle: `Lesson Questions - ${metadata.difficulty}`
    };
  }

  // Helper methods
  private static getSubjectName(subjectId: string): string {
    const subjects: { [key: string]: string } = {
      '1': 'Mathematics',
      '2': 'English', 
      '3': 'Science'
    };
    return subjects[subjectId] || 'General';
  }

  private static getSubjectCategory(subjectId: string): string {
    const categories: { [key: string]: string } = {
      '1': 'math',
      '2': 'english',
      '3': 'science'
    };
    return categories[subjectId] || 'math';
  }

  // Get lesson topic from lesson ID (you might want to expand this)
  static getLessonTopic(lessonId: number, subjectId: string): string {
    // This could be expanded to fetch actual lesson topics from your API
    const topicMaps: { [subjectId: string]: { [lessonId: number]: string } } = {
      '1': { // Mathematics
        1: 'Basic Addition and Subtraction',
        2: 'Multiplication Tables',
        3: 'Division Basics',
        4: 'Fractions Introduction',
        5: 'Geometry Shapes'
      },
      '2': { // English
        1: 'Parts of Speech',
        2: 'Verb Tenses',
        3: 'Spelling and Grammar',
        4: 'Reading Comprehension',
        5: 'Writing Skills'
      },
      '3': { // Science
        1: 'Living and Non-living Things',
        2: 'Plant Life Cycle',
        3: 'Animal Habitats',
        4: 'Weather and Climate',
        5: 'Basic Chemistry'
      }
    };
    
    return topicMaps[subjectId]?.[lessonId] || `Lesson ${lessonId} Topic`;
  }

  // Check if we should generate new questions
  static shouldGenerateQuestions(availableQuestions: Question[], usedQuestionIds: number[]): boolean {
    const unusedQuestions = availableQuestions.filter(q => q.id && !usedQuestionIds.includes(q.id));
    return unusedQuestions.length < 3; // Generate new questions if less than 3 unused questions remain
  }
}
