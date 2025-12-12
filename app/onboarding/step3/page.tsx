"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// Assets
const backArrow = "/assets/icons/backArrow.svg";
const backgroundImage = "/assets/images/backgroundImage.png";

interface PricingData {
  studentCount: number;
  pricingType: 'term' | 'year';
}

interface SchoolFormData {
  name: string;
  schoolName: string;
  email: string;
  phone: string;
}

export default function SchoolOnboardingStep3() {
  const router = useRouter();
  const [pricingData, setPricingData] = useState<PricingData>({
    studentCount: 0,
    pricingType: 'term',
  });
  const [schoolData, setSchoolData] = useState<SchoolFormData | null>(null);

  useEffect(() => {
    // Load school form data from localStorage
    const savedData = localStorage.getItem('schoolFormData');
    if (savedData) {
      setSchoolData(JSON.parse(savedData));
    }
  }, []);

  const pricePerStudent = 20000;
  const termCount = 3; // 3 terms per year
  const yearlyDiscount = 0.1; // 10% discount for yearly payment

  const calculateTotal = () => {
    const baseTotal = pricingData.studentCount * pricePerStudent;
    if (pricingData.pricingType === 'year') {
      const yearlyTotal = baseTotal * termCount;
      return Math.round(yearlyTotal * (1 - yearlyDiscount));
    }
    return baseTotal;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleStudentCountChange = (value: string) => {
    const count = parseInt(value) || 0;
    setPricingData(prev => ({ ...prev, studentCount: count }));
  };

  const handlePricingTypeChange = (type: 'term' | 'year') => {
    setPricingData(prev => ({ ...prev, pricingType: type }));
  };

  const handlePay = () => {
    const total = calculateTotal();
    
    // Create comprehensive WhatsApp message with all school data
    let message = `Hello! I'm interested in Zuzuplay for my school.\n\n`;
    
    if (schoolData) {
      message += `School Information:\n`;
      message += `• School Name: ${schoolData.schoolName}\n`;
      message += `• Contact Person: ${schoolData.name}\n`;
      message += `• Email: ${schoolData.email}\n`;
      message += `• Phone: ${schoolData.phone}\n\n`;
    }
    
    message += `Pricing Details:\n`;
    message += `• Number of Students: ${pricingData.studentCount}\n`;
    message += `• Pricing Type: ${pricingData.pricingType === 'term' ? 'Per Term' : 'Per Year (10% discount)'}\n`;
    message += `• Price per Student: ${formatCurrency(pricePerStudent)}\n`;
    message += `• Total Amount: ${formatCurrency(total)}\n\n`;
    
    if (pricingData.pricingType === 'year') {
      const savings = (pricingData.studentCount * pricePerStudent * termCount) - total;
      message += `• You save: ${formatCurrency(savings)} with yearly payment!\n\n`;
    }
    
    message += `Please contact me to proceed with the setup. Thank you!`;
    
    const whatsappUrl = `https://wa.me/2349054297049?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const total = calculateTotal();
  const isFormValid = pricingData.studentCount > 0;

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
          onClick={() => router.back()}>
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
          Pricing
        </h1>

        <div className="max-w-md mx-auto lg:max-w-none lg:mx-0 lg:w-[450px]">
          {/* Student Count Input */}
          <div className="flex flex-col gap-2 mb-6">
            <label className="text-[#58514d] text-base font-normal font-['Work_Sans'] tracking-[-0.32px]">
              Student count
            </label>
            <input
              type="number"
              value={pricingData.studentCount || ''}
              onChange={(e) => handleStudentCountChange(e.target.value)}
              placeholder="How many students do you have"
              className="w-full h-14 px-6 border border-[#d5d7d5] rounded-lg text-base font-['Work_Sans'] placeholder:text-[#9c9c9c] focus:outline-none focus:border-[#4fc3f7]"
              min="1"
            />
          </div>

          {/* Pricing Type Selection */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => handlePricingTypeChange('term')}
              className={`
                flex-1 h-12 rounded-lg border-2 font-medium text-base font-['Work_Sans']
                transition-all duration-200
                ${pricingData.pricingType === 'term'
                  ? 'bg-[#4fc3f7] border-[#4fc3f7] text-white'
                  : 'bg-white border-[#d5d7d5] text-[#58514d] hover:border-[#4fc3f7]'
                }
              `}
            >
              Per Term
            </button>
            <button
              onClick={() => handlePricingTypeChange('year')}
              className={`
                flex-1 h-12 rounded-lg border-2 font-medium text-base font-['Work_Sans']
                transition-all duration-200
                ${pricingData.pricingType === 'year'
                  ? 'bg-[#4fc3f7] border-[#4fc3f7] text-white'
                  : 'bg-white border-[#d5d7d5] text-[#58514d] hover:border-[#4fc3f7]'
                }
              `}
            >
              Per Year (10% off)
            </button>
          </div>

          {/* Pricing Breakdown */}
          {pricingData.studentCount > 0 && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[#58514d] text-base font-normal font-['Work_Sans'] tracking-[-0.16px]">
                      Price
                    </p>
                    <div className="flex items-end gap-2">
                      <span className="text-[#58514d] text-xl font-medium font-['Work_Sans'] tracking-[-0.2px]">
                        {formatCurrency(pricePerStudent)}
                      </span>
                      <span className="text-[#58514d] text-base font-normal font-['Work_Sans'] tracking-[-0.16px]">
                        /student
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[#58514d] text-base font-normal font-['Work_Sans'] tracking-[-0.16px]">
                      Student count
                    </p>
                    <p className="text-[#58514d] text-xl font-medium font-['Work_Sans'] tracking-[-0.2px]">
                      {pricingData.studentCount}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-[#d5d7d5] my-4" />

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[#58514d] text-base font-normal font-['Work_Sans'] tracking-[-0.16px]">
                      Total
                    </p>
                    <p className="text-[#58514d] text-xl font-medium font-['Work_Sans'] tracking-[-0.2px]">
                      {formatCurrency(total)}
                    </p>
                    {pricingData.pricingType === 'year' && (
                      <p className="text-green-600 text-sm font-medium">
                        You save {formatCurrency((pricingData.studentCount * pricePerStudent * termCount) - total)}!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pay Button */}
          <button
            onClick={handlePay}
            disabled={!isFormValid}
            className={`
              w-full h-14 rounded-lg border-2 font-bold text-base font-['Comic_Sans_MS']
              transition-all duration-200
              ${isFormValid
                ? 'bg-[#4fc3f7] border-[#06113c] text-[#3651ab] hover:bg-[#4fc3f7]'
                : 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <div className="relative h-full flex items-center justify-center">
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-[300px] h-1.5 bg-[#ffe4d7] rounded-full" />
              <span className="relative z-10">
                Pay {formatCurrency(total)}
              </span>
            </div>
          </button>
        </div>

        {/* Login Link */}
        <div className="max-w-md mx-auto lg:max-w-none lg:mx-0 lg:w-[450px] mt-6">
          <p className="text-[#58514d] text-base text-center font-['Work_Sans'] tracking-[-0.32px]">
            <span>Already have an account?</span>
            <Link href="/login" className="font-bold text-[#4fc3f7] ml-1">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
