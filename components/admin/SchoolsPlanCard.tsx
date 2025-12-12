"use client";
import React from "react";

interface SchoolsPlanCardProps {
  price?: string;
  studentCount?: number;
  onEdit?: () => void;
}

export function SchoolsPlanCard({ 
  price = "₦15,000", 
  studentCount = 56, 
  onEdit 
}: SchoolsPlanCardProps) {
  return (
    <div className="relative rounded-[8px] w-[552px] h-[167px] bg-white border border-[#d5d7d5] overflow-hidden">
      {/* Top Section - Orange Background */}
      <div className="bg-[#d4662d] h-[88px] flex items-center justify-between px-8">
        <div>
          <p className="text-white text-[16px] font-bold leading-[1.5]">
            Schools Plan
          </p>
        </div>
        <div className="text-right">
          <p className="text-white text-[16px] leading-[1.5]">
            <span className="font-bold">{price}</span>
            <span className="font-normal"> per student/term</span>
          </p>
        </div>
      </div>

      {/* Bottom Section - White Background */}
      <div className="h-[79px] px-8 flex items-center justify-between">
        <div>
          <p className="text-[#58514d] text-[16px] leading-[1.5]">
            <span className="font-bold">{studentCount} students </span>
            <span className="font-normal">slots registered</span>
          </p>
        </div>
        <button
          onClick={onEdit}
          className="text-[#fd6c22] text-[16px] font-bold tracking-[-0.16px] hover:underline"
        >
          Edit
        </button>
      </div>
    </div>
  );
}

export default SchoolsPlanCard;
