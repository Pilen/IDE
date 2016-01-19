
var reader;
var load_progress;

function load_logfile(event) {
    $("#logurl_input")[0].value = "";
    var files = event.target.files;
    var log_file = files[0];
    load_file(log_file);
}

function load_logurl(event) {
    $("#load_logfile")[0].value = "";
    var url = $("#logurl_input")[0].value;
    if (!url.startsWith("http")) {
        url = "//" + url;
    };
    $.get(url).done(function(data) {
        if (typeof data == "string") {
            parse_log(reader.result);
        } else {
            load_file(data);
        }
    });
}

function load_cancel() {
    if (reader) {
        reader.abort();
    }
}

function load_file(file) {
    $("#load_stats").show();
    $("#load_name").html(file.name);
    $("#load_size").html(file.size);

    load_progress.width("0%");
    load_progress.html("0%");

    reader = new FileReader();
    reader.onerror = function (event) {
        switch(event.target.error.code) {
        case event.target.error.NOT_FOUND_ERR:
            $("#load_status").html("File not found");
            break;
        case event.target.error.NOT_READABLE_ERR:
            $("#load_status").html("File not readable");
            break;
        case event.target.error.ABORT_ERR:
            $("#load_status").html("Loading aborted");
            break;
        default:
            $("#load_status").html("An error occured while reading the file");
        }
    };
    reader.onprogress = function (event) {
        if (event.lengthComputable) {
            var percent = Math.round((event.loaded / event.total) * 100);
            if (percent <= 100) {
                load_progress.width(percent + "%");
                load_progress.html(percent + "%");
            }
        }
    };
    reader.onabort = function (event) {
        $("#load_status").html("Loading aborted");
    };
    reader.onloadstart = function(event) {};
    reader.onload = function(event) {
        load_progress.width("100%");
        load_progress.html("100%");
        setTimeout(function() {$("#load_stats").fadeOut(2000);}, 1000*0);
        console.log(reader.result.length);
        parse_log(reader.result);
    };

    reader.readAsText(file);

}

function load(log_file) {
    if (typeof log_file === "string") {
        $("#log_name").html("");
        $("#log_size").html(log_file.length);

    } else {
        $("#log_name").html(log_file.name);
        $("#log_size").html(log_file.size);

    }
    f = log_file;
}

window.onload = init;
