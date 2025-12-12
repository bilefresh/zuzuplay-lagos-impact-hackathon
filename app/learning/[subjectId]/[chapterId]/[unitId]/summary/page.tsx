import React from "react";
import fs from "fs";
import path from "path";
import SummaryScreenClient from "./client";

export async function generateStaticParams() {
  try {
    const filePath = path.join(process.cwd(), "public/data/lessons-complete.json");
    const fileContents = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(fileContents);

    const paths: { subjectId: string; chapterId: string; unitId: string }[] = [];
    // Currently only Mathematics is in the JSON, but we can iterate subjects if needed.
    // Assuming subjectId in URL matches "Mathematics" or other subject names.
    const subjects = ["Mathematics"];

    subjects.forEach((subject) => {
      data.chapters.forEach((chapter: any) => {
        if (chapter.units) {
          chapter.units.forEach((unit: any) => {
            paths.push({
              subjectId: subject,
              chapterId: chapter.id.toString(),
              unitId: unit.id.toString(),
            });
          });
        }
      });
    });

    return paths;
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export default function SummaryScreen({
  params,
}: {
  params: { subjectId: string; chapterId: string; unitId: string };
}) {
  return <SummaryScreenClient params={params} />;
}