"use client";

import React, { useState, useEffect } from 'react';
import { ProgressionService } from '@/services/progressionService';
import { toast } from 'sonner';

interface ProgressionDebugPanelProps {
  subjectId?: string;
  lessonId?: number;
  isVisible?: boolean;
}

export const ProgressionDebugPanel: React.FC<ProgressionDebugPanelProps> = ({ 
  subjectId, 
  lessonId, 
  isVisible = false 
}) => {
  const [showPanel, setShowPanel] = useState(isVisible);
  const [progressionData, setProgressionData] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Refresh progression data
  const refreshData = () => {
    const data = ProgressionService.getProgressionData();
    setProgressionData(data);
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    refreshData();
  }, [refreshKey, subjectId, lessonId]);

  if (!showPanel) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowPanel(true)}
          className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-lg hover:bg-blue-700"
        >
          🔧 Debug
        </button>
      </div>
    );
  }

  const clearAllProgress = () => {
    ProgressionService.clearAllProgress();
    refreshData();
    toast.success("All progression data cleared!");
  };

  const exportData = () => {
    const data = ProgressionService.exportProgressionData();
    navigator.clipboard.writeText(data);
    toast.success("Progression data copied to clipboard!");
  };

  const unlockAllLessons = () => {
    if (!subjectId) return;
    
    const data = ProgressionService.getProgressionData();
    const subjectProgress = data[subjectId];
    
    if (subjectProgress) {
      Object.keys(subjectProgress.lessons).forEach(lessonIdKey => {
        ProgressionService.updateLessonProgress(parseInt(lessonIdKey), subjectId, {
          status: 'in_progress'
        });
      });
      refreshData();
      toast.success("All lessons unlocked for current subject!");
    }
  };

  const getCurrentLessonInfo = () => {
    if (!subjectId || !lessonId) return null;
    return ProgressionService.getLessonProgress(lessonId, subjectId);
  };

  const currentLessonInfo = getCurrentLessonInfo();

  return (
    <div className="fixed top-4 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-xl p-4 max-w-md max-h-96 overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">🔧 Progression Debug</h3>
        <button
          onClick={() => setShowPanel(false)}
          className="text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          ×
        </button>
      </div>

      {/* Current Context */}
      <div className="mb-4 p-3 bg-gray-100 rounded">
        <h4 className="font-semibold text-sm text-gray-700 mb-2">Current Context</h4>
        <p className="text-xs text-gray-600">Subject ID: {subjectId || 'None'}</p>
        <p className="text-xs text-gray-600">Lesson ID: {lessonId || 'None'}</p>
      </div>

      {/* Current Lesson Info */}
      {currentLessonInfo && (
        <div className="mb-4 p-3 bg-blue-50 rounded">
          <h4 className="font-semibold text-sm text-blue-700 mb-2">Current Lesson</h4>
          <p className="text-xs text-blue-600">Status: {currentLessonInfo.status}</p>
          <p className="text-xs text-blue-600">High Score: {currentLessonInfo.highScore}</p>
          <p className="text-xs text-blue-600">Average: {currentLessonInfo.averageScore.toFixed(1)}</p>
          <p className="text-xs text-blue-600">Attempts: {currentLessonInfo.attempts}</p>
          <p className="text-xs text-blue-600">Used Questions: {currentLessonInfo.usedQuestionIds.length}</p>
        </div>
      )}

      {/* Subject Progress */}
      {subjectId && progressionData?.[subjectId] && (
        <div className="mb-4 p-3 bg-green-50 rounded">
          <h4 className="font-semibold text-sm text-green-700 mb-2">Subject Progress</h4>
          <p className="text-xs text-green-600">
            Completed: {progressionData[subjectId].completedLessons} / {progressionData[subjectId].totalLessons}
          </p>
          <p className="text-xs text-green-600">
            Progress: {progressionData[subjectId].progressPercentage.toFixed(1)}%
          </p>
          <p className="text-xs text-green-600">
            Current Lesson: {progressionData[subjectId].currentLesson}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={refreshData}
          className="w-full bg-blue-500 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-600"
        >
          🔄 Refresh Data
        </button>
        
        <button
          onClick={exportData}
          className="w-full bg-green-500 text-white px-3 py-2 rounded text-sm font-medium hover:bg-green-600"
        >
          📋 Copy Data
        </button>
        
        {subjectId && (
          <button
            onClick={unlockAllLessons}
            className="w-full bg-yellow-500 text-white px-3 py-2 rounded text-sm font-medium hover:bg-yellow-600"
          >
            🔓 Unlock All Lessons
          </button>
        )}
        
        {lessonId && subjectId && (
          <button
            onClick={() => {
              ProgressionService.resetLessonProgress(lessonId, subjectId);
              refreshData();
              toast.success("Lesson progress reset!");
            }}
            className="w-full bg-orange-500 text-white px-3 py-2 rounded text-sm font-medium hover:bg-orange-600"
          >
            🔄 Reset Lesson
          </button>
        )}
        
        {subjectId && (
          <button
            onClick={() => {
              ProgressionService.resetSubjectProgression(subjectId);
              refreshData();
              toast.success("Subject progression reset! Only first lesson unlocked.");
            }}
            className="w-full bg-purple-500 text-white px-3 py-2 rounded text-sm font-medium hover:bg-purple-600"
          >
            🔄 Reset Subject Progress
          </button>
        )}
        
        <button
          onClick={clearAllProgress}
          className="w-full bg-red-500 text-white px-3 py-2 rounded text-sm font-medium hover:bg-red-600"
        >
          🗑️ Clear All Progress
        </button>
      </div>

      {/* Storage Stats */}
      <div className="mt-4 p-3 bg-gray-50 rounded">
        <h4 className="font-semibold text-sm text-gray-700 mb-2">Storage Info</h4>
        <p className="text-xs text-gray-600">
          Subjects Tracked: {Object.keys(progressionData || {}).length}
        </p>
        <p className="text-xs text-gray-600">
          Data Size: {JSON.stringify(progressionData || {}).length} chars
        </p>
      </div>
    </div>
  );
};

export default ProgressionDebugPanel;
