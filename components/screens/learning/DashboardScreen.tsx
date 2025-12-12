"use client";
import Image from "next/image";
import Link from "next/link";

import math from "../../../assets/images/math.png";
import english from "../../../assets/images/english.png";
import science from "../../../assets/images/science.png";
import avatar from "../../../assets/images/avatar.jpg";
import coin from "../../../assets/images/coin.png";
import zuzuplayCar from "../../../assets/icons/zuzuplayCar.svg";
import zuzuplayMascot from "../../../assets/icons/zuzuplay.svg";
import adminIcon from "../../../assets/icons/flag.svg";
import flagIcon from "../../../assets/icons/flag.svg";
import { getUserInfo } from "@/middleware/general";
import { apiService } from "@/middleware/apiService";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCoinBalance } from "@/lib/coinStorage";
import { Clock, Users, BookOpen } from "lucide-react";

const oldsubject = [
  {
    id: 1,
    name: "Mathematics",
    image: math,
    color: "bg-[#3651AB]",
    href: "/learning/Mathematics",
  },
  // {
  //   id: 2,
  //   name: "English",
  //   image: english,
  //   color: "bg-[#E56253]",
  //   href: "/learning/English",
  // },
  // {
  //   id: 3,
  //   name: "Science",
  //   image: science,
  //   color: "bg-[#06113C]",
  //   href: "/learning/Science",
  // },
  // {
  //   id: 4,
  //   name: "Math Racer",
  //   image: zuzuplayCar,
  //   color: "bg-[#3651AB]",
  //   href: "/game/racer",
  //   class: "w-[89px] h-[25px] py-5 object-cover",
  // },
  {
    id: 5,
    name: "Ask Zuzuplay",
    image: zuzuplayMascot,
    color: "bg-[#A95124]",
    href: "/ask",
    class: "w-[65px] h-[56px] object-cover",
  },
  {
    id: 6,
    name: "Assessments",
    image: flagIcon,
    color: "bg-[#E56253]",
    href: "/learning/assessments",
    class: "w-[48px] h-[48px] object-cover",
  },
];
const defaultUser = getUserInfo();

const DashboardScreen = () => {
  const [subject, setSubject] = useState(oldsubject);
  const [user, setUser] = useState(defaultUser);
  const [activeClassTime, setActiveClassTime] = useState<any>(null);
  const navigate = useRouter();
  useEffect(() => {
    apiService.profile().then((res) => {
      setUser(res);
      try {
        if (res && typeof res.role !== "undefined") {
          const role: number = res.role;
          const isAdmin = role === 1; // per API: role 1 = admin
          const isTeacher = role === 3; // assuming role 3 = teacher
          if (isAdmin || isTeacher) {
            setSubject((prev) => {
              const hasAdmin = prev.some((s) => s.id === 99);
              if (hasAdmin) return prev;
              const adminHref = isAdmin ? "/admin" : "/teacher/dashboard";
              return [
                {
                  id: 99,
                  name: "Admin",
                  image: adminIcon,
                  color: "bg-[#06113C]",
                  href: adminHref,
                  class: "w-[48px] h-[48px] object-cover",
                },
                ...prev,
              ];
            });
          }
        }
      } catch (e) {
        console.log(e);
      }
    });
  }, []);

  // Check for active class time
  useEffect(() => {
    // Mock active class time - replace with actual API call
    const mockActiveClass = {
      id: "1",
      subject: "Mathematics",
      topic: "Algebra",
      startTime: new Date().toISOString(),
      teacher: "Ms. Johnson",
      studentCount: 15,
    };

    // Simulate checking for active class time
    const checkActiveClass = () => {
      // This would be an actual API call to check if there's an active class
      // For now, we'll randomly show/hide the class time card
      if (Math.random() > 0.5) {
        setActiveClassTime(mockActiveClass);
      }
    };

    checkActiveClass();
  }, []);

  return (
    <div className="p-10">
      <div className="flex items-center justify-between">
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => {
            window.location.href = "/profile/view-profile";
          }}
        >
          <Image
            src={avatar}
            alt={""}
            className="w-16 h-16 rounded-full object-cover"
          />
          <p className="text-[#58514D] font-bold">
            Hello, {user ? user.first_name : ""}
          </p>
        </div>
        <div
          className="cursor-pointer flex bg-[#06113C] text-white space-x-1 rounded-full items-center pr-2 font-bold"
          onClick={() => {
            window.location.href = "/coinPage";
          }}
        >
          <Image src={coin} alt={""} className="w-10 h-10 object-cover" />
          <p>{user ? getCoinBalance() : "-"}</p>
        </div>
      </div>

      <h2 className="my-4 font-bold text-lg text-[#58514D]">
        What do you want to learn today?
      </h2>
      <div className="flex flex-col justify-center space-y-4 text-white">
        {subject.map((subject) => (
          <div key={subject.id} className="group px-6">
            <Link
              href={subject.href}
              className="flex h-[85px] items-center justify-between rounded-xl pl-5 pr-2 py-2 backdrop-blur-2xl border-2 border-cyan-200/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden"
              style={{
                background: "rgba(135, 206, 235, 0.25)",
                boxShadow:
                  "inset 0 1px 0 0 rgba(255,255,255,0.4), 0 8px 24px rgba(135, 206, 235, 0.15)",
              }}
            >
              {/* Icy shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:animate-shimmer"></div>

              <h3 className="text-lg font-bold text-center text-blue-900 drop-shadow-md relative z-10">
                {subject.name}
              </h3>
              <Image
                src={subject.image}
                alt={subject.name}
                className={`${subject.class} relative z-10 drop-shadow-md`}
                width={150}
                height={150}
              />
            </Link>
          </div>
        ))}
      </div>

      {/* Active Class Time Display */}
      {activeClassTime && (
        <div className="mb-6 mt-14 bg-[#fff6f2] border border-secondary rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-[#291b13] font-semibold text-lg">
                  Live Class: {activeClassTime.subject} -{" "}
                  {activeClassTime.topic}
                </h3>
                <p className="text-[#58514d] text-sm">
                  with {activeClassTime.teacher} •{" "}
                  {activeClassTime.studentCount} students
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                // Navigate to the active class
                window.location.href = `/learning/${activeClassTime.subject}`;
              }}
              className="bg-secondary hover:bg-secondary/80 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Join Class
            </button>
          </div>
        </div>
      )}

      {/* <p
        className="text-[#58514D] cursor-pointer"
        onClick={() => navigate.push("/game/racer")}
      >
        Click here to go to the game
      </p> */}
    </div>
  );
};

export default DashboardScreen;
