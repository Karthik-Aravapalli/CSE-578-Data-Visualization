var streamInitData = [];
var streamFilterData = [];
var streamTimeInterval = [];
var stackHeight;

const streamWidth = 990;
const streamHeight = 600;
const streamMargin = {top: 60, left: 30, right: 60, bottom: 70};
const streamHeightPadded = streamHeight - streamMargin.top - streamMargin.bottom;
const streamWidthPadded = streamWidth - streamMargin.left - streamMargin.right;

const streamTitlePadding = 0;
var streamToolTip = d3.select("#streamToolTip_div")
    .style('position', 'absolute')
    .style("text-align", "center")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-radius", "5px")
    .style("border-width", "2px")
    .style("padding", "10px")
    .style("pointer-events", "none")
    .style("opacity", 0)

var streamGraph_svg = d3.select('.streamGraphDiv')
    .append('svg')
    .attr('width', streamWidth)
    .attr('height', streamHeight)
    .append('g')
    .attr('transform', `translate(${streamMargin.left},${streamMargin.top})`);

var xScaleStream = d3.scaleTime().range([0, streamWidthPadded]);
var yScaleStream = d3.scaleLinear().range([streamHeightPadded, 0]);

const streamKeys = ['angry', 'anxious', 'happy', 'sad'];
const streamColor = d3.scaleOrdinal()
    .domain(streamKeys)
    .range(['#e41a1c','#377eb8','#4daf4a','#984ea3']);

const streamTransition = 1500;

// perform preprocessing when HTML page is loaded
document.addEventListener('DOMContentLoaded', function () {
    // load csv data
    Promise.all([d3.csv('data/streamGraph_sentiments5.csv')])
        .then(function (values) {
            streamInitData = values[0];
            
            convertStreamData(streamInitData);
            drawStreamGraph();
        });
});

function convertStreamData(data){

    data.forEach(d =>{
        Object.keys(d).forEach(function(key){
            if(key=='timestamp'){
                d[key] = d3.timeParse('%Y%m%d%H%M%S')(d[key]);
                // console.log(d[key]);
            }
            else{
                d[key] = +d[key];
            }
        })
    })
}

function filterStreamData(){
    if(selectedStart===undefined){
        selectedStart = new Date(2014, 0, 23, 17, 0, 0);
    }

    if(selectedEnd===undefined){
        selectedEnd = new Date(2014, 0, 23, 21, 30, 0);
    }

    streamTimeInterval = [selectedStart, selectedEnd];

    const intervalStart = selectedStart.getTime()
    const intervalEnd = selectedEnd.getTime();

    streamFilterData = streamInitData.filter((i)=>{
        return i['timestamp'].getTime() >=intervalStart && i['timestamp'].getTime() <=intervalEnd
    })
}

function getStackHeight(data){
    var maxHeight = 0;
    data.forEach(d =>{
        const heightSum = d.angry + d.anxious + d.happy + d.sad;
        maxHeight = Math.max(maxHeight, heightSum);
    })

    return maxHeight/2;
}

function drawStreamGraph(){

    filterStreamData();

    xScaleStream
        // .domain(d3.extent(streamFilterData, function(d) { return d.timestamp; }))
        .domain([streamTimeInterval[0], streamTimeInterval[1]]);
    
    stackHeight = getStackHeight(streamFilterData);

    yScaleStream
        .domain([-stackHeight, stackHeight]);

    streamGraph_svg.append('g')
        .attr('class', 'streamxaxis')
        .attr('transform', `translate(${streamMargin.left},${streamHeightPadded})`)
        .call(d3.axisBottom(xScaleStream))

    streamGraph_svg.append("text")
        .attr("x", streamMargin.left + (streamWidthPadded/2))
        .attr("y", streamHeightPadded + (streamMargin.top/1.5))
        .attr("text-anchor", "middle")
        .style("font-size", "15px")
        .text("Time")

    streamGraph_svg.append('g')
        .attr('class', 'streamyaxis')
        .attr('transform', `translate(${streamMargin.left},${0})`)
        .call(d3.axisLeft(yScaleStream))

    streamGraph_svg.append("text")
        .attr("x", -(streamHeightPadded - streamMargin.top)/2)
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .style("font-size", "15px")
        .attr("transform", "rotate(-90)")
        .text("Number of Tweets")

    streamGraph_svg.append('text')
        .attr('x', streamMargin.left + streamWidthPadded/2)
        .attr('y', streamTitlePadding)
        .attr('text-anchor', 'middle')
        .style('font-size', '30px')
        .style('text-decoration', 'underline')
        .text('Sentiment variation across time')

    const stackedData = d3.stack()
        .offset(d3.stackOffsetSilhouette)
        .keys(streamKeys)
        (streamFilterData)

    streamGraph_svg.selectAll('streams')
        .data(stackedData)
        .join('path')
        .attr('class', 'streampaths')
        .style('fill', d => streamColor(d.key))
        .attr('transform', `translate(${streamMargin.left},${0})`)
        .attr('d', d3.area()
            .curve(d3.curveBasis)
            .x(function(d, i) { return xScaleStream(d.data.timestamp); })
            .y0(function(d) { return yScaleStream(0); })
            .y1(function(d) { return yScaleStream(0); })
        )
        .transition() 
        .duration(streamTransition)
        .attr('d', d3.area()
            .curve(d3.curveBasis)
            .x(function(d, i) { return xScaleStream(d.data.timestamp); })
            .y0(function(d) { return yScaleStream(d[0]); })
            .y1(function(d) { return yScaleStream(d[1]); })
        )
        .attr('opacity', 0.8)
        
    applyStreamMouse();
    addStreamLegend();

}

function transitionStreamGraph(){

    streamGraph_svg.selectAll('.streampaths').remove();

    filterStreamData();

    xScaleStream
        .domain([streamTimeInterval[0], streamTimeInterval[1]])
    
    stackHeight = getStackHeight(streamFilterData);

    yScaleStream
        .domain([-stackHeight, stackHeight])

    streamGraph_svg.selectAll('.streamxaxis')
        .transition()
        .duration(streamTransition)
        .call(d3.axisBottom(xScaleStream))

    streamGraph_svg.selectAll('.streamyaxis')
        .transition()
        .duration(streamTransition)
        .call(d3.axisLeft(yScaleStream))

    const stackedData = d3.stack()
        .offset(d3.stackOffsetSilhouette)
        .keys(streamKeys)
        (streamFilterData)

    streamGraph_svg.selectAll('streams')
        .data(stackedData)
        .join('path')
        .attr('class', 'streampaths')
        .style('fill', d => streamColor(d.key))
        .attr('transform', `translate(${streamMargin.left},${0})`)
        .attr('d', d3.area()
            .curve(d3.curveBasis)
            .x(function(d, i) { return xScaleStream(d.data.timestamp); })
            .y0(function(d) { return yScaleStream(0); })
            .y1(function(d) { return yScaleStream(0); })
        )
        .transition() 
        .duration(streamTransition)
        .attr('d', d3.area()
            .curve(d3.curveBasis)
            .x(function(d, i) { return xScaleStream(d.data.timestamp); })
            .y0(function(d) { return yScaleStream(d[0]); })
            .y1(function(d) { return yScaleStream(d[1]); })
        )
        .attr('opacity', 0.8)

    applyStreamMouse();
        
}

function applyStreamMouse(){

    streamGraph_svg.selectAll('.streampaths')
    .on('mouseover', function(event, d) {
        d3.selectAll('.streampaths')
            .attr('opacity', 0.5)
            .attr('stroke', 'none')
        d3.select(event.currentTarget)
            .attr('opacity', 1)
            .attr('stroke', 'black')
            .attr('stroke-width', '2px')

        const mouseX = xScaleStream.invert(event.offsetX);
        const bisect = d3.bisector(function(d) { return d.timestamp; }).left;
        const index = bisect(streamFilterData, mouseX);
        const selectedData = d3.select(event.currentTarget).datum();
        const count = selectedData[index][1] - selectedData[index][0];

        streamToolTip
            .html('Sentiment: ' + d.key + '<br>' + 'Count: ' + count)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY + 10) + 'px')
            .style('opacity', 1)
    })
    .on('mousemove', function(event, d){

        const mouseX = xScaleStream.invert(d3.pointer(event, this)[0]);
        const bisect = d3.bisector(function(d) { return d.timestamp; }).left;
        const index = bisect(streamFilterData, mouseX);
        const selectedData = d3.select(event.currentTarget).datum();
        const count = selectedData[index][1] - selectedData[index][0];

        streamToolTip
            .html('Sentiment: ' + selectedData.key + '<br>' + 'Count: ' + count)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY + 10) + 'px')
    })
    .on('mouseout', function(event, d) {
        d3.selectAll('.streampaths')
            .attr('opacity', 0.8)
            .attr('stroke', 'none')
        streamToolTip
            .style('opacity', 0);
    })
    // .on('click', function(event, d) {
    //     var clickedStreamPath = d3.select(this);
    //     var isClicked = clickedStreamPath.attr('clicked') == 'true';
    //     d3.selectAll('.streampaths')
    //         .attr('opacity', 0.5)
    //         .attr('stroke', 'none')
    //         .attr('clicked', 'false');
    //     if (!isClicked) {
    //         clickedStreamPath
    //             .attr('opacity', 1)
    //             .attr('stroke', 'black')
    //             .attr('stroke-width', '2px')
    //             .attr('clicked', 'true');
    //     }
    // })

}

function addStreamLegend(){
    var streamLegendX = streamWidthPadded - 40;
    var streamLegendY = streamMargin.top - 100;
    for(var i = streamKeys.length-1; i >= 0; i--) {
        streamGraph_svg.append('rect')
            .attr('width', 15)
            .attr('height', 15)
            .attr('x', streamLegendX)
            .attr('y', streamLegendY)
            .attr('fill', streamColor(streamKeys[i]))

        streamGraph_svg.append('text')
            .attr('x', streamLegendX + 30)
            .attr('y', streamLegendY + 12.5)
            .style('font-size', '15px')
            .style('alignment-baseline', 'middle')
            .attr('fill', streamColor(streamKeys[i]))
            .text(streamKeys[i])
        
        streamLegendY+=25;
    }
}