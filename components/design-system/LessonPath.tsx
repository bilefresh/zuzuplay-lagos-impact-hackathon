import React from 'react';
import { cn } from '@/lib/utils';

interface LessonPathProps {
  unitName: string;
  lessons: Array<{
    id: number;
    name: string;
    status: 'completed' | 'in_progress' | 'locked';
    position: { left: string; transform: string };
  }>;
  onLessonClick: (lesson: any) => void;
  onLockedLessonClick: (lesson: any) => void;
  className?: string;
}

const LessonPath: React.FC<LessonPathProps> = ({
  unitName,
  lessons,
  onLessonClick,
  onLockedLessonClick,
  className
}) => {
  const getLessonIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 16.2L4.8 12L3.4 13.4L9 19L21 7L19.6 5.6L9 16.2Z" fill="white"/>
          </svg>
        );
      case 'in_progress':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M8 5V19L19 12L8 5Z" fill="white"/>
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C13.1 2 14 2.9 14 4V5H16C17.1 5 18 5.9 18 7V19C18 20.1 17.1 21 16 21H8C6.9 21 6 20.1 6 19V7C6 5.9 6.9 5 8 5H10V4C10 2.9 10.9 2 12 2ZM12 4C11.4 4 11 4.4 11 5V5H13V4C13 4.4 12.6 4 12 4ZM8 7V19H16V7H8Z" fill="white"/>
          </svg>
        );
    }
  };

  const getLessonStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-[#4fc3f7] border-orange-300 hover:bg-orange-600 hover:scale-110';
      case 'in_progress':
        return 'bg-blue-600 border-blue-300 hover:bg-blue-700 hover:scale-110';
      default:
        return 'bg-gray-600 border-gray-400 opacity-70 hover:opacity-90';
    }
  };

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Unit Section Header */}
      <div className="flex items-center my-8">
        <hr className="border-[#828282] flex-1 border-t-2" />
        <p className="text-sm font-bold text-[#58514D] px-4 whitespace-nowrap">
          {unitName}
        </p>
        <hr className="border-[#828282] flex-1 border-t-2" />
      </div>

      {/* Lessons in Path */}
      <div className="relative w-full">
        {lessons.map((lesson, index) => {
          const isLastLesson = index === lessons.length - 1;
          
          return (
            <div key={lesson.id} className="relative w-full h-24 mb-4">
              {/* Connecting Path Line */}
              {!isLastLesson && (
                <svg 
                  className="absolute top-16 left-0 w-full h-12 pointer-events-none z-10"
                  viewBox="0 0 100 12" 
                  preserveAspectRatio="none"
                >
                  <path
                    d={`M ${parseFloat(lesson.position.left)} 0 L ${parseFloat(lessons[index + 1]?.position.left || lesson.position.left)} 12`}
                    stroke="#D1D5DB"
                    strokeWidth="0.4"
                    fill="none"
                    strokeDasharray="6,4"
                    opacity="0.8"
                  />
                </svg>
              )}
              
              {/* Lesson Circle */}
              <div 
                className="absolute top-0 w-16 h-16 z-20"
                style={lesson.position}
              >
                <div 
                  onClick={() => 
                    lesson.status === 'locked' 
                      ? onLockedLessonClick(lesson)
                      : onLessonClick(lesson)
                  }
                  className={cn(
                    'w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-4 cursor-pointer transition-all duration-200',
                    getLessonStyles(lesson.status)
                  )}
                >
                  {getLessonIcon(lesson.status)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { LessonPath };
