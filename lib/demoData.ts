import { DemoSchool, demoSchoolSeed } from "@/data/demoSchool";

const STORAGE_KEY = "demoSchool";

export function getDemoSchool(): DemoSchool {
  if (typeof window === "undefined") return demoSchoolSeed;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demoSchoolSeed));
      return demoSchoolSeed;
    }
    return JSON.parse(raw) as DemoSchool;
  } catch {
    return demoSchoolSeed;
  }
}

export function setDemoSchool(next: DemoSchool) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function addDemoStudent(student: DemoSchool["students"][number]) {
  const current = getDemoSchool();
  const next: DemoSchool = {
    ...current,
    students: [...current.students, student],
    analytics: {
      ...current.analytics,
      totalStudents: current.students.length + 1,
    },
  };
  setDemoSchool(next);
  return next;
}


