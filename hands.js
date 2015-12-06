
function create_hands() {

    var svg = d3.select("#hands")
            .append("svg")
            .attr("width", 1000)
            .attr("height", 1000);


    var hand_x_offset = 50;
    var hand_y_offset = 50;
    var hand_scale = d3.scale.linear()
            .domain([0.1, 1.3])
            .range([0, 600]);

    var plot_x_offset = 650;
    var plot_y_offset = 650;
    var plot_scale = d3.scale.linear()
            .domain([-0.7, 0.7])
            .range([-300, 300]);

    var h_x_axis = svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate("+hand_x_offset+", "+hand_y_offset+")")
            .call(d3.svg.axis()
                  .scale(hand_scale)
                  .orient("top"));
    var h_y_axis = svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate("+hand_x_offset+", "+hand_y_offset+")")
            .call(d3.svg.axis()
                  .scale(hand_scale)
                  .orient("left"));

    var p_x_axis = svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate("+plot_x_offset+", "+plot_y_offset+")")
            .call(d3.svg.axis()
                  .scale(plot_scale)
                  .orient("top"));
    var p_y_axis = svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate("+plot_x_offset+", "+plot_y_offset+")")
            .call(d3.svg.axis()
                  .scale(plot_scale)
                  .orient("left"));

    var color = d3.scale.linear()
            .domain(d3.range(0, 40))
            // .range(["red", "orange", "yellow", "magenta"]);
            // .range(["#53337F", "#772B7A", "#A63A5D", "#BB6241"]);
            // .range(["#FF8D0F", "#E8310C", "#FF009F", "#840CE8", "#0D27FF"]);
            .range(d3.range(0, 360, 360/40).map(function(h) {return d3.hsl(h, 0.8, 0.5);}));


    // var tooltip = d3.select("body")
    //         .append("div")
    //         .attr("id", "tooltip")
    //         .classed("hidden", true)
    //         .append("p")
    //         .append("span")
    //         .attr("id", "value")
    //         .text("?")


    var lineFn = d3.svg.line()
            .x(function(d) { return hand_scale(d[0]) + hand_x_offset; })
            .y(function(d) { return hand_scale(d[1]) + hand_y_offset; })
            .interpolate("cardinal");

    svg.selectAll(".handpath")
        .data(hands_raw_coordinates)
        .enter()
        .append("path")
        .classed("handpath", true)
        .attr("d", function(d, i) {return lineFn(d);})
        .attr("id", function(d, i) {return "pathno" + i; })
        .attr("stroke", function(d, i) {return color(i);})
        .attr("stroke-width", 1)
        .attr("stroke-opacity", "0.5")
        .attr("fill", "none");
    // .attr("fill-opacity", "0.01");


    svg.selectAll("circle")
        .data(hands_pca)
        .enter()
        .append("circle")
        .attr("cx", function(d, i) {return plot_scale(d[0]) + plot_x_offset;})
        .attr("cy", function(d, i) {return plot_scale(d[1]) + plot_y_offset;})
        .attr("r", 5)
        .attr("fill", function(d, i) {return color(i);})
        .on("mousemove", function(d, i) {
            // d3.selectAll("path")
            //     .attr("stroke", function(p_d, p_i) {
            //         if (i == p_i) {
            //             console.log("abe");
            //             return "red";
            //         } else {
            //             return "gYyreen";
            //         }
            //     });
            d3.selectAll("path")
                // .attr("stroke", function(d, i) {return color(i);})
                .attr("stroke-width", 1)
                .attr("stroke-opacity", "0.1");

            d3.select("#pathno"+i)
                // .attr("stroke", "red")
                .attr("stroke-width", 3)
                .attr("stroke-opacity", "1");

            d3.selectAll("circle")
                .attr("stroke", "none");
            d3.select(this)
                .attr("stroke", "black")
                .attr("stroke-width", 2);



            var point = d3.mouse(this);
            d3.select("#tooltip")
                .classed("hidden", false)
                .style("left", (point[0]+20)+"px")
                .style("top", (point[1]+20)+"px")
                .select("#value")
                .text("#"+i);
        })
        .on("mouseout", function() {
            d3.select("#tooltip").classed("hidden", true);
        });


    svg.selectAll(".rect")
        .data(d3.range(0, 40))
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", function(d, i) { return i + 10})
        .attr("width", 20)
        .attr("height", 1)
        .attr("fill", function(d) {return color(d)});

}

d3.select(window).on("load", create_hands);

console.log("ready");
