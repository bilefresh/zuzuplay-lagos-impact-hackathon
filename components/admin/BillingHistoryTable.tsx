"use client";
import React, { useState } from "react";

// Icons
const ArrowDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6L8 10L12 6" stroke="#9C9C9C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="#9C9C9C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 14L11.1 11.1" stroke="#9C9C9C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const KebabMenuIcon = () => (
  <svg width="16" height="4" viewBox="0 0 16 4" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="2" cy="2" r="2" fill="#9C9C9C"/>
    <circle cx="8" cy="2" r="2" fill="#9C9C9C"/>
    <circle cx="14" cy="2" r="2" fill="#9C9C9C"/>
  </svg>
);

interface BillingHistoryItem {
  id: string;
  date: string;
  plan: string;
  students: number;
  amount: string;
  status: "Successful" | "Pending" | "Failed";
}

interface BillingHistoryTableProps {
  data?: BillingHistoryItem[];
  onSearch?: (query: string) => void;
  onFilter?: (filter: string) => void;
}

export function BillingHistoryTable({ 
  data = [
    {
      id: "1",
      date: "06/04/2025",
      plan: "School Plan",
      students: 64,
      amount: "₦840,000",
      status: "Successful"
    },
    {
      id: "2", 
      date: "06/04/2025",
      plan: "School Plan",
      students: 64,
      amount: "₦840,000",
      status: "Successful"
    },
    {
      id: "3",
      date: "06/04/2025", 
      plan: "School Plan",
      students: 64,
      amount: "₦840,000",
      status: "Successful"
    }
  ],
  onSearch,
  onFilter
}: BillingHistoryTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-2 rounded-[56px] text-[14px] font-medium";
    
    switch (status) {
      case "Successful":
        return (
          <div className={`${baseClasses} bg-[#eefdee] text-[#219a21] border border-[#219a21]`}>
            {status}
          </div>
        );
      case "Pending":
        return (
          <div className={`${baseClasses} bg-[#fff3cd] text-[#856404] border border-[#ffc107]`}>
            {status}
          </div>
        );
      case "Failed":
        return (
          <div className={`${baseClasses} bg-[#f8d7da] text-[#721c24] border border-[#dc3545]`}>
            {status}
          </div>
        );
      default:
        return (
          <div className={`${baseClasses} bg-gray-100 text-gray-600`}>
            {status}
          </div>
        );
    }
  };

  return (
    <div className="relative rounded-[8px] w-full max-w-[1128px] min-h-[335px] bg-white border border-[#d5d7d5] overflow-hidden">
      <div className="min-h-[335px] overflow-clip relative w-full">
        {/* Header */}
        <div className="absolute left-[24px] top-[24px]">
          <h3 className="text-[#364151] text-[18px] font-semibold leading-[normal]">
            Billing History
          </h3>
        </div>

        {/* Search and Filter Controls */}
        <div className="absolute right-[24px] top-[18px] flex gap-4">
          {/* Class Filter */}
          <div className="bg-white border border-[#d5d7d5] rounded-[8px] h-[36px] px-3 py-2 flex items-center gap-2 min-w-[80px]">
            <span className="text-[#9c9c9c] text-[16px] font-medium tracking-[-0.16px]">Class</span>
            <ArrowDownIcon />
          </div>
          
          {/* Search Input */}
          <div className="bg-white border border-[#d5d7d5] rounded-[8px] h-[36px] px-3 py-2 flex items-center gap-2 w-[239px]">
            <input
              type="text"
              placeholder="Search student name"
              value={searchQuery}
              onChange={handleSearch}
              className="flex-1 text-[#9c9c9c] text-[16px] font-medium tracking-[-0.16px] outline-none"
            />
            <SearchIcon />
          </div>
        </div>

        {/* Table Header */}
        <div className="absolute bg-white h-[38px] left-0 top-[73px] w-full border-b border-[#e6e7e6]">
          <div className="h-[38px] flex items-center text-[#364151] text-[16px] font-normal tracking-[-0.16px] px-6">
            <div className="flex-1 min-w-[120px]">Date</div>
            <div className="flex-1 min-w-[100px]">Plan</div>
            <div className="flex-1 min-w-[80px]">Students</div>
            <div className="flex-1 min-w-[100px]">Amount</div>
            <div className="flex-1 min-w-[120px]">Status</div>
            <div className="w-[40px] text-center">Action</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="absolute left-0 top-[115px] w-full px-6">
          <div className="flex flex-col gap-2">
            {data.map((item) => (
              <div key={item.id} className="flex items-center py-4 border-b border-[#e6e7e6] last:border-b-0">
                <div className="flex-1 min-w-[120px] text-[#58514d] text-[16px] font-normal tracking-[-0.32px]">
                  {item.date}
                </div>
                <div className="flex-1 min-w-[100px] text-[#364151] text-[16px] font-normal tracking-[-0.16px]">
                  {item.plan}
                </div>
                <div className="flex-1 min-w-[80px] text-[#364151] text-[16px] font-normal tracking-[-0.16px]">
                  {item.students}
                </div>
                <div className="flex-1 min-w-[100px] text-[#364151] text-[16px] font-normal tracking-[-0.16px]">
                  {item.amount}
                </div>
                <div className="flex-1 min-w-[120px] flex items-center gap-2">
                  {getStatusBadge(item.status)}
                </div>
                <div className="w-[40px] flex justify-center">
                  <button className="w-4 h-4 flex items-center justify-center hover:bg-gray-100 rounded">
                    <KebabMenuIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BillingHistoryTable;
