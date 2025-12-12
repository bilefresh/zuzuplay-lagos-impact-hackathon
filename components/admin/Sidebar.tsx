"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "../../assets/icons/logo.svg";
import Image from "next/image";
// Chevron Icons
const ChevronLeftIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

// SVG Icons from Figma design
const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.5 2.5H4.16667C3.24619 2.5 2.5 3.24619 2.5 4.16667V7.5C2.5 8.42048 3.24619 9.16667 4.16667 9.16667H7.5C8.42048 9.16667 9.16667 8.42048 9.16667 7.5V4.16667C9.16667 3.24619 8.42048 2.5 7.5 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15.8333 2.5H12.5C11.5795 2.5 10.8333 3.24619 10.8333 4.16667V7.5C10.8333 8.42048 11.5795 9.16667 12.5 9.16667H15.8333C16.7538 9.16667 17.5 8.42048 17.5 7.5V4.16667C17.5 3.24619 16.7538 2.5 15.8333 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7.5 10.8333H4.16667C3.24619 10.8333 2.5 11.5795 2.5 12.5V15.8333C2.5 16.7538 3.24619 17.5 4.16667 17.5H7.5C8.42048 17.5 9.16667 16.7538 9.16667 15.8333V12.5C9.16667 11.5795 8.42048 10.8333 7.5 10.8333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15.8333 10.8333H12.5C11.5795 10.8333 10.8333 11.5795 10.8333 12.5V15.8333C10.8333 16.7538 11.5795 17.5 12.5 17.5H15.8333C16.7538 17.5 17.5 16.7538 17.5 15.8333V12.5C17.5 11.5795 16.7538 10.8333 15.8333 10.8333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const StudentsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 9.16667C11.3807 9.16667 12.5 8.04738 12.5 6.66667C12.5 5.28595 11.3807 4.16667 10 4.16667C8.61929 4.16667 7.5 5.28595 7.5 6.66667C7.5 8.04738 8.61929 9.16667 10 9.16667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15.8333 15.8333C15.8333 13.9924 13.1591 12.5 10 12.5C6.8409 12.5 4.16667 13.9924 4.16667 15.8333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TeachersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 12.5C12.7614 12.5 15 10.2614 15 7.5C15 4.73858 12.7614 2.5 10 2.5C7.23858 2.5 5 4.73858 5 7.5C5 10.2614 7.23858 12.5 10 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2.5 17.5C2.5 14.7386 4.73858 12.5 7.5 12.5H12.5C15.2614 12.5 17.5 14.7386 17.5 17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BillingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.8333 3.33333H4.16667C3.24619 3.33333 2.5 4.07952 2.5 5V15C2.5 15.9205 3.24619 16.6667 4.16667 16.6667H15.8333C16.7538 16.6667 17.5 15.9205 17.5 15V5C17.5 4.07952 16.7538 3.33333 15.8333 3.33333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.66667 8.33333H13.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.66667 11.6667H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CBTIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.6667 2.5H5.83333C4.91286 2.5 4.16667 3.24619 4.16667 4.16667V15.8333C4.16667 16.7538 4.91286 17.5 5.83333 17.5H14.1667C15.0871 17.5 15.8333 16.7538 15.8333 15.8333V6.66667M11.6667 2.5V6.66667H15.8333M11.6667 2.5L15.8333 6.66667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 14.1667H10.0083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 10.8333H10.0083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7.5 14.1667H7.50833" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7.5 10.8333H7.50833" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12.5 14.1667H12.5083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12.5 10.8333H12.5083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const sidebarItems = [
  { label: "Dashboard", href: "/admin", icon: DashboardIcon },
  { label: "Students", href: "/admin/students", icon: StudentsIcon },
  { label: "Teachers", href: "/admin/teachers", icon: TeachersIcon },
  { label: "CBT", href: "/admin/cbt", icon: CBTIcon },
  { label: "Billing", href: "/admin/billing", icon: BillingIcon },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={`${isCollapsed ? 'w-[64px]' : 'w-[232px]'} h-screen bg-white border-r border-[#d5d7d5] flex flex-col relative transition-all duration-300`}>
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-8 py-6">
        {/* Zuzuplay Logo - simplified version */}
        <Image 
          src={Logo} 
          alt="Zuzuplay" 
          className="w-8 h-8" 
          width={32} height={32} 
        />
        {!isCollapsed && (
          <span className="text-[#fd6c22] text-2xl font-bold" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            Zuzuplay
          </span>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute top-6 right-2 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRightIcon className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronLeftIcon className="w-4 h-4 text-gray-600" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 px-0 py-4">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          const IconComponent = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-6 py-3 text-base font-normal transition-colors relative ${
                isActive
                  ? "bg-[#fff6f2] text-[#fd6c22]"
                  : "text-[#58514d] hover:bg-gray-50"
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              {/* Active border */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#fd6c22]" />
              )}
              
              <div className="w-5 h-5 flex items-center justify-center">
                <IconComponent />
              </div>
              {!isCollapsed && (
                <span className="text-[16px] tracking-[-0.32px]">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default Sidebar;

