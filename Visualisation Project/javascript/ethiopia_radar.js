// ******* Common varaible set up *******
var year = ["2021", "2020", "2019", "2018"];
var w = 600;
var h = 600;
var data = [
  {
    className: "conflict-and-violence",
    axes: [
      { axis: "2021", value: 1.40182605 },
      { axis: "2020", value: -0.2156655},
      { axis: "2019", value: -0.970495 },
      { axis: "2018", value: -0.2156655 }
    ]
  },
  {
    className: "natural-disaster",
    axes: [
      { axis: "2021", value: -0.953224 },
      { axis: "2020", value: 1.2197165 },
      { axis: "2019", value: 0.399739},
      { axis: "2018", value: -0.666232 }
    ]
  },
  {
    className: "human-trafficking",
    axes: [
      { axis: "2021", value: -1.193754 },
      { axis: "2020", value: 0.1414033 },
      { axis: "2019", value: 1.2337191 },
      { axis: "2018", value: -0.181369 }
    ]
  }
];


// ******* Chart varaible set up *******
var padding = 40; 
var containerSize = Math.min(w, h) - padding * 2;
var scale = d3.scaleLinear().domain([0, 10]).range([0, containerSize / 2]);
var ticks = [2, 4, 6, 8, 10];
var max = d3.max(data, d => d3.max(d.axes, d => d.value));
var Cscale = d3.scaleLinear().domain([0, max]).range([0, containerSize / 2]);
var svg = d3.select("#chart").append("svg").attr("width", w).attr("height", h);

// ******* Chart code: grid *******
const angle = (2 * Math.PI) / year.length; // Angle between each point of the polygon
const centerX = w / 2;
const centerY = h / 2;
const polygonVertices = year.map((d, i) => [
  centerX + Math.cos(i * angle + Math.PI / 2) * scale(10),
  centerY + Math.sin(i * angle + Math.PI / 2) * scale(10)
]);
polygonVertices.push(polygonVertices[0]);
svg.append("polygon").attr("points", polygonVertices.map(d => d.join(",")).join(" "));


// ******* Chart code: grid lines *******
ticks.forEach((tick) => {
  year.forEach((d, i) => {
    const x1 = centerX + Math.cos(i * angle + Math.PI / 2) * scale(tick);
    const y1 = centerY + Math.sin(i * angle + Math.PI / 2) * scale(tick);
    const x2 = centerX + Math.cos((i + 1) * angle + Math.PI / 2) * scale(tick);
    const y2 = centerY + Math.sin((i + 1) * angle + Math.PI / 2) * scale(tick);

    svg.append("line")
      .attr("x1", x1)
      .attr("y1", y1)
      .attr("x2", x2)
      .attr("y2", y2)

  });
});

// ******* Chart code: grid axis *******
function angleToCoordinate(angle, point) {
  var x = centerX + Math.cos(angle - Math.PI / 2) * scale(10);
  var y = centerY + Math.sin(angle - Math.PI / 2) * scale(10);
  return { "x": x, "y": y };
}

var YearData = year.map((f, i) => {
  var angle = (Math.PI / 2) + (2 * Math.PI * i / year.length) + (Math.PI / 2);
  var labelDistance = scale(10);
  var labelCoord = angleToCoordinate(angle, labelDistance);
  return {
    "name": f,
    "angle": angle,
    "line_coord": angleToCoordinate(angle, 10),
    "label_coord": labelCoord
  };
});

svg.selectAll(".axislabel")
  .data(YearData)
  .enter()
  .append("text")
  .attr("class", "axislabel")
  .attr("x", d => d.label_coord.x)
  .attr("y", d => d.label_coord.y)
  .text(d => d.name);



// ******* Chart code: Legend *******
// Legend varaibles
var width = 350
var height = 200
var Svg = d3.select("#ledged").append("svg").attr("width", width).attr("height", height)
var keys = ["CONFLICT AND VIOLENCE", "NATURAL DISASTER", "HUMAN TRAFFICING"]
var colour = ["rgba(124, 97, 108, 1)", "rgba(221, 202, 217, 1)", "rgba(170, 189, 223, 1)"]

// Ledend code 
Svg.selectAll("mydots")
  .data(keys)
  .enter()
  .append("circle")
  .attr("cx", 100)
  .attr("cy", function (d, i) { return 100 + i * 25 }) // 100 is where the first dot appears. 25 is the distance between dots
  .attr("r", 7)
  .style("fill", function (d, i) { return colour[i] })

Svg.selectAll("mylabels")
  .data(keys)
  .enter()
  .append("text")
  .attr("x", 120)
  .attr("y", function (d, i) { return 100 + i * 25 }) // 100 is where the first dot appears. 25 is the distance between dots
  .style("fill", function (d, i) { return colour[i] })
  .text(function (d) { return d })
  .attr("text-anchor", "left")
  .style("alignment-baseline", "middle")

  
// ******* Chart code: Drawing Data*******
  var line = d3.lineRadial().curve(d3.curveCardinalClosed).radius(d => Cscale(d.value)).angle((d, i) => i * angle);
  var g = svg.append("g").attr("transform", `translate(${centerX},${centerY})`);
// drawing chart data 
var blobWrapper = g.append("g")
  .attr("class", "all-blobs-wrapper")
  .selectAll(".blob-wrapper")
  .data(data)
  .enter().append("g")
  .attr("class", d => "blob-wrapper" + d.className);

blobWrapper.append("path")
  .attr("class", d => "blob-area blob-area-" + d.className)
  .attr("d", (d, i) => {
    return line(d.axes);
  })
// ******* Chart interactity: opacity popout of data *******
  .on('mouseover', function (d, i) {
    d3.selectAll(".blob-area")
      .transition().duration(200)
      .style("fill-opacity", 0.3);
    d3.select(this)
      .transition().duration(200)
      .style("fill-opacity", 0.8);
  })
  .on('mouseout', function () {
    d3.selectAll(".blob-area")
      .transition().duration(200)
      .style("fill-opacity", 0.5);
  })
  .style("fill", (d, i) => colour[i])
  .style("fill-opacity", 0.5)
  .style("stroke", (d, i) => colour[i])
  .style("stroke-width", 2);

// ******* Chart interactity: tool tip *******
blobWrapper.append("path")
var blobWrapper = g.append("g")
  .attr("class", "all-blobs-wrapper")
  .selectAll(".blob-wrapper")
  .enter().append("g")
  .attr("class", d => "blob-wrapper" + d.className);

blobWrapper.append("path")
  .attr("class", d => "blob-area blob-area-" + d.className)
  .attr("d", (d, i) => {
    return line(d.axes);
  }).on("mouseover", function(d) {
    // Get the class name of the current blob area
    var className = d.className;
    // Show the corresponding tooltip based on the class name
    d3.select("#" + className).classed("hidden", false);
  })
  .on("mouseout", function(d) {
    // Get the class name of the current blob area
    var className = d.className;
    // Hide the corresponding tooltip based on the class name
    d3.select("#" + className).classed("hidden", true);
  })
  






