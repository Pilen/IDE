
var tooltip;
var graph_width = 1000;
var graph_height = 700;
var selected;

function render() {
    console.log("Rendering...");
    $("#settings_container").removeClass("hidden");
    tooltip = null;
    selected = null;
    postprocess(null);
    render_graph();
    render_range();
    render_update();
    console.log("Rendering done");
}

var ca = 1, cb = 10.0, cc = 0.1;
var ca = 0.1, cb = 5.0, cc = 0.1;
// var ca = 1, cb = 10.0, cc = 0.0;

function parable (x) {return ca * x * x + cb * x + cc;};

function render_graph() {
    var all_sites_max = d3.max(all_sites, function(x){return x.value;});

    var node_scale = d3.scale.linear()
        .domain([1, all_sites_max])
        .range([3, 100 ]);
    var label_scale = d3.scale.linear()
        .domain([1, all_sites_max])
        .range([0.1, 1]);
    // var link_scale = d3.scale.linear()
        // .domain(

    tooltip = d3.select("#tooltip");

    svg = d3.select("#graph")
        .classed("graph", true)
        .append("svg")
        .attr("width", graph_width)
        .attr("height", graph_height);

    svg.append("rect")
        .classed("back", true)
        .attr("width", graph_width)
        .attr("height", graph_height);

    var scale = 0.5;
    var x = 0;
    var y = 0;
    graph = svg.append("g");
        // .attr("transform", "translate("+graph_width/4+","+graph_height/4+")scale("+scale+")translate("+x+","+y+")");
        // .attr("transform", "scale("+scale+")translate("+x+","+y+")");

    zoom = d3.behavior.zoom()
        .size([graph_width, graph_height])
        .scaleExtent([0.1, 10])
        .on("zoom", zoomed);
    function zoomed() {
        graph.attr("transform", "translate("+zoom.translate()+")scale("+zoom.scale()+")");
    }
    svg.call(zoom);
    gz = zoomed;

    // graph.append("rect")
    //     .style("fill", "white")
    //     .attr("width", graph_width)
    //     .attr("height", graph_height);

    var bubble = d3.layout.pack()
        .sort(null)
        .size([graph_width, graph_height])
        .padding(1.5);

    var nodes = [];
    var links = [];

    force = d3.layout.force()
        .nodes(nodes)
        .links(links)
        // .charge(-400)
        // .charge(function(d) {return -parable(d.value);})
        .charge(function(d) {return -parable(node_scale(d.value));})
        // .linkStrength(function(d) {return p(Math.min(1, d.weight*d.weight));})
        .linkStrength(function(d) {return 0.4*Math.sqrt(d.weight)+0.6;})
        // .linkStrength(function(d) {return (d.weight * Math.pow(20, d.weight))/20;})
        .gravity(0.05)
        // .linkDistance(30)
        .linkDistance(function(d) {var min = 50,
                                       s = (node_scale(d.source.value)+node_scale(d.target.value))*1.5;
                                   return s > min ? s : min;})
        .size([graph_width, graph_height])
        .on("tick", tick);

    var drag = force.drag()
        .on("dragstart", function(d) {
            d3.event.sourceEvent.stopPropagation();
            d.fixed = true;
            d3.select(this).classed("fixed", true)});

    var link = graph.append("g").selectAll(".link");
    var node = graph.append("g").selectAll(".node");

    function tick() {
        node.attr("cx", function(d) {return d.x;})
            .attr("cy", function(d) {return d.y;});

        link.attr("x1", function(d) {return d.source.x;})
            .attr("y1", function(d) {return d.source.y;})
            .attr("x2", function(d) {return d.target.x;})
            .attr("y2", function(d) {return d.target.y;});
    }




    render_graph.update = function() {
        merge(nodes, filtered.sites);
        merge(links, filtered.links);

        function link_width(d) {return 0.1 + d.weight * 5;};
        link = link.data(links, function(d) {return d.id;});
        link.style("stroke-width", link_width);
        link.enter()
            .append("line")
            .style("stroke-width", link_width)
            .attr("class", "link")
            // .on("mousemove", function(d, i) {
            //     tooltip.classed("hidden", false)
            //         .style("left", (d3.event.pageX+20)+"px")
            //         .style("top", (d3.event.pageY+20)+"px")
            //         .select("#value")
            //         .text(d.weight);
            // })
            // .on("mouseout", function() {
            //     tooltip .classed("hidden", true);
            // })
        link.exit().remove();

        function node_radius(d) {return node_scale(d.value);};
        node = node.data(nodes, function(d) {return d.id;})
            .attr("r", node_radius)

        node.enter()
        // .append("g")
        // .classed("node", true)
        // .attr("transform", function(d) {return "translate("+d.x+","+d.y+")";});

            .append("circle")
            .classed("node", true)
            .attr("r", node_radius)
            .style("fill", function(d) {return color_path(d.name, d.extension)})
            .style("stroke", "black")
            .style("stroke-width", 0)
            .classed("fixed", function(d) {return d.fixed})
            .on("mousemove", function(d, i) {
                if (selected != this) {
                    d3.select(this).style("stroke-width", 1);
                }
                var point = d3.mouse(this);
                tooltip.classed("hidden", false)
                    .style("left", (d3.event.pageX+20)+"px")
                    .style("top", (d3.event.pageY+20)+"px")
                    .select("#value")
                    .text(d.name + d.extension + ": " + d.value);
            })
            .on("mouseout", function() {
                if (selected != this) {
                    d3.select(this).style("stroke-width", 0);
                }
                tooltip .classed("hidden", true);
            })
            .on("click", function(d) {
                if (selected) {
                    d3.select(selected).style("stroke-width", 0);}
                d3.select(this).style("stroke-width", 2);
                selected = this;
            })
            .on("dblclick", function(d) {
                d3.event.stopPropagation();
                d.fixed = false;
                d3.select(this).classed("fixed", d.fixed)})
            .call(force.drag);
        node.exit().remove();





        force.start();
    }
}

function render_range() {

    var range_width = graph_width;
    var range_height = 120;
    var margin = {top: 10, bottom: 40, left:40, right: 10};
    var width = range_width - margin.left - margin.right;
    var height = range_height - margin.top - margin.bottom;

    var count = count_time_samples(all_records, width);
    samples = count.samples;

    // var time_extent = [new Date(all_records[0].time-1),
    //                    new Date(all_records[all_records.length -1].time + 1)];
    var time_extent = [new Date(count.start), new Date(count.end)];

    var max = d3.max(samples, function(x){return x.count;})
    var x_scale = d3.time.scale()
        .domain(time_extent)
        // .nice()
        .range([0, width]);
    var y_scale = d3.scale.linear()
        .domain([0, max])
        .range([height, 0]);

    var x_axis = d3.svg.axis().scale(x_scale).orient("bottom");
    var y_axis = d3.svg.axis().scale(y_scale).orient("left").tickFormat(d3.format("s"));

    var brush = d3.svg.brush()
        .x(x_scale)
        .on("brush", function() {
            if (brush.empty()) {
                settings.extent = null;
            } else {
                settings.extent = brush.extent();
            }
            render_update();
        });

    var area = d3.svg.area()
        .interpolate("monotone")
        .x(function(d) {return x_scale(d.start);})
        .y0(height)
        .y1(function(d) {return y_scale(d.count);});


    var svg = d3.select("#range")
        .append("svg")
        .attr("width", range_width)
        .attr("height", range_height);

    svg.append("rect")
        .classed("back", true)
        .attr("width", range_width)
        .attr("height", range_height);

    svg.append("defs")
        .append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);

    var from = svg.append("text")
        .attr("x", margin.left+250)
        .attr("y", range_height-margin.bottom+30)
        .text("");
    var to = svg.append("text")
        .attr("x", range_width-margin.right-450)
        .attr("y", range_height-margin.bottom+30)
        .text("");



    var range = svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    range.append("path")
        .datum(samples)
        .attr("class", "area")
        .attr("d", area);

    range.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(x_axis);

    range.append("g")
        .attr("class", "y axis")
        .call(y_axis);

    range.append("g")
        .attr("class", "x brush")
        .call(brush)
        .selectAll("rect")
        .attr("y", -6)
        .attr("height", height + 7);

    render_range.update = function() {
        if (settings.extent) {
            from.text("From: "+settings.extent[0]);
            to.text("To: "+settings.extent[1]);
        } else {
            from.text("");
            to.text("");
        }
    }
};

function render_update() {
    postprocess();
    render_range.update();
    render_graph.update();

}

function merge(target, fresh) {
    target.length = fresh.length;
    for (var i = 0; i < fresh.length; i++) {
        target[i] = fresh[i];
    }
}
    // var t = 0;
    // var o = 0;
    // var f = 0;
    // var old = target.copy()

    // while (o < old.length && f < fresh.length) {
    // while (f < fresh.length) {
    //     if (old[o].id === fresh[f]) {
    //         target[t] = old[o];
    //         t++; o++; f++;
    //     } else if (old[o].id < fresh[f].id) {
    //         // Old is not in fresh, skip
    //         o++;
    //     } else { //if (old[o].id > fresh[f].id)
    //         target[t] = fresh[f];
    //         t++; o++;
    //     }
    // }
// }


function color_path(path, extension) {
    path = (path + extension).toLowerCase();
    var alphabet = "etaoinsrhldcumfpgwybvkxjqz/._-"
    var length = alphabet.length;
    var factor = 360/alphabet.length
    var hue = 0;
    // for (var i = 0; i < path.length; i++) {
    //     var value = alphabet.indexOf(path[i])+1;
    //     if (value < 0) {
    //         value = alphabet.length;
    //     }
    //     value = value / length;
    //     hue += 360 * value * (1/(i+1))
    //     // hue += value * (1/(i+1)) * factor;
    //     // hue += (1/(value))*factor
    //     // hue = 360 * Math.pow(value, -(i+1));
    //     console.log("v: "+value+"  1/v: "+1/value+"  h: "+ hue);
    // }
    var letter = 1;
    var word = 1;
    var factor = 20
    var word_hue = 0;
    for (var i = 0; i < path.length; i++) {
        if (path[i] == "/") {
            letter = 1;
            word += 1;
            hue += word_hue * (1/word) * factor * i
            word_hue = 0;

        } else {
            value = alphabet.indexOf(path[i]) + 1;
            value = value / length;

            word_hue += (letter * value);
            letter += 1;
            // console.log("v: "+value+"  w: "+word_hue+"  h: "+ hue);
        }

    }
    // hue = 360 * (hue - Math.floor(hue))

    hue = hue % 361;
    var color = d3.hsl(hue, 0.7, 0.5);
    return color;
}
