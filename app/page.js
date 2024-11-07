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
    <div
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        overflow: "visible", // Added to prevent clipping
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "50px",
        paddingBottom: "50px",
        backgroundColor: "#f5f5f5",
      }}
    >
      <h1>Professional Abilities Radar Chart</h1>
      <RadarChartComponent
        data={radarData}
        options={options}
        size={{ width: "100%", height: "100%" }} // Set size to fill available space
      />
    </div>
  );
};

export default Page;
