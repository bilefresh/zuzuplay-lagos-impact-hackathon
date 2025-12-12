"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiService } from "@/middleware/apiService";

// Schema
const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  class_id: z.string().min(1, "Please select a class"),
  subject_id: z.string().min(1, "Please select a subject"),
  duration_minutes: z.coerce.number().min(5, "Duration must be at least 5 minutes"),
  scheduled_date: z.date({
    required_error: "A scheduled date is required",
  }),
  instructions: z.string().optional(),
});

interface AssessmentConfigFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  initialData: any;
}

const AssessmentConfigForm = ({ onSubmit, initialData }: AssessmentConfigFormProps) => {
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      class_id: initialData?.class_id || "",
      subject_id: initialData?.subject_id || "",
      duration_minutes: initialData?.duration_minutes || 60,
      scheduled_date: initialData?.scheduled_date ? new Date(initialData.scheduled_date) : undefined,
      instructions: initialData?.instructions || "",
    },
  });

  useEffect(() => {
      const fetchData = async () => {
          try {
              const [classesRes, subjectsRes] = await Promise.all([
                  apiService.getClasses(), // Ensure this endpoint exists or use mock
                  apiService.getSubjects()
              ]);
              
              // Handle response structure variations (e.g., { data: [...] } vs [...])
              setClasses(classesRes.data || classesRes || []); 
              setSubjects(subjectsRes.data || subjectsRes || []);
          } catch (err) {
              console.error("Error fetching config data:", err);
          }
      };
      fetchData();
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Assessment Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Mid-term Mathematics Assessment" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Class */}
             <FormField
              control={form.control}
              name="class_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classes.length > 0 ? classes.map((cls: any) => (
                          <SelectItem key={cls.id} value={String(cls.id)}>{cls.name}</SelectItem>
                      )) : (
                          <SelectItem value="mock-class" disabled>Loading classes...</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Subject */}
            <FormField
              control={form.control}
              name="subject_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects.length > 0 ? subjects.map((sub: any) => (
                          <SelectItem key={sub.id} value={String(sub.id)}>{sub.name}</SelectItem>
                      )) : (
                          <SelectItem value="mock-subject" disabled>Loading subjects...</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Duration */}
            <FormField
              control={form.control}
              name="duration_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (Minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date Picker */}
            <FormField
              control={form.control}
              name="scheduled_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Scheduled Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date()
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Instructions */}
             <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Instructions for Students</FormLabel>
                  <FormControl>
                    <Textarea 
                        placeholder="Enter instructions..." 
                        className="min-h-[100px]"
                        {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <div className="flex justify-end">
            <Button type="submit" className="bg-[#fd6c22] hover:bg-[#e55b18]">Next Step</Button>
        </div>
      </form>
    </Form>
  );
};

export default AssessmentConfigForm;
