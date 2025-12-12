"use client";

import ProgressBar from "@/components/common/ProgressBar";
import CorrectAnswer from "@/components/CorrectAnswer";
import IncorrectAnswer from "@/components/IncorrectAnswer";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import quizFoam from "../../../../../../assets/icons/quizFoam.svg";
import cancelIcon from "../../../../../../assets/icons/cancelIcon.svg";
import { useRouter } from "next/navigation";
import { apiCaller } from "@/middleware/apiService";
import axios from "@/node_modules/axios/index";

interface QuizData {
  question_start: string;
  question_end: string;
  options: string[];
  answer: string;
  id: number;
}

const QuizClient = ({
  params,
}: {
  params: { subjectId: string; chapterId: string; unitId: string };
}) => {
  const router = useRouter();

  const { subjectId, chapterId, unitId } = params;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Track current question
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [startDrop, setStartDrop] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [quizData, SetQuizData] = useState<QuizData[]>([]);
  const [answers, setAnswers] = useState<object[]>([]);
  useEffect(() => {
    apiCaller.get(`lessons/${unitId}`).then((res: any) => {
      SetQuizData(res.data.data.quiz);
      console.log(res.data.data.quiz);
    });
  }, [unitId]);

  console.log(quizData);

  const currentQuestion = quizData[currentQuestionIndex];

  const handleOptionClick = (option: string) => {
    setSelectedAnswer(option);
    const correct = option === currentQuestion.answer;
    setIsCorrect(correct);
    answers.length > 0
      ? setAnswers([...answers, { answer: option }])
      : setAnswers([{ answer: option }]);
    console.log("aser", answers);
    setIsAnswered(true);

    const answerSpan = document.getElementById("answer");
    if (answerSpan) {
      answerSpan.textContent = currentQuestion.answer;
    }

    // Return the options to their initial position
    setStartDrop(false);

    // Show the feedback after options return to their initial position
    setTimeout(() => {
      setIsAnswered(true);
    }, 500);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizData.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      resetQuizState();
    } else {
      console.log(answers);
      apiCaller
        .post(`lessons/${unitId}/complete`, { answers })
        .then((res: any) => {
          router.push(`/learning/${subjectId}/${chapterId}/${unitId}/summary`);
        })
        .catch((err: any) => {
          console.log(err);
          alert("Unable to submit answers");
        });
      // If it's the last question, you can display a summary or finish screen
      //   router.push('/summary')
    }
  };

  const resetQuizState = () => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    setIsAnswered(false);
    setStartDrop(false);
    setIsLoading(true);

    // Clear the previous answer from the span
    const answerSpan = document.getElementById("answer");
    if (answerSpan) {
      answerSpan.textContent = "";
    }

    // Automatically start the drop animation after 1 second
    setTimeout(() => {
      setStartDrop(true);
      setIsLoading(false);
    }, 100);
  };

  // Automatically start the drop animation after 1 second
  useEffect(() => {
    const startTimer = setTimeout(() => {
      setStartDrop(true);
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(startTimer);
  }, [currentQuestionIndex]);

  // Automatically mark as wrong after 45 seconds if no option is selected
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAnswered) {
        setSelectedAnswer(null);
        setIsCorrect(false);
        setIsAnswered(true);
        setStartDrop(false); // Return the options to their initial position
      }
    }, 60000);

    return () => clearTimeout(timer);
  }, [isAnswered]);

  return (
    <div>
      {quizData.length > 0 ? (
        <>
          <div className="flex items-center justify-center space-x-3">
            <Image src={cancelIcon} alt={""} />
            <ProgressBar
              progress={((currentQuestionIndex + 1) / quizData.length) * 100}
              height={0}
            />
          </div>
          <div className="my-10">
            <h2 className="font-bold text-lg mb-6">Pick the correct answer</h2>
            <div className="flex flex-row w-full">
              <p>
                {currentQuestion?.question_start}{" "}
                <span
                  id="answer"
                  className="border-b border-black focus:outline-none bg-transparent px-2"
                ></span>{" "}
                {currentQuestion?.question_end}
              </p>
            </div>
            <Image src={quizFoam} alt={""} className="w-full pt-10 pb-5" />
            <div
              className={`relative flex justify-center space-x-4 mb-6 ${
                startDrop ? "animate-dropToBottom" : "translate-y-0"
              }`}
            >
              {currentQuestion?.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleOptionClick(option)}
                  disabled={isLoading || isAnswered}
                  className={`px-4 py-2 rounded-full border text-center ${
                    selectedAnswer === option
                      ? "bg-[#FD6C22] text-white"
                      : "border-gray-400"
                  } ${
                    isAnswered && selectedAnswer !== option ? "opacity-50" : ""
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          {isAnswered && (
            <div>
              {isCorrect ? (
                <CorrectAnswer handleNext={handleNextQuestion} />
              ) : (
                <IncorrectAnswer
                  handleNext={handleNextQuestion}
                  correctAnswer={currentQuestion?.answer}
                />
              )}
            </div>
          )}
        </>
      ) : (
        <div>No Quiz Found</div>
      )}
    </div>
  );
};

export default QuizClient;
