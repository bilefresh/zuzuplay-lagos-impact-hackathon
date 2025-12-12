"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/components/common/ProgressBar";
import BackButton from "@/components/common/BackButton";
import useFormData from "@/hooks/useFormData";
import { apiService } from "@/middleware/apiService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as Yup from "yup";

const LoginScreen = () => {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const loginValidationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),
  });

  const phoneValidationSchema = Yup.object().shape({
    phone: Yup.string()
      .min(10, "Phone number must be at least 10 digits")
      .required("Phone number is required"),
  });

  const handleEmailLogin = async () => {
    try {
      setIsLoading(true);
      await loginValidationSchema.validate({ email, password });

      const loginData = { email, password };
      const response = await apiService.login(loginData);

      if (response.status === 200) {
        toast.success("Login successful");
        router.push("/learning/dashboard");
      } else {
        toast.error("Email or Password Incorrect");
      }
    } catch (error: any) {
      if (error instanceof Yup.ValidationError) {
        toast.error(error.message);
      } else {
        toast.error("Email or Password Incorrect");
        console.error(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestOTP = async () => {
    try {
      setIsLoading(true);
      await phoneValidationSchema.validate({ phone });

      const response = await apiService.requestPhoneOTP({ phone });

      if (response.status === 200) {
        toast.success("OTP sent to your WhatsApp!");
        setOtpSent(true);
      } else {
        toast.error("Failed to send OTP. Please check your phone number.");
      }
    } catch (error: any) {
      if (error instanceof Yup.ValidationError) {
        toast.error(error.message);
      } else {
        toast.error(error.response?.data?.msg || "Failed to send OTP. Please ensure your phone number is registered.");
        console.error(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      setIsLoading(true);
      if (!otp || otp.length < 4) {
        toast.error("Please enter a valid OTP");
        return;
      }

      const response = await apiService.verifyPhoneOTP({ phone, otp });

      if (response.status === 200) {
        toast.success("Login successful");
        router.push("/learning/dashboard");
      } else {
        toast.error("Invalid OTP. Please try again.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.msg || "Invalid OTP. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center bg-white h-screen text-black px-4">
      <div className="w-full space-x-5 flex items-center justify-start mb-8">
        <BackButton />
      </div>

      <h2 className="text-lg font-semibold mb-6 text-black text-center">
        Login to your account
      </h2>

      {/* Login Method Tabs */}
      <div className="flex w-full max-w-xs mb-6 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => {
            setLoginMethod("email");
            setOtpSent(false);
          }}
          className={`flex-1 py-2 px-4 rounded-md transition-all ${
            loginMethod === "email"
              ? "bg-[#4fc3f7] text-white"
              : "bg-transparent text-gray-600"
          }`}
        >
          Email
        </button>
        <button
          onClick={() => {
            setLoginMethod("phone");
            setOtpSent(false);
          }}
          className={`flex-1 py-2 px-4 rounded-md transition-all ${
            loginMethod === "phone"
              ? "bg-[#4fc3f7] text-white"
              : "bg-transparent text-gray-600"
          }`}
        >
          Phone
        </button>
      </div>

      {/* Email Login Form */}
      {loginMethod === "email" && (
        <>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            className="p-3 mb-4 w-full max-w-xs border border-gray-300 rounded"
          />
          <div className="relative w-full max-w-xs mb-4">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="p-3 w-full border border-gray-300 rounded"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-500"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
          <button
            onClick={handleEmailLogin}
            disabled={isLoading}
            className="p-3 w-full max-w-xs bg-[#4fc3f7] text-white rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? "Logging in..." : "Login with Email"}
          </button>
        </>
      )}

      {/* Phone Login Form */}
      {loginMethod === "phone" && (
        <>
          {!otpSent ? (
            <>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number (e.g., 08012345678)"
                className="p-3 mb-4 w-full max-w-xs border border-gray-300 rounded"
              />
              <p className="text-sm text-gray-600 mb-4 w-full max-w-xs">
                You will receive an OTP on WhatsApp
              </p>
              <button
                onClick={handleRequestOTP}
                disabled={isLoading}
                className="p-3 w-full max-w-xs bg-[#4fc3f7] text-white rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Sending OTP..." : "Send OTP"}
              </button>
            </>
          ) : (
            <>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP code"
                className="p-3 mb-4 w-full max-w-xs border border-gray-300 rounded"
                maxLength={6}
              />
              <p className="text-sm text-gray-600 mb-4 w-full max-w-xs text-center">
                OTP sent to {phone}
              </p>
              <button
                onClick={handleVerifyOTP}
                disabled={isLoading}
                className="p-3 w-full max-w-xs bg-[#4fc3f7] text-white rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed mb-2"
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </button>
              <button
                onClick={() => setOtpSent(false)}
                className="text-[#4fc3f7] underline text-sm"
              >
                Change phone number
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default LoginScreen;
