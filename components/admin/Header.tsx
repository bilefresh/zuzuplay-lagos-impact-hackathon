"use client";
import React from "react";
import { MessageCircle, Bell, User } from "lucide-react";

interface HeaderProps {
  schoolName?: string;
  userName?: string;
  userInitials?: string;
  onChatClick?: () => void;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
}

export function Header({ 
  schoolName = "Jonia primary school",
  userName = "Sarah. H",
  userInitials = "S",
  onChatClick,
  onNotificationClick,
  onProfileClick
}: HeaderProps) {
  return (
    <div className="relative w-full h-16 bg-white border-b border-[#d5d7d5] flex items-center justify-between px-8">
      {/* School Name */}
      <div className="flex items-center">
        <h1 className="text-[#58514d] text-[16px] font-bold leading-none">
          {schoolName}
        </h1>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        {/* Chat Button */}
        <button
          onClick={onChatClick}
          className="relative w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
          aria-label="Open chat"
        >
          <MessageCircle className="w-5 h-5 text-gray-600" />
        </button>

        {/* Notification Button */}
        <button
          onClick={onNotificationClick}
          className="relative w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
          aria-label="View notifications"
        >
          <Bell className="w-5 h-5 text-gray-600" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2">
          <div className="relative w-10 h-10">
            <div className="w-10 h-10 bg-[#fd6c22] rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {userInitials}
              </span>
            </div>
          </div>
          <span className="text-[#58514d] text-[16px] font-normal tracking-[-0.32px]">
            {userName}
          </span>
        </div>
      </div>
    </div>
  );
}

export default Header;
