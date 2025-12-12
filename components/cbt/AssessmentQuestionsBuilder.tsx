"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit2, GripVertical, Loader2 } from "lucide-react";
import QuestionEditor, { Question } from "./QuestionEditor";

interface AssessmentQuestionsBuilderProps {
  onBack: () => void;
  assessmentData: any;
  onSave: (questions: Question[]) => void;
  isSubmitting?: boolean;
  initialQuestions?: Question[];
  onQuestionsChange?: (questions: Question[]) => void;
}

const AssessmentQuestionsBuilder = ({ 
    onBack, 
    assessmentData, 
    onSave, 
    isSubmitting = false,
    initialQuestions = [],
    onQuestionsChange 
}: AssessmentQuestionsBuilderProps) => {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [isEditing, setIsEditing] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Sync local state with prop updates if needed (optional, mainly for draft loading)
  useEffect(() => {
      if (initialQuestions.length > 0 && questions.length === 0) {
          setQuestions(initialQuestions);
      }
  }, [initialQuestions]);

  // Notify parent on change
  useEffect(() => {
      if (onQuestionsChange) {
          onQuestionsChange(questions);
      }
  }, [questions, onQuestionsChange]);

  const handleAddQuestion = (question: Question) => {
    if (editingQuestionId) {
      setQuestions(questions.map(q => q.id === editingQuestionId ? question : q));
      setEditingQuestionId(null);
    } else {
      setQuestions([...questions, question]);
    }
    setIsEditing(false);
  };

  const handleDeleteQuestion = (id: string) => {
    if (confirm("Are you sure you want to delete this question?")) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestionId(question.id);
    setIsEditing(true);
  };

  // Strip HTML tags for preview
  const stripHtml = (html: string) => {
     const tmp = document.createElement("DIV");
     tmp.innerHTML = html;
     return tmp.textContent || tmp.innerText || "";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <div>
            <h3 className="text-lg font-medium">Questions ({questions.length})</h3>
            <p className="text-sm text-gray-500">Total Points: {questions.reduce((acc, q) => acc + q.points, 0)}</p>
         </div>
         {!isEditing && (
             <Button onClick={() => setIsEditing(true)} className="bg-[#fd6c22] hover:bg-[#e55b18]">
               <Plus className="h-4 w-4 mr-2" /> Add Question
             </Button>
         )}
      </div>

      {isEditing ? (
        <QuestionEditor 
          onSave={handleAddQuestion} 
          onCancel={() => {
            setIsEditing(false);
            setEditingQuestionId(null);
          }}
          initialQuestion={editingQuestionId ? questions.find(q => q.id === editingQuestionId) : null}
        />
      ) : (
        <div className="space-y-4">
          {questions.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg bg-gray-50">
              <p className="text-gray-500">No questions added yet.</p>
              <Button variant="link" onClick={() => setIsEditing(true)}>Add your first question</Button>
            </div>
          ) : (
            questions.map((question, index) => (
              <div key={question.id} className="flex items-start gap-4 p-4 border rounded-lg bg-white hover:shadow-sm transition-shadow">
                 <div className="mt-1 text-gray-400">
                    <GripVertical className="h-5 w-5" />
                 </div>
                 <div className="flex-1">
                    <div className="flex justify-between">
                        <span className="font-medium text-sm bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                            Q{index + 1} • {question.type === 'multiple-choice' ? 'Multiple Choice' : 'True/False'} • {question.points} pts
                        </span>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditQuestion(question)} className="h-8 w-8">
                                <Edit2 className="h-4 w-4 text-gray-500" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteQuestion(question.id)} className="h-8 w-8">
                                <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                        </div>
                    </div>
                    {/* Render HTML securely or strip tags for preview */}
                    <div 
                        className="mt-2 text-gray-800 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: question.text }} 
                    />
                    
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {question.options.map(opt => (
                            <div key={opt.id} className={`text-sm p-2 rounded border ${question.correctAnswerId === opt.id ? 'bg-green-50 border-green-200 text-green-800' : 'bg-gray-50 border-gray-100'}`}>
                                {opt.text}
                                {question.correctAnswerId === opt.id && " ✓"}
                            </div>
                        ))}
                    </div>
                 </div>
              </div>
            ))
          )}
        </div>
      )}

      {!isEditing && (
        <div className="flex justify-between pt-6 border-t">
            <Button variant="outline" onClick={onBack} disabled={isSubmitting}>Back</Button>
            <Button 
                onClick={() => onSave(questions)} 
                disabled={questions.length === 0 || isSubmitting}
                className="bg-[#fd6c22] hover:bg-[#e55b18]"
            >
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...</> : "Publish Assessment"}
            </Button>
        </div>
      )}
    </div>
  );
};

export default AssessmentQuestionsBuilder;
