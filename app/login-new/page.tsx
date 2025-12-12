"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// Assets
const backArrow = "/assets/icons/backArrow.svg";
const emailIcon = "/assets/icons/emailIcon.svg";
const teacherIcon = "/assets/icons/teacherIcon.svg";

interface LoginOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  selected: boolean;
}

export default function NewLoginPage() {
  const router = useRouter();
  const [loginOptions, setLoginOptions] = useState<LoginOption[]>([
    {
      id: "email",
      title: "Email",
      description: "Sign in with your email",
      icon: emailIcon,
      selected: false,
    },
    {
      id: "access-code",
      title: "Access code",
      description: "Sign in with your school code",
      icon: teacherIcon,
      selected: false,
    },
  ]);

  const handleOptionSelect = (selectedId: string) => {
    setLoginOptions(prev =>
      prev.map(option => ({
        ...option,
        selected: option.id === selectedId,
      }))
    );
  };

  const handleContinue = () => {
    const selectedOption = loginOptions.find(option => option.selected);
    if (selectedOption) {
      if (selectedOption.id === "email") {
        router.push("/login");
      } else {
        router.push("/login-access-code");
      }
    }
  };

  const isSelected = loginOptions.some(option => option.selected);

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
          Welcome back
        </h1>

        {/* Subtitle */}
        <p className="text-[#9c9c9c] text-base text-center mb-8 font-['Work_Sans'] tracking-[-0.32px]">
          Select a sign in option
        </p>

        {/* Login Options */}
        <div className="max-w-md mx-auto lg:max-w-none lg:mx-0 lg:w-[450px]">
          <div className="space-y-4">
            {loginOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionSelect(option.id)}
                className={`
                  w-full h-[88px] bg-white border border-[#d5d7d5] rounded-lg p-6
                  transition-all duration-200 hover:shadow-md
                  ${option.selected 
                    ? 'border-[#fd6c22] bg-[#FFFBF6] shadow-md' 
                    : 'hover:border-[#fd6c22]/50'
                  }
                `}
              >
                <div className="flex items-center gap-4 h-full">
                  <div className="w-8 h-8 flex-shrink-0">
                    <Image
                      src={option.icon}
                      alt={option.title}
                      width={32}
                      height={32}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="flex flex-col items-start gap-4 text-left">
                    <h3 className="text-[#291b13] text-base font-bold font-['Comic_Sans_MS']">
                      {option.title}
                    </h3>
                    <p className="text-[#58514d] text-base font-normal font-['Work_Sans'] tracking-[-0.32px]">
                      {option.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Continue Button */}
        <div className="max-w-md mx-auto lg:max-w-none lg:mx-0 lg:w-[450px] mt-8">
          <button
            onClick={handleContinue}
            disabled={!isSelected}
            className={`
              w-full h-14 rounded-lg border-2 font-bold text-base font-['Comic_Sans_MS']
              transition-all duration-200
              ${isSelected
                ? 'bg-[#fd6c22] border-[#06113c] text-[#3651ab] hover:bg-[#fea679]'
                : 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <div className="relative h-full flex items-center justify-center">
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-[300px] h-1.5 bg-[#fea679] rounded-full" />
              <span className="relative z-10">Log In</span>
            </div>
          </button>
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
