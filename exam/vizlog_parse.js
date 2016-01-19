
var log;
var failed_to_parse;

function parse_log(log_) {
    console.log("Parsing...");
    $("#parse_stats").show(0);
    $("#parse_stats h1").remove()
    $("#parse_stats").append("<h1>Loading data...</h1>");
    setTimeout(function() {
        $("#parse_stats")[0].offsetHeight;
        $(window).trigger("resize");
        log = log_.split("\n");
        parse(log);
        num = log.length;
        console.log(num);
        console.log("Parsing done.");
        console.log("Processing data...");
        process();
        console.log("Process done.")
        $("#parse_stats").fadeOut(0);
        $("#loading_area").remove();
        render();
    }, 1);
}

// var meth = "([^ ]+)";
// var dest = "([^ \"]+)";
// var suffix = "([?#][^ /\"]*)";

// var path = "(/*([^ /?]*/)*?)";
// var simplebase = "([^ /.]+)";
// var base = "([^ /]+)";
// var ext = "([.][^ /.?#]+)";
// var suffixo = "([?#]?[^ /]*)";
// var end = "([ \"]|$)";
// // var regstr = "^"+meth+" "+dest+suffix+"?"+end;

var meth = "([^ ]+)";
var path = "(/*([^ /?]*/)*?)";
var base = "([^ /?#]*?)";
var ext = "([.][^ /?#.]*?)";
var suffix = "([?#][^ ]*)";
var end = "([ \"]|$)";
var regstr = "^"+meth+" "+path+base+ext+"?"+suffix+"?"+end;
var file_regex = RegExp(regstr);
function test_reg(reg) {
    reg = RegExp(reg);
    var list = ["GET /ABC/DEF/abc.def.gif?a.b/c.d HTTP",
                "GET /ABC/DEF/abc.def HTTP",
                "GET /ABC/DEF/.def HTTP",
                "GET /ABC/DEF/abc HTTP",
                "GET /ABC/DEF/ HTTP",
                "GET /ABC//DEF/ HTTP",
                "GET /ABC/DEF// HTTP"
               ];

    list = list.map(function(x){return reg.exec(x);});
    list = list.map(function (x) {
        return !x ? "null" : x.map(function(x) {return !x?"undefined":'"'+x+'"';}).join(", ");
    });
    list.forEach(function(x){
        console.log(x);
    });
}

function parse(log) {
    if (typeof log === "string") {
        log = log.split("\n");
    }

    reset_data();
    failed_to_parse = [];

    match = create_regex();
    regex = match.regex;
    for (var i = 0; i < log.length; i++) {
        var line = log[i];
        if (line == "") {
            continue;
        }
        var entry = regex.exec(line);
        if (!entry) {
            failed_to_parse.push([i, line, null]);
            continue;
        }

        var request = entry[match.request];
        var request_parts = file_regex.exec(request);
        if (!request_parts) {
            failed_to_parse.push([i, line, request]);
            continue;
        }
        var extension = request_parts[5];
        var base = request_parts[4];
        if (extension && !base) {
            base = extension;
            extension = undefined;
        }
        if (extension) {
            extension = extension.toLowerCase();
        }
        var method = request_parts[1];
        var file = base + (extension || "");
        var destination = request_parts[2] + base;
        var suffix = request_parts[6];
        var full_destination = destination + suffix;
        var status = parseInt(entry[match.status]);

        if (destination.endsWith("/")) {
            if (extension) {
                console.log("Assertion failed");
            }
            extension = ""
            while (destination.endsWith("/")) {
                destination = destination.slice(0, -1);
                extension += "/";
            }
        }

        var record = {
            full:line,
            remote: entry[match.remote],
            time: entry[match.time],
            status: status,
            request: entry[match.request],
            method: method,
            destination: destination,
            extension: extension,
            site: undefined
        };
        preprocess_record(record);
    }
    console.log("Failed to parse " + failed_to_parse.length);
}

function create_regex(pattern) {
    if (!pattern) {
        pattern = $("#pattern")[0].value;
    }
    var noncap_field = '(?:[^ ]+)';
    var noncap_square = '(?:\\[(?:[^\\]]*)\\])';
    var noncap_string = '(?:"(?:[^"]*))"';

    var mapping = {
        field: '([^ ]+)',
        square: '\\[([^\\]]*)\\]',
        string: '"([^"]*)"',
        number: '([0-9]*)',
        any: '('+noncap_field+'|'+noncap_square+'|'+noncap_string+')'
    };
    mapping["remote"] = mapping.field;
    mapping["time"] = mapping.square;
    mapping["request"] = mapping.string;
    mapping["status"] = mapping.number;
    mapping["-"] = mapping.any;

    var alias = {
        from: "remote",
        host: "remote",
        id: "remote",
        ip: "remote",
        client: "remote",
        date: "time",
        when: "time",
        result: "status",
        "return": "status"
    }
    var parts = pattern.split(" ");
    var fields = []
    var regex = {};

    for (var i = 0; i < parts.length; i++) {
        var name = alias[parts[i]] || parts[i];
        var field = mapping[name];
        if (!field) {
            alert("Invalid log pattern");
        } else {
            fields.push(field);
            regex[name] = i+1;
        }
    }

    regex.regex = new RegExp("^"+fields.join(" ")+" *.*$");
    return regex;
}
l = "whitener.iquest.com - - [01/Jul/1995:10:37:05 -0400] \"GET /software/winvn/wvsmall.gif HTTP/1.0\" 304 0"
