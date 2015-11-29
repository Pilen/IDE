var avg_temperatures = ["Average temperature"];
var monthly = [["Jan"],
               ["Feb"],
               ["Mar"],
               ["Apr"],
               ["May"],
               ["Jun"],
               ["Jul"],
               ["Aug"],
               ["Sep"],
               ["Oct"],
               ["Nov"],
               ["Dec"]]


for (var i = 0; i < temperatures.length; i += 12) {
    var sum = 0;
    var n = 0;
    for (var j = 0; j < 12; j++) {
        temp = temperatures[i+j];
        if (temp < 100) {
            sum += temp;
            n++
            monthly[j].push(temp);
        } else {
            month = monthly[j];
            old = month[month.length - 1]
            monthly[j].push(old);
        }
    }
    avg_temperatures.push(sum/n);
}
monthly.push(avg_temperatures);


function create_plot() {
    var chart = c3.generate({
        bindto: "#chart",
        data: {
            columns: monthly
        },
        axis: {
            y: {
                label: {
                    text: "Temperature (deg)",
                    position: "outer-middle"
                }
            },
            x: {
                label: {
                    text: "year (since 1880)"
                }
            }

        }
    });
}

d3.select(window).on("load", function() {create_plot(); create_heatmap()});
