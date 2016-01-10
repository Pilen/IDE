String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};


var sf_crimes = null;
var sfpd_districts = null;
var ready = 3;
d3.json("/IDE/sf_crime.geojson", function(error, crimes) {sf_crimes = crimes;
                                                     if (error) {console.log(error);} else {start();}});
d3.json("/IDE/sfpd_districts.geojson", function(error, districts) {sfpd_districts = districts;
                                                              if (error) {console.log(error);} else {start();}});

function start() {
    ready--;
    if (ready == 0) {
        create_crimemap()
    }
};

function crime_color_factory() {
    var crime_color = new Map();
    for (var i = 0; i < crime_categories.length; i++) {
        var crime = crime_categories[i];
        var hue = crime.color_hue;
        var color = function(){
            // Scope hack
            var hue_scale = d3.scale.ordinal()
                    .domain(crime.crimes)
                    .rangePoints([hue-20, hue+20]);
            return function(crime) {return d3.hsl(hue_scale(crime), 0.8, 0.5);};
        }();
        for (var j = 0; j < crime.crimes.length; j++) {
            crime_color.set(crime.crimes[j], color);
        }
    }
    return function(crime) {
        var color = crime_color.get(crime);
        if (color) {
            return color(crime);
        } else {
            return "black";
        }
    };
}


function create_crimemap() {
    console.log("Creating map");


    var crime_color = crime_color_factory([]);




    var district_by_name = d3.map();
    crime_types = new Set();
    for (var i = 0; i < sfpd_districts.features.length; i++) {
        var district = sfpd_districts.features[i];
        district_by_name.set(district.properties.district, district);
        district.properties.crimerate = 0;
    }
    for (var i = 0; i < sf_crimes.features.length; i++) {
        var crime = sf_crimes.features[i];
        var district = district_by_name.get(crime.properties.PdDistrict);
        district.properties.crimerate++;

        crime_types.add(crime.properties.Category)

    }
    var max_crimerate = d3.max(sfpd_districts.features, function(d) {return d.properties.crimerate});

    var district_color = d3.scale.linear()
            .domain([0, max_crimerate])
    // .range(["blue", "red"]);
            .range(["white", "black"]);

    var width = 800, height = 700;
    var svg = d3.select("#crimemap")
            .append("svg")
            .attr("width", width)
            .attr("height", height);


    var projection = d3.geo.orthographic()
            .scale(3 * Math.pow(10, 5))
            .rotate([122.43, -37.78, 0.0])
            .translate([width / 2, height / 2])
            .clipAngle(90)
            .precision(.1);

    // var projection = d3.geo.albers()
    //         .scale(190000)
    //         .rotate([71.057, 0])
    //         .center([0, 42.313])
    //         .translate([width / 2, height / 2]);

    var geo_path = d3.geo.path()
            .projection(projection);

    function reset_districts() {
        svg.selectAll(".district")
            .attr("stroke", "white")
            .attr("stroke-width", 0);
    };

    // District fill
    svg.append("g")
        .selectAll(".districtfill")
        .data(sfpd_districts.features)
        .enter()
        .append("path")
        .classed("districtfill", true)
        .attr("d", geo_path)
        .attr("fill", function(d, i) {return district_color(d.properties.crimerate);})
        // .attr("opacity", "0.5")
        .attr("stroke", "white")
        .attr("stroke-width", 1);


    svg.append("g")
        .selectAll(".crimescene")
        .data(sf_crimes.features)
        .enter()
        .append("path")
        .classed("crimescene", true)
        .attr("fill", function(d, i) {return crime_color(d.properties.Category);})
        .attr("d", geo_path.pointRadius(2));


    // District outline
    svg.append("g")
        .selectAll(".district")
        .data(sfpd_districts.features)
        .enter()
        .append("path")
        .classed("district", true)
        .attr("d", geo_path)
        .attr("id", function(d, i) {return "districtno"+i;})
        .attr("fill-opacity", 0)
        .on("mousemove", function(d, i) {
            reset_districts();
            d3.select("#districtno"+i)
                .attr("stroke", "white")
                .attr("stroke-width", 4);

            var point = d3.mouse(this);
            d3.select("#tooltip")
                .classed("hidden", false)
                .style("left", (point[0]+20)+"px")
                .style("top", (point[1]+20)+"px")
                .select("#value")
                .text(d.properties.district.toProperCase() + " " + d.properties.crimerate);
        })
        .on("mouseout", function() {
            reset_districts();
            d3.select("#tooltip")
                .classed("hidden", true);
        });

    var legend = d3.select("#crimemap")
        .append("div")
        .attr("id", "legend");
    legend.selectAll(".category")
        .data(crime_categories)
        .enter()
        .append("div")
        .classed("category", true)
        // .text(function(d, i) {return d.category.toProperCase();})
        .selectAll(".crimetype")
        .data(function(d, i) {return d.crimes;})
        .enter()
        .append("div")
        .text(function(d, i) {return d.toProperCase();})
        .style("background-color", function(d, i) {return crime_color(d);})
        .on("mousemove", function(d, i) {
            d3.selectAll(".crimescene")
                .attr("opacity", function(cd, ci) {
                    if (cd.properties.Category == d) {
                        return 1;
                    } else {
                        return 0;
                    }
                });
            d3.select(this)
                .style("border", "3px solid black")
                .style("border-radius", "5px");
        })
        .on("mouseout", function() {
            d3.selectAll(".crimescene")
                .attr("opacity", 1);
            d3.select(this)
                .style("border", "0px");
        });

};

d3.select(window).on("load", start);
console.log("ready");
