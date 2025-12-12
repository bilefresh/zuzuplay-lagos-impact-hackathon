"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { apiService } from "@/middleware/apiService";

// Assets
const backArrow = "/assets/icons/backArrow.svg";
const backgroundImage = "/assets/images/backgroundImage.png";

interface SchoolFormData {
  name: string;
  schoolName: string;
  email: string;
  phone: string;
}

export default function SchoolOnboardingStep2() {
  const router = useRouter();
  const [formData, setFormData] = useState<SchoolFormData>({
    name: "",
    schoolName: "",
    email: "",
    phone: "",
  });

  const handleInputChange = (field: keyof SchoolFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleContinue = async () => {
    // Persist locally
    localStorage.setItem('schoolFormData', JSON.stringify(formData));
    try {
      // Create school via API (public)
      const resp = await apiService.saveSchool({ name: formData.schoolName });
      // Store server result for next step usage
      localStorage.setItem('createdSchool', JSON.stringify(resp?.data ?? resp));
    } catch (e) {
      // Proceed even if API fails, but ideally show error/toast here
      console.error(e);
    }
    router.push("/onboarding/step3");
  };

  const isFormValid = formData.name && formData.schoolName && formData.email && formData.phone;

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute h-full right-0 top-0 w-[491px] hidden lg:block">
        <div className="absolute inset-0">
          <Image
            src={backgroundImage}
            alt="Background"
            fill
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
      </div>

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
      <div className="relative z-10 px-4 lg:px-20 py-8">
        {/* Title */}
        <h1 className="text-[#291b13] text-xl lg:text-2xl font-bold text-center lg:text-left mb-8 font-['Comic_Sans_MS']">
          Get Started
        </h1>

        {/* Form */}
        <div className="max-w-md mx-auto lg:max-w-none lg:mx-0 lg:w-[450px]">
          <div className="space-y-6">
            {/* Name */}
            <div className="flex flex-col gap-2">
              <label className="text-[#58514d] text-base font-normal font-['Work_Sans'] tracking-[-0.32px]">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your first name"
                className="w-full h-14 px-6 border border-[#d5d7d5] rounded-lg text-base font-['Work_Sans'] placeholder:text-[#9c9c9c] focus:outline-none focus:border-[#fd6c22]"
                required
              />
            </div>

            {/* School Name */}
            <div className="flex flex-col gap-2">
              <label className="text-[#58514d] text-base font-normal font-['Work_Sans'] tracking-[-0.32px]">
                School Name
              </label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={(e) => handleInputChange('schoolName', e.target.value)}
                placeholder="Enter your school's name"
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
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={!isFormValid}
            className={`
              w-full mt-5 h-14 rounded-lg border-2 font-bold text-base font-['Comic_Sans_MS']
              transition-all duration-200
              ${isFormValid
                ? 'bg-[#fd6c22] border-[#06113c] text-[#3651ab] hover:bg-[#fea679]'
                : 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <div className="relative h-full flex items-center justify-center">
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-[300px] h-1.5 bg-[#ffe4d7] rounded-full" />
              <span className="relative z-10">Create Account</span>
            </div>
          </button>
        </div>

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
