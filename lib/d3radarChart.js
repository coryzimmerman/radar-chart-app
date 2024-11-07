import * as d3 from "d3";

/**
 * RadarChart Function
 * @param {string} id - The DOM element ID where the radar chart will be rendered.
 * @param {Array} data - Array of datasets to plot on the radar chart.
 * @param {Object} options - Configuration options for the radar chart.
 */
export function RadarChart(id, data, options) {
  const cfg = {
    w: 800, // Fixed width of the chart
    h: 800, // Fixed height of the chart
    margin: {
      top: 100, // Adjusted margins for better spacing
      right: 100,
      bottom: 100,
      left: 100,
    },
    levels: 5, // Number of concentric circles
    maxValue: 8, // Maximum value for the chart
    labelFactor: 1.15, // Adjusted labelFactor for label positioning
    wrapWidth: 100, // Adjusted wrap width for longer labels
    opacityArea: 0.35, // Opacity of the filled area
    dotRadius: 4, // Radius of the data points
    opacityCircles: 0.1, // Opacity of the concentric circles
    strokeWidth: 2, // Stroke width of the lines
    roundStrokes: true, // Smoothness of the lines
    color: d3.scaleOrdinal(d3.schemeCategory10), // Color scale for datasets
    format: d3.format(".0f"), // Number formatting
    tooltip: true, // Enable tooltips
    unit: "", // Unit for the values
    ...options, // Override default options with user-provided options
  };

  // Define pillar colors
  const pillarColors = {
    "Powerful Practice": "#F3467C", // Pillar 1
    "Streamlined Systems": "#00ADBB", // Pillar 2
    "Intentional Growth": "#FFC728", // Pillar 3
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

  // Calculate the global maximum value across all datasets
  const maxValue = Math.max(
    cfg.maxValue,
    d3.max(data, (d) => d3.max(d.axes, (o) => o.value)) // Changed 'd.data' to 'd.axes'
  );

  const allAxis = data[0].axes.map((i) => i.axis); // Axis names
  const originalTotal = allAxis.length; // Original number of axes (9)
  const totalAxes = originalTotal * 2; // Total axes after adding invisible ones (18)
  const radius =
    Math.min(cfg.w / 2, cfg.h / 2) - Math.max(cfg.margin.left, cfg.margin.top); // Radius with margin
  const angleSlice = (Math.PI * 2) / totalAxes; // Angle per slice (360/18=20 degrees)

  // Scale for the radius
  const rScale = d3.scaleLinear().range([0, radius]).domain([0, maxValue]);

  // Remove existing SVG if any
  d3.select(id).select("svg").remove();

  // Create the SVG container with fixed size
  const svg = d3
    .select(id)
    .append("svg")
    .attr("width", cfg.w + cfg.margin.left + cfg.margin.right)
    .attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
    .attr("class", "radar");

  // Append a group element
  const g = svg
    .append("g")
    .attr(
      "transform",
      `translate(${(cfg.w + cfg.margin.left + cfg.margin.right) / 2}, ${
        (cfg.h + cfg.margin.top + cfg.margin.bottom) / 2
      })`
    );

  ///////////////////////////////////////////////////////////
  ///////////////// Draw the Circular Grid //////////////////
  ///////////////////////////////////////////////////////////

  // Draw the background circles
  for (let level = 0; level < cfg.levels; level++) {
    const r = (radius / cfg.levels) * (level + 1);
    g.append("circle")
      .attr("r", r)
      .attr("fill", "#CDCDCD")
      .attr("stroke", "#CDCDCD")
      .attr("fill-opacity", cfg.opacityCircles);
  }

  // Text indicating the level
  for (let level = 0; level < cfg.levels; level++) {
    const r = (radius / cfg.levels) * (level + 1);
    g.append("text")
      .attr("x", 4)
      .attr("y", -r)
      .attr("dy", "0.4em")
      .style("font-size", "14px") // Increased font size
      .attr("fill", "#000") // Set text color to black
      .text(cfg.format((maxValue * (level + 1)) / cfg.levels));
  }

  ///////////////////////////////////////////////////////////
  ////////////////////// Draw the Axes //////////////////////
  ///////////////////////////////////////////////////////////

  const axesData = [];
  allAxis.forEach((axis, i) => {
    axesData.push({ axis, visible: true }); // Original visible axis
    axesData.push({ axis, visible: false }); // Invisible axis for centering
  });

  const axisGroup = g
    .selectAll(".axis")
    .data(axesData)
    .enter()
    .append("g")
    .attr("class", "axis");

  // Append the lines
  axisGroup
    .append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", (d, i) =>
      d.visible
        ? rScale(maxValue * 1.1) * Math.cos(angleSlice * i - Math.PI / 2)
        : rScale(maxValue * 1.1) * Math.cos(angleSlice * i - Math.PI / 2)
    )
    .attr("y2", (d, i) =>
      d.visible
        ? rScale(maxValue * 1.1) * Math.sin(angleSlice * i - Math.PI / 2)
        : rScale(maxValue * 1.1) * Math.sin(angleSlice * i - Math.PI / 2)
    )
    .attr("stroke", (d) => (d.visible ? "white" : "none")) // Invisible axes have no stroke
    .attr("stroke-width", "2px");

  // Modify the labeling logic to include blank labels for even-numbered axes
  axisGroup
    .append("text")
    .attr("class", "legend")
    .style("font-size", "14px") // Adjusted font size
    .attr("text-anchor", "middle")
    .attr("dy", "0.35em")
    .attr(
      "x",
      (d, i) =>
        rScale(maxValue * cfg.labelFactor) *
        Math.cos(angleSlice * i - Math.PI / 2)
    )
    .attr(
      "y",
      (d, i) =>
        rScale(maxValue * cfg.labelFactor) *
        Math.sin(angleSlice * i - Math.PI / 2)
    )
    .text((d, i) => (i % 2 !== 0 ? d.axis : "")) // Add label text only for odd indices, leave blank for even
    .style("fill", "#000") // Set text color to black for better contrast
    .call(wrap, cfg.wrapWidth);

  ///////////////////////////////////////////////////////////
  ///////////////// Draw the Radar Chart Blobs /////////////
  ///////////////////////////////////////////////////////////

  // Line generator
  const radarLine = d3
    .lineRadial()
    .radius((d, i) => rScale(d.value))
    .angle((d, i) => {
      // Plot on every other axis starting from the second
      return angleSlice * (i * 2 + 1) - Math.PI / 2;
    })
    .curve(cfg.roundStrokes ? d3.curveCardinalClosed : d3.curveLinearClosed);

  // Create a wrapper for the blobs
  const blobWrapper = g
    .selectAll(".radarWrapper")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "radarWrapper");

  // Append the filled areas
  blobWrapper.selectAll(".radarArea").remove(); // Remove existing filled areas

  blobWrapper
    .append("path")
    .attr("class", "radarArea")
    .attr("d", (d) => radarLine(d.axes))
    .style("fill", (d, i) => cfg.color(i))
    .style("fill-opacity", cfg.opacityArea)
    .on("mouseover", function () {
      // Dim all blobs
      d3.selectAll(".radarArea")
        .transition()
        .duration(200)
        .style("fill-opacity", 0.1);
      // Bring back the hovered over blob
      d3.select(this).transition().duration(200).style("fill-opacity", 0.7);
    })
    .on("mouseout", function () {
      // Bring back all blobs
      d3.selectAll(".radarArea")
        .transition()
        .duration(200)
        .style("fill-opacity", cfg.opacityArea);
    });

  // Create the outlines
  blobWrapper.selectAll(".radarStroke").remove(); // Remove existing strokes

  blobWrapper
    .append("path")
    .attr("class", "radarStroke")
    .attr("d", (d) => radarLine(d.axes)) // Changed 'd.data' to 'd.axes'
    .style("stroke-width", `${cfg.strokeWidth}px`)
    .style("stroke", (d, i) => cfg.color(i))
    .style("fill", "none");

  // Append the circles on invisible axes
  blobWrapper.selectAll(".radarCircle").remove(); // Remove existing circles

  blobWrapper
    .selectAll(".radarCircle")
    .data((d) => d.axes) // Changed 'd.data' to 'd.axes'
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
      // Find the parent dataset's index
      const parentData = d3.select(nodes[i].parentNode).datum();
      const datasetIndex = data.indexOf(parentData);
      return cfg.color(datasetIndex);
    })
    .style("fill-opacity", 0.8);

  ///////////////////////////////////////////////////////////
  ///////////// Append Invisible Circles for Tooltip ///////
  ///////////////////////////////////////////////////////////

  if (cfg.tooltip) {
    // Tooltip div
    const tooltip = d3
      .select(id)
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "#fff")
      .style("padding", "8px")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("font-size", "14px") // Increased font size
      .style("color", "#000"); // Set text color to black

    // Append invisible circles on shifted axes
    blobWrapper
      .selectAll(".radarInvisibleCircle")
      .data((d) => d.axes) // Changed 'd.data' to 'd.axes'
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

  ///////////////////////////////////////////////////////////
  ///////////// Draw Legends //////////////////////////////
  ///////////////////////////////////////////////////////////

  // Create legend
  const legend = svg
    .append("g")
    .attr("class", "legend")
    .attr(
      "transform",
      `translate(${cfg.w + cfg.margin.left + 20}, ${cfg.margin.top})`
    );

  data.forEach((d, i) => {
    const legendRow = legend
      .append("g")
      .attr("transform", `translate(0, ${i * 25})`); // Increased spacing

    legendRow
      .append("rect")
      .attr("width", 12) // Increased size
      .attr("height", 12)
      .attr("fill", cfg.color(i));

    legendRow
      .append("text")
      .attr("x", 18)
      .attr("y", 12)
      .attr("text-anchor", "start")
      .style("font-size", "16px") // Increased font size
      .style("fill", "#000") // Set text color to black
      .text(d.name);
  });

  ///////////////////////////////////////////////////////////
  ////////////////////// Helper Function ///////////////////
  ///////////////////////////////////////////////////////////

  /**
   * Wraps SVG text to fit within a specified width.
   * @param {Object} text - The SVG text element.
   * @param {number} width - The maximum width before wrapping.
   */
  function wrap(text, width) {
    text.each(function () {
      const textEl = d3.select(this);
      const words = textEl.text().split(/\s+/).reverse();
      let word;
      let line = [];
      let lineNumber = 0;
      const lineHeight = 1.4; // ems
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
