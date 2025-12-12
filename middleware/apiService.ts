// services/apiServices.ts

import axios from "axios";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

interface AuthResponse {
  msg?: string;
  accessToken?: string; // Include the JWT token in the response type
  error: string;
  data?: {
    uuid: string;
    email: string;
    first_name: string;
    role: number;
  };
}

export interface LoginData {
  email?: string;
  phone?: string;
  password: string;
}

export interface PhoneOTPRequestData {
  phone: string;
}

export interface PhoneOTPVerifyData {
  phone: string;
  otp: string;
}

export interface RegisterData {
  first_name: string;
  child_name: string;
  email: string;
  password: string;
  level: string;
}

export interface SchoolLoginData {
  accessCode: string;
  userData?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
}

interface ForgotPasswordData {
  emailAddress: string;
}

interface ResetPasswordData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}
interface coinsData {
  coins: number;
}

apiClient.interceptors.request.use((config: any) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
export const apiCaller = apiClient;

export const apiService = {
  login: async (data: LoginData) => {
    const response = await apiClient
      .post("auth/login", data, { headers: { Authorization: null } })
      .catch((error) => {
        console.log(error);
        return error;
      });
    if (response.data?.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("user", JSON.stringify(response.data));
    }
    try {
      if (response.response.data.msg == "jwt expired") {
        console.log("jwt expired");
        localStorage.removeItem("accessToken");
        apiService.login(data);
      }
    } catch (e) {
      console.log(e);
    }

    return response;
  },

  register: async (data: RegisterData) => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    const response = await apiClient.post("auth/register", data, {
      headers: { Authorization: null },
    });
    if (response.data?.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("user", JSON.stringify(response.data));
    }
    try {
      if (response.data.msg == "jwt expired") {
        console.log("jwt expired");
        localStorage.removeItem("accessToken");
        apiService.register(data);
      }
    } catch (e) {
      console.log(e);
    }
    console.log(response);
    return response;
  },

  forgotPassword: async (data: ForgotPasswordData) => {
    const response = await apiClient.post("auth/forgot-password", data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordData) => {
    const response = await apiClient.post("auth/reset-password", data);
    return response.data;
  },
  profile: async () => {
    const response = await apiClient.get("");
    localStorage.setItem("user", JSON.stringify(response.data));
    return response.data.data;
  },
  getChatbotResponse: async (
    message: string,
    model: string = "gpt-3.5-turbo"
  ) => {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: model,
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: message },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content;
  },

  // School authentication methods
  validateAccessCode: async (accessCode: string) => {
    const response = await apiClient.get(`/school/validate-access-code/${accessCode}`);
    return response.data;
  },

  loginWithAccessCode: async (data: SchoolLoginData) => {
    const response = await apiClient.post("/school/login-with-access-code", data);
    return response.data;
  },
  
  // Onboarding: create school (public)
  saveSchool: async (data: { name: string; address?: string; city?: string; country?: string }) => {
    const response = await apiClient.post("/school/onboarding-create", data, { headers: { Authorization: null } });
    return response.data;
  },

  // Phone authentication methods
  requestPhoneOTP: async (data: PhoneOTPRequestData) => {
    const response = await apiClient.post("auth/request-phone-otp", data, {
      headers: { Authorization: null },
    });
    return response;
  },

  verifyPhoneOTP: async (data: PhoneOTPVerifyData) => {
    const response = await apiClient.post("auth/verify-phone-otp", data, {
      headers: { Authorization: null },
    });
    if (response.data?.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("user", JSON.stringify(response.data));
    }
    return response;
  },

  // --- CBT Assessment Methods ---
  
  // Admin
  getAssessments: async () => {
    const response = await apiClient.get("/admin/assessments");
    return response.data;
  },
  
  getAssessmentById: async (id: string) => {
    const response = await apiClient.get(`/admin/assessments/${id}`);
    return response.data;
  },

  createAssessment: async (data: any) => {
    const response = await apiClient.post("/admin/assessments", data);
    return response.data;
  },

  updateAssessment: async (id: string, data: any) => {
    const response = await apiClient.put(`/admin/assessments/${id}`, data);
    return response.data;
  },

  deleteAssessment: async (id: string) => {
    const response = await apiClient.delete(`/admin/assessments/${id}`);
    return response.data;
  },

  // Student
  getStudentAssessments: async (classId?: string) => {
    const query = classId ? `?classId=${classId}` : "";
    const response = await apiClient.get(`/assessments${query}`);
    return response.data;
  },

  startAssessment: async (id: string) => {
    const response = await apiClient.post(`/assessments/${id}/start`);
    return response.data;
  },

  submitAssessment: async (id: string, answers: any[]) => {
    const response = await apiClient.post(`/assessments/${id}/submit`, { answers });
    return response.data;
  },

  // Helpers for Dropdowns (Assuming these exist or should be added)
  getClasses: async () => {
      const response = await apiClient.get("/admin/classes"); // Adjust route if needed
      return response.data;
  },
  
  getSubjects: async () => {
      const response = await apiClient.get("/admin/subjects");
      return response.data;
  }
};
