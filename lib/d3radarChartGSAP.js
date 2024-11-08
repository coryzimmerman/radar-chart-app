import * as d3 from "d3";
import gsap from "gsap";

/**
 * RadarChart Function with Adjustments:
 * - Animation consists of two sweeps.
 * - First sweep reveals the color fills (wedges).
 * - Second sweep reveals the plotted data (radar lines and data points).
 * - Sweeps are sped up by 200% (twice as fast).
 * @param {string} id - The DOM element ID where the radar chart will be rendered.
 * @param {Array} data - Array of datasets to plot on the radar chart.
 * @param {Object} options - Configuration options for the radar chart.
 * @param {Object} questionToPillar - Mapping of questions to pillars.
 * @param {Object} pillarColors - Mapping of pillars to colors.
 */
export function RadarChart(id, data, options, questionToPillar, pillarColors) {
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

  // Angle offset in degrees
  const angleOffsetDegrees = 0;
  const angleOffsetRadians = (Math.PI / 180) * angleOffsetDegrees;

  // Rotation of wedges in degrees
  const rotationDegrees = -30;
  const rotationRadians = (Math.PI / 180) * rotationDegrees;

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

  // Draw and animate the concentric circles
  const circles = [];
  for (let level = 0; level < cfg.levels; level++) {
    const r = (radius / cfg.levels) * (level + 1);
    const circle = g
      .append("circle")
      .attr("r", 0) // Start with radius zero for animation
      .attr("fill", "#CDCDCD")
      .attr("stroke", "#CDCDCD")
      .attr("fill-opacity", cfg.opacityCircles);

    circles.push({ circle: circle, r: r });
  }

  // Collect circle nodes and target radii for animation
  const circleAnimations = circles.map((d) => ({
    node: d.circle.node(),
    r: d.r,
  }));

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

  // Append lines for each axis with initial opacity zero
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
    .attr("stroke-width", "2px")
    .style("opacity", 0); // Start hidden for animation

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

  // Create a group for wedges
  const wedgeGroup = g.append("g").attr("class", "wedges");

  // Draw wedges with pillar colors rotated by -30 degrees
  wedgeGroup
    .selectAll(".wedge")
    .data(allAxis)
    .enter()
    .append("path")
    .attr("class", "wedge")
    .attr("d", (d, i) => {
      const startAngle = angleSlice * (i * 2) - Math.PI / 2 + rotationRadians;
      const endAngle = angleSlice * (i * 2 + 2) - Math.PI / 2 + rotationRadians;
      return d3
        .arc()
        .innerRadius(0)
        .outerRadius(radius)
        .startAngle(startAngle)
        .endAngle(endAngle)();
    })
    .style("fill", (d) => pillarColors[questionToPillar[d]])
    .style("fill-opacity", 0.1)
    .style("opacity", 1);

  // Create a group for radar data and apply clip path
  const radarDataGroup = g.append("g").attr("class", "radarDataGroup");

  // Radar line generator
  const radarLine = d3
    .lineRadial()
    .radius((d) => rScale(d.value))
    .angle((d, i) => angleSlice * (i * 2 + 1) + angleOffsetRadians)
    .curve(cfg.roundStrokes ? d3.curveCardinalClosed : d3.curveLinearClosed);

  // Plot radar blobs and data points for each dataset
  data.forEach((dataset, datasetIndex) => {
    const blobWrapper = radarDataGroup
      .append("g")
      .attr("class", "radarWrapper");

    // Radar line path
    blobWrapper
      .append("path")
      .attr("class", "radarStroke")
      .attr("d", radarLine(dataset.axes))
      .style("stroke-width", `${cfg.strokeWidth}px`)
      .style("stroke", cfg.color(datasetIndex))
      .style("fill", "none")
      .style("opacity", 1);

    // Radar circles
    blobWrapper
      .selectAll(".radarCircle")
      .data(dataset.axes)
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
      .style("fill", cfg.color(datasetIndex))
      .style("fill-opacity", 0.8)
      .style("opacity", 1);

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
        .data(dataset.axes)
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
  });

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

  // Create a sweep line
  const sweepLine = g
    .append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", radius * 1.1)
    .attr("y2", 0)
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .style("opacity", 1);

  // Create clip paths
  // Wedge clip path for wedges (fills)
  const wedgeClipPath = g
    .append("clipPath")
    .attr("id", "wedgeClip")
    .append("path")
    .attr("d", describeArc(0, 0, radius * 1.1, 0, 0));

  // Data clip path for radar data
  const dataClipPath = g
    .append("clipPath")
    .attr("id", "dataClip")
    .append("path")
    .attr("d", describeArc(0, 0, radius * 1.1, 0, 0));

  // Apply clip paths
  wedgeGroup.attr("clip-path", "url(#wedgeClip)");
  radarDataGroup.attr("clip-path", "url(#dataClip)");

  // Define rotation duration (sped up by 200%)
  const rotationDuration = 0.5; // Duration for one full sweep (was 2 seconds)

  // Create GSAP timeline
  const tl = gsap.timeline();

  // Animate concentric circles expanding from the center
  tl.to(
    circleAnimations.map((d) => d.node),
    {
      duration: 0.5, // Adjusted duration
      attr: { r: (i) => circleAnimations[i].r },
      stagger: 0.05, // Adjusted stagger
    }
  );

  // Animate the sweep line rotation for the first sweep (reveal wedges)
  tl.to(
    sweepLine.node(),
    {
      duration: rotationDuration,
      rotation: 360,
      svgOrigin: "0 0",
      ease: "none",
      onUpdate: function () {
        // Update wedge clip path angle to match sweep line
        const rotation = gsap.getProperty(sweepLine.node(), "rotation");
        wedgeClipPath.attr("d", describeArc(0, 0, radius * 1.1, 0, rotation));
      },
    },
    "-=0.5" // Overlap the start of the sweep with the circles animation
  );

  // Animate axis lines appearing with the sweep
  axisGroup.selectAll("line").each(function (d, i) {
    const angle = angleSlice * i * (180 / Math.PI); // Convert to degrees
    const delay = (angle / 360) * rotationDuration;
    tl.to(
      this,
      { duration: 0.05, opacity: 1 },
      `-=${rotationDuration - delay}` // Schedule based on delay
    );
  });

  // Second sweep for radar data (reveal data)
  tl.to(sweepLine.node(), {
    duration: rotationDuration,
    rotation: 720, // From 360 to 720 degrees
    svgOrigin: "0 0",
    ease: "none",
    onUpdate: function () {
      // Update data clip path angle to match sweep line
      const rotation = gsap.getProperty(sweepLine.node(), "rotation");
      const adjustedRotation = rotation - 360; // Adjust for second rotation
      dataClipPath.attr(
        "d",
        describeArc(0, 0, radius * 1.1, 0, adjustedRotation)
      );
    },
  });

  // Optionally, hide the sweep line after the animations
  tl.to(sweepLine.node(), { duration: 0.25, opacity: 0 }).add(() => {
    // Set clip paths to a full circle
    const fullArcPath = describeArc(0, 0, radius * 1.1, 0, 360);
    wedgeClipPath.attr("d", fullArcPath);
    dataClipPath.attr("d", fullArcPath);
  });

  // Function to describe an arc for the clip path
  function describeArc(x, y, radius, startAngle, endAngle) {
    const startRadians = (startAngle - 90) * (Math.PI / 180);
    const endRadians = (endAngle - 90) * (Math.PI / 180);

    return d3.arc()({
      innerRadius: 0,
      outerRadius: radius,
      startAngle: startRadians,
      endAngle: endRadians,
    });
  }

  // Function to convert polar coordinates to Cartesian coordinates
  function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  }
}
