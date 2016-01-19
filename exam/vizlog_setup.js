
var settings = {extent: null,
                min_activity: 1,
                max_time_diff: 60*60,
                min_weight_threshold: 0.1,
                only_connected: true,
               };

function p(x) {
    console.log(x);
    return x;
}


function init() {
    $("#load_logfile").on("change", load_logfile);
    $("#load_logurl").on("click", load_logurl);
    $("#logurl_input").keyup(function (event) {
        if (event.keyCode == 13) {
            load_logurl();
        }
    });

    load_progress = $("#load_progress");
    $("#load_cancel").on("click", load_cancel);
    $("#load_stats").hide();
    $("#load_logfile").focus();


    var zoom_factor = 1.5;
    $("#zoom_in").on("click", create_zoom(zoom_factor));
    $("#zoom_out").on("click", create_zoom(1/zoom_factor));
    $("#zoom_reset").on("click", function() {
        svg.transition().duration(500).call(zoom.scale(1).translate([0,0]).event);
    })


    $("#slider").slider({
        min: 0,
        max: 100,
        value: settings.min_weight_slider,
        slide: function(event, ui) {
            settings.min_weight_threshold = ui.value/100;
            render_update();
        }});
}


function create_zoom(factor) {
    // http://bl.ocks.org/mgold/c2cc7242c8f800c736c4
    return function() {
        var scale = zoom.scale();
        var extent = zoom.scaleExtent();
        var translate = zoom.translate();
        var x = translate[0];
        var y = translate[1];
        var target_scale = scale * factor;

        // Already at an extent, done
        if (target_scale === extent[0] || target_scale === extent[1]) {
            return false;
        }

        var clamped_target_scale = Math.max(extent[0], Math.min(extent[1], target_scale));
        if (clamped_target_scale != target_scale) {
            target_scale = clamped_target_scale;
            factor = target_scale/scale;
        }
        var x_center = graph_width/2;
        var y_center = graph_height/2
        x = (x - x_center) * factor + x_center;
        y = (y - y_center) * factor + y_center;
        // svg.call(zoom.scale(target_scale).translate([x, y]).event);
        d3.transition().duration(100).tween("zoom", function() {
            var interpolate_scale = d3.interpolate(scale, target_scale);
            var interpolate_trans = d3.interpolate(translate, [x, y]);
            return function(t) {
                zoom.scale(interpolate_scale(t))
                    .translate(interpolate_trans(t));
                gz();
            }
        });
    }
}
