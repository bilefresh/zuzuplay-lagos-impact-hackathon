"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getUserInfo } from "@/middleware/general";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { getDemoSchool } from "@/lib/demoData";

type AdminLayoutProps = {
  title?: string;
  children: React.ReactNode;
  requiredRole?: "admin" | "teacher" | "any";
  tabs?: { label: string; href: string }[];
};

export function AdminLayout({ title, children, requiredRole = "any", tabs = [] }: AdminLayoutProps) {
  const router = useRouter();
  const user = getUserInfo();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const role = user?.role as number | undefined;
  const isAdmin = role === 1;
  const isTeacher = role === 3;
  const allowed =
    requiredRole === "any" || (requiredRole === "admin" && isAdmin) || (requiredRole === "teacher" && isTeacher);

  if (!allowed) {
    if (typeof window !== "undefined") router.push("/learning/dashboard");
    return null;
  }

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F8] flex">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar}/>
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header 
          schoolName={getDemoSchool().name}
          userName="Sarah. H"
          userInitials="S"
          onChatClick={() => console.log("Chat clicked")}
          onNotificationClick={() => console.log("Notification clicked")}
          onProfileClick={() => console.log("Profile clicked")}
        />
        
        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="mb-6">
            <h2 className="text-[#291b13] text-xl font-bold">Good morning,</h2>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-[#d5d7d5]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;


