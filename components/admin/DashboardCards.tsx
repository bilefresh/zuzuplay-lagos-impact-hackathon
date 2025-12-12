"use client";
import React from "react";

// Student character images from Figma
const studentImage1 = "/assets/images/studIllustration.png";
const studentImage2 = "/assets/images/averageTime.png";
const studentImage3 = "/assets/images/questionAttempted.png";

interface DashboardCardProps {
  title: string;
  value: string;
  image: string;
  className?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  onClick?: () => void;
}

const DashboardCard = ({ title, value, image, className = "", trend, onClick }: DashboardCardProps) => (
  <div 
    className={`relative rounded-[8px] size-full bg-white hover:shadow-lg transition-all duration-200 cursor-pointer group ${className}`}
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick?.();
      }
    }}
    aria-label={`${title}: ${value}`}
  >
    <div className="overflow-clip relative size-full p-6 pr-0 pb-0">
      <div className="flex flex-col gap-4 items-start">
        <div className="flex flex-col gap-2">
          <div className="font-['Work_Sans:Regular',_sans-serif] font-normal text-[#58514d] text-[16px] tracking-[-0.32px]">
            {title}
          </div>
          <div className="font-['Comic_Sans_MS:Bold',_sans-serif] text-[#291b13] text-[24px] font-bold">
            {value}
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-sm ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <span className="text-xs">
                {trend.isPositive ? '↗' : '↘'}
              </span>
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 opacity-80 group-hover:opacity-100 transition-opacity">
          <img 
            alt={`${title} illustration`} 
            className="w-16 h-16 object-contain" 
            src={image}
            loading="lazy"
          />
        </div>
      </div>
    </div>
    <div aria-hidden="true" className="absolute border border-[#d5d7d5] border-solid inset-0 pointer-events-none rounded-[8px] group-hover:border-[#4fc3f7] transition-colors" />
  </div>
);

export const StudentsCard = () => (
  <DashboardCard
    title="Students"
    value="125"
    image={studentImage1}
    trend={{ value: "+12% this month", isPositive: true }}
    onClick={() => console.log("Navigate to students page")}
  />
);

export const AverageTimeCard = () => (
  <DashboardCard
    title="Average time spent"
    value="25 mins"
    image={studentImage2}
    trend={{ value: "+5 mins", isPositive: true }}
    onClick={() => console.log("View time analytics")}
  />
);

export const QuestionsCard = () => (
  <DashboardCard
    title="Questions attempted"
    value="400"
    image={studentImage3}
    trend={{ value: "+23 this week", isPositive: true }}
    onClick={() => console.log("View question analytics")}
  />
);

export default DashboardCard;
