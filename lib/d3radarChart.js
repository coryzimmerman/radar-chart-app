import * as d3 from "d3";

/**
 * RadarChart Function
 * @param {string} id - The DOM element ID where the radar chart will be rendered.
 * @param {Array} data - Array of datasets to plot on the radar chart.
 * @param {Object} options - Configuration options for the radar chart.
 */
export function RadarChart(id, data, options, questionToPillar, pillarColors) {
  // Use the options provided directly
  const cfg = options;

  // Convert rotation and angle offsets from degrees to radians
  const angleOffsetRadians = (Math.PI / 180) * cfg.angleOffsetDegrees;
  const rotationRadians = (Math.PI / 180) * cfg.rotationDegrees;
  const rotationOffset = -2.1; // Add this constant near the other angle calculations

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

  // Draw the wedges first
  const wedgeGroup = g
    .selectAll(".wedge")
    .data(allAxis)
    .enter()
    .append("g")
    .attr("class", "wedge");

  wedgeGroup
    .append("path")
    .attr("d", (d, i) => {
      const startAngle = angleSlice * (i * 2) - Math.PI / 2 + rotationRadians ;
      const endAngle = angleSlice * (i * 2 + 2) - Math.PI / 2 + rotationRadians ;
      return d3
        .arc()
        .innerRadius(0)
        .outerRadius(radius)
        .startAngle(startAngle)
        .endAngle(endAngle)();
    })
    .style("fill", (d) => pillarColors[questionToPillar[d]])
    .style("fill-opacity", cfg.wedgeOpacity);

  // Draw the concentric circles
  for (let level = 0; level < cfg.levels; level++) {
    const r = (radius / cfg.levels) * (level + 1);
    g.append("circle")
      .attr("r", r)
      .attr("fill", cfg.fillColorLevelCircles)
      .attr("stroke", cfg.strokeColorLevelCircles)
      .attr("fill-opacity", cfg.opacityCircles);
  }

  // Text indicating the levels
  for (let level = 0; level < cfg.levels; level++) {
    const r = (radius / cfg.levels) * (level + 1);
    g.append("text")
      .attr("x", 4)
      .attr("y", -r)
      .attr("dy", "0.4em")
      .style("font-size", cfg.levelFontSize)
      .attr("fill", cfg.levelTextColor)
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

  // Append lines for each axis
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
    .attr("stroke", (d) => (d.visible ? cfg.axisLineStroke : "none"))
    .attr("stroke-width", cfg.axisLineWidth);

  // Place axis labels with adjusted angles
  axisGroup
    .append("text")
    .attr("class", "legend")
    .style("font-size", cfg.axisLabelFontSize)
    .attr("text-anchor", "middle")
    .attr("dy", "0.35em")
    .attr(
      "x",
      (d, i) =>
        rScale(cfg.maxValue * cfg.labelFactor) *
        Math.cos(angleSlice * i - Math.PI / 2 - 2.1)
    )
    .attr(
      "y",
      (d, i) =>
        rScale(cfg.maxValue * cfg.labelFactor) *
        Math.sin(angleSlice * i - Math.PI / 2 - 2.1)
    )
    .text((d, i) => (i % 2 !== 0 ? d.axis : ""))
    .style("fill", cfg.axisLabelColor)
    .call(wrap, cfg.wrapWidth);

  // Radar line generator with an adjustable angle offset
  const radarLine = d3
    .lineRadial()
    .radius((d) => rScale(d.value))
    .angle((d, i) => angleSlice * (i * 2 + 1) + angleOffsetRadians + rotationOffset) // Apply the angle offset
    .curve(cfg.roundStrokes ? d3.curveCardinalClosed : d3.curveLinearClosed);

  const blobWrapper = g
    .selectAll(".radarWrapper")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "radarWrapper");

  // Plot radar lines with configurable stroke width and style
  blobWrapper
    .append("path")
    .attr("class", "radarStroke")
    .attr("d", (d) => radarLine(d.axes))
    .style("stroke-width", `${cfg.strokeWidth}px`)
    .style("stroke", (d, i) => cfg.color(i))
    .style("fill", "none")
    .style("stroke-dasharray", (d, i) =>
      cfg.style(i) === "dashed" ? "4 4" : "0"
    );

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
        rScale(d.value) * Math.cos(angleSlice * (i * 2 + 1) - Math.PI / 2 + rotationOffset)
    )
    .attr(
      "cy",
      (d, i) =>
        rScale(d.value) * Math.sin(angleSlice * (i * 2 + 1) - Math.PI / 2 + rotationOffset)
    )
    .style("fill", (d, i, nodes) => {
      const parentData = d3.select(nodes[i].parentNode).datum();
      const datasetIndex = data.indexOf(parentData);
      return cfg.color(datasetIndex);
    });

  // Simplify tooltip creation
  if (cfg.tooltip) {
    const tooltip = d3
      .select(id)
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background-color", "white")
      .style("color", "black")
      .style("padding", "5px")
      .style("border", "1px solid #ccc")
      .style("border-radius", "5px")
      .style("pointer-events", "none")
      .style("opacity", 0);

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
          rScale(d.value) * Math.cos(angleSlice * (i * 2 + 1) - Math.PI / 2 + rotationOffset)
      )
      .attr(
        "cy",
        (d, i) =>
          rScale(d.value) * Math.sin(angleSlice * (i * 2 + 1) - Math.PI / 2 + rotationOffset)
      )
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mouseover", (event, d) => {
        tooltip
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 10}px`)
          .style("opacity", 1)
          .html(
            `<strong>${d.axis}</strong><br/>Score: ${d.value}${
              d.explanation ? `<br/><em>${d.explanation}</em>` : ""
            }`
          );
      })
      .on("mouseout", () => {
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
}
