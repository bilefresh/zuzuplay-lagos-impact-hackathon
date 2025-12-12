"use client";
import Footer from "@/components/common/Footer";
import DashboardScreen from "@/components/screens/learning/DashboardScreen";
import Image from "next/image";
import Link from "next/link";

import math from "../../assets/images/math.png";
import english from "../../assets/images/english.png";
import science from "../../assets/images/science.png";
import avatar from "../../assets/images/avatar.jpg";
import coin from "../../assets/images/coin.png";
import { useUserInfo } from "@/hooks/useUserInfo";

const subject = [
  {
    id: 1,
    name: "Mathematics",
    image: math,
    color: "bg-[#3651AB]",
    href: "",
  },
  {
    id: 2,
    name: "English",
    image: english,
    color: "bg-[#E56253]",
    href: "",
  },
  {
    id: 3,
    name: "Science",
    image: science,
    color: "bg-[#06113C]",
    href: "",
  },
];
const Dashboard = () => {
  const { coins, firstName } = useUserInfo();
  return (
    <>
      {/* <div className="pb-24">
        <DashboardScreen />
      </div>
      <Footer /> */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image
              src={avatar}
              alt={""}
              className="w-16 h-16 rounded-full object-cover"
            />
            <p className="text-[#58514D] font-bold">
              Hello, {firstName}
            </p>
          </div>
          <div className="flex bg-[#06113C] text-white space-x-1 rounded-full items-center pr-2 font-bold">
            <Image src={coin} alt={""} className="w-10 h-10 object-cover" />
            <p>{coins}</p>
          </div>
        </div>
        <h2 className="my-4 font-bold text-[#58514D]">
          What do you want to learn today
        </h2>
        <div className="flex flex-col justify-center space-y-5 text-white">
          {subject.map((subject) => (
            <div key={subject.id}>
              <Link
                href={`/learning/${subject.name}`}
                className={`flex items-center justify-between rounded-xl pl-5 pr-2 py-2 ${subject.color}`}
              >
                <h3 className="text-md font-bold text-center">
                  {subject.name}
                </h3>
                <Image
                  src={subject.image}
                  alt={subject.name}
                  className="w-24 h-24 object-cover"
                />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
