"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import AssessmentConfigForm from "./AssessmentConfigForm";
import AssessmentQuestionsBuilder from "./AssessmentQuestionsBuilder";
import { apiService } from "@/middleware/apiService";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

const STORAGE_KEY = "cbt_assessment_draft";

const CreateAssessmentWizard = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [assessmentData, setAssessmentData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Load draft on mount
  useEffect(() => {
      const savedDraft = localStorage.getItem(STORAGE_KEY);
      if (savedDraft) {
          try {
              const parsed = JSON.parse(savedDraft);
              if (confirm("We found an unsaved assessment draft. Would you like to resume?")) {
                  setAssessmentData(parsed.assessmentData || {});
                  setQuestions(parsed.questions || []);
                  setStep(parsed.step || 1);
                  setLastSaved(parsed.lastSaved);
              } else {
                  localStorage.removeItem(STORAGE_KEY);
              }
          } catch (e) {
              console.error("Failed to parse draft", e);
          }
      }
  }, []);

  // Auto-save every 30 seconds if there is data
  useEffect(() => {
      const timer = setInterval(() => {
          if (Object.keys(assessmentData).length > 0 || questions.length > 0) {
              saveDraft();
          }
      }, 30000);
      return () => clearInterval(timer);
  }, [assessmentData, questions, step]);

  const saveDraft = () => {
      const now = new Date().toLocaleTimeString();
      const draft = {
          assessmentData,
          questions,
          step,
          lastSaved: now
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      setLastSaved(now);
      toast.info("Draft auto-saved");
  };

  const handleManualSave = () => {
      saveDraft();
      toast.success("Draft saved manually");
  };

  const handleConfigSubmit = (data: any) => {
    setAssessmentData({ ...assessmentData, ...data });
    setStep(2);
    // Trigger immediate save on step change
    const now = new Date().toLocaleTimeString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        assessmentData: { ...assessmentData, ...data },
        questions,
        step: 2,
        lastSaved: now
    }));
    setLastSaved(now);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  // Handler to update questions state in parent
  const handleQuestionsUpdate = (newQuestions: any[]) => {
      setQuestions(newQuestions);
  };

  const handleFinalSubmit = async (finalQuestions: any[]) => {
      try {
          setIsSubmitting(true);
          
          const payload = {
              ...assessmentData,
              class_id: Number(assessmentData.class_id),
              subject_id: Number(assessmentData.subject_id),
              questions: finalQuestions.map((q: any, idx: number) => ({
                  text: q.text,
                  type: q.type,
                  points: q.points,
                  display_order: idx + 1,
                  options: q.options.map((opt: any) => ({
                      text: opt.text,
                      is_correct: q.correctAnswerId === opt.id || q.correctAnswerId === 'true' && opt.id === 'true' || q.correctAnswerId === 'false' && opt.id === 'false'
                  }))
              }))
          };

          await apiService.createAssessment(payload);
          
          // Clear draft on success
          localStorage.removeItem(STORAGE_KEY);
          
          toast.success("Assessment created successfully!");
          router.push('/admin/cbt');

      } catch (error) {
          console.error("Error creating assessment:", error);
          toast.error("Failed to create assessment.");
      } finally {
          setIsSubmitting(false);
      }
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Stepper Indicator */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold text-[#291b13]">
            {step === 1 ? "Configure Assessment" : "Add Questions"}
          </h2>
          <p className="text-[#58514d]">Step {step} of 2</p>
        </div>
        <div className="flex items-center gap-4">
            {lastSaved && (
                <span className="text-xs text-gray-400">Last saved: {lastSaved}</span>
            )}
            <Button variant="outline" size="sm" onClick={handleManualSave}>
                <Save className="w-4 h-4 mr-2" /> Save Draft
            </Button>
            <div className="flex gap-2">
                <div className={`h-2 w-16 rounded-full ${step >= 1 ? 'bg-[#4fc3f7]' : 'bg-gray-200'}`} />
                <div className={`h-2 w-16 rounded-full ${step >= 2 ? 'bg-[#4fc3f7]' : 'bg-gray-200'}`} />
            </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 border border-[#d5d7d5]">
        {step === 1 && (
          <AssessmentConfigForm 
            onSubmit={handleConfigSubmit} 
            initialData={assessmentData} 
          />
        )}
        {step === 2 && (
          <AssessmentQuestionsBuilder 
            onBack={handleBack} 
            assessmentData={assessmentData}
            initialQuestions={questions} // Pass drafted questions
            onQuestionsChange={handleQuestionsUpdate} // Capture updates
            onSave={handleFinalSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
};

export default CreateAssessmentWizard;
