"use client";
import { useEffect, useState } from "react";
import flagIcon from "../../../assets/icons/flag.svg";
import coinsIcon from "../../../assets/icons/coins.svg";
import timerIcon from "../../../assets/icons/timer.svg";
import HighlightsCard from "@/components/HighlightsCard";
import { apiCaller } from "@/middleware/apiService";

let highlights = [
  {
    id: 1,
    title: "Accuracy",
    color: "bg-[#219653]",
    textColor: "text-[#219653]",
    icon: flagIcon,
    description: "-",
  },
  {
    id: 2,
    title: "Time",
    color: "bg-[#3651AB]",
    textColor: "text-[#3651AB]",
    icon: timerIcon,
    description: "-",
  },
  {
    id: 3,
    title: "Coins",
    color: "bg-[#06113C]",
    textColor: "text-[#06113C]",
    icon: coinsIcon,
    description: "-",
  },
];

const AnalyticsScreen = () => {
  const [highlightData, setHighlights] = useState<any>(highlights);
  const [data, setData] = useState<any>({
    analysis: "",
    actionableSteps: "",
    accuracy: 0,
    time: 0,
    coins: 0,
  });
  useEffect(() => {
    apiCaller.get(`analytics`).then((res: any) => {
      highlights[0].description = `${res.data.data.accuracy}%`;
      highlights[1].description = `${res.data.data.time}`;
      highlights[2].description = `${res.data.data.coins}`;
      setData({ ...res.data.data });
      setHighlights(highlights);
    });
  }, []);
  return (
    <div className="text-black space-y-10">
      <section className="">
        <h2 className="font-bold text-xl mb-4">Insights</h2>
        <p className="">
          {data.analysis ? data.analysis : "No data available yet"}
        </p>
        <p className="mt-5">
          <span className="font-bold">Actionable steps:</span>
          {data.actionableSteps ? (
            <ul className="list-disc pl-5 mt-2 space-y-2">
              {JSON.parse(data.actionableSteps).map((step: string, index: number) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          ) : (
            <span className="ml-2">No data available yet</span>
          )}
        </p>
      </section>
      <section className="space-y-3">
        <h2 className="font-bold text-xl mb-4">Highlights</h2>
        <div className="grid grid-cols-3 gap-4">
          {highlightData.map((highlight: any) => (
            <div key={highlight.id}>
              <HighlightsCard
                title={highlight.title}
                color={highlight.color}
                textColor={highlight.textColor}
                icon={highlight.icon}
                description={highlight.description}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AnalyticsScreen;
