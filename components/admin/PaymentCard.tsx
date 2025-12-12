"use client";
import React from "react";

// Card icon SVG
const CardIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="8" width="36" height="24" rx="4" stroke="#9C9C9C" strokeWidth="2"/>
    <path d="M2 16h36" stroke="#9C9C9C" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="32" cy="20" r="2" fill="#9C9C9C"/>
  </svg>
);

interface PaymentCardProps {
  nextBillAmount?: string;
  nextBillDate?: string;
  cardNumber?: string;
  cardExpiry?: string;
  onUpdate?: () => void;
}

export function PaymentCard({ 
  nextBillAmount = "₦840,000",
  nextBillDate = "02/01/2026",
  cardNumber = "****0987",
  cardExpiry = "02/29",
  onUpdate 
}: PaymentCardProps) {
  return (
    <div className="relative rounded-[8px] w-[552px] h-[167px] bg-white border border-[#d5d7d5] overflow-hidden">
      <div className="h-[167px] overflow-clip relative w-[552px]">
        {/* Payment Title */}
        <div className="absolute left-[32px] top-[24px]">
          <p className="text-[#58514d] text-[16px] font-bold leading-[1.5]">
            Payment
          </p>
        </div>

        {/* Next Bill Info */}
        <div className="absolute left-[32px] top-[56px]">
          <p className="text-[#58514d] text-[16px] leading-[1.5]">
            <span>Your next bill is </span>
            <span className="font-bold">{nextBillAmount}</span>
            <span> on the {nextBillDate}</span>
          </p>
        </div>

        {/* Saved Card Section */}
        <div className="absolute left-[32px] top-[104px] flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <CardIcon />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[#58514d] text-[16px] font-medium leading-none">
              Saved card
            </p>
            <p className="text-[#58514d] text-[16px] font-normal leading-none">
              {cardNumber} | {cardExpiry}
            </p>
          </div>
        </div>

        {/* Update Button */}
        <div className="absolute right-[32px] bottom-[32px]">
          <button
            onClick={onUpdate}
            className="text-[#fd6c22] text-[16px] font-bold tracking-[-0.16px] hover:underline"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentCard;
