"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { apiService } from "@/middleware/apiService";

// Assets
const backArrow = "http://localhost:3845/assets/a79f9271df139eb0e177f5900ceb107416844b1b.svg";

interface ParentFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  childName: string;
  childClass: string;
  password: string;
  confirmPassword: string;
}

export default function ParentForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<ParentFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    childName: "",
    childClass: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (field: keyof ParentFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      // Prepare registration data according to API schema
      const registrationData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        child_name: formData.childName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        level: formData.childClass,
      };

      // Call the registration API
      const response = await apiService.register(registrationData);
      
      if (response.data?.accessToken) {
        // Registration successful, redirect to dashboard
        router.push('/learning/dashboard');
      } else {
        setError(response.data?.msg || "Registration failed. Please try again.");
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.response?.data?.msg || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.firstName && formData.lastName && formData.email && formData.phone && formData.childName && formData.childClass && formData.password && formData.confirmPassword;

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center gap-2 p-4">
        <button
          onClick={() => router.back()}
          className="w-6 h-6 flex items-center justify-center"
        >
          <Image src={backArrow} alt="Back" width={24} height={24} />
        </button>
        <span className="text-[#58514d] text-base font-normal">Back</span>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:flex items-center gap-2 p-6"
          onClick={() => router.back()}
      >
        <button
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
          Get Started
        </h1>

        {/* Error Message */}
        {error && (
          <div className="max-w-md mx-auto lg:max-w-none lg:mx-0 lg:w-[450px] mb-4">
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-md mx-auto lg:max-w-none lg:mx-0 lg:w-[450px]">
          <div className="space-y-6">
            {/* First Name */}
            <div className="flex flex-col gap-2">
              <label className="text-[#58514d] text-base font-normal font-['Work_Sans'] tracking-[-0.32px]">
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Enter your first name"
                className="w-full h-14 px-6 border border-[#d5d7d5] rounded-lg text-base font-['Work_Sans'] placeholder:text-[#9c9c9c] focus:outline-none focus:border-[#fd6c22]"
                required
              />
            </div>

            {/* Last Name */}
            <div className="flex flex-col gap-2">
              <label className="text-[#58514d] text-base font-normal font-['Work_Sans'] tracking-[-0.32px]">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Enter your last name"
                className="w-full h-14 px-6 border border-[#d5d7d5] rounded-lg text-base font-['Work_Sans'] placeholder:text-[#9c9c9c] focus:outline-none focus:border-[#fd6c22]"
                required
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-[#58514d] text-base font-normal font-['Work_Sans'] tracking-[-0.32px]">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
                className="w-full h-14 px-6 border border-[#d5d7d5] rounded-lg text-base font-['Work_Sans'] placeholder:text-[#9c9c9c] focus:outline-none focus:border-[#fd6c22]"
                required
              />
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-2">
              <label className="text-[#58514d] text-base font-normal font-['Work_Sans'] tracking-[-0.32px]">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
                className="w-full h-14 px-6 border border-[#d5d7d5] rounded-lg text-base font-['Work_Sans'] placeholder:text-[#9c9c9c] focus:outline-none focus:border-[#fd6c22]"
                required
              />
            </div>

            {/* Child Name */}
            <div className="flex flex-col gap-2">
              <label className="text-[#58514d] text-base font-normal font-['Work_Sans'] tracking-[-0.32px]">
                Child&apos;s Name
              </label>
              <input
                type="text"
                value={formData.childName}
                onChange={(e) => handleInputChange('childName', e.target.value)}
                placeholder="Enter your child&apos;s name"
                className="w-full h-14 px-6 border border-[#d5d7d5] rounded-lg text-base font-['Work_Sans'] placeholder:text-[#9c9c9c] focus:outline-none focus:border-[#fd6c22]"
                required
              />
            </div>

            {/* Child Class */}
            <div className="flex flex-col gap-2">
              <label className="text-[#58514d] text-base font-normal font-['Work_Sans'] tracking-[-0.32px]">
                Child&apos;s Class
              </label>
              <select
                value={formData.childClass}
                onChange={(e) => handleInputChange('childClass', e.target.value)}
                className="w-full h-14 px-6 border border-[#d5d7d5] rounded-lg text-base font-['Work_Sans'] focus:outline-none focus:border-[#fd6c22]"
                required
              >
                <option value="">Select class</option>
                <option value="primary 1">Primary 1</option>
                <option value="primary 2">Primary 2</option>
                <option value="primary 3">Primary 3</option>
                <option value="primary 4">Primary 4</option>
                <option value="primary 5">Primary 5</option>
                <option value="primary 6">Primary 6</option>
              </select>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-[#58514d] text-base font-normal font-['Work_Sans'] tracking-[-0.32px]">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Enter your password"
                className="w-full h-14 px-6 border border-[#d5d7d5] rounded-lg text-base font-['Work_Sans'] placeholder:text-[#9c9c9c] focus:outline-none focus:border-[#fd6c22]"
                required
                minLength={8}
              />
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-2">
              <label className="text-[#58514d] text-base font-normal font-['Work_Sans'] tracking-[-0.32px]">
                Confirm Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Confirm your password"
                className="w-full h-14 px-6 border border-[#d5d7d5] rounded-lg text-base font-['Work_Sans'] placeholder:text-[#9c9c9c] focus:outline-none focus:border-[#fd6c22]"
                required
                minLength={8}
              />
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
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </span>
            </div>
          </button>
        </form>

        {/* Login Link */}
        <div className="max-w-md mx-auto lg:max-w-none lg:mx-0 lg:w-[450px] mt-6">
          <p className="text-[#58514d] text-base text-center font-['Work_Sans'] tracking-[-0.32px]">
            <span>Already have an account?</span>
            <Link href="/login" className="font-bold text-[#fd6c22] ml-1">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
