export type DemoStudentReport = {
  totalQuizzesTaken: number;
  averageScorePercent: number;
  accuracyRatePercent: number;
  recentTopics: string[];
};

export type DemoStudent = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  level: string; // e.g., "Year 4"
  accessCode: string;
  avatarUrl?: string;
  report: DemoStudentReport;
};

export type DemoTeacher = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  classes: string[]; // e.g., ["Year 4", "Year 5"]
};

export type DemoAnalytics = {
  totalStudents: number;
  totalTeachers: number;
  weeklyActiveStudents: number;
  averageAccuracyPercent: number;
  topClassesByEngagement: { className: string; engagementScore: number }[];
};

export type DemoPlan = {
  name: string;
  price: number;
  currency: string; // e.g., "NGN"
  billingInterval: "monthly" | "yearly";
};

export type DemoPaymentMethod = {
  brand: string; // e.g., "visa"
  last4: string;
  exp_month: number;
  exp_year: number;
};

export type DemoInvoice = {
  id: string;
  date: string; // ISO string
  amount: number;
  currency: string;
  status: "paid" | "due" | "failed";
  description?: string;
};

export type DemoBilling = {
  plan: DemoPlan;
  paymentMethod: DemoPaymentMethod;
  invoices: DemoInvoice[];
};

export type DemoSchool = {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  accessCode: string;
  classes: string[];
  teachers: DemoTeacher[];
  students: DemoStudent[];
  analytics: DemoAnalytics;
  billing: DemoBilling;
};

export const demoSchoolSeed: DemoSchool = {
  id: "demo-school-001",
  name: "Jonia Primary School",
  address: "12 Hope Street",
  city: "London",
  country: "UK",
  accessCode: "JONIA1",
  classes: ["Year 4", "Year 5", "Year 6"],
  teachers: [
    { id: "t-1", firstName: "Sarah", lastName: "Hughes", email: "sarah.hughes@example.com", classes: ["Year 4"] },
    { id: "t-2", firstName: "Michael", lastName: "Brown", email: "michael.brown@example.com", classes: ["Year 5", "Year 6"] },
  ],
  students: [
    {
      id: "s-1",
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@example.com",
      level: "Year 5",
      accessCode: "5JND48",
      report: {
        totalQuizzesTaken: 18,
        averageScorePercent: 82,
        accuracyRatePercent: 87,
        recentTopics: ["Fractions", "Decimals", "Word Problems"],
      },
    },
    {
      id: "s-2",
      firstName: "Ayo",
      lastName: "Akin",
      email: "ayo.akin@example.com",
      level: "Year 4",
      accessCode: "4AYO12",
      report: {
        totalQuizzesTaken: 12,
        averageScorePercent: 76,
        accuracyRatePercent: 80,
        recentTopics: ["Addition", "Subtraction"],
      },
    },
  ],
  analytics: {
    totalStudents: 2,
    totalTeachers: 2,
    weeklyActiveStudents: 2,
    averageAccuracyPercent: 84,
    topClassesByEngagement: [
      { className: "Year 5", engagementScore: 92 },
      { className: "Year 4", engagementScore: 81 },
    ],
  },
  billing: {
    plan: { name: "Standard", price: 15000, currency: "NGN", billingInterval: "monthly" },
    paymentMethod: { brand: "visa", last4: "4242", exp_month: 12, exp_year: 2028 },
    invoices: [
      { id: "inv-001", date: new Date().toISOString(), amount: 15000, currency: "NGN", status: "paid", description: "Monthly subscription" },
      { id: "inv-000", date: new Date(Date.now() - 30*24*3600*1000).toISOString(), amount: 15000, currency: "NGN", status: "paid", description: "Monthly subscription" },
    ],
  },
};


