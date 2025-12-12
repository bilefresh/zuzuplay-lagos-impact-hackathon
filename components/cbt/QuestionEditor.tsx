"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { X, Plus, Save } from "lucide-react";
import RichTextEditor from "./RichTextEditor";

export interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'true-false';
  points: number;
  options: { id: string; text: string }[];
  correctAnswerId: string;
}

interface QuestionEditorProps {
  onSave: (question: Question) => void;
  onCancel: () => void;
  initialQuestion?: Question | null;
}

const QuestionEditor = ({ onSave, onCancel, initialQuestion }: QuestionEditorProps) => {
  const [text, setText] = useState(initialQuestion?.text || "");
  const [type, setType] = useState<'multiple-choice' | 'true-false'>(initialQuestion?.type || "multiple-choice");
  const [points, setPoints] = useState(initialQuestion?.points || 1);
  const [options, setOptions] = useState<{ id: string; text: string }[]>(
    initialQuestion?.options || [
      { id: '1', text: '' },
      { id: '2', text: '' },
      { id: '3', text: '' },
      { id: '4', text: '' },
    ]
  );
  const [correctAnswerId, setCorrectAnswerId] = useState(initialQuestion?.correctAnswerId || "");

  useEffect(() => {
    if (type === 'true-false') {
        setOptions([
            { id: 'true', text: 'True' },
            { id: 'false', text: 'False' }
        ]);
        if (correctAnswerId !== 'true' && correctAnswerId !== 'false') {
             setCorrectAnswerId('true');
        }
    } else if (type === 'multiple-choice' && (options.length === 2 && options[0].id === 'true')) {
        // Switching back from T/F, reset options to 4 defaults
        setOptions([
            { id: '1', text: '' },
            { id: '2', text: '' },
            { id: '3', text: '' },
            { id: '4', text: '' },
        ]);
        setCorrectAnswerId('');
    }
  }, [type]);

  const handleAddOption = () => {
    const newId = String(options.length + 1);
    setOptions([...options, { id: newId, text: "" }]);
  };

  const handleOptionChange = (id: string, value: string) => {
    setOptions(options.map((opt) => (opt.id === id ? { ...opt, text: value } : opt)));
  };

  const handleRemoveOption = (id: string) => {
    if (options.length <= 2) return;
    setOptions(options.filter((opt) => opt.id !== id));
    if (correctAnswerId === id) setCorrectAnswerId("");
  };

  const handleSave = () => {
    if (!text || !correctAnswerId) {
        alert("Please fill in the question text and select a correct answer.");
        return;
    }
    // Basic validation: ensure options have text for multiple choice
    if (type === 'multiple-choice' && options.some(opt => !opt.text.trim())) {
        alert("Please fill in all option fields.");
        return;
    }
    
    const question: Question = {
      id: initialQuestion?.id || Date.now().toString(),
      text,
      type,
      points,
      options,
      correctAnswerId,
    };
    onSave(question);
  };

  return (
    <div className="space-y-6 border p-6 rounded-lg bg-white shadow-sm">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>Question Text</Label>
          <RichTextEditor 
            value={text} 
            onChange={setText} 
            placeholder="Type your question here... (Supports basic math like x^2)"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Question Type</Label>
            <Select
              value={type}
              onValueChange={(val: any) => setType(val)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                <SelectItem value="true-false">True / False</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Points</Label>
            <Input
              type="number"
              min={1}
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Answer Options</Label>
          <RadioGroup value={correctAnswerId} onValueChange={setCorrectAnswerId} className="gap-3">
            {options.map((option, index) => (
              <div key={option.id} className="flex items-center gap-3">
                <RadioGroupItem value={option.id} id={`opt-${option.id}`} />
                <div className="flex-1">
                    <Input
                        value={option.text}
                        onChange={(e) => handleOptionChange(option.id, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        disabled={type === 'true-false'} // Disable editing text for T/F
                        className={correctAnswerId === option.id ? "border-green-500 ring-1 ring-green-500" : ""}
                    />
                </div>
                {type === 'multiple-choice' && options.length > 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveOption(option.id)}
                    className="h-8 w-8 text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </RadioGroup>
          
          {type === 'multiple-choice' && (
            <Button
                variant="outline"
                size="sm"
                onClick={handleAddOption}
                className="w-fit mt-2"
            >
                <Plus className="h-4 w-4 mr-2" /> Add Option
            </Button>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave} className="bg-[#4fc3f7] hover:bg-[#e55b18]">
            <Save className="w-4 h-4 mr-2" />
            {initialQuestion ? "Update Question" : "Add Question"}
        </Button>
      </div>
    </div>
  );
};

export default QuestionEditor;
