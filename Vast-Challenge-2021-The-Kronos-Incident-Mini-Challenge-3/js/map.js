const mapWidth = 900;
const mapHeight = 600;
const mapTooltipWidth = 300;
var mapsvg, projection, pathGenerator, mapTooltip
var geoData
var mapMargin = {
    left: 20,
    top:50,
    bottom: 10,
    right: 10
}
var tweetData_map = []

document.addEventListener('DOMContentLoaded', function () {
    mapsvg = d3.select("#mapDiv").append("svg")
        .attr("width", mapWidth-mapMargin.left-mapMargin.right)
        .attr("height", mapHeight-mapMargin.top-mapMargin.bottom);
    Promise.all([d3.csv('data/RawData/csv-1700-1830.csv'), d3.csv('data/RawData/csv-1831-2000.csv'), d3.csv('data/RawData/csv-2001-2131.csv')])
        .then(function (values) {
            var fullValues = values[0].concat(values[1], values[2])
            getReqData_Map(fullValues)
        })
    d3.json("data/geoData/Abila.geojson")
        .then(function (data) {
            geoData = data
            projection = d3.geoMercator()
                .fitSize([mapWidth-mapMargin.left-mapMargin.right, mapHeight-mapMargin.top-mapMargin.bottom-56], geoData);

            pathGenerator = d3.geoPath().projection(projection);


            var features = geoData.features;

            mapsvg.selectAll("path")
                .data(features)
                .enter()
                .append("path")
                .attr("d", pathGenerator)
                .attr("transform", "translate(" + mapMargin.left + "," + mapMargin.top + ")")
                .style("fill", "none")
                .style("stroke", "grey")
                .style("stroke-width", 1);

            mapTooltip = d3.select("#mapToolTip_div")
                .attr("class", "tooltip")
                .style('position', 'absolute')
                .style("visibility", "hidden")
                .style("background-color", "white")
                .style("border", "solid")
                .style("border-width", "medium")
                .style("border-radius", "5px")
                .style("padding", "10px")
                .style("opacity", 0)
                .style("max-width", mapTooltipWidth + "px");

            addMapLegend()

            mapsvg.append('text')
                .attr('x', mapWidth/2)
                .attr('y', mapMargin.top-20)
                .attr('text-anchor', 'middle')
                .style('font-size', '30px')
                .style('text-decoration', 'underline')
                .text('Incident mapping at Abila')

            tweetData_map.forEach(data => {
                highlightLocation(data)
            })

        })
})

function updateMarkOnMap(startT, endT) {
    d3.selectAll(".highlight_dot").remove()
    d3.selectAll(".highlight_line").remove()

    tweetData_map.filter(data => data.time >= startT && data.time <= endT)
        .forEach(data => {
            //console.log(data.location)
            highlightLocation(data)
        })
}

function getReqData_Map(unprocessedData) {

    unprocessedData.forEach(row => {
        if (row[' location'] !== "" && row[' location'] !== "N/A") {
            const item = {
                'location': row[' location'].trim(),
                'time': timeFormater(row['date(yyyyMMddHHmmss)']),
                'tweet': row['message'],
                'author': row['author']
            }
            tweetData_map.push(item)
        }

    })
}

function haveCommonArray(arr1, arr2) {
    for (let i = 0; i < arr1.length; i++) {
        for (let j = 0; j < arr2.length; j++) {
            if (JSON.stringify(arr1[i]) === JSON.stringify(arr2[j])) {
                return arr1[i];
            }
        }
    }
    return [];
}

function streetNamer(name) {
    var street = {
        'FEDIRP': null,
        'FENAME': null,
        'FETYPE': null
    }
    var temp = name.trim().split(" ")

    if (temp.length >= 3) {
        if ((["N", "E", "W", "S"]).includes(temp[0].replace('.', ''))) {
            street.FEDIRP = temp[0].replace('.', '')
        }
        street.FENAME = temp[1]
        street.FETYPE = temp[2]
    } else {
        street.FENAME = temp[0]
        street.FETYPE = temp[1]
    }

    return street
}

function highlightLocation(tweet) {
    const address = tweet.location
    if (address.includes("/")) {
        const streets = address.split("/")

        const street1 = streetNamer(streets[0])
        const street2 = streetNamer(streets[1])

        const segments1 = geoData.features.filter(feature => feature.properties.FENAME === street1.FENAME && feature.properties.FEDIRP === street1.FEDIRP && feature.properties.FETYPE === street1.FETYPE)
            .map(feature => feature.geometry);
        const segments2 = geoData.features.filter(feature => feature.properties.FENAME === street2.FENAME && feature.properties.FEDIRP === street2.FEDIRP && feature.properties.FETYPE === street2.FETYPE)
            .map(feature => feature.geometry);

        //console.log(segments1)
        //console.log(segments2)

        const array1 = []
        const array2 = []
        segments1.forEach(item => {
            const temp = item.coordinates
            temp.forEach(i => {
                array1.push(i)
            })
        })
        segments2.forEach(item => {
            const temp = item.coordinates
            temp.forEach(i => {
                array2.push(i)
            })
        })

        const filteredArray = haveCommonArray(array1, array2)

        if (filteredArray.length >= 2) {
            mapsvg.append("circle")
                .attr("cx", projection(filteredArray)[0])
                .attr("cy", projection(filteredArray)[1])
                .attr("class", "highlight_dot")
                .attr("r", 5)
                .style("fill", "red")
                .style("stroke", "black")
                .attr("transform", "translate(" + mapMargin.left + "," + mapMargin.top + ")")
                .on("mouseover", function (d, i) {
                    //console.log("mouse on :" + tweet.location)
                    d3.select(this).attr("stroke-width", 3);
                    mapTooltip.html(
                        "<b> Time: </b>" + tweet.time +
                        "<br>" +
                        "<b> Message: </b>" + tweet.tweet +
                        "<br>" +
                        "<b> Location: </b>" + tweet.location
                    )
                        .style("opacity", 1)
                        .style("visibility", "visible")
                        .style("border-color", "red");
                })
                .on("mouseout", function (d, i) {
                    d3.select(this).attr("stroke-width", 1);
                    mapTooltip
                        .style("opacity", 0)
                        .style("visibility", "hidden")

                })
                .on("mousemove", function (event, d) {
                    var tooltipWidth = Math.min(mapTooltip.node().getBoundingClientRect().width, mapTooltipWidth);
                    mapTooltip
                        .style("left", (event.pageX + 20) + "px")
                        .style("top", event.pageY + "px")
                        .style("width", tooltipWidth + "px");

                    // Check if the tooltip is going off the screen to the right
                    if (mapTooltip.node().getBoundingClientRect().right > window.innerWidth) {
                        mapTooltip.style("left", (event.pageX - mapTooltip.node().getBoundingClientRect().width - 20) + "px");
                    }
                });
        }
    } else {
        const processed_address = address.replace('.', '')
        //console.log(processed_address)
        const feature = geoData.features.find(feature => {
            const {FEDIRP, FENAME, FETYPE, FRADDL, TOADDL} = feature.properties;
            const streetName = `${FEDIRP ? FEDIRP + ' ' : ''}${FENAME} ${FETYPE}`;
            const addressRange = `${FRADDL}-${TOADDL}`;
            const addressFrRange = FRADDL;
            const addressToRange = TOADDL;
            const numInAdd = parseInt(processed_address.split(" ")[0])
            return numInAdd >= FRADDL && numInAdd <= TOADDL && processed_address.includes(streetName);
        });
        if (feature) {
            mapsvg.append("path")
                .datum(feature.geometry)
                .attr("class", "highlight_line")
                .attr("d", pathGenerator)
                .style("fill", "none")
                .style("stroke", "red")
                .attr("stroke-width", 2)
                .attr("transform", "translate(" + mapMargin.left + "," + mapMargin.top + ")")
                .on("mouseover", function (d, i) {
                    //console.log("mouse on :" + tweet.location)
                    d3.select(this).attr("stroke-width", 5);
                    mapTooltip.html(
                        "<b> Time: </b>" + tweet.time +
                        "<br>" +
                        "<b> Message: </b>" + tweet.tweet +
                        "<br>" +
                        "<b> Location: </b>" + tweet.location
                    )
                        .style("opacity", 1)
                        .style("visibility", "visible")
                        .style("border-color", "red");
                })
                .on("mouseout", function (d, i) {
                    d3.select(this).attr("stroke-width", 2);
                    mapTooltip
                        .style("opacity", 0)
                        .style("visibility", "hidden")

                })
                .on("mousemove", function (event, d) {
                    var tooltipWidth = Math.min(mapTooltip.node().getBoundingClientRect().width, mapTooltipWidth);
                    mapTooltip
                        .style("left", (event.pageX + 20) + "px")
                        .style("top", event.pageY + "px")
                        .style("width", tooltipWidth + "px");

                    // Check if the tooltip is going off the screen to the right
                    if (mapTooltip.node().getBoundingClientRect().right > window.innerWidth) {
                        mapTooltip.style("left", (event.pageX - mapTooltip.node().getBoundingClientRect().width - 20) + "px");
                    }
                });
        }
    }

}

function addMapLegend() {

    var mapLegendX = mapWidth - 200;
    var mapLegendY = 50;
    mapsvg.append('rect')
        .attr('width', 50)
        .attr('height', 2)
        .attr('x', mapLegendX)
        .attr('y', mapLegendY)
        .attr('fill', "red")

    mapsvg.append('text')
        .attr('x', mapLegendX + 60)
        .attr('y', mapLegendY + 5)
        .style('font-size', '15px')
        .style('alignment-baseline', 'middle')
        .attr('fill', "red")
        .text("Street")

    mapLegendY+=25

    mapsvg.append("circle")
        .attr("cx", mapLegendX + 28)
        .attr("cy", mapLegendY)
        .attr("r", 5)
        .style("fill", "red")
        .style("stroke", "black")
    mapsvg.append('text')
        .attr('x', mapLegendX + 60)
        .attr('y', mapLegendY + 5)
        .style('font-size', '15px')
        .style('alignment-baseline', 'middle')
        .attr('fill', "red")
        .text("Intersection")


}


