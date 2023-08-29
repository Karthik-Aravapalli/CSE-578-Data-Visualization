// create the variables and margins for the SVG
var margin = {top: 60, right: 160, bottom: 50, left: 50},
    width = 1200 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;
var data=[];
var color;
var keys;
var filter;
var start_year;
var end_year;
var x = d3.scaleTime();
var x_axis;
    
// set the SVG
document.addEventListener('DOMContentLoaded', function () {
  svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform","translate(" + margin.left + "," + margin.top + ")");

  // Load the data from csv
  d3.csv("data/global_development.csv").then( function(value) {
    keys = value.columns.slice(2)
    //console.log(keys);

    value.forEach(element => {
      data.push({
        year: element.year,
        country: (element.country),
        Birth_Rate: +(element.Birth_Rate),
        Death_Rate: +(element.Death_Rate),
        Fertility_Rate: +(element.Fertility_Rate),
        Population_Growth: +(element.Population_Growth)
      })    
    });

    // set the color palets
    color = d3.scaleOrdinal()
      .domain(keys)
      .range(d3.schemeSet2);

    //console.log('data',data);
    //console.log('len', data.length);

    update_stack('Canada');
  })
});

function update_stack(selected)
{ 
  svg.selectAll("*").remove();
  //console.log('selected',selected);
  //console.log('len of data',data.length);
  filter=[];
  for(i=0;i<data.length;i++){
    if(data[i].country == selected){
      //console.log('hello');
      filter.push({
        year: data[i].year,
        country: data[i].country,
        Population_Growth: data[i].Population_Growth,
        Fertility_Rate: data[i].Fertility_Rate,
        Death_Rate: data[i].Death_Rate,
        Birth_Rate: data[i].Birth_Rate
      })
    }
  }
  //console.log('filtedred data', filter);
  draw(filter,selected);
}

function draw(data,selected)
{

  var Population_Avg=0, Fertility_Avg=0, Death_Avg=0, Birth_Avg=0;
  
  for(i=0;i<data.length;i++){
    Population_Avg += data[i].Population_Growth;
    Fertility_Avg += data[i].Fertility_Rate;
    Death_Avg += data[i].Death_Rate;
    Birth_Avg += data[i].Birth_Rate;
  }
  Population_Avg= Population_Avg/data.length;
  Fertility_Avg= Fertility_Avg/data.length;
  Death_Avg= Death_Avg/data.length;
  Birth_Avg= Birth_Avg/data.length;

  document.getElementById("Country_Name").innerHTML = selected;
  document.getElementById("Birth_Average").innerHTML = Birth_Avg;
  document.getElementById("Death_Average").innerHTML = Death_Avg;
  document.getElementById("Fertility_Average").innerHTML = Fertility_Avg;
  document.getElementById("Population_Average").innerHTML = Population_Avg;

  // console.log('Population_Avg',Population_Avg);
  // console.log('Fertility_Avg',Fertility_Avg);
  // console.log('Death_Avg',Death_Avg);
  // console.log('Birth_Avg',Birth_Avg);


  var data=data;
  var maximum = d3.max(data, function(d) {
    return d.Birth_Rate + d.Death_Rate + d.Fertility_Rate + d.Population_Growth;
  });
  //console.log('maximum',maximum);

  //stack the data?
  var stackedData = d3.stack()
    .keys(keys)
    (data)

  //console.log('stack data', stackedData);

  var x = d3.scaleLinear()
    .domain(d3.extent(data, function(d) { return d.year; }))
    .range([ 0, width ]);
  var xAxis = svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x))

  // Add X axis label:
  svg.append("text")
      .attr("x", width/2-50)
      .attr("y", height+40 )
      .text("Year")
      .style("font-weight", "bold");

  // Add Y axis label:
  svg.append("text")
      .attr("x", -300)
      .attr("y", -35 )
      .text("Health Data")
      .attr("transform", "rotate(-90)")
      .style("font-weight", "bold");
    

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0,maximum])
    .range([ height, 0 ]);
  svg.append("g")
    .call(d3.axisLeft(y))

  
  var clip = svg.append("defs").append("svg:clipPath")
      .attr("id", "clip")
      .append("svg:rect")
      .attr("width", width )
      .attr("height", height )
      .attr("x", 0)
      .attr("y", 0);

  
  var brush = d3.brushX()                 
      .extent( [ [0,0], [width,height] ] ) 
      .on("end", updateChart)

  
  var areaChart = svg.append('g')
    .attr("clip-path", "url(#clip)")

  // Area loading
  var area = d3.area()
    .x(function(d) { return x(d.data.year); })
    .y0(function(d) { return y(d[0]); })
    .y1(function(d) { return y(d[1]); })

  // Show the areas loaded
  areaChart
    .selectAll("mylayers")
    .data(stackedData)
    .join("path")
    .attr("class", function(d) { return "myArea " + d.key })
    .style("fill", function(d) { return color(d.key); })
    .attr("d", area)
    

  // Add brushing
  areaChart
    .append("g")
    .attr("class", "brush")
    .call(brush);


  let idleTimeout
  function idled() { idleTimeout = null; }

  function updateChart(event,d) {

    extent = event.selection

    if(!extent){
      if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); 
      x.domain(d3.extent(data, function(d) { return d.year; }))
    }else{
      x.domain([ x.invert(extent[0]), x.invert(extent[1]) ])
      areaChart.select(".brush").call(brush.move, null)
    }
 
    xAxis.transition().duration(1000).call(d3.axisBottom(x).ticks(5))
    areaChart
      .selectAll("path")
      .transition().duration(1000)
      .attr("d", area)
  }

  var mouse_on = function(event,d){
    d3.selectAll(".myArea").style("opacity", .2)
    d3.select("."+d).style("opacity", 1)      
  }

  var mouse_out = function(event,d){
    d3.selectAll(".myArea").style("opacity", 1)
  }

  var set = 20
  svg.selectAll("myrect")
    .data(keys)
    .join("rect")
    .attr("x", 1000)
    .attr("y", function(f,e){ return 10 + e*(set+5)}) 
    .attr("width", set)
    .attr("height", set)
    .style("fill", function(f){ return color(f)})
    .on("mouseover", mouse_on)
    .on("mouseleave", mouse_out)


  svg.selectAll("mylabels")
    .data(keys)
    .join("text")
    .attr("x", 1000 + set*1.2)
    .attr("y", function(f,e){ return 10 + e*(set+5) + (set/2)})
    .style("fill", function(f){ return color(f)})
    .text(function(f){ return f})
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")
    .on("mouseover", mouse_on)
    .on("mouseleave", mouse_out)
}
