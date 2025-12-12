import { Question } from "@/data/questions";

// Types for progression tracking
export interface LessonProgress {
  lessonId: number;
  subjectId: string;
  status: 'locked' | 'in_progress' | 'completed';
  highScore: number;
  averageScore: number;
  attempts: number;
  lastPlayed: string;
  usedQuestionIds: number[];
  completedAt?: string;
}

export interface GameStats {
  score: number;
  questionsAnswered: number;
  correctAnswers: number;
  duration: number;
  difficulty: string;
  timestamp: string;
}

export interface SubjectProgress {
  subjectId: string;
  subjectName: string;
  totalLessons: number;
  completedLessons: number;
  currentLesson: number;
  progressPercentage: number;
  lessons: { [lessonId: string]: LessonProgress };
}

// Main progression service class
export class ProgressionService {
  private static readonly STORAGE_KEY = 'zuzuplay_learning_progression';
  private static readonly QUESTION_HISTORY_KEY = 'zuzuplay_question_history';

  // Get all progression data
  static getProgressionData(): { [subjectId: string]: SubjectProgress } {
    if (typeof window === 'undefined') return {};
    
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error loading progression data:', error);
      return {};
    }
  }

  // Save progression data
  static saveProgressionData(data: { [subjectId: string]: SubjectProgress }): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving progression data:', error);
    }
  }

  // Get lesson progress for a specific lesson
  static getLessonProgress(lessonId: number, subjectId: string): LessonProgress {
    const progressionData = this.getProgressionData();
    const subjectProgress = progressionData[subjectId];
    
    if (!subjectProgress || !subjectProgress.lessons[lessonId.toString()]) {
      // Determine if this should be the first lesson for this subject
      const isFirstLesson = this.isFirstLessonInSubject(lessonId, subjectId);
      
      // Create default lesson progress
      return {
        lessonId,
        subjectId,
        status: isFirstLesson ? 'in_progress' : 'locked',
        highScore: 0,
        averageScore: 0,
        attempts: 0,
        lastPlayed: '',
        usedQuestionIds: []
      };
    }
    
    return subjectProgress.lessons[lessonId.toString()];
  }

  // Update lesson progress
  static updateLessonProgress(lessonId: number, subjectId: string, updates: Partial<LessonProgress>): void {
    const progressionData = this.getProgressionData();
    
    // Initialize subject if doesn't exist
    if (!progressionData[subjectId]) {
      progressionData[subjectId] = {
        subjectId,
        subjectName: this.getSubjectName(subjectId),
        totalLessons: 0,
        completedLessons: 0,
        currentLesson: 1,
        progressPercentage: 0,
        lessons: {}
      };
    }
    
    const subjectProgress = progressionData[subjectId];
    const lessonKey = lessonId.toString();
    
    // Initialize lesson if doesn't exist
    if (!subjectProgress.lessons[lessonKey]) {
      subjectProgress.lessons[lessonKey] = {
        lessonId,
        subjectId,
        status: 'locked',
        highScore: 0,
        averageScore: 0,
        attempts: 0,
        lastPlayed: '',
        usedQuestionIds: []
      };
    }
    
    // Update lesson progress
    const lessonProgress = subjectProgress.lessons[lessonKey];
    Object.assign(lessonProgress, updates);
    
    // Update last played timestamp
    lessonProgress.lastPlayed = new Date().toISOString();
    
    // Recalculate subject progress
    this.updateSubjectProgress(subjectId, progressionData);
    
    // Save data
    this.saveProgressionData(progressionData);
  }

  // Record game completion
  static recordGameCompletion(
    lessonId: number, 
    subjectId: string, 
    gameStats: GameStats,
    allLessons: any[] = []
  ): void {
    const lessonProgress = this.getLessonProgress(lessonId, subjectId);
    
    // Update attempts and calculate new average
    const newAttempts = lessonProgress.attempts + 1;
    const newAverage = ((lessonProgress.averageScore * lessonProgress.attempts) + gameStats.score) / newAttempts;
    
    // Update lesson progress
    const updates: Partial<LessonProgress> = {
      attempts: newAttempts,
      averageScore: newAverage,
      highScore: Math.max(lessonProgress.highScore, gameStats.score)
    };
    
    // Check if lesson should be completed
    const isAboveAverage = gameStats.score > (lessonProgress.averageScore || 0);
    const passThreshold = 60; // Configurable pass threshold
    
    if (gameStats.score >= passThreshold || isAboveAverage) {
      updates.status = 'completed';
      updates.completedAt = new Date().toISOString();
      
      // Unlock next lesson
      this.unlockNextLesson(lessonId, subjectId, allLessons);
    }
    
    this.updateLessonProgress(lessonId, subjectId, updates);
    
    // Store game history
    this.storeGameHistory(lessonId, subjectId, gameStats);
  }

  // Check if this is the first lesson in the subject
  static isFirstLessonInSubject(lessonId: number, subjectId: string): boolean {
    // For now, we'll consider lesson IDs 4, 28, 17 as first lessons based on the data
    // In a real implementation, you'd query the lesson structure
    const firstLessonIds = [4, 28, 17, 5, 20, 22, 25, 30, 31]; // Add known first lesson IDs
    return firstLessonIds.includes(lessonId);
  }

  // Get all lesson IDs for a subject (from the loaded lesson data)
  static getAllLessonsForSubject(subjectId: string): number[] {
    // This matches the actual lesson order from lessons-complete.json
    const lessonIdsBySubject: { [key: string]: number[] } = {
      '1': [4, 10, 9, 7, 5, 8, 6, 12, 13, 14, 15, 16, 28, 29, 17, 11, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 30, 32, 31]
    };
    
    return lessonIdsBySubject[subjectId] || [];
  }

  // Get the next lesson ID in sequence
  static getNextLessonId(currentLessonId: number, subjectId: string): number | null {
    const allLessons = this.getAllLessonsForSubject(subjectId);
    const currentIndex = allLessons.indexOf(currentLessonId);
    
    if (currentIndex !== -1 && currentIndex + 1 < allLessons.length) {
      return allLessons[currentIndex + 1];
    }
    
    return null;
  }

  // Unlock next lesson
  static unlockNextLesson(currentLessonId: number, subjectId: string, allLessons: any[] = []): number | null {
    const allLessonIds = this.getAllLessonsForSubject(subjectId);
    const currentIndex = allLessonIds.indexOf(currentLessonId);
    const nextLessonId = this.getNextLessonId(currentLessonId, subjectId);
    
    console.log(`🔓 Unlock Logic: Current lesson ${currentLessonId} at index ${currentIndex}`);
    console.log(`🔓 Lesson sequence: [${allLessonIds.join(', ')}]`);
    console.log(`🔓 Next lesson should be: ${nextLessonId}`);
    
    if (nextLessonId) {
      const nextLessonProgress = this.getLessonProgress(nextLessonId, subjectId);
      
      console.log(`🔓 Next lesson ${nextLessonId} current status: ${nextLessonProgress.status}`);
      
      if (nextLessonProgress.status === 'locked') {
        this.updateLessonProgress(nextLessonId, subjectId, {
          status: 'in_progress'
        });
        
        console.log(`✅ Lesson ${nextLessonId} unlocked!`);
        return nextLessonId;
      } else {
        console.log(`⚠️ Lesson ${nextLessonId} already ${nextLessonProgress.status}`);
      }
    } else {
      console.log(`❌ No next lesson found after ${currentLessonId}`);
    }
    
    return null;
  }

  // Mark question as used for a lesson
  static markQuestionAsUsed(lessonId: number, subjectId: string, questionId: number): void {
    const lessonProgress = this.getLessonProgress(lessonId, subjectId);
    
    if (!lessonProgress.usedQuestionIds.includes(questionId)) {
      lessonProgress.usedQuestionIds.push(questionId);
      this.updateLessonProgress(lessonId, subjectId, {
        usedQuestionIds: lessonProgress.usedQuestionIds
      });
    }
  }

  // Get unused questions for a lesson
  static getUnusedQuestions(lessonId: number, subjectId: string, allQuestions: Question[]): Question[] {
    const lessonProgress = this.getLessonProgress(lessonId, subjectId);
    return allQuestions.filter(q => q.id && !lessonProgress.usedQuestionIds.includes(q.id));
  }

  // Reset lesson progress (for testing or retry)
  static resetLessonProgress(lessonId: number, subjectId: string): void {
    this.updateLessonProgress(lessonId, subjectId, {
      usedQuestionIds: [],
      attempts: 0,
      averageScore: 0,
      highScore: 0,
      status: 'in_progress'
    });
  }

  // Check if lesson is unlocked
  static isLessonUnlocked(lessonId: number, subjectId: string): boolean {
    const lessonProgress = this.getLessonProgress(lessonId, subjectId);
    return lessonProgress.status !== 'locked';
  }

  // Get current unlocked lesson for subject
  static getCurrentLesson(subjectId: string): number {
    const progressionData = this.getProgressionData();
    const subjectProgress = progressionData[subjectId];
    
    if (!subjectProgress) return 1;
    
    // Find the highest unlocked lesson
    let currentLesson = 1;
    Object.values(subjectProgress.lessons).forEach(lesson => {
      if (lesson.status !== 'locked' && lesson.lessonId > currentLesson) {
        currentLesson = lesson.lessonId;
      }
    });
    
    return currentLesson;
  }

  // Private helper methods
  private static getSubjectName(subjectId: string): string {
    const subjects: { [key: string]: string } = {
      '1': 'Mathematics',
      '2': 'English',
      '3': 'Science'
    };
    return subjects[subjectId] || 'Unknown Subject';
  }

  private static updateSubjectProgress(subjectId: string, progressionData: { [subjectId: string]: SubjectProgress }): void {
    const subjectProgress = progressionData[subjectId];
    if (!subjectProgress) return;
    
    const lessons = Object.values(subjectProgress.lessons);
    const completedCount = lessons.filter(l => l.status === 'completed').length;
    const totalCount = Math.max(lessons.length, subjectProgress.totalLessons);
    
    subjectProgress.completedLessons = completedCount;
    subjectProgress.totalLessons = totalCount;
    subjectProgress.progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    subjectProgress.currentLesson = this.getCurrentLesson(subjectId);
  }

  private static storeGameHistory(lessonId: number, subjectId: string, gameStats: GameStats): void {
    if (typeof window === 'undefined') return;
    
    try {
      const historyKey = `${this.QUESTION_HISTORY_KEY}_${subjectId}_${lessonId}`;
      const existingHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
      existingHistory.push(gameStats);
      
      // Keep only last 10 games for storage efficiency
      if (existingHistory.length > 10) {
        existingHistory.splice(0, existingHistory.length - 10);
      }
      
      localStorage.setItem(historyKey, JSON.stringify(existingHistory));
    } catch (error) {
      console.error('Error storing game history:', error);
    }
  }

  // Export progression data (for backup or analysis)
  static exportProgressionData(): string {
    return JSON.stringify(this.getProgressionData(), null, 2);
  }

  // Import progression data (for restoration)
  static importProgressionData(data: string): boolean {
    try {
      const parsedData = JSON.parse(data);
      this.saveProgressionData(parsedData);
      return true;
    } catch (error) {
      console.error('Error importing progression data:', error);
      return false;
    }
  }

  // Clear all progression data
  static clearAllProgress(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.STORAGE_KEY);
    // Also clear question history
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.QUESTION_HISTORY_KEY)) {
        localStorage.removeItem(key);
      }
    });
  }

  // Reset progression for specific subject to test unlocking sequence
  static resetSubjectProgression(subjectId: string): void {
    const data: any = this.getProgressionData();
    if (data.subjects[subjectId]) {
      delete data.subjects[subjectId];
      this.saveProgressionData(data);
      console.log(`🔄 Progression reset for subject ${subjectId}`);
      console.log(`📖 Lesson sequence: [${this.getAllLessonsForSubject(subjectId).join(', ')}]`);
    }
  }
}
