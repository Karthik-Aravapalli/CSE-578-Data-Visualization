
// svg utilities
var innovativeMargin = { top: 130, right: 30, left: 30, bottom: 30 };
var innovativeWidth = 1500 - innovativeMargin.left - innovativeMargin.right;
var innovativeHeight = 750 - innovativeMargin.top - innovativeMargin.bottom;
var innovativeSvg;
var innovativeOuterSvg;

var beeSwarmData;
var tooltip;

var darkRed = "#e81123"
var darkBlue = "#00188f"
var darkOrange = "#ff8c00"
var green = "#009e49"
var unknown = "#bad80a"
var yellow = "#fff100"
var brown = "#964b00"
var purple = "#68217a"
var cyan = "#00bcf2"
var black = "#000000"
var teal = "#00b294"

// event listener called once the HTML page is fully loaded by the browser
document.addEventListener("DOMContentLoaded", () => {
    loadCSVData();
})

function loadCSVData() {

    innovativeOuterSvg = d3.select(".innovativeChart")
        .append("svg")
        .attr("width", innovativeWidth + innovativeMargin.left + innovativeMargin.right)
        .attr("height", innovativeHeight + innovativeMargin.top + innovativeMargin.bottom);

    innovativeSvg = innovativeOuterSvg
        .append("g")
        .attr("transform", "translate(" + innovativeMargin.left + "," + innovativeMargin.top + ")");

    var parseTime = d3.timeParse("%H:%M:%S");

    d3.csv("./data/innovativeFinalData.csv").then(function (data) {
        beeSwarmData = data.map(function (d) {
            return {
                time: parseTime(d.time),
                author: d.author,
                message: d.message,
                rt_count: +d.RT_count,
            }
        })

        var xScale = d3.scaleTime()
            .domain(d3.extent(beeSwarmData, function (d) { return d.time; }))
            .range([0, innovativeWidth]);

        var yScale = d3.scaleLinear()
            .domain([-10, d3.max(beeSwarmData, function (d) { return d.message.length; })])
            .range([innovativeHeight, 0]);

        var xPos = function (d) {
            return xScale(d.time);
        };

        var yPos = function (d) {
            return yScale(d.message.length);
        }
        var rad = function (d) {
            return (d.rt_count == 0) ? 4 : d.rt_count + 4 + 2;
        };

        var spamAccounts = ["KronosQuoth", "OnlytheTruth", "rockinHW", "Officia1AbilaPost", "Clevvah4Evah", "mainman447", "choconibbs", "grassGreeener", "dealsRUs101", "powercrystals", "michelleR", "junkman995", "reggierockin776", "skinnyJeans", "hotdrugs225", "carjunkers", "superhero447", "junkman377", "cheapgoods998", "eazymoney", "cheapgoods998", "junkieduck113", "hotdrugs225", "deals4realz", "meds4realz43", "dirtdigger334", "junk99902", "maskedWoman101", "whiteprotein", "starz1134", "kedits", "pashmina887", "writinLazy", "cminvestments11", "cleaningFish", "mailfoool", "supplementsRule", "pumpitup", "grlPwrz505", "fictionalJoe"]
        var journalisticAccounts = ["AbilaPost", "CentralBulletin", "InternationalNews", "NewsOnlineToday"]
        var biasedAccounts = ["HomelandIlluminations", "FriendsOfKronos", "ourcountryourrights"]
        var onTheScene = ["megaMan", "panopticon", "roger_roger", "Sara_Nespola", "prettyRain", "protoGuy", "SiaradSea", "Simon_Hamaeth", "sofitees", "truccotrucco", "mountain478", "KronosStar", "ReggieWassali", "anaregents", "truthforcadau", "GreyCatCollectibles", "hempRules", "katrina", "yomamma", "dangermice", "redisrad", "HerraTomas", "martaflores", "kingWilly", "rockStar113", "windAvatar", "jenny90210", "mamin", "martaO", "unicorns", "aliceRocks", "hennyhenhendrix", "brewvebeenserved", "dtrejos", "hngohebo_ABILAPOST", "trapanitweets", "jsmith", "surferMan", "brontes_riff", "ernieO", "BoraVerissimo", "luvwool", "aaasTech", "MarcusDrymiau", "mattdies", "omgponies"]
        var POKRallyUpdates = ["POK", "maha_Homeland"]
        var officialAccounts = ["AbilaFireDept", "Viktor-E", "AbilaAllFaith", "AbilaPoliceDepartment"]
        var unrelatedToRally = ["SaveOurWildlands", "eliza003", "stuffNstuff", "hazMore445", "creatorRocks", "onl1neRecords", "partyon"]
        var hatespeech = ["footfingers", "trollingsnark", "soulofShi", "hermanM", "MindOfKronos"]
        var prayers = ["shoutItOut", "praise111", "joyBubbles", "joyousNoise", "livin4HigherPower"]
        var retweetsOnly = ["pinky", "rrWine", "BlueVelvet", "dragonRider1", "blueSunshine", "dtennent", "klingon4real", "sarajane", "wiseWords", "phantomagate", "teresaJ", "microBanana", "siliconKing", "vetsRock", "wireHead1122", "luvMyPants", "brain448", "rnbwBrite", "dolls4sale", "plasticParts", "soup4u", "muppiesRock", "gardener4958", "sithLordJames", "lindyT", "lordWally", "slamrjamr", "stolkfair", "worldWatcher", "zengardener", "joyce101", "ninjabob", "electricAvenue", "henri", "farmboy", "courage4life", "vonneka", "jaques", "brandonL", "jgrobannne"]

        var color = function (d) {
            if (spamAccounts.includes(d.author))
                return darkRed
            else if (journalisticAccounts.includes(d.author))
                return darkBlue
            else if (biasedAccounts.includes(d.author))
                return darkOrange
            else if (onTheScene.includes(d.author))
                return green
            else if (POKRallyUpdates.includes(d.author))
                return black
            else if (officialAccounts.includes(d.author))
                return brown
            else if (unrelatedToRally.includes(d.author))
                return teal
            else if (hatespeech.includes(d.author))
                return cyan
            else if (prayers.includes(d.author))
                return purple
            else if (retweetsOnly.includes(d.author))
                return yellow
            else {
                console.log("Error!: ", d.author)
                return unknown
            }
        }

        var mySet = new Set()
        for (var i = 0; i < beeSwarmData.length; i++) {
            mySet.add(beeSwarmData[i].author);
        }

        var innovativePoints = innovativeSvg.selectAll("circle")
            .data(beeSwarmData)
            .enter()
            .append("circle")
            .attr("class", "beeCircles")
            .attr("cx", xPos)
            .attr("cy", yPos)
            .attr("r", rad)
            .attr("fill", color)
            .attr("stroke", "black")
            .on("mouseover", function (d, i) {

                d3.select(this).attr("stroke-width", 3);

                var author = i.author;
                var message = i.message;
                var retweetCount = i.rt_count;
                var timestamp = new Date(i.time);
                var time = timestamp.getHours().toString().padStart(2, '0')
                    + ":" + timestamp.getMinutes().toString().padStart(2, '0')
                    + ":" + timestamp.getSeconds().toString().padStart(2, '0');

                var category = function (author) {
                    if (spamAccounts.includes(author))
                        return "Spam Account";
                    else if (journalisticAccounts.includes(author))
                        return "Journalistic Account";
                    else if (biasedAccounts.includes(author))
                        return "Biased Account";
                    else if (onTheScene.includes(author))
                        return "On The Scene";
                    else if (POKRallyUpdates.includes(author))
                        return "POK Rally Updates";
                    else if (officialAccounts.includes(author))
                        return "Official Accounts";
                    else if (unrelatedToRally.includes(author))
                        return "Unrelated To Rally";
                    else if (hatespeech.includes(author))
                        return "Hate Speech";
                    else if (retweetsOnly.includes(author))
                        return "Retweets only Account";
                    else
                        return "Unclassified";
                }

                tooltip.html(
                    "<b> Time: </b>" + time +
                    "<br>" +
                    "<b> Author: </b>" + author +
                    "<br>" +
                    "<b> Message: </b>" + message +
                    "<br>" +
                    "<b> Retweets: </b>" + retweetCount +
                    "<br>" +
                    "<b> Category: </b>" + category(author)
                )
                    .style("opacity", 1)
                    .style("visibility", "visible")
                    .style("border-color", color(i));
            })
            .on("mouseout", function (d) {
                d3.select(this).attr("stroke-width", 1);

                tooltip
                    .style("opacity", 0)
                    .style("visibility", "hidden")
            })
            .on("mousemove", function (event, d) {

                var tooltipWidth = Math.min(tooltip.node().getBoundingClientRect().width, maxTooltipWidth);

                tooltip
                    .style("left", (event.pageX + 20) + "px")
                    .style("top", event.pageY + "px")
                    .style("width", tooltipWidth + "px");

                // Check if the tooltip is going off the screen to the right
                if (tooltip.node().getBoundingClientRect().right > window.innerWidth) {
                    tooltip.style("left", (event.pageX - tooltip.node().getBoundingClientRect().width - 20) + "px");
                }
            });

        const simulation = d3.forceSimulation(beeSwarmData)
            .force("x", d3.forceX(d => xScale(d.time)).strength(1))
            .force("y", d3.forceY(d => yScale(d.message.length)).strength(1))
            .force("collide", d3.forceCollide(function (d) { return (d.rt_count == 0) ? 7 : (d.rt_count + 1 + 8) }).strength(0.5).iterations(1))
            .alphaDecay(0.01)
            .on("tick", () => {
                innovativePoints
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y)
            })

        simulation.nodes(beeSwarmData).alpha(0.1).restart();

        var xAxis = d3.axisBottom(xScale);
        var axisHeight = innovativeHeight - 15;
        innovativeSvg.append("g")
            .attr("transform", "translate(0," + axisHeight + ")")
            .call(xAxis);

        // var yAxis = d3.axisLeft(yScale);
        // innovativeSvg.append("g")
        //     .attr("transform", "translate(0, 0)")
        //     .call(yAxis);

        // console.log("Number of points: ", innovativeSvg.selectAll("circle").size());

        // create 'g' element for chart legend
        const innovativelegend = innovativeOuterSvg.append('g')
            .attr('transform', `translate(${innovativeWidth - 115}, 10)`);

        // display colored square for spam accounts
        innovativelegend.append('rect')
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', darkRed);

        // display text next to square -> "Spam Accounts"
        innovativelegend.append('text')
            .attr('x', 15)
            .attr('y', 10)
            .text('Spam Accounts');

        // display colored square for journalist accounts
        innovativelegend.append('rect')
            .attr('y', 20)
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', darkBlue);

        // display text next to square -> "Journalistic Accounts"
        innovativelegend.append('text')
            .attr('x', 15)
            .attr('y', 30)
            .text('Journalistic Accounts');

        // display colored square for biased accounts
        innovativelegend.append('rect')
            .attr('y', 40)
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', darkOrange);

        // display text next to square -> "Biased Accounts"
        innovativelegend.append('text')
            .attr('x', 15)
            .attr('y', 50)
            .text('Biased Accounts');

        // display colored square for on the scene accounts
        innovativelegend.append('rect')
            .attr('y', 60)
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', green);

        // display text next to square -> "On The Scene"
        innovativelegend.append('text')
            .attr('x', 15)
            .attr('y', 70)
            .text('On The Scene');

        // display colored square for POK rally update accounts
        innovativelegend.append('rect')
            .attr('y', 80)
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', black);

        // display text next to square -> "POK Rally Updates"
        innovativelegend.append('text')
            .attr('x', 15)
            .attr('y', 90)
            .text('POK Rally Updates');

        // display colored square for official accounts
        innovativelegend.append('rect')
            .attr('y', 100)
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', brown);

        // display text next to square -> "Official Accounts"
        innovativelegend.append('text')
            .attr('x', 15)
            .attr('y', 110)
            .text('Official Accounts');

        // display colored square for hate speech accounts
        innovativelegend.append('rect')
            .attr('y', 120)
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', cyan);

        // display text next to square -> "Hate Speech Accounts"
        innovativelegend.append('text')
            .attr('x', 15)
            .attr('y', 130)
            .text('Hate Speech Accounts');

        // display colored square for retweet accounts
        innovativelegend.append('rect')
            .attr('y', 140)
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', yellow);

        // display text next to square -> "Retweet Accounts"
        innovativelegend.append('text')
            .attr('x', 15)
            .attr('y', 150)
            .text('Retweets Only');

        // title area
        const titleArea = innovativeOuterSvg.append('g')
            .attr('transform', `translate(${innovativeWidth - 950}, 10)`);

        // graph title
        titleArea.append('text')
            .attr('x', 150)
            .attr('y', 30)
            .style('font-size', '30px')
            .style('text-decoration', 'underline')
            .text('Tweet-Retweet Beeswarm');

        var maxTooltipWidth = 300;

        tooltip = d3.select("#tooltip_div")
            .attr("class", "tooltip")
            .style('position', 'absolute')
            .style("visibility", "hidden")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "medium")
            .style("border-radius", "5px")
            .style("padding", "10px")
            .style("opacity", 0)
            .style("max-width", maxTooltipWidth + "px");

        innovativeSvg
            .append("text")
            .attr("class", "axis-label")
            .attr("x", innovativeWidth / 2)
            .attr("y", innovativeHeight + 20)
            .style("text-anchor", "middle")
            .text("Time");

    })
}


function setOpacityBasedOnTime(d) {
    var startTime = new Date(selectedStart);
    var endTime = new Date(selectedEnd);
    var myTime = new Date(d.time);

    var startHour = startTime.getHours();
    var startMins = startTime.getMinutes();
    var startSeconds = startTime.getSeconds();

    var endHour = endTime.getHours();
    var endMins = endTime.getMinutes();
    var endSeconds = endTime.getSeconds();

    var myHour = myTime.getHours();
    var myMins = myTime.getMinutes();
    var mySeconds = myTime.getSeconds();

    if (myHour >= startHour && myHour <= endHour) {
        // if hour between start and end
        if (myHour > startHour && myHour < endHour) {
            return 0.9;
        }
        // if same start, end and my hour
        else if (startHour === endHour && myHour === startHour) {
            // compare minutes
            if (myMins >= startMins && myMins <= endMins) {
                if (myMins > startMins && myMins < endMins)
                    return 0.9
                else if (myMins === startMins && myMins === endMins) {
                    // compare seconds
                    if (mySeconds >= startSeconds && mySeconds <= endSeconds)
                        return 0.9
                    else return 0.2
                }
                else if ((myMins === startMins && myMins < endMins)) {
                    if (mySeconds >= startSeconds && mySeconds <= endSeconds)
                        return 0.9
                    else return 0.2
                }
                else if (myMins > startMins && myMins === endMins) {
                    if (mySeconds >= startSeconds && mySeconds <= endSeconds)
                        return 0.9
                    else return 0.2
                }
                else return 0.2
            }
            else return 0.2
        }
        // same start hour check for minutes
        else if (myHour === startHour) {
            if (myMins > startMins)
                return 0.9
            // same minute check for seconds
            if (myMins === startMins) {
                if (mySeconds >= startSeconds)
                    return 0.9
                else
                    return 0.2
            }
            else return 0.2
        }
        // same end hour check for minutes
        else if (myHour === endHour) {
            if (myMins < endMins)
                return 0.9
            // same minute check for seconds
            if (myMins === endMins) {
                if (mySeconds < endSeconds)
                    return 0.9
                else
                    return 0.2
            }
            else return 0.2
        }
        else return 0.2;
    } else return 0.2;
}

function transitionBeeSwarm() {
    console.log("In beeswarm: " + selectedStart + " " + selectedEnd);

    innovativeSvg.selectAll("circle")
        .style("opacity", d => setOpacityBasedOnTime(d));

}