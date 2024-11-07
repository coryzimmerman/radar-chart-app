import React, { useRef, useEffect } from "react";
import { RadarChart } from "../lib/d3radarChart";
import * as d3 from "d3";
import { pillars } from "../data/radarData";

const RadarChartComponent = ({ data, options }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const renderChart = () => {
      const margin = { top: 150, right: 150, bottom: 150, left: 150 };

      const width = window.innerWidth - margin.left - margin.right;
      const height = window.innerHeight - margin.top - margin.bottom;

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
      RadarChart(chartRef.current, radarData, chartOptions);
    };

    // Initial render
    renderChart();

    // Update chart on window resize
    window.addEventListener("resize", renderChart);

    // Cleanup
    return () => {
      window.removeEventListener("resize", renderChart);
    };
  }, [data, options]);

  return (
    <div
      ref={chartRef}
      style={{ width: "100%", height: "100%", overflow: "visible" }} // Ensured the container allows overflow
    ></div>
  );
};

export default RadarChartComponent;
