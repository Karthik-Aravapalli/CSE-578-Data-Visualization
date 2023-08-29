var msgPerSec = []
var ccPerSec = []
var mbPerSec = []
var mbPerFiveMin = []
var ccPerFiveMin = []
var msgPerFiveMin = []
var timelineSvg, timelineSliderSvg, timelineTooltip
const timelineMargin = {top: 50, right: 50, bottom: 30, left: 50};
const sliderMargin = {top: 10, right: 10, bottom: 10, left: 40};
const timelineWidth = 1500 - timelineMargin.left - timelineMargin.right;
const timelineHeight = 500 - timelineMargin.top - timelineMargin.bottom;
const sliderHeight = 100 - sliderMargin.top - sliderMargin.bottom;
const timelineTooltipWidth = "300px"

var startTime, endTime
var selectedMsg, selectedCc, selectedMb, selectedStart, selectedEnd
var timelineColors = {
    ccdata: "#984ea3",
    mbdata: "#4daf4a"
}


document.addEventListener('DOMContentLoaded', function () {
    Promise.all([d3.csv('data/RawData/csv-1700-1830.csv'), d3.csv('data/RawData/csv-1831-2000.csv'), d3.csv('data/RawData/csv-2001-2131.csv')])
        .then(function (values) {
            var fullValues = values[0].concat(values[1], values[2])
            getTweetCount(fullValues)
            plotTimeline()
            addTimelineLegend()
        })
})

function timeFormater(timeValue) {
    // var ts = timeValue.toString()
    // //20140123213400
    // let year = parseInt(ts.slice(0, 4))
    // let month = parseInt(ts.slice(4, 6))
    // let day = parseInt(ts.slice(6, 8))
    // let hour = parseInt(ts.slice(8, 10))
    // let minute = parseInt(ts.slice(10, 12))
    // let second = parseInt(ts.slice(12, 14))

    // return new Date(year, month, day, hour, minute, second)
    return d3.timeParse('%Y%m%d%H%M%S')(timeValue.toString())
}

function fitToFiveMin(data, start, end) {
    let currentDate = new Date(start);
    let endDate = new Date(end);
    let returnList = []
    const startItem = {
        'time': startTime,
        'count': 0
    }
    returnList.push(startItem)

    while (currentDate <= endDate) {
        let count = 0
        const nextDate = new Date(currentDate)
        nextDate.setMinutes(nextDate.getMinutes() + 5)
        data.filter(item => item.time >= currentDate && item.time < nextDate)
            .forEach(item => {
                count = count + item.count
            })
        const item = {
            'time': nextDate,
            'count': count
        }
        returnList.push(item)
        currentDate.setMinutes(currentDate.getMinutes() + 5)
        currentDate = new Date(nextDate)
    }
    return returnList
}


function getTweetCount(dataset) {
    var tweetsCounter = {}
    var ccCounter = {}
    var mbCounter = {}
    startTime = dataset[0]['date(yyyyMMddHHmmss)']
    endTime = dataset[dataset.length - 1]['date(yyyyMMddHHmmss)']
    dataset.forEach(data => {
        if (startTime > data['date(yyyyMMddHHmmss)']) {
            startTime = data['date(yyyyMMddHHmmss)']
        }
        if (endTime < data['date(yyyyMMddHHmmss)']) {
            endTime = data['date(yyyyMMddHHmmss)']
        }

        let time = timeFormater(data['date(yyyyMMddHHmmss)'])
        if (time in tweetsCounter) {
            tweetsCounter[time] = tweetsCounter[time] + 1
        } else {
            tweetsCounter[time] = 1
        }

        if (data.type === "ccdata") {
            if (time in ccCounter) {
                ccCounter[time] = ccCounter[time] + 1
            } else {
                ccCounter[time] = 1
            }
        } else if (data.type === "mbdata") {
            if (time in mbCounter) {
                mbCounter[time] = mbCounter[time] + 1
            } else {
                mbCounter[time] = 1
            }
        }

    })

    var dataFromDataset = []

    for (let t in tweetsCounter) {
        let item = {
            'time': new Date(t),
            'count': tweetsCounter[t]
        }
        dataFromDataset.push(item)
    }
    for (let t in mbCounter) {
        let item = {
            'time': new Date(t),
            'count': mbCounter[t]
        }
        mbPerSec.push(item)
    }


    for (let t in ccCounter) {
        let item = {
            'time': new Date(t),
            'count': ccCounter[t]
        }
        ccPerSec.push(item)
    }

    startTime = timeFormater(startTime)
    endTime = timeFormater(endTime)

    ccPerFiveMin = fitToFiveMin(ccPerSec, startTime, endTime)
    mbPerFiveMin = fitToFiveMin(mbPerSec, startTime, endTime)

    msgPerSec = dataFromDataset
    msgPerFiveMin = fitToFiveMin(msgPerSec, startTime, endTime)

    msgPerFiveMin.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    mbPerFiveMin.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    ccPerFiveMin.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    selectedMsg = msgPerFiveMin
}

function reselectData(data) {
    return (data.time >= selectedStart) && (data.time <= selectedEnd);
}

function plotTimeline() {
    timelineSvg = d3.select(".timelineDiv").append("svg")
        .attr("width", timelineWidth + timelineMargin.left + timelineMargin.right)
        .attr("height", timelineHeight + timelineMargin.top + timelineMargin.bottom);

    timelineSliderSvg = d3.select(".timelineSliderDiv").append("svg")
        .attr("width", timelineWidth + sliderMargin.left + sliderMargin.right + 250)
        .attr("height", sliderHeight + sliderMargin.bottom + sliderMargin.top);

    timelineSvg.append('text')
        .attr('x', timelineWidth/2)
        .attr('y', timelineMargin.top-20)
        .attr('text-anchor', 'middle')
        .style('font-size', '30px')
        .style('text-decoration', 'underline')
        .text('Number of messages over time')

    const focus = timelineSvg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + timelineMargin.left + "," + timelineMargin.top + ")");

    const context = timelineSliderSvg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + 250 + "," + 0 + ")");

    const x = d3.scaleTime().range([0, timelineWidth]);
    const y_cc = d3.scaleLinear().range([timelineHeight, 0]);
    const y_mb = d3.scaleLinear().range([timelineHeight, 0]);

    const x_slider = d3.scaleTime().range([0, timelineWidth]);
    const y_slider_cc = d3.scaleLinear().range([sliderHeight, 0]);
    const y_slider_mb = d3.scaleLinear().range([sliderHeight, 0]);

    const x_axis = d3.axisBottom(x);
    const y_mb_axis = d3.axisLeft(y_mb);
    const y_cc_axis = d3.axisRight(y_cc);

    const x_axis_slider = d3.axisBottom(x_slider);

    x.domain([startTime, endTime])
    y_cc.domain([0, d3.max(ccPerFiveMin, function (d) {
        return d['count'];
    })+6]);
    y_mb.domain([0, d3.max(mbPerFiveMin, function (d) {
        return d['count'];
    })+30]);

    x_slider.domain(x.domain());
    y_slider_cc.domain(y_cc.domain());
    y_slider_mb.domain(y_mb.domain());

    focus.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + timelineHeight + ")")
        .call(x_axis);
    focus.append("g")
        .attr("class", "axis axis--y--mb")
        .style("stroke", timelineColors.mbdata)
        .call(y_mb_axis);
    focus.append("g")
        .attr("class", "axis axis--y--cc")
        .attr("transform", "translate(" + timelineWidth + "," + 0 + ")")
        .style("stroke", timelineColors.ccdata)
        .call(y_cc_axis);

    context.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + sliderHeight + ")")
        .call(x_axis_slider);

    timelineSvg.append("text")
        .attr("x", -(timelineHeight/2))
        .attr("y", timelineMargin.left - 38)
        .attr("class", "axis--y--mb")
        .attr("text-anchor", "middle")
        .style("font-size", "15px")
        .attr("transform", "rotate(-90)")
        .text("Number of MB messages")
        .style("fill",timelineColors.mbdata)

    timelineSvg.append("text")
        .attr("x", (timelineHeight/2))
        .attr("y", -timelineWidth-80)
        .attr("class", "axis--y--cc")
        .attr("text-anchor", "middle")
        .style("font-size", "15px")
        .attr("transform", "rotate(90)")
        .text("Number of CC messages")
        .style("fill",timelineColors.ccdata)

    var line_cc = d3.line()
        .x(function (d) {
            return x(d.time);
        })
        .y(function (d) {
            return y_cc(d.count);
        });

    var line_mb = d3.line()
        .x(function (d) {
            return x(d.time);
        })
        .y(function (d) {
            return y_mb(d.count);
        });

    var line_cc_slider = d3.line()
        .x(function (d) {
            return x_slider(d.time);
        })
        .y(function (d) {
            return y_slider_cc(d.count);
        });

    var line_mb_slider = d3.line()
        .x(function (d) {
            return x_slider(d.time);
        })
        .y(function (d) {
            return y_slider_mb(d.count);
        });

    focus.selectAll(".dotcc")
        .data(ccPerFiveMin)
        .enter().append("circle")
        .attr("class", "dotcc")
        .attr("cx", function (d) {
            return x(d.time);
        })
        .attr("cy", function (d) {
            return y_cc(d.count);
        })
        .attr("r", 3)
        .style("stroke", timelineColors.ccdata)
        .on("mouseover", function (d, i) {
            d3.select(this).attr("stroke-width", 5);
            timelineTooltip.html(
                "<b> Time: </b>" + i.time +
                "<br>" +
                "<b> Count: </b>" + i.count
            )
                .style("opacity", 1)
                .style("visibility", "visible")
                .style("border-color", timelineColors.ccdata);
        })
        .on("mouseout", function (d, i) {
            d3.select(this).attr("stroke-width", 3);
            d3.select(this).attr("stroke-width", 3);
            timelineTooltip
                .style("opacity", 0)
                .style("visibility", "hidden")
        })
        .on("mousemove", function (event, d) {
            var tooltipWidth = Math.min(timelineTooltip.node().getBoundingClientRect().width, timelineTooltipWidth);
            timelineTooltip
                .style("left", (event.pageX + 20) + "px")
                .style("top", event.pageY + "px")
                .style("width", tooltipWidth + "px");

            // Check if the tooltip is going off the screen to the right
            if (timelineTooltip.node().getBoundingClientRect().right > window.innerWidth) {
                timelineTooltip.style("left", (event.pageX - timelineTooltip.node().getBoundingClientRect().width - 20) + "px");
            }
        });

    focus.selectAll(".dotmb")
        .data(mbPerFiveMin)
        .enter().append("circle")
        .attr("class", "dotmb")
        .attr("cx", function (d) {
            return x(d.time);
        })
        .attr("cy", function (d) {
            return y_mb(d.count);
        })
        .attr("r", 3)
        .style("stroke", timelineColors.mbdata)
        .on("mouseover", function (d, i) {
            d3.select(this).attr("stroke-width", 5);
            timelineTooltip.html(
                "<b> Time: </b>" + i.time +
                "<br>" +
                "<b> Count: </b>" + i.count
            )
                .style("opacity", 1)
                .style("visibility", "visible")
                .style("border-color", timelineColors.mbdata);
        })
        .on("mouseout", function (d, i) {
            d3.select(this).attr("stroke-width", 3);
            timelineTooltip
                .style("opacity", 0)
                .style("visibility", "hidden")
        })
        .on("mousemove", function (event, d) {
            var tooltipWidth = Math.min(timelineTooltip.node().getBoundingClientRect().width, timelineTooltipWidth);
            timelineTooltip
                .style("left", (event.pageX + 20) + "px")
                .style("top", event.pageY + "px")
                .style("width", tooltipWidth + "px");

            // Check if the tooltip is going off the screen to the right
            if (timelineTooltip.node().getBoundingClientRect().right > window.innerWidth) {
                timelineTooltip.style("left", (event.pageX - timelineTooltip.node().getBoundingClientRect().width - 20) + "px");
            }
        });

    focus.append("path")
        .datum(ccPerFiveMin)
        .attr("class", "linecc")
        .attr("d", line_cc)
        .style("fill", "none")
        .style("stroke", timelineColors.ccdata)

    focus.append("path")
        .datum(mbPerFiveMin)
        .attr("class", "linemb")
        .attr("d", line_mb)
        .style("fill", "none")
        .style("stroke", timelineColors.mbdata)

    context.append("path")
        .datum(mbPerFiveMin)
        .attr("class", "linemb_slider")
        .attr("d", line_mb_slider)
        .style("fill", "none")
        .style("stroke", timelineColors.mbdata)
        .style("stroke-width", "2");

    context.append("path")
        .datum(ccPerFiveMin)
        .attr("class", "linecc_slider")
        .attr("d", line_cc_slider)
        .style("fill", "none")
        .style("stroke", timelineColors.ccdata)
        .style("stroke-width", "2");


    const brush = d3.brushX()
        .extent([[0, 0], [timelineWidth, sliderHeight]])
        .on("brush", brushed)
        .on("end", updatePlots);

    context.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, x.range());

    timelineTooltip = d3.select("#timelineToolTip_div")
        .attr("class", "timelinetooltip")
        .style('position', 'absolute')
        .style("visibility", "hidden")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "medium")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("opacity", 0)
        .style("max-width", timelineTooltipWidth);

    function brushed(event) {

        if (event.sourceEvent && event.sourceEvent.type === "zoom") return;
        const s = event.selection || x_slider.range();
        selectedStart = s.map(x_slider.invert, x_slider)[0]
        selectedEnd = s.map(x_slider.invert, x_slider)[1]
        selectedMb = mbPerFiveMin.filter(reselectData)
        selectedCc = ccPerFiveMin.filter(reselectData)

        //updatePlots()

        x.domain(s.map(x_slider.invert, x_slider));
        focus.select(".axis--x").call(x_axis);

        timelineSvg.selectAll(".linemb")
            .datum(selectedMb)
            .attr("class", "linemb")
            .attr("d", line_mb)
            .style("fill", "none")
            .style("stroke", timelineColors.mbdata)
            .on("mouseover", function (d, i) {
                d3.selectAll(".linemb").attr("stroke-width", "5")
                d3.selectAll(".linemb").attr("opacity", "1")
                d3.selectAll(".linecc").attr("opacity", ".3")
                d3.selectAll(".axis--y--cc").attr("opacity", ".3")
            })
            .on("mouseout", function (d, i) {
                d3.selectAll(".linemb").attr("stroke-width", "1")
                d3.selectAll(".linemb").attr("opacity", ".8")
                d3.selectAll(".linecc").attr("opacity", ".8")
                d3.selectAll(".axis--y--cc").attr("opacity", "1")
            });

        timelineSvg.selectAll(".linecc")
            .datum(selectedCc)
            .attr("class", "linecc")
            .attr("d", line_cc)
            .style("fill", "none")
            .style("stroke", timelineColors.ccdata)
            .on("mouseover", function (d, i) {
                d3.selectAll(".linecc").attr("stroke-width", "5")
                d3.selectAll(".linecc").attr("opacity", "1")
                d3.selectAll(".linemb").attr("opacity", ".3")
                d3.selectAll(".axis--y--mb").attr("opacity", ".3")
            })
            .on("mouseout", function (d, i) {
                d3.selectAll(".linecc").attr("stroke-width", "1")
                d3.selectAll(".linecc").attr("opacity", ".8")
                d3.selectAll(".linemb").attr("opacity", ".8")
                d3.selectAll(".axis--y--mb").attr("opacity", "1")
            });

        focus.selectAll(".dotcc")
            .attr("cx", function (d) {
                var xVal = x(d.time);
                return (xVal > 0 && xVal < timelineWidth) ? xVal : -100;
            })
        focus.selectAll(".dotmb")
            .attr("cx", function (d) {
                var xVal = x(d.time);
                return (xVal > 0 && xVal < timelineWidth) ? xVal : -100;
            })
    }
}

function addTimelineLegend(){
    const keys = [{
        "color":timelineColors.ccdata,
        "label":"CC Data"
    },{
        "color":timelineColors.mbdata,
        "label":"MB Data"
    }
    ]
    var timelineLegendX = timelineWidth-150;
    var timelineLegendY = timelineMargin.top - 20;
    keys.forEach(k => {
        timelineSvg.append('rect')
            .attr('width', 50)
            .attr('height', 2)
            .attr('x', timelineLegendX)
            .attr('y', timelineLegendY)
            .attr('fill', k.color)

        timelineSvg.append('text')
            .attr('x', timelineLegendX + 60)
            .attr('y', timelineLegendY + 5)
            .style('font-size', '15px')
            .style('alignment-baseline', 'middle')
            .attr('fill', k.color)
            .text(k.label)

        timelineLegendY+=25;
    })
}

function updatePlots() {
    // console.log(selectedStart)
    // console.log(selectedEnd)
    transitionAreaDonut();
    transitionStreamGraph();
    transitionBeeSwarm();
    updateMarkOnMap(selectedStart, selectedEnd)
}