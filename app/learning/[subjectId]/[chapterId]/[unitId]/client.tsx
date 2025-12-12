"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import ProgressBar from "@/components/common/ProgressBar";
import Image from "next/image";
import bearIcon from "@/assets/icons/ask.svg";

const UnitPageClient = ({
  params,
}: {
  params: { subjectId: string; chapterId: string; unitId: string };
}) => {
  const router = useRouter();
  const { subjectId, chapterId, unitId } = params;

  const unit = {
    title: "Unit 1: Introduction to Numbers",
    progress: 50,
  };

  const handleContinueLesson = () => {
    router.push(`/learning/${subjectId}/${chapterId}/${unitId}/lesson`);
  };

  const handleStartQuiz = () => {
    router.push(`/learning/${subjectId}/${chapterId}/${unitId}/quiz`);
  };

  const handleGoHome = () => {
    router.push(`/learning/dashboard`);
  };

  return (
    <div className="flex flex-col items-center h-screen bg-white p-5">
      {/* Bear Icon */}
      <div className="mb-4 ml-1">
        <Image src={bearIcon} alt="Bear Icon" className="w-20 h-20" />
      </div>

      {/* Unit Title */}
      <h2 className="text-2xl font-bold">{unit.title}</h2>

      {/* Progress Bar */}
      <div className="w-full my-5">
        <ProgressBar progress={unit.progress} height={10} />
      </div>

      {/* Action Buttons */}
      <div className="mt-10 w-full max-w-xs">
        <Button
          text="Continue To Next Lesson"
          handleNext={handleContinueLesson}
        />
      </div>
      <div className="mt-5 w-full max-w-xs">
        <Button text="Start Quiz" handleNext={handleStartQuiz} />
      </div>
      <div className="mt-5 w-full max-w-xs">
        <Button text="Back To Home" handleNext={handleGoHome} />
      </div>
    </div>
  );
};

export default UnitPageClient;

