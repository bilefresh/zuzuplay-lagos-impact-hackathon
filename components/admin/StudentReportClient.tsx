"use client";
import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { X, TrendingUp, Clock, FileText, Users, Target } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { getDemoSchool } from "@/lib/demoData";

interface StudentReport {
  studentName: string;
  accuracyRate: number;
  timeSpent: string;
  questionsAnswered: number;
  trends: {
    improvedAccuracy: number;
    moreTimePracticing: number;
  };
  recommendations: string;
  insights: {
    strengths: string[];
    weaknesses: string[];
    improvementAreas: string[];
  };
}

export default function StudentReportClient() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<StudentReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const school = getDemoSchool();
    const id = Array.isArray(params.studentId) ? params.studentId[0] : params.studentId;
    const student = school.students.find(s => `${s.firstName}-${s.lastName}`.toLowerCase().replace(/\s+/g, '-') === id);
    if (!student) {
      setIsLoading(false);
      return;
    }
    const mockReport: StudentReport = {
      studentName: `${student.firstName} ${student.lastName}`,
      accuracyRate: student.report.accuracyRatePercent,
      timeSpent: "3 hrs 20 mins",
      questionsAnswered: student.report.totalQuizzesTaken * 10,
      trends: {
        improvedAccuracy: 5,
        moreTimePracticing: 8,
      },
      recommendations: "Encourage practice on decimals and division",
      insights: {
        strengths: student.report.recentTopics.slice(0, 2),
        weaknesses: ["Multiplication Tables", "Division"],
        improvementAreas: ["Basic Arithmetic", "Number Operations"],
      },
    };
    setReport(mockReport);
    setIsLoading(false);
  }, [params.studentId]);

  if (isLoading) {
    return (
      <AdminLayout title="Student Report" requiredRole="admin">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-[#4fc3f7] border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!report) {
    return (
      <AdminLayout title="Student Report" requiredRole="admin">
        <div className="text-center py-8">
          <p className="text-[#58514d]">Report not found</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Student Report" requiredRole="admin">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[#291b13] text-2xl font-bold">Report</h1>
            <p className="text-[#58514d] text-sm mt-1">
              Performance analytics for {report.studentName}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Close
          </Button>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Accuracy Rate */}
          <div className="bg-white rounded-lg border border-[#d5d7d5] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#4fc3f7] rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[#58514d] text-sm">Accuracy Rate</p>
                <p className="text-[#291b13] text-2xl font-semibold">{report.accuracyRate}%</p>
              </div>
            </div>
          </div>

          {/* Time Spent */}
          <div className="bg-white rounded-lg border border-[#d5d7d5] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#4fc3f7] rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[#58514d] text-sm">Time Spent</p>
                <p className="text-[#291b13] text-2xl font-semibold">{report.timeSpent}</p>
              </div>
            </div>
          </div>

          {/* Questions Answered */}
          <div className="bg-white rounded-lg border border-[#d5d7d5] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#4fc3f7] rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[#58514d] text-sm">Questions</p>
                <p className="text-[#291b13] text-2xl font-semibold">{report.questionsAnswered}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trends Section */}
        <div className="bg-white rounded-lg border border-[#d5d7d5] p-6 mb-6">
          <h3 className="text-[#58514d] font-semibold text-lg mb-4">Trends</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#0abc22] rounded-full" />
              <p className="text-[#58514d]">
                Improved <span className="text-[#0abc22] font-semibold">{report.trends.improvedAccuracy}%</span> in math accuracy over last 4 weeks
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#0abc22] rounded-full" />
              <p className="text-[#58514d]">
                Spent <span className="text-[#0abc22] font-semibold">{report.trends.moreTimePracticing}%</span> more time practicing this week
              </p>
            </div>
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="bg-white rounded-lg border border-[#d5d7d5] p-6 mb-6">
          <h3 className="text-[#58514d] font-semibold text-lg mb-4">Recommendations</h3>
          <p className="text-[#58514d] leading-relaxed">{report.recommendations}</p>
        </div>

        {/* Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Strengths */}
          <div className="bg-white rounded-lg border border-[#d5d7d5] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-[#0abc22]" />
              <h4 className="text-[#291b13] font-semibold">Strengths</h4>
            </div>
            <div className="space-y-2">
              {report.insights.strengths.map((strength, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#0abc22] rounded-full" />
                  <span className="text-[#58514d] text-sm">{strength}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weaknesses */}
          <div className="bg-white rounded-lg border border-[#d5d7d5] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-[#ef4444]" />
              <h4 className="text-[#291b13] font-semibold">Areas to Improve</h4>
            </div>
            <div className="space-y-2">
              {report.insights.weaknesses.map((weakness, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#ef4444] rounded-full" />
                  <span className="text-[#58514d] text-sm">{weakness}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Focus Areas */}
          <div className="bg-white rounded-lg border border-[#d5d7d5] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-[#4fc3f7]" />
              <h4 className="text-[#291b13] font-semibold">Focus Areas</h4>
            </div>
            <div className="space-y-2">
              {report.insights.improvementAreas.map((area, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#4fc3f7] rounded-full" />
                  <span className="text-[#58514d] text-sm">{area}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

