"use client";
import React, { useState } from "react";

// Avatar images from Figma
const avatar1 = "http://localhost:3845/assets/05f820628d396ff2d4cf661b0165b75e3834c0b6.png";
const avatar2 = "http://localhost:3845/assets/7bca07de9f898d20325e4f79cc10b89b6167c9cd.png";
const avatar3 = "http://localhost:3845/assets/d0f0d4d69895237767ef0aea19dd9e3fb8ff95e1.png";
const avatar4 = "http://localhost:3845/assets/03e9aa159c68794ad29b4c72f1cbc288b7c4de0b.png";

interface AtRiskLearner {
  id: string;
  name: string;
  accuracyRate: string;
  avatar: string;
  lastActivity?: string;
  riskLevel: 'high' | 'medium' | 'low';
}

interface AtRiskLearnersProps {
  learners?: AtRiskLearner[];
  isEmpty?: boolean;
  isLoading?: boolean;
  onLearnerClick?: (learner: AtRiskLearner) => void;
}

const AtRiskLearnerItem = ({ learner, onClick }: { learner: AtRiskLearner; onClick?: (learner: AtRiskLearner) => void }) => {
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div 
      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
      onClick={() => onClick?.(learner)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(learner);
        }
      }}
      aria-label={`View details for ${learner.name}`}
    >
      <div className="flex gap-3 items-center">
        {/* <div className="relative">
          <img 
            alt={`${learner.name} avatar`} 
            className="w-8 h-8 rounded-full object-cover" 
            src={learner.avatar}
            loading="lazy"
          />
          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getRiskColor(learner.riskLevel).split(' ')[1]}`} />
        </div> */}
        <div className="flex flex-col">
          <div className="font-medium text-[#58514d] text-sm">
            {learner.name}
          </div>
          {learner.lastActivity && (
            <div className="text-xs text-[#9c9c9c]">
              Last active: {learner.lastActivity}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(learner.riskLevel)}`}>
          {learner.riskLevel.toUpperCase()}
        </div>
        <div className="font-semibold text-[#58514d] text-sm">
          {learner.accuracyRate}
        </div>
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4fc3f7] mb-4"></div>
    <p className="text-[#9c9c9c] text-sm">Loading learners...</p>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
      <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <h3 className="text-[#58514d] text-lg font-semibold mb-2">No at-risk learners</h3>
    <p className="text-[#9c9c9c] text-sm text-center">All students are performing well! 🎉</p>
  </div>
);

export const AtRiskLearners = ({ learners, isEmpty = false, isLoading = false, onLearnerClick }: AtRiskLearnersProps) => {
  const defaultLearners: AtRiskLearner[] = [
    { 
      id: "1", 
      name: "Anna Oreoluwa", 
      accuracyRate: "12%", 
      avatar: avatar1, 
      lastActivity: "2 days ago",
      riskLevel: 'high' as const
    },
    { 
      id: "2", 
      name: "Abubakar Sanusi", 
      accuracyRate: "14%", 
      avatar: avatar2, 
      lastActivity: "1 day ago",
      riskLevel: 'high' as const
    },
    { 
      id: "3", 
      name: "Micheal Emeka", 
      accuracyRate: "24%", 
      avatar: avatar3, 
      lastActivity: "3 days ago",
      riskLevel: 'medium' as const
    },
    { 
      id: "4", 
      name: "Sarah Lumingo", 
      accuracyRate: "34%", 
      avatar: avatar4, 
      lastActivity: "1 day ago",
      riskLevel: 'medium' as const
    },
  ];

  const displayLearners = learners || defaultLearners;

  return (
    <div className="relative rounded-[8px] size-full bg-white">
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[#58514d] text-lg font-semibold">At Risk Learners</h3>
          <div className="flex items-center gap-2">
            <span className="text-[#9c9c9c] text-sm">Accuracy rate</span>
            <div className="w-2 h-2 bg-[#4fc3f7] rounded-full"></div>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <LoadingState />
          ) : isEmpty ? (
            <EmptyState />
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {displayLearners.map((learner) => (
                <AtRiskLearnerItem 
                  key={learner.id} 
                  learner={learner} 
                  onClick={onLearnerClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#d5d7d5] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
};

export default AtRiskLearners;
