// D3 code goes here
// create SVG element
const svg = d3.select("svg"),
  width = svg.attr("width"), // using variables to specify width of SVG
  height = svg.attr("height"), // using variables to specify height of SVG
  path = d3.geoPath(),
  data = d3.map(),
  worldmap = "countries.geo.json",
  worldpopulation = "illegal_data.csv";
    
let centered, world;

// style the geographic projection and scaling
const projection = d3.geoRobinson()
                  .scale(130)
                  .translate([width / 2, height / 2]);
    
// definie the colour scale
const colorScale = d3.scaleThreshold()
                  .domain([10000, 80000, 100000, 200000, 300000, 500000, 1000000, 5000000])
                  .range(["#d3d3d3","#bfe2db","#a2d9ce","#84cfc1","#4ba8c9","#2989bd","#0a6aad","#254b8c"]);
    
// add the tooltip
const tooltip = d3.select("body")
                .append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

// load the csv data and boot
d3.queue()
  .defer(d3.json, worldmap)
  .defer(d3.csv, worldpopulation, function(d) {data.set(d.code, + d.total);})
  .await(ready);
    
// create the choropleth drawing
function ready(error, topo) { // topo is the data received from the d3.queue function (world.geojson)
    
let mouseOver = function(d) {
  
d3.selectAll(".Country")
  .transition()
  .duration(200)
  .style("opacity", .5)
  .style("stroke","transparent");
        
d3.select(this)
  .transition()
  .duration(200)
  .style("opacity", 1)
  .style("stroke", "black");
  
tooltip.style("left", (d3.event.pageX + 15) + "px")
    .style("top", (d3.event.pageY - 28) + "px")
    .transition().duration(400)
    .style("opacity", 1)
    .text(d.properties.name + ': ' + d.total);}
    
let mouseLeave = function() {
    
d3.selectAll(".Country")
  .transition()
  .duration(200)
  .style("opacity", 1)
  .style("stroke", "transparent");
      
tooltip.transition().duration(300)
    .style("opacity", 0);}
    
// draw the outline for the world map
world = svg.append("g")
        .attr("class", "world");
          
world.selectAll("path")
  .data(topo.features)
  .enter()
  .append("path")
  .attr("d", d3.geoPath().projection(projection)) // drawing the outline for each country using d3.geoPath(), a built-in function that takes care of showing the map from a properly formatted geojson file
  .attr("data-name", function(d) {return d.properties.name}) //retrieve the name of the country from data
  .attr("fill", function(d) {d.total = data.get(d.id);return colorScale(d.total);}) // set the color of each country
  .style("stroke", "transparent")
  .attr("class", function(d) {return "Country"}) // add a class, styling and mouseover/mouseleave and click functions
  .attr("id", function(d) {return d.id})
  .style("opacity", 1)
  .on("mouseover", mouseOver)
  .on("mouseleave", mouseLeave)
  .on("click", click);
      
// create the legend
const x = d3.scaleLinear()
          .domain([0, 7])
          .range([10000, 80000, 100000, 200000, 300000, 500000, 1000000, 5000000]);
    
const legend = svg.append("g")
                .attr("id", "legend");
    
const legend_entry = legend.selectAll("g.legend")
                      .data(colorScale.range().map(function(d) {d = colorScale.invertExtent(d); 
                        if (d[0] == null) d[0] = x.domain()[0]; if (d[1] == null) d[1] = x.domain()[1]; return d;}))
                      .enter().append("g")
                      .attr("class", "legend_entry");
    
const ls_w = 20,
      ls_h = 20;
    
legend_entry.append("rect")
        .attr("x", 20)
        .attr("y", function(d, i) {return height - (i * ls_h) - 2 * ls_h;})
        .attr("width", ls_w)
        .attr("height", ls_h)
        .style("fill", function(d) {return colorScale(d[0]);})
        .style("opacity", 0.8);
    
legend_entry.append("text")
        .attr("x", 50)
        .attr("y", function(d, i) {return height - (i * ls_h) - ls_h - 6;})
        .text(function(d, i) {
          if (i === 0) return "< " + d[1];
          if (i === 1) return "10000 - " + d[1];
          if (i === 2) return "80000 - " + d[1];
          if (i === 3) return "100000 - " + d[1];
          if (i === 4) return "200000 - " + d[1];
          if (i === 5) return "300000 - " + d[1];
          if (i === 6) return "500000 - " + d[1];
          if (i === 7) return "1000000 - " + d[1];});
    
legend.append("text").attr("x", 15).attr("y", 280);}
    
// legend position
function click(d) {
  var x, y, k; 
  
world.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });}