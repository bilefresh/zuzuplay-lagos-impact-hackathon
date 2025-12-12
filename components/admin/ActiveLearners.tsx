"use client";
import React, { useState, useEffect } from "react";

// Chart SVG assets from Figma
const chartVector1 = "/assets/icons/activeLearner.svg";
const chartVector2 = "/assets/icons/activeLearner.svg";

interface ActiveLearnersProps {
  hasData?: boolean;
  isLoading?: boolean;
  onRefresh?: () => void;
}

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4fc3f7] mb-4"></div>
    <p className="text-[#9c9c9c] text-sm">Loading chart data...</p>
  </div>
);

const ChartWithData = ({ onRefresh }: { onRefresh?: () => void }) => {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  
  const data = [
    { day: 'Mon', value: 23, label: 'Monday' },
    { day: 'Tue', value: 33, label: 'Tuesday' },
    { day: 'Wed', value: 33, label: 'Wednesday' },
    { day: 'Thu', value: 40, label: 'Thursday' },
    { day: 'Fri', value: 62, label: 'Friday' },
    { day: 'Sat', value: 62, label: 'Saturday' },
    { day: 'Sun', value: 47, label: 'Sunday' },
  ];

  const pointsAttr = data
    .map((p, i) => {
      const x = (i / (data.length - 1)) * 100; // percent
      const y = 100 - p.value; // invert because SVG y grows downward, values are 0-100
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="relative h-full">
      {/* Y-axis labels */}
      <div className="absolute left-4 top-16 flex flex-col gap-7 text-[#9c9c9c] text-sm">
        {[100, 80, 60, 40, 20, 0].map((value) => (
          <div key={value} className="text-right w-6">{value}</div>
        ))}
      </div>
      
      {/* Chart area */}
      <div className="absolute left-16 top-16 right-4 bottom-16">
        <div className="relative h-full w-full">
          {/* Background removed to render a clean graph */}

          {/* Connecting line between points (touching dots) */}
          <svg
            className="absolute inset-0 pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {/* grid lines */}
            {[0,20,40,60,80,100].map((y) => (
              <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="#eee" strokeWidth="0.5" />
            ))}
            <polyline
              points={pointsAttr}
              fill="none"
              stroke="#4fc3f7"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
          
          {/* Interactive points */}
          {data.map((point, index) => (
            <div
              key={point.day}
              className="absolute w-3 h-3 bg-[#4fc3f7] rounded-full cursor-pointer hover:scale-125 transition-transform"
              style={{
                left: `${(index / (data.length - 1)) * 100}%`,
                bottom: `${(point.value / 100) * 100}%`,
                transform: 'translate(-50%, 50%)'
              }}
              onMouseEnter={() => setHoveredPoint(index)}
              onMouseLeave={() => setHoveredPoint(null)}
              title={`${point.label}: ${point.value} learners`}
            />
          ))}
          
          {/* Tooltip */}
          {hoveredPoint !== null && (
            <div 
              className="absolute bg-[#291b13] text-white text-xs px-2 py-1 rounded shadow-lg z-10"
              style={{
                left: `${(hoveredPoint / (data.length - 1)) * 100}%`,
                bottom: `${(data[hoveredPoint].value / 100) * 100}%`,
                transform: 'translate(-50%, -100%)'
              }}
            >
              {data[hoveredPoint].value} learners
            </div>
          )}
        </div>
      </div>
      
      {/* X-axis labels */}
      <div className="absolute bottom-4 left-16 right-4 flex justify-between text-[#9c9c9c] text-sm">
        {data.map((point) => (
          <div key={point.day} className="text-center">{point.day}</div>
        ))}
      </div>
      
      {/* Refresh button */}
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="absolute top-4 right-4 p-2 text-[#9c9c9c] hover:text-[#4fc3f7] transition-colors"
          aria-label="Refresh chart data"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      )}
    </div>
  );
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    </div>
    <h3 className="text-[#58514d] text-lg font-semibold mb-2">No active learners</h3>
    <p className="text-[#9c9c9c] text-sm text-center">No learning activity data available for this period.</p>
  </div>
);

export const ActiveLearners = ({ hasData = true, isLoading = false, onRefresh }: ActiveLearnersProps) => {
  return (
    <div className="relative rounded-[8px] size-full bg-white">
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[#58514d] text-lg font-semibold">Active Learners</h3>
          <div className="flex items-center gap-2">
            <span className="text-[#9c9c9c] text-sm">Weekly activity</span>
            <div className="w-2 h-2 bg-[#4fc3f7] rounded-full"></div>
          </div>
        </div>
        
        <div className="flex-1 relative">
          {isLoading ? (
            <LoadingState />
          ) : hasData ? (
            <ChartWithData onRefresh={onRefresh} />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#d5d7d5] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
};

export default ActiveLearners;
