"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { apiService } from "@/middleware/apiService";

// Assets
const backArrow = "http://localhost:3845/assets/a79f9271df139eb0e177f5900ceb107416844b1b.svg";

export default function AccessCodeLoginPage() {
  const router = useRouter();
  const [accessCode, setAccessCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Validate access code
      const validationResponse = await apiService.validateAccessCode(accessCode);
      
      if (!validationResponse.success) {
        setError(validationResponse.message || "Invalid access code. Please check and try again.");
        return;
      }

      // Login with access code
      const loginResponse = await apiService.loginWithAccessCode({
        accessCode,
        userData: {
          // Add any additional user data if needed
        }
      });

      if (loginResponse.success) {
        // Store token and user data
        localStorage.setItem('accessToken', loginResponse.data.token);
        localStorage.setItem('userData', JSON.stringify(loginResponse.data.user));
        
        // Redirect to dashboard
        router.push("/learning/dashboard");
      } else {
        setError(loginResponse.message || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = accessCode.length >= 6;

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center gap-2 p-4"
          onClick={() => router.back()}
      >
        <button
          className="w-6 h-6 flex items-center justify-center"
        >
          <Image src={backArrow} alt="Back" width={24} height={24} />
        </button>
        <span className="text-[#58514d] text-base font-normal">Back</span>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:flex items-center gap-2 p-6">
        <button
          onClick={() => router.back()}
          className="w-6 h-6 flex items-center justify-center"
        >
          <Image src={backArrow} alt="Back" width={24} height={24} />
        </button>
        <span className="text-[#58514d] text-base font-normal">Back</span>
      </div>

      {/* Content */}
      <div className="px-4 lg:px-20 py-8">
        {/* Title */}
        <h1 className="text-[#291b13] text-xl lg:text-2xl font-bold text-center lg:text-left mb-8 font-['Comic_Sans_MS']">
          Access Code Login
        </h1>

        {/* Subtitle */}
        <p className="text-[#58514d] text-base text-center mb-8 font-['Work_Sans'] tracking-[-0.32px]">
          Enter your school access code to continue
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-md mx-auto lg:max-w-none lg:mx-0 lg:w-[450px]">
          <div className="space-y-6">
            {/* Access Code Input */}
            <div className="flex flex-col gap-2">
              <label className="text-[#58514d] text-base font-normal font-['Work_Sans'] tracking-[-0.32px]">
                Access Code
              </label>
              <input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                placeholder="Enter your school access code"
                className="w-full h-14 px-6 border border-[#d5d7d5] rounded-lg text-base font-['Work_Sans'] placeholder:text-[#9c9c9c] focus:outline-none focus:border-[#fd6c22] text-center tracking-widest"
                maxLength={10}
                required
              />
              {error && (
                <p className="text-red-500 text-sm font-['Work_Sans']">
                  {error}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className={`
              w-full h-14 rounded-lg border-2 font-bold text-base font-['Comic_Sans_MS'] mt-8
              transition-all duration-200
              ${isFormValid && !isLoading
                ? 'bg-[#fd6c22] border-[#06113c] text-[#3651ab] hover:bg-[#fea679]'
                : 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <div className="relative h-full flex items-center justify-center">
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-[300px] h-1.5 bg-[#fea679] rounded-full" />
              <span className="relative z-10">
                {isLoading ? "Signing in..." : "Sign In"}
              </span>
            </div>
          </button>
        </form>

        {/* Alternative Login Options */}
        <div className="max-w-md mx-auto lg:max-w-none lg:mx-0 lg:w-[450px] mt-6">
          <div className="text-center">
            <p className="text-[#58514d] text-base font-['Work_Sans'] tracking-[-0.32px] mb-4">
              Don&apos;t have an access code?
            </p>
            <Link 
              href="/login-new" 
              className="text-[#fd6c22] text-base font-bold font-['Work_Sans'] hover:underline"
            >
              Try email login instead
            </Link>
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="max-w-md mx-auto lg:max-w-none lg:mx-0 lg:w-[450px] mt-6">
          <p className="text-[#58514d] text-base text-center font-['Work_Sans'] tracking-[-0.32px]">
            <span>Don&apos;t have an account?</span>
            <Link href="/onboarding/step1" className="font-bold text-[#fd6c22] ml-1">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
