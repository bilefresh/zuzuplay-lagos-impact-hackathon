import { apiCaller } from "@/middleware/apiService";

const base = "school";

export const schoolService = {
  // Students
  getStudents: (params: { schoolId: number; name?: string; level?: string; page?: number; limit?: number }) =>
    apiCaller.get(`${base}/students`, { params }),
  addStudent: (data: { school_id: number; child_id: number }) => apiCaller.post(`${base}/students`, data),
  removeStudent: (id: number) => apiCaller.delete(`${base}/students/${id}`),

  // Teachers
  getTeachers: (params: { schoolId: number; name?: string; subject?: string; page?: number; limit?: number }) =>
    apiCaller.get(`${base}/teachers`, { params }),
  createTeacher: (data: { school_id: number; first_name: string; last_name: string; email: string; subject?: string }) =>
    apiCaller.post(`${base}/teachers`, data),
  updateTeacher: (id: number, data: Partial<{ school_id: number; first_name: string; last_name: string; email: string; subject?: string }>) =>
    apiCaller.put(`${base}/teachers/${id}`, data),
  deleteTeacher: (id: number) => apiCaller.delete(`${base}/teachers/${id}`),

  // Billing
  getPlan: (schoolId: number) => apiCaller.get(`${base}/billing/plan`, { params: { schoolId } }),
  updatePlan: (data: { school_id: number; plan_id: number }) => apiCaller.post(`${base}/billing/plan`, data),
  getPaymentMethod: (schoolId: number) => apiCaller.get(`${base}/billing/payment-method`, { params: { schoolId } }),
  updatePaymentMethod: (data: { school_id: number; brand: string; last4: string; exp_month: number; exp_year: number }) =>
    apiCaller.post(`${base}/billing/payment-method`, data),
  getInvoices: (params: { schoolId: number; page?: number; limit?: number }) =>
    apiCaller.get(`${base}/billing/invoices`, { params }),

  // Classes
  getClasses: (schoolId: number) => apiCaller.get(`${base}/classes`, { params: { schoolId } }),
  createClass: (data: { school_id: number; name: string }) => apiCaller.post(`${base}/classes`, data),
  enrollStudent: (data: { classroom_id: number; child_id: number }) => apiCaller.post(`${base}/classes/enroll`, data),
  unenrollStudent: (id: number) => apiCaller.delete(`${base}/classes/enroll/${id}`),

  // Assignments
  listAssignments: (params: { classroomId?: number; teacherId?: number; page?: number; limit?: number }) =>
    apiCaller.get(`${base}/assignments`, { params }),
  createAssignment: (data: { teacher_id: number; classroom_id: number; title: string; due_date?: string | null; questions: { question: string; options: string[]; answer: string }[] }) =>
    apiCaller.post(`${base}/assignments`, data),
};

export type SchoolService = typeof schoolService;


