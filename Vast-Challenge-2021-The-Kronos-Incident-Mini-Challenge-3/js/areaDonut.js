var donutInitData = [];
var donutFilterData = [];
var donutTimeInterval = [];
var categoryCountMap = new Map();
var donutCountArray = [];
var donutCountNormal = [];

const donutImageMap = new Map();
donutImageMap.set("Journalistic Source", "media/journalistic.png");
donutImageMap.set("Official Source", "media/official.png");
donutImageMap.set("Biased Source", "media/biased.png");
donutImageMap.set("At-scene Source", "media/onscene.png");

const donutWidth = 495;
const donutHeight = 600;

const donutTitlePadding = 30;

const donutTransition = 2000;

var areaDonut_svg = d3.select('.areaDonutDiv')
    .append('svg')
    .attr('width', donutWidth)
    .attr('height', donutHeight)
    .append('g');

const cx = (donutWidth / 2);
const cy = (donutHeight / 2)+50;
const r = 150;
const angle = (2 * Math.PI) / 4;

// perform preprocessing when HTML page is loaded
document.addEventListener('DOMContentLoaded', function () {
    // load csv data
    Promise.all([d3.csv('data/areaDonut_tweetCategory.csv')])
        .then(function (values) {
            donutInitData = values[0];
            convertDonutData(donutInitData);
            drawAreaDonut();
        });
});

function convertDonutData(data){

    data.forEach(d =>{
        Object.keys(d).forEach(function(key){
            if(key=='timestamp'){
                d[key] = d3.timeParse('%Y%m%d%H%M%S')(d[key]);
            }
        })
    })
}


function filterDonutData(){

    if(selectedStart===undefined){
        selectedStart = new Date(2014, 0, 23, 17, 0, 0);
    }

    if(selectedEnd===undefined){
        selectedEnd = new Date(2014, 0, 23, 21, 30, 0);
    }

    donutTimeInterval = [selectedStart, selectedEnd];

    const intervalStart = selectedStart.getTime()
    const intervalEnd = selectedEnd.getTime();

    donutFilterData = donutInitData.filter((i)=>{
        return i['timestamp'].getTime() >=intervalStart && i['timestamp'].getTime() <=intervalEnd
    })

}

function getCategoryCountMap(data){

    categoryCountMap.clear();
    categoryCountMap.set('Journalistic Source', 0);
    categoryCountMap.set('Official Source', 0);
    categoryCountMap.set('Biased Source', 0);
    categoryCountMap.set('At-scene Source', 0);

    data.forEach(d =>{
        const curSourceType = d['source_types'];
        if(categoryCountMap.has(curSourceType)){
            categoryCountMap.set(curSourceType, categoryCountMap.get(curSourceType)+1);
        }
    })

    getNormalizedArray(categoryCountMap);
}

function getNormalizedArray(countMap){

    const tempArray = [0, 0, 0, 0];
    countMap.forEach((value, key) =>{
        if(key=='Journalistic Sources'){
            tempArray[0] = value;
        }
        else if(key=='Official Source'){
            tempArray[1] = value;
        }
        else if(key=='Biased Source'){
            tempArray[2] = value;
        }
        else if(key=='At-scene Source'){
            tempArray[3] = value;
        }
    })

    const min = Math.min(...tempArray);
    const max = Math.max(...tempArray);

    donutCountArray = tempArray.map((value) =>{
        if(min==0 && max==0){
            return 2;
        }
        return ((value - min) / (max - min)) * 2 + 1;
    });
}

function drawAreaDonut(){

    filterDonutData();
    getCategoryCountMap(donutFilterData);

    areaDonut_svg.append('text')
        .attr('x', donutWidth/2)
        .attr('y', donutTitlePadding)
        .attr('text-anchor', 'middle')
        .style('font-size', '25px')
        .style('text-decoration', 'underline')
        .text('Tweets across categories')

    areaDonut_svg.append('circle')
        .attr('class', 'bigCircle')
        .attr('cx', cx)
        .attr('cy', cy)
        .style('stroke', 'black')
        .style('stroke-width', 2)
        .attr('fill', 'none')
        .attr('r', 0)
        .transition()
        .duration(donutTransition)
        .attr('r', r)
        .attr('opacity', 0.8)

    areaDonut_svg.append('text')
        .attr('class', 'center-text')
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .attr('font-size', 20)
        .attr('font-weight', 'bold')
        .attr('x', cx)
        .attr('y', cy)
        .style('opacity', 0)
        .html('Tweet Categories')
        .transition()
        .duration(donutTransition)
        .style('opacity', 1)

    const smallWidth = 50;
    const smallHeight = 50;

    const smallImages = [
        {x: cx + r * Math.cos(angle * 0), y: cy + r * Math.sin(angle * 0), type: 'Journalistic Source'},
        {x: cx + r * Math.cos(angle * 1), y: cy + r * Math.sin(angle * 1), type: 'Official Source'},
        {x: cx + r * Math.cos(angle * 2), y: cy + r * Math.sin(angle * 2), type: 'Biased Source'},
        {x: cx + r * Math.cos(angle * 3), y: cy + r * Math.sin(angle * 3), type: 'At-scene Source'}
      ];

    areaDonut_svg.selectAll('image')
        .data(smallImages)
        .enter()
        .append('image')
        .attr('class', 'typeImage')
        .attr('xlink:href', (d) => donutImageMap.get(d.type))
        .attr('width', 0)
        .attr('height', 0)
        .attr('x', (d, i) =>{
            return d.x;
        })
        .attr('y', (d, i) =>{
            return d.y;
        })
        .transition()
        .duration(donutTransition)
        .attr('x', (d, i) =>{
            return d.x - ((smallWidth*donutCountArray[i])/2);
        })
        .attr('y', (d, i) =>{
            return d.y - ((smallHeight*donutCountArray[i])/2);
        })
        .attr('width', (d, i) =>{
            return smallWidth*donutCountArray[i];
        })
        .attr('height', (d, i) =>{
            return smallHeight*donutCountArray[i];
        })

    areaDonut_svg.selectAll('.typeImage').on('mouseover', (d, i) =>{
            areaDonut_svg.selectAll('text.center-text')
                .html(i.type + ': ' + categoryCountMap.get(i['type']))
        })
        .on('mouseout', (d, i) =>{
            areaDonut_svg.selectAll('text.center-text')
                .html('Tweet Categories')
        })
    
}

function transitionAreaDonut(){

    filterDonutData();
    getCategoryCountMap(donutFilterData);

    const smallWidth = 50;
    const smallHeight = 50;

    const smallImages = [
        {x: cx + r * Math.cos(angle * 0), y: cy + r * Math.sin(angle * 0), type: 'Journalistic Sources'},
        {x: cx + r * Math.cos(angle * 1), y: cy + r * Math.sin(angle * 1), type: 'Official Source'},
        {x: cx + r * Math.cos(angle * 2), y: cy + r * Math.sin(angle * 2), type: 'Biased'},
        {x: cx + r * Math.cos(angle * 3), y: cy + r * Math.sin(angle * 3), type: 'On the Scene'}
      ];

    areaDonut_svg.selectAll('.typeImage')
        .transition()
        .duration(donutTransition)
        .attr('x', (d, i) =>{
            return d.x - ((smallWidth*donutCountArray[i])/2);
        })
        .attr('y', (d, i) =>{
            return d.y - ((smallHeight*donutCountArray[i])/2);
        })
        .attr('width', (d, i) =>{
            return smallWidth*donutCountArray[i];
        })
        .attr('height', (d, i) =>{
            return smallHeight*donutCountArray[i];
        })
    
}