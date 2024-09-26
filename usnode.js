// set the dimensions and margins of the graph
const marginMap = {top: 50, right: 50, bottom: 50, left: 60},
    widthMap = 1000 - marginMap.left - marginMap.right,
    heightMap = 600 - marginMap.top - marginMap.bottom;

// container div for the SVG and info box
const container = d3.select("#graph-container")
  .style("position", "relative");

// append the main SVG to container
const svgMap = container.append("svg")
  .attr("width", widthMap + marginMap.left + marginMap.right)
  .attr("height", heightMap + marginMap.top + marginMap.bottom)
  .append("g")
  .attr("transform", `translate(${marginMap.left},${marginMap.top})`);




const airportData = d3.json("data.json");

const projection1 = d3.geoAlbersUsa()
  .scale(1200) // shrink the map size so that the entire map fits into the svg
  .translate([width/2, height /2]); // center the map around the center of the svg
  
const pathgeo1 = d3.geoPath().projection(projection1);

   // load us-states.json
const map = d3.json("./us-states.json");

const carrierNames = {
    'AA': "American Airlines",
    'DL': "Delta Airlines",
    'UA': "United Airlines",
    '9E': 'Endeavor Air',
    'AS': 'Alaska Airlines',
    'B6': 'JetBlue Airways',
    'C5': 'CommuteAir',
    'F9': 'Frontier Airlines',
    'G4': 'Allegiant Air',
    'G7': 'GoJet Airlines',
    'HA': 'Hawaiian Airlines',
    'MQ': 'Envoy Air',
    'NK': 'Spirit Airlines',
    'OH': 'PSA Airlines',
    'OO': 'Skywest Airlines',
    'PT': 'Piedmont Airlines',
    'QX': 'Horizon Air',
    'WN': 'Southwest Airlines',
    'YV': 'Mesa Airlines',
    'YX': 'Republic Airways',
    'ZW': 'Air Wisconsin'
  };

d3.csv('/grouped_flights_data.csv').then(function(data_csv){
    data_csv.forEach(d => {
      d.DEP_DELAY = +d.DEP_DELAY;
      d.ACTIVE_WEATHER = +d.ACTIVE_WEATHER;
      d.AIR_TIME = +d.AIR_TIME;
      d.ALTIMETER = +d.ALTIMETER;
      d.CANCELLED = +d.CANCELLED * 100;
      d.CLOUD_COVER = +d.CLOUD_COVER;
      d.DEP_HOUR = +d.DEP_HOUR;
      d.DEW_POINT = +d.DEW_POINT;
      d.DISTANCE = +d.DISTANCE;
      d.ELEVATION = +d.ELEVATION;
      d.FL_DATE_MONTH = +d.FL_DATE_MONTH;
      d.HIGH_LEVEL_CLOUD = +d.HIGH_LEVEL_CLOUD;
      d.LATITUDE = +d.LATITUDE;
      d.LONGITUDE = +d.LONGITUDE;
      d.LOWEST_CLOUD_LAYER = +d.LOWEST_CLOUD_LAYER;
      d.LOW_LEVEL_CLOUD = +d.LOW_LEVEL_CLOUD;
      d.MID_LEVEL_CLOUD = +d.MID_LEVEL_CLOUD;
      d.MKT_CARRIER_FL_NUM = +d.MKT_CARRIER_FL_NUM;
      d.N_CLOUD_LAYER = +d.N_CLOUD_LAYER;
      d.OP_CARRIER_FL_NUM = +d.OP_CARRIER_FL_NUM;
      d.REL_HUMIDITY = +d.REL_HUMIDITY;
      d.TAXI_OUT = +d.TAXI_OUT;
      d.TEMPERATURE = +d.TEMPERATURE;
      d.VISIBILITY = +d.VISIBILITY;
      d.WIND_DIR = +d.WIND_DIR;
      d.WIND_GUST = +d.WIND_GUST;
      d.WIND_SPD = +d.WIND_SPD;
      d['YEAR OF MANUFACTURE'] = Math.floor(+d['YEAR OF MANUFACTURE']);
      const carrierCode = d.OP_UNIQUE_CARRIER;
      const carrierName = carrierNames[carrierCode];
      d.OP_UNIQUE_CARRIER = carrierName;
    })
    // console.log(data_csv)
map.then(map => {

    svgMap.selectAll("path")
        .data(map.features)
        .enter()
        .append("path")
        .attr("d", pathgeo1)
        .attr('fill','grey')
        .attr('stroke','black')
        .attr('stroke-opacity','0.4')

    // const zoomMap = d3.zoom()
    // .scaleExtent([0.5, 5])
    // .on("zoom", zoomFuncMap);
    
    // function zoomFuncMap(event) {
    //     svgMap.attr("transform", event.transform);
    //     }
    
    // svgMap.append("rect")
    //     .attr("width", widthMap)
    //     .attr("height", heightMap)
    //     .style("fill", "none")
    //     .style("pointer-events", "all")
    //     .call(zoomMap);

    airportData.then(data => {
        const nodes = data.nodes;
        const links = data.links;
        
        const nodeSelection = svgMap.selectAll(".node")
        .data(nodes)
        .enter()
        .append("g");
    
        function getAirlineColor(link) {
       
            const airlineName = link.airline;
        
            const colorScheme = {
                "Southwest Airlines": "orange",
                "American Airlines": "red",
                "Delta Airlines": "blue",
                "JetBlue Airways": "brown",
                "Spirit Airlines": "yellow",
                "Alaska Airlines": "purple",
                "Frontier Airlines": "pink",
                "Allegiant Air": "green",
                "United Airlines": "#9edae5",
            };
            return colorScheme[airlineName]; 
          }

        
          const lineGenerator = d3.line()
          .x(d => projection1([d.LONGITUDE, d.LATITUDE])[0])
          .y(d => projection1([d.LONGITUDE, d.LATITUDE])[1]);
        
        const linkSelection = svgMap.selectAll(".link")
          .data(links)
          .enter()
          .append("path")
          .attr("class", "link")
          .attr("stroke", d => getAirlineColor(d))
          .attr("d", d => {
            const sourceNode = nodes.find(node => node.id === d.source);
            const targetNode = nodes.find(node => node.id === d.target);
            const lineData = [sourceNode, targetNode];
            return lineGenerator(lineData);
          })

        // circles representing airports
        nodeSelection.append("circle")
        .attr("cx", d => projection1([d.LONGITUDE, d.LATITUDE])[0])
        .attr("cy", d => projection1([d.LONGITUDE, d.LATITUDE])[1])
        .attr("r", 5);


        // text representing name of airport
        nodeSelection.append("text")
            .attr("x", d => projection1([d.LONGITUDE, d.LATITUDE])[0])
            .attr("y", d => projection1([d.LONGITUDE, d.LATITUDE])[1] - 10)
            .text(d => d.name)
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle");
    

const airlineColors = {
    "Southwest Airlines": "orange",
    "American Airlines": "red",
    "Delta Airlines": "blue",
    "JetBlue Airways": "brown",
    "Spirit Airlines": "yellow",
    "Alaska Airlines": "purple",
    "Frontier Airlines": "pink",
    "Allegiant Air": "green",
    "United Airlines": "#9edae5",
  };
  
  const airlineNames = Object.keys(airlineColors);
  
  const legendWidth = 130;
  
  // legend 
  const svgLegend = svgMap
  .append("g")
  .attr("transform", `translate(${widthMap - legendWidth - 10}, 360)`);
  
  const legendAttr = svgLegend
    .selectAll(".legend-item")
    .data(airlineNames)
    .enter()
    .append("g")
    .attr("transform", (d, i) => `translate(-800, ${i * 20})`)
    .on("mouseover",handleLegendItemHover)
    .on("mouseout", handleLegendItemMouseout);;

  legendAttr
  .append("line")
  .attr("x1", 0)
  .attr("y1", 6)
  .attr("x2", 15)
  .attr("y2", 6)
  .style("stroke", d => airlineColors[d])
  .style("stroke-width", "2px");
  
  legendAttr
    .append("text")
    .attr("x", 20)
    .attr("y", 10)
    .text(d => d)
    .attr("alignment-baseline", "middle");

// make info box about stats for each airline

const infoBox = container.append("svg")
  .attr("width", 200)
  .attr("height", 70)
  .style("position", "absolute")
  .style("bottom", "10px")
  .style("right", "800px")
  .style("border","none");

const airlineText = infoBox.append("text")
  .attr("x", 10)
  .attr("y", 20)
  .text("Airline: ");

const routesText = infoBox.append("text")
  .attr("x", 10)
  .attr("y", 40)
  .text("Total Routes: ");

const cancelledText = infoBox.append("text")
  .attr("x", 10)
  .attr("y", 60)
  .text("Cancellations: ");

  
  // function to update the info based on airline
function updateInfoBox(airlineName) {
    const airlineRoutes = links.filter(link => link.airline === airlineName).length;
    const airlineData = data_csv.find(item => item.OP_UNIQUE_CARRIER === airlineName);
    const cancellationRate = airlineData ? airlineData.CANCELLED : "N/A";
  
    airlineText.text("Airline: " + airlineName);
    routesText.text("Total Routes: " + airlineRoutes);
    cancelledText.text("Cancellations: " + (cancellationRate).toFixed(3) + "%");
    
  }
  
// function to handle hover event
function handleLegendItemHover() {
    const airlineName = d3.select(this).datum(); 

  // Filter the link selection based on airline 
  linkSelection.attr("opacity", route =>
    route.airline === airlineName ? 0.8 : 0
  );

  updateInfoBox(airlineName);

    
  }
  
  // Function to handle mouseout event
  function handleLegendItemMouseout() {

    linkSelection.attr("opacity", 1);


    airlineText.text("Airline: ");
    routesText.text("Total Routes: ");
    cancelledText.text("Cancellations: ");

  }      
    
        
    });


});

svgMap.append("text")
  .attr("x", width / 2)
  .attr("y", -margin.top / 2)
  .attr("text-anchor", "middle")
  .text("Airline Flight Routes From The Top 20 Busiest Aiports In The Year 2022");
})
