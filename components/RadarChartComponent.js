import React, { useRef, useEffect } from "react";
import { RadarChart } from "../lib/d3radarChart";
import * as d3 from "d3";
import { questionToPillar, pillarColors, pillars } from "@/data/radarData.js";

const RadarChartComponent = ({ data, options }) => {
  const chartRef = useRef(null);


  // all configuration options here
  const chartOptions = {
    // Dimensions of the chart
    w: 800,
    h: 800,
    margin: {
      top: 0,
      right: 100,
      bottom: 100,
      left: 100,
    },
    // Number of concentric circles (levels)
    levels: 5,
    // Maximum value expected across all axes
    maxValue: 8,
    // Factor for how far out the labels are placed from the outer circle
    labelFactor: 1.15,
    // Maximum width of label text before wrapping
    wrapWidth: 100,
    // Opacity of the area inside the radar line (0 to 1)
    opacityArea: 0.35,
    // Radius of the dots representing each data point
    dotRadius: 4,
    // Opacity of the concentric circles (0 to 1)
    opacityCircles: 0.1,
    // Stroke width of the radar lines
    strokeWidth: 6,
    // Determines if the radar lines have rounded corners
    roundStrokes: true,
    // Format function for level values
    format: d3.format(".0f"),
    // Enables tooltips
    tooltip: true,
    // Unit label for tooltips
    unit: "",
    // Rotation angle of the chart in degrees
    rotationDegrees: -30,
    // Angular offset for radar lines in degrees
    angleOffsetDegrees: 0,
    // Stroke color for concentric circles
    strokeColorLevelCircles: "#CDCDCD",
    // Fill color for concentric circles
    fillColorLevelCircles: "#CDCDCD",
    // Text color for level indicators
    levelTextColor: "#000",
    // Font size for level indicators
    levelFontSize: "14px",
    // Stroke color for axis lines
    axisLineStroke: "white",
    // Stroke width for axis lines
    axisLineWidth: 2,
    // Font size for axis labels
    axisLabelFontSize: "14px",
    // Text color for axis labels
    axisLabelColor: "#000",
    // Opacity of the wedges (0 to 1)
    wedgeOpacity: 0.1,
    // Color function for radar lines
    color: (i) => {
      if (i === data.length - 1) return "teal"; // Most recent results
      if (i === data.length - 2) return "black"; // Previous results
      return "grey"; // Baseline results
    },
    // Style function for radar lines ('solid' or 'dashed')
    style: (i) => {
      if (i === data.length - 1) return "solid"; // Most recent results
      return "dashed"; // Previous and baseline results
    },
    // Spread any additional options provided
    ...options,
  };

  useEffect(() => {
    const renderChart = () => {
      const radarData = data.map((dataset) => ({
        name: dataset.name,
        axes: pillars.flatMap((pillar) =>
          pillar.sections.map((section) => {
            const axisName = section.name;
            const dataItem = dataset.data.find(
              (item) => item.axis === axisName
            );
            return {
              axis: axisName,
              value: dataItem ? dataItem.value : 0,
            };
          })
        ),
      }));

      // Clear previous chart
      d3.select(chartRef.current).selectAll("*").remove();

      // Render the RadarChart with consolidated chartOptions
      RadarChart(
        chartRef.current,
        radarData,
        chartOptions,
        questionToPillar,
        {
          ...pillarColors,
          "Therapy Planning": "blue",
          "Data Collection": "blue",
          "Paperwork": "blue",
          "Individual Collaboration": "yellow",
          "School Collaboration": "yellow",
          "Community Impact": "yellow",
          "Thematic Units": "pink",
          "Session Structure": "pink",
          "Evidence-Backed Strategies": "pink",
        }
      );
    };

    // Initial render
    renderChart();
  }, [data, options]);

  // Update legend items using chartOptions
  const legendItems = data.map((dataset, index) => ({
    name: dataset.name,
    color: chartOptions.color(index),
    style: chartOptions.style(index),
  }));

  return (
    <div className="relative">
      <div ref={chartRef} />
      <div className="absolute flex space-x-6 transform -translate-x-1/2 top-4 left-1/2">
        {legendItems.map((item) => (
          <div key={item.name} className="flex items-center space-x-2">
            <svg width="40" height="10">
              <line
                x1="0"
                y1="5"
                x2="40"
                y2="5"
                stroke={item.color}
                strokeWidth="2"
                strokeDasharray={item.style === "dashed" ? "4 2" : "0"}
              />
            </svg>
            <span className="text-sm font-medium text-gray-800">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RadarChartComponent;
