import React from "react";
import fs from "fs";
import path from "path";
import SubjectScreenClient from "./client";

export async function generateStaticParams() {
  try {
    const filePath = path.join(process.cwd(), "public/data/lessons-complete.json");
    const fileContents = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(fileContents);

    // Extract unique subjects from the lessons data
    const subjects = new Set<string>();
    data.chapters.forEach((chapter: any) => {
      // For now, we'll use "Mathematics" as the main subject
      // In the future, this could be expanded based on the data structure
      subjects.add("Mathematics");
    });

    return Array.from(subjects).map((subjectId) => ({
      subjectId: subjectId,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    // Fallback to common subjects
    return [
      { subjectId: "Mathematics" },
      { subjectId: "English" },
      { subjectId: "Science" },
    ];
  }
}

export default function SubjectScreen({
  params,
}: {
  params: { subjectId: string };
}) {
  return <SubjectScreenClient params={params} />;
}