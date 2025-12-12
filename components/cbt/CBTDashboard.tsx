"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import DataTable, { Column } from "@/components/admin/DataTable";
import DashboardCard from "@/components/admin/DashboardCards";
import { apiService } from "@/middleware/apiService";
import { format } from "date-fns";
import { toast } from "sonner";

// Data types matching backend
export type AssessmentStatus = 'draft' | 'published' | 'completed' | 'scheduled';

export interface Assessment {
  id: string;
  title: string;
  class_id: number;
  subject_id: number;
  duration_minutes: number;
  scheduled_date: string;
  status: AssessmentStatus;
  created_at: string;
  Classroom?: { name: string };
  Subject?: { name: string };
  // Add computed fields if needed for display
  className?: string;
  subjectName?: string;
}

const CBTDashboard = () => {
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    avgCompletion: "0%"
  });

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAssessments();
      if (response.data) {
        const data = response.data.map((item: any) => ({
            ...item,
            className: item.Classroom?.name || "N/A",
            subjectName: item.Subject?.name || "N/A"
        }));
        setAssessments(data);
        calculateStats(data);
      }
    } catch (error) {
      console.error("Error fetching assessments:", error);
      toast.error("Failed to load assessments");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: Assessment[]) => {
      // Simple stats calculation
      const total = data.length;
      const active = data.filter(a => a.status === 'published').length;
      const completed = data.filter(a => a.status === 'completed').length;
      // Mock average for now as we need student data for real avg
      setStats({ total, active, completed, avgCompletion: "85%" });
  };

  const handleCreateAssessment = () => {
    router.push("/admin/cbt/create");
  };

  const columns: Column<Assessment>[] = [
    {
      key: "title",
      header: "Assessment Title",
      render: (row) => <div className="font-medium text-[#291b13]">{row.title}</div>
    },
    {
      key: "className",
      header: "Class",
    },
    {
      key: "subjectName",
      header: "Subject",
    },
    {
      key: "created_at",
      header: "Date Created",
      render: (row) => <span>{format(new Date(row.created_at), 'MMM dd, yyyy')}</span>
    },
    {
      key: "scheduled_date",
      header: "Scheduled Date",
      render: (row) => <span>{format(new Date(row.scheduled_date), 'MMM dd, yyyy HH:mm')}</span>
    },
    {
      key: "status",
      header: "Status",
      render: (row) => {
        const colors: Record<string, string> = {
          draft: "bg-gray-100 text-gray-800",
          published: "bg-blue-100 text-blue-800",
          completed: "bg-green-100 text-green-800",
          scheduled: "bg-yellow-100 text-yellow-800",
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[row.status] || "bg-gray-100"}`}>
            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          </span>
        );
      }
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/cbt/${row.id}`)}>
            View
          </Button>
          {row.status === 'draft' && (
             <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => router.push(`/admin/cbt/${row.id}/edit`)}>
               Edit
             </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <DashboardCard 
           title="Total Assessments" 
           value={stats.total.toString()} 
           image="/assets/images/questionAttempted.png" 
         />
         <DashboardCard 
           title="Active Now" 
           value={stats.active.toString()} 
           image="/assets/images/studIllustration.png" 
         />
         <DashboardCard 
           title="Completed" 
           value={stats.completed.toString()} 
           image="/assets/images/averageTime.png" 
         />
         <DashboardCard 
           title="Avg. Completion" 
           value={stats.avgCompletion} 
           image="/assets/images/questionAttempted.png" 
         />
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-[#291b13]">Recent Assessments</h2>
        <Button 
          onClick={handleCreateAssessment}
          className="bg-[#4fc3f7] hover:bg-[#e55b18] text-white"
        >
          + Create Assessment
        </Button>
      </div>

      {/* Table */}
      <DataTable 
        columns={columns} 
        data={assessments} 
        empty={<div className="text-center py-8 text-gray-500">{loading ? "Loading..." : "No assessments found"}</div>}
      />
    </div>
  );
};

export default CBTDashboard;
