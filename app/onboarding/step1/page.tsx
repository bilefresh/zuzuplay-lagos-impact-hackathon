"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// Assets
const parentIcon = "/assets/icons/parentIcon.svg";
const teacherIcon = "/assets/icons/teacherIcon.svg";
const backgroundImage = "/assets/images/backgroundImage.png";
const backArrow = "/assets/icons/backArrow.svg";

interface UserTypeOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  selected: boolean;
}

export default function OnboardingStep1() {
  const router = useRouter();
  const [userType, setUserType] = useState<UserTypeOption[]>([
    {
      id: "parent",
      title: "Parent",
      description: "Sign up your kids",
      icon: parentIcon,
      selected: false,
    },
    {
      id: "school",
      title: "School",
      description: "Sign up your students",
      icon: teacherIcon,
      selected: false,
    },
  ]);

  const handleUserTypeSelect = (selectedId: string) => {
    setUserType(prev =>
      prev.map(option => ({
        ...option,
        selected: option.id === selectedId,
      }))
    );
  };

  const handleContinue = () => {
    const selectedType = userType.find(option => option.selected);
    if (selectedType) {
      if (selectedType.id === "parent") {
        // router.push("/onboarding/parent-form");
        router.push("/onboarding/email");
      } else {
        router.push("/onboarding/step2");
      }
    }
  };

  const isSelected = userType.some(option => option.selected);

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
          onClick={() => router.back()}
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
        <h1 className="text-[#291b13] text-xl lg:text-2xl font-bold text-center lg:text-left mb-20 font-['Comic_Sans_MS']">
          Join as a Parent or School
        </h1>

        {/* User Type Selection */}
        <div className="max-w-md mx-auto lg:max-w-none lg:mx-0 lg:w-[450px]">
          <div className="flex flex-col lg:flex-row gap-4">
            {userType.map((option) => (
              <button
                key={option.id}
                onClick={() => handleUserTypeSelect(option.id)}
                className={`
                  bg-white border border-[#d5d7d5] rounded-lg p-6 py-4 gap-5 content-center lg:h-[140px] w-full lg:w-[225px]
                  transition-all duration-200 hover:shadow-md
                  ${option.selected 
                    ? 'border-[#4fc3f7] bg-[#FFFBF6] shadow-md' 
                    : 'hover:border-[#4fc3f7]/50'
                  }
                `}
              >
                <div className="flex flex-row items-center gap-5 h-full">
                  <div className="w-8 h-8">
                    <Image
                      src={option.icon}
                      alt={option.title}
                      width={32}
                      height={32}
                      className={`w-full h-full ${option.selected 
                        ? 'color-[#4fc3f7] fill-[#4fc3f7]' 
                        : ''
                      }`}
                    />
                  </div>
                  <div className="flex flex-col gap-4 text-left">
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
              w-full mt-4 h-14 rounded-lg border-2 font-bold text-base font-['Comic_Sans_MS']
              transition-all duration-200
              ${isSelected
                ? 'bg-[#4fc3f7] border-[#06113c] text-[#3651ab] hover:bg-[#4fc3f7]'
                : 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <div className="relative h-full flex items-center justify-center">
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-[300px] h-1.5 bg-[#ffe4d7] rounded-full" />
              <span className="relative z-10">Get Started</span>
            </div>
          </button>
        </div>

        {/* Login Link */}
        <div className="max-w-md mx-auto lg:max-w-none lg:mx-0 lg:w-[450px] mt-6">
          <p className="text-[#58514d] text-base text-center font-['Work_Sans'] tracking-[-0.32px]">
            <span>Already have an account?</span>
            <Link href="/login-new" className="font-bold text-[#4fc3f7] ml-1">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
