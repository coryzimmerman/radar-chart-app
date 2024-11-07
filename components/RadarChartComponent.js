import React, { useRef, useEffect } from "react";
import { RadarChart } from "../lib/d3radarChart";
import * as d3 from "d3";
import { questionToPillar, pillarColors, pillars } from "@/data/radarData.js";

const RadarChartComponent = ({ data, options }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const renderChart = () => {
      const margin = { top: 150, right: 150, bottom: 150, left: 150 };

      const width = 800; // Fixed width as per RadarChart configuration
      const height = 800; // Fixed height as per RadarChart configuration

      const chartOptions = {
        w: width,
        h: height,
        marginTop: margin.top,
        marginRight: margin.right,
        marginBottom: margin.bottom,
        marginLeft: margin.left,
        ...options,
      };

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

      // Render the RadarChart
      RadarChart(
        chartRef.current,
        radarData,
        chartOptions,
        questionToPillar,
        pillarColors
      );
    };

    // Initial render
    renderChart();
  }, [data, options]);

  const colorScale = options.color || d3.scaleOrdinal(d3.schemeCategory10);

  const legendItems = data.map((dataset, index) => ({
    name: dataset.name,
    color: colorScale(index),
  }));

  return (
    <div className="relative">
      <div ref={chartRef} />
      <div className="absolute flex space-x-6 transform -translate-x-1/2 top-4 left-1/2">
        {legendItems.map((item) => (
          <div key={item.name} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: item.color }}
            ></div>
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
