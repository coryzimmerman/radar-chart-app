import * as d3 from "d3";

/**
 * RadarChart Function
 * @param {string} id - The DOM element ID where the radar chart will be rendered.
 * @param {Array} data - Array of datasets to plot on the radar chart.
 * @param {Object} options - Configuration options for the radar chart.
 */
export function RadarChart(id, data, options) {
  const cfg = {
    w: 800,
    h: 800,
    margin: {
      top: 100,
      right: 100,
      bottom: 100,
      left: 100,
    },
    levels: 5,
    maxValue: 8,
    labelFactor: 1.15,
    wrapWidth: 100,
    opacityArea: 0.35,
    dotRadius: 4,
    opacityCircles: 0.1,
    strokeWidth: 2,
    roundStrokes: true,
    color: d3.scaleOrdinal(d3.schemeCategory10),
    format: d3.format(".0f"),
    tooltip: true,
    unit: "",
    ...options,
  };

  // Angle offset in degrees, adjustable as needed (e.g., 90 for a 90-degree rotation)
  const angleOffsetDegrees = -0;
  const angleOffsetRadians = (Math.PI / 180) * angleOffsetDegrees;

  const allAxis = data[0].axes.map((i) => i.axis);
  const originalTotal = allAxis.length;
  const totalAxes = originalTotal * 2; // Doubling to add invisible axes
  const radius =
    Math.min(cfg.w / 2, cfg.h / 2) - Math.max(cfg.margin.left, cfg.margin.top);
  const angleSlice = (Math.PI * 2) / totalAxes;

  const rScale = d3.scaleLinear().range([0, radius]).domain([0, cfg.maxValue]);

  d3.select(id).select("svg").remove();

  const svg = d3
    .select(id)
    .append("svg")
    .attr("width", cfg.w + cfg.margin.left + cfg.margin.right)
    .attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
    .attr("class", "radar");

  const g = svg
    .append("g")
    .attr(
      "transform",
      `translate(${(cfg.w + cfg.margin.left + cfg.margin.right) / 2}, ${
        (cfg.h + cfg.margin.top + cfg.margin.bottom) / 2
      })`
    );

  // Define pillar colors
  const pillarColors = {
    "Powerful Practice": "#F3467C",
    "Streamlined Systems": "#00ADBB",
    "Intentional Growth": "#FFC728",
  };

  // Mapping of axis names to pillars
  const questionToPillar = {
    "Thematic Units": "Powerful Practice",
    "Session Structure": "Powerful Practice",
    "Evidence-Backed Strategies": "Powerful Practice",
    Paperwork: "Streamlined Systems",
    "Data Collection": "Streamlined Systems",
    "Therapy Planning": "Streamlined Systems",
    "Individual Growth": "Intentional Growth",
    "School Collaboration": "Intentional Growth",
    "Community Impact": "Intentional Growth",
  };

  // Draw the concentric circles
  for (let level = 0; level < cfg.levels; level++) {
    const r = (radius / cfg.levels) * (level + 1);
    g.append("circle")
      .attr("r", r)
      .attr("fill", "#CDCDCD")
      .attr("stroke", "#CDCDCD")
      .attr("fill-opacity", cfg.opacityCircles);
  }

  // Text indicating the levels
  for (let level = 0; level < cfg.levels; level++) {
    const r = (radius / cfg.levels) * (level + 1);
    g.append("text")
      .attr("x", 4)
      .attr("y", -r)
      .attr("dy", "0.4em")
      .style("font-size", "14px")
      .attr("fill", "#000")
      .text(cfg.format((cfg.maxValue * (level + 1)) / cfg.levels));
  }

  const axesData = [];
  allAxis.forEach((axis, i) => {
    axesData.push({ axis, visible: true });
    axesData.push({ axis, visible: false });
  });

  const axisGroup = g
    .selectAll(".axis")
    .data(axesData)
    .enter()
    .append("g")
    .attr("class", "axis");

  // Append lines for each axis with no rotation applied
  axisGroup
    .append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr(
      "x2",
      (d, i) =>
        rScale(cfg.maxValue * 1.1) * Math.cos(angleSlice * i - Math.PI / 2)
    )
    .attr(
      "y2",
      (d, i) =>
        rScale(cfg.maxValue * 1.1) * Math.sin(angleSlice * i - Math.PI / 2)
    )
    .attr("stroke", (d) => (d.visible ? "white" : "none"))
    .attr("stroke-width", "2px");

  // Place axis labels on visible axes only
  axisGroup
    .append("text")
    .attr("class", "legend")
    .style("font-size", "14px")
    .attr("text-anchor", "middle")
    .attr("dy", "0.35em")
    .attr(
      "x",
      (d, i) =>
        rScale(cfg.maxValue * cfg.labelFactor) *
        Math.cos(angleSlice * i - Math.PI / 2)
    )
    .attr(
      "y",
      (d, i) =>
        rScale(cfg.maxValue * cfg.labelFactor) *
        Math.sin(angleSlice * i - Math.PI / 2)
    )
    .text((d, i) => (i % 2 !== 0 ? d.axis : ""))
    .style("fill", "#000")
    .call(wrap, cfg.wrapWidth);

  // Draw wedges with pillar colors
  const wedgeGroup = g
    .selectAll(".wedge")
    .data(allAxis)
    .enter()
    .append("g")
    .attr("class", "wedge");

  wedgeGroup
    .append("path")
    .attr("d", (d, i) => {
      const startAngle = angleSlice * (i * 2) - Math.PI / 2;
      const endAngle = angleSlice * (i * 2 + 2) - Math.PI / 2;
      return d3
        .arc()
        .innerRadius(0)
        .outerRadius(radius)
        .startAngle(startAngle)
        .endAngle(endAngle)();
    })
    .style("fill", (d) => pillarColors[questionToPillar[d]])
    .style("fill-opacity", 0.1);

  // Radar line generator with an adjustable angle offset
  const radarLine = d3
    .lineRadial()
    .radius((d) => rScale(d.value))
    .angle((d, i) => angleSlice * (i * 2 + 1) + angleOffsetRadians) // Apply the angle offset
    .curve(cfg.roundStrokes ? d3.curveCardinalClosed : d3.curveLinearClosed);

  const blobWrapper = g
    .selectAll(".radarWrapper")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "radarWrapper");

  // Plot radar blobs with rotated line endings
  blobWrapper
    .append("path")
    .attr("class", "radarStroke")
    .attr("d", (d) => radarLine(d.axes))
    .style("stroke-width", `${cfg.strokeWidth}px`)
    .style("stroke", (d, i) => cfg.color(i))
    .style("fill", "none");

  // After defining blobWrapper, add animations to radar areas
  blobWrapper
    .append("path")
    .attr("class", "radarStroke")
    .attr("d", radarLine)
    .style("stroke-width", `${cfg.strokeWidth}px`)
    .style("stroke", (d, i) => cfg.color(i))
    .style("fill", "none")
    .attr("stroke-dasharray", function () {
      const totalLength = this.getTotalLength();
      return `${totalLength} ${totalLength}`;
    })
    .attr("stroke-dashoffset", function () {
      const totalLength = this.getTotalLength();
      return totalLength;
    })
    .transition()
    .duration(1000)
    .attr("stroke-dashoffset", 0);

  // Animate radar area fill
  blobWrapper
    .append("path")
    .attr("class", "radarArea")
    .attr("d", radarLine)
    .style("fill", (d, i) => cfg.color(i))
    .style("fill-opacity", 0)
    .transition()
    .delay(500)
    .duration(1000)
    .style("fill-opacity", cfg.opacityArea);

  // Animate data points
  blobWrapper
    .selectAll(".radarCircle")
    .style("opacity", 0)
    .transition()
    .delay(1000)
    .duration(500)
    .style("opacity", 1);

  // Add interactivity for tooltips
  blobWrapper
    .selectAll(".radarInvisibleCircle")
    .on("mouseover", function (event, d) {
      tooltip
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 10}px`)
        .style("opacity", 1)
        .html(
          `<strong>${d.axis}</strong><br/>Score: ${d.value}<br/><em>${
            d.explanation || ""
          }</em>`
        );
      // Highlight corresponding radar area
      d3.select(this.parentNode)
        .select(".radarArea")
        .transition()
        .duration(200)
        .style("fill-opacity", 0.7);
    })
    .on("mouseout", function () {
      tooltip.style("opacity", 0);
      // Reset radar area opacity
      d3.select(this.parentNode)
        .select(".radarArea")
        .transition()
        .duration(200)
        .style("fill-opacity", cfg.opacityArea);
    });

  // Plot data points on each invisible axis (unchanged from original)
  blobWrapper
    .selectAll(".radarCircle")
    .data((d) => d.axes)
    .enter()
    .append("circle")
    .attr("class", "radarCircle")
    .attr("r", cfg.dotRadius)
    .attr(
      "cx",
      (d, i) =>
        rScale(d.value) * Math.cos(angleSlice * (i * 2 + 1) - Math.PI / 2)
    )
    .attr(
      "cy",
      (d, i) =>
        rScale(d.value) * Math.sin(angleSlice * (i * 2 + 1) - Math.PI / 2)
    )
    .style("fill", (d, i, nodes) => {
      const parentData = d3.select(nodes[i].parentNode).datum();
      const datasetIndex = data.indexOf(parentData);
      return cfg.color(datasetIndex);
    })
    .style("fill-opacity", 0.8);

  // Re-add tooltip functionality
  if (cfg.tooltip) {
    // Tooltip div
    const tooltip = d3
      .select(id)
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background-color", "white")
      .style("padding", "5px")
      .style("border", "1px solid #ccc")
      .style("border-radius", "5px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    // Append invisible circles for tooltips
    blobWrapper
      .selectAll(".radarInvisibleCircle")
      .data((d) => d.axes)
      .enter()
      .append("circle")
      .attr("class", "radarInvisibleCircle")
      .attr("r", cfg.dotRadius * 1.5)
      .attr(
        "cx",
        (d, i) =>
          rScale(d.value) * Math.cos(angleSlice * (i * 2 + 1) - Math.PI / 2)
      )
      .attr(
        "cy",
        (d, i) =>
          rScale(d.value) * Math.sin(angleSlice * (i * 2 + 1) - Math.PI / 2)
      )
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mouseover", function (event, d) {
        tooltip
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 10}px`)
          .style("opacity", 1)
          .html(
            `<strong>${d.axis}</strong><br/>Score: ${d.value}<br/><em>${
              d.explanation || ""
            }</em>`
          );
      })
      .on("mouseout", function () {
        tooltip.style("opacity", 0);
      });
  }

  function wrap(text, width) {
    text.each(function () {
      const textEl = d3.select(this);
      const words = textEl.text().split(/\s+/).reverse();
      let word;
      let line = [];
      let lineNumber = 0;
      const lineHeight = 1.4;
      const y = textEl.attr("y");
      const x = textEl.attr("x");
      const dy = parseFloat(textEl.attr("dy"));
      let tspan = textEl
        .text(null)
        .append("tspan")
        .attr("x", x)
        .attr("y", y)
        .attr("dy", `${dy}em`);

      while ((word = words.pop())) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = textEl
            .append("tspan")
            .attr("x", x)
            .attr("y", y)
            .attr("dy", `${++lineNumber * lineHeight + dy}em`)
            .text(word);
        }
      }
    });
  }

  // Add legend for pillars
  const pillarLegend = svg
    .append("g")
    .attr("class", "pillarLegend")
    .attr(
      "transform",
      `translate(${cfg.margin.left}, ${cfg.h + cfg.margin.top + 20})`
    );

  Object.keys(pillarColors).forEach((pillar, i) => {
    const legendRow = pillarLegend
      .append("g")
      .attr("transform", `translate(${i * 150}, 0)`);

    legendRow
      .append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", pillarColors[pillar]);

    legendRow
      .append("text")
      .attr("x", 18)
      .attr("y", 12)
      .attr("text-anchor", "start")
      .style("font-size", "14px")
      .style("fill", "#000")
      .text(pillar);
  });

  // Add legend for datasets
  const datasetLegend = svg
    .append("g")
    .attr("class", "datasetLegend")
    .attr(
      "transform",
      `translate(${cfg.w + cfg.margin.left + 20}, ${cfg.margin.top})`
    );

  data.forEach((d, i) => {
    const legendRow = datasetLegend
      .append("g")
      .attr("transform", `translate(0, ${i * 25})`);

    legendRow
      .append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", cfg.color(i));

    legendRow
      .append("text")
      .attr("x", 18)
      .attr("y", 12)
      .attr("text-anchor", "start")
      .style("font-size", "14px")
      .style("fill", "#000")
      .text(d.name);
  });

  // Make the chart responsive
  svg
    .attr(
      "viewBox",
      `0 0 ${cfg.w + cfg.margin.left + cfg.margin.right} ${
        cfg.h + cfg.margin.top + cfg.margin.bottom
      }`
    )
    .attr("preserveAspectRatio", "xMidYMid meet");
}
