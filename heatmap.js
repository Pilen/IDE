var years = temperatures.length / 12;
var cell_width = 10;
var cell_height = 5;
var width = 12 * cell_width + 150;
var height = years * cell_height + 100;

var min_temp = d3.min(temperatures);
var max_temp = d3.max(temperatures.filter(function(x){return x < 100}));
var middle_temp = min_temp + (max_temp - min_temp)/2;
var temp_step = max_temp/3;
// var color = d3.scale.linear()
//     .domain([min_temp, middle_temp, max_temp])
//     .range(["blue", "yellow", "red"]);
// var color = d3.scale.linear()
//     .domain([min_temp, 0       , 10      , 20      , max_temp])
//     .range([ "blue",  "white","yellow", "orange", "red"]);
var color = d3.scale.linear()
    .domain([min_temp , 0,  temp_step*1, temp_step*2, temp_step*3])
    .range([ "#aaaaff", "white", "yellow", "orange", "red"]);

console.log(color(14));

var offset_x = 40;
var offset_y = 40;

function create_heatmap() {

    var svg = d3.select("body")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

    svg.selectAll("rect")
        .data(temperatures)
        .enter()
        .append("rect")
        .attr("x", function(d, i) {
            var col = i % 12;
            return col * cell_width + offset_x;
        })
        .attr("y", function(d, i) {
            var row = Math.floor(i / 12);
            return row * cell_height + offset_y;
        })
        .attr("width", cell_width)
        .attr("height", cell_height)
        .attr("fill", function(d, i) {
            if (d > 100) {
                return "#000000";
            }
            // var col = i % 12;
            // var color = Math.floor(col * (255/12));
            // var color_string =  "rgb(" + color +","+ color +","+ color +")";
            // return color_string;
            return color(d);
        });

    svg.append("text")
        .attr("x", 40)
        .attr("y", 35)
        .text("Month")
        .attr("font-family", "sans-serif")
        .attr("font-size", "20px")
        .attr("fill", "black");

    svg.append("text")
        .attr("transform", "translate(20, 100)rotate(90)")
        .text("Year")
        .attr("font-family", "sans-serif")
        .attr("font-size", "20px")
        .attr("fill", "black");

    svg.append("text")
        .attr("x", 170)
        .attr("y", 70)
        .text(min_temp)
        .attr("font-family", "sans-serif")
        .attr("font-size", "20px")
        .attr("fill", "black");

    svg.append("text")
        .attr("x", 170)
        .attr("y", 400)
        .text(max_temp)
        .attr("font-family", "sans-serif")
        .attr("font-size", "20px")
        .attr("fill", "black");

    svg.append("text")
        .attr("x", 170)
        .attr("y", 430)
        .text("Temp.")
        .attr("font-family", "sans-serif")
        .attr("font-size", "20px")
        .attr("fill", "black");

    svg.append("text")
        .attr("x", 205)
        .attr("y", 157)
        .text("0")
        .attr("font-family", "sans-serif")
        .attr("font-size", "20px")
        .attr("fill", "black");

    svg.selectAll(".rect")
        .data(d3.range(min_temp, max_temp, 0.1))
        .enter()
        .append("rect")
        .attr("x", 180)
        .attr("y", function(d, i) { return i + 80})
        .attr("width", 20)
        .attr("height", 1)
        .attr("fill", function(d) {return color(d)});


    console.log("Done");


}

d3.select(window).on("load", create_heatmap);
