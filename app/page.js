"use client";
import React from "react";
import RadarChartComponent from "../components/RadarChartComponent";
import radarData from "../data/radarData";

const Page = () => {
  const options = {
    levels: 5,
    maxValue: 8, // Based on your score range
    labelFactor: 1.2,
    wrapWidth: 60,
    opacityArea: 0.35,
    dotRadius: 4,
    opacityCircles: 0.1,
    strokeWidth: 2,
    roundStrokes: false,
    // The color scale is handled inside the RadarChart function
  };

  return (
    <div className="w-screen h-screen m-0 overflow-visible flex flex-col items-center pt-[50px] pb-[50px] bg-[#f0f0f0]">
      <RadarChartComponent data={radarData} options={options} />
    </div>
  );
};

export default Page;
