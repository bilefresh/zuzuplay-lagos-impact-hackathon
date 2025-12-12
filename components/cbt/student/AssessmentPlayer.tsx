"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Flag, Clock, ChevronLeft, ChevronRight, Maximize, Minimize, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { apiService } from "@/middleware/apiService";
import { toast } from "sonner";

// Reusing types from admin side for consistency, but defining here for self-containment
interface Option {
    id: string;
    text: string;
    question_id: string;
    is_correct?: boolean; // For review mode
}

interface Question {
    id: string;
    text: string;
    type: 'multiple-choice' | 'true-false';
    options: Option[];
    points: number;
}

interface Assessment {
    id: string;
    title: string;
    duration_minutes: number;
    questions: Question[];
    studentAnswers?: { questionId: number, selectedOptionId: number }[]; // For review
}

interface AssessmentPlayerProps {
    assessment: Assessment;
    attemptId: string;
    reviewMode?: boolean;
    existingAnswers?: { questionId: number, selectedOptionId: number }[];
}

const AssessmentPlayer = ({ assessment, attemptId, reviewMode = false, existingAnswers }: AssessmentPlayerProps) => {
    const router = useRouter();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
    
    const duration = assessment.duration_minutes || (assessment as any).durationMinutes || 60;
    const [timeLeft, setTimeLeft] = useState(duration * 60);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const STORAGE_KEY = `cbt_attempt_${attemptId}`;

    const currentQuestion = assessment.questions[currentQuestionIndex];

    // Pre-fill answers if reviewing or load from storage
    useEffect(() => {
        if (reviewMode && existingAnswers) {
            const ansMap: Record<string, string> = {};
            existingAnswers.forEach(a => {
                ansMap[a.questionId] = String(a.selectedOptionId);
            });
            setAnswers(ansMap);
            setHasStarted(true);
            return;
        }

        const savedProgress = localStorage.getItem(STORAGE_KEY);
        if (savedProgress) {
            try {
                const parsed = JSON.parse(savedProgress);
                if (parsed.assessmentId === assessment.id) {
                    setAnswers(parsed.answers || {});
                    setFlaggedQuestions(new Set(parsed.flaggedQuestions || []));
                    if (parsed.timeLeft) {
                        setTimeLeft(parsed.timeLeft);
                    }
                    setHasStarted(true); // Auto-resume
                }
            } catch (e) {
                console.error("Failed to load progress", e);
            }
        }
    }, [assessment.id, attemptId, reviewMode, existingAnswers]);

    // Save progress to LocalStorage on change (Only if not in review mode)
    useEffect(() => {
        if (hasStarted && !reviewMode) {
            const stateToSave = {
                assessmentId: assessment.id,
                answers,
                flaggedQuestions: Array.from(flaggedQuestions),
                timeLeft,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        }
    }, [answers, flaggedQuestions, timeLeft, hasStarted, assessment.id, reviewMode]);

    // Timer logic (Skip in review mode)
    useEffect(() => {
        if (!hasStarted || reviewMode) return;
        if (timeLeft <= 0) {
            handleSubmit();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [hasStarted, timeLeft, reviewMode]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                setIsFullScreen(true);
            }).catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullScreen(false);
            }
        }
    };

    // Listen for fullscreen changes
    useEffect(() => {
        const handleFullScreenChange = () => {
             setIsFullScreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFullScreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullScreenChange);
    }, []);

    const handleAnswer = (value: string) => {
        if (reviewMode) return;
        setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
    };

    const toggleFlag = () => {
        if (reviewMode) return;
        const newFlags = new Set(flaggedQuestions);
        if (newFlags.has(currentQuestion.id)) {
            newFlags.delete(currentQuestion.id);
        } else {
            newFlags.add(currentQuestion.id);
        }
        setFlaggedQuestions(newFlags);
    };

    const handleSubmit = async () => {
        if (reviewMode) {
            router.push('/learning/assessments');
            return;
        }

        try {
            setIsSubmitting(true);
            const formattedAnswers = Object.entries(answers).map(([qId, optId]) => ({
                questionId: Number(qId),
                selectedOptionId: Number(optId)
            }));

            await apiService.submitAssessment(assessment.id, formattedAnswers);
            localStorage.removeItem(STORAGE_KEY);
            toast.success("Assessment submitted successfully!");
            router.push('/learning/assessments');
            if (document.fullscreenElement) document.exitFullscreen();

        } catch (error) {
            console.error("Error submitting assessment:", error);
            toast.error("Failed to submit assessment. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!hasStarted && !reviewMode) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                    <h1 className="text-2xl font-bold mb-4">{assessment.title}</h1>
                    <div className="space-y-4 mb-8 text-left text-gray-600">
                        <p>• Duration: {duration} minutes</p>
                        <p>• Questions: {assessment.questions.length}</p>
                        <p>• Once started, the timer cannot be paused.</p>
                        <p>• Please ensure you have a stable internet connection.</p>
                        <p>• Do not switch tabs or exit full screen.</p>
                    </div>
                    <Button 
                        size="lg" 
                        className="w-full bg-[#fd6c22] hover:bg-[#e55b18]"
                        onClick={() => {
                            toggleFullScreen();
                            setHasStarted(true);
                        }}
                    >
                        Start Assessment
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
                <div className="flex flex-col">
                    <h1 className="font-bold text-lg truncate max-w-[300px]">{assessment.title}</h1>
                    {reviewMode && <span className="text-xs text-blue-600 font-medium">REVIEW MODE</span>}
                </div>
                
                <div className="flex items-center gap-6">
                    {!reviewMode && (
                        <div className={`flex items-center gap-2 font-mono text-xl font-bold ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-[#fd6c22]'}`}>
                            <Clock className="w-5 h-5" />
                            {formatTime(timeLeft)}
                        </div>
                    )}
                    <Button variant="ghost" size="sm" onClick={toggleFullScreen}>
                        {isFullScreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                    </Button>
                </div>
            </div>

            <div className="flex-1 container mx-auto max-w-5xl p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Question Area */}
                <div className="md:col-span-3 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border min-h-[400px] flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                            <span className="text-sm font-medium text-gray-500">Question {currentQuestionIndex + 1} of {assessment.questions.length}</span>
                            {!reviewMode && (
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={toggleFlag}
                                    className={flaggedQuestions.has(currentQuestion.id) ? "text-yellow-500" : "text-gray-400"}
                                >
                                    <Flag className="w-4 h-4 mr-2" />
                                    {flaggedQuestions.has(currentQuestion.id) ? "Flagged" : "Flag for Review"}
                                </Button>
                            )}
                        </div>

                        <div className="flex-1">
                            <div 
                                className="text-xl font-medium mb-8 leading-relaxed prose max-w-none"
                                dangerouslySetInnerHTML={{ __html: currentQuestion.text }}
                            />
                            
                            <RadioGroup 
                                value={answers[currentQuestion.id] || ""} 
                                onValueChange={handleAnswer}
                                className="space-y-3"
                            >
                                {currentQuestion.options.map((option) => {
                                    const isSelected = answers[currentQuestion.id] === String(option.id);
                                    let itemClass = "border p-4 rounded-lg transition-colors cursor-pointer flex items-center space-x-3";
                                    
                                    if (reviewMode) {
                                        itemClass += " cursor-default"; // Disable pointer
                                        if (option.is_correct) {
                                            itemClass += " bg-green-50 border-green-500"; // Highlight correct answer
                                        } else if (isSelected && !option.is_correct) {
                                            itemClass += " bg-red-50 border-red-500"; // Highlight incorrect student selection
                                        }
                                    } else {
                                        itemClass += " hover:bg-gray-50";
                                        if (isSelected) itemClass += " border-[#fd6c22] bg-orange-50";
                                    }

                                    return (
                                        <div key={option.id} className={itemClass}>
                                            <RadioGroupItem value={String(option.id)} id={String(option.id)} disabled={reviewMode} />
                                            <Label htmlFor={String(option.id)} className="flex-1 cursor-pointer text-base font-normal flex justify-between items-center">
                                                <span className="flex-1">{option.text}</span>
                                                {reviewMode && option.is_correct && <CheckCircle className="w-5 h-5 text-green-600" />}
                                                {reviewMode && isSelected && !option.is_correct && <XCircle className="w-5 h-5 text-red-600" />}
                                            </Label>
                                        </div>
                                    );
                                })}
                            </RadioGroup>
                        </div>

                        <div className="mt-8 flex justify-between pt-6 border-t">
                            <Button 
                                variant="outline" 
                                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                                disabled={currentQuestionIndex === 0}
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                            </Button>
                            
                            {currentQuestionIndex === assessment.questions.length - 1 ? (
                                <Button 
                                    className={reviewMode ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"}
                                    onClick={() => {
                                        if (reviewMode) {
                                            router.push('/learning/assessments');
                                        } else if (confirm("Are you sure you want to submit?")) {
                                            handleSubmit();
                                        }
                                    }}
                                    disabled={isSubmitting}
                                >
                                    {reviewMode ? "Exit Review" : (isSubmitting ? "Submitting..." : "Submit Assessment")}
                                </Button>
                            ) : (
                                <Button 
                                    className="bg-[#fd6c22] hover:bg-[#e55b18]"
                                    onClick={() => setCurrentQuestionIndex(prev => Math.min(assessment.questions.length - 1, prev + 1))}
                                >
                                    Next <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar / Question Palette */}
                <div className="md:col-span-1">
                    <div className="bg-white p-4 rounded-lg shadow-sm border sticky top-24">
                        <h3 className="font-medium mb-4">Question Palette</h3>
                        <div className="grid grid-cols-5 gap-2">
                            {assessment.questions.map((q, idx) => {
                                const isAnswered = !!answers[q.id];
                                const isFlagged = flaggedQuestions.has(q.id);
                                const isCurrent = currentQuestionIndex === idx;
                                
                                let btnClass = "h-8 w-8 rounded flex items-center justify-center text-sm font-medium transition-colors relative ";
                                
                                if (isCurrent) btnClass += "ring-2 ring-[#fd6c22] ring-offset-1 ";
                                
                                if (reviewMode) {
                                    // In review, color by correctness
                                    const studentAnsId = answers[q.id];
                                    const correctOpt = q.options.find(o => o.is_correct);
                                    const isCorrect = studentAnsId && String(correctOpt?.id) === String(studentAnsId);
                                    
                                    if (isCorrect) btnClass += "bg-green-100 text-green-800 border border-green-200";
                                    else btnClass += "bg-red-100 text-red-800 border border-red-200";
                                } else {
                                    if (isAnswered) btnClass += "bg-[#fd6c22] text-white";
                                    else btnClass += "bg-gray-100 text-gray-600 hover:bg-gray-200";
                                    
                                    if (isFlagged && !isAnswered) btnClass += " bg-yellow-100 text-yellow-700";
                                }

                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => setCurrentQuestionIndex(idx)}
                                        className={btnClass}
                                    >
                                        {idx + 1}
                                        {!reviewMode && isFlagged && (
                                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        
                        {!reviewMode ? (
                            <div className="mt-6 space-y-2 text-xs text-gray-500">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-[#fd6c22]" /> Answered
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-gray-100 border" /> Not Answered
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-200" /> Flagged
                                </div>
                            </div>
                        ) : (
                            <div className="mt-6 space-y-2 text-xs text-gray-500">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-green-100 border border-green-200" /> Correct
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-red-100 border border-red-200" /> Incorrect
                                </div>
                            </div>
                        )}

                        <Button 
                            variant="outline" 
                            className={`w-full mt-6 ${reviewMode ? 'text-blue-600 border-blue-200' : 'text-red-600 border-red-200'}`}
                            onClick={() => {
                                if (reviewMode) {
                                    router.push('/learning/assessments');
                                } else if (confirm("Are you sure you want to submit?")) {
                                    handleSubmit();
                                }
                            }}
                            disabled={isSubmitting}
                        >
                             {reviewMode ? "Exit Review" : (isSubmitting ? "Submitting..." : "Submit Assessment")}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssessmentPlayer;
