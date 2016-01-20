
var site_id = 0;
var all_sites;
var destinations;
var extensions;
var records_by_remote;
var all_records;
var data;
var filtered;

function reset_data() {
    all_sites = [];
    destinations = {};
    extensions = new Map();
    records_by_remote = new Map();
    all_records = [];
    filtered = {sites: [],
                links: []};

    data = {};
    data.records = crossfilter();
    data.time = data.records.dimension(function(d) {return d.unix});
    // data.status = data.crossfilter.dimension(function(d) {return d.status});
    // data.status.filter(200);
}


function get_site(destination_str, extension) {
    extension = extension || "";
    var destination = destinations[destination_str];
    if (destination === undefined) {
        destination = {}
        destinations[destination_str] =  destination;
    }
    var site = destination[extension];
    if (site === undefined) {
        site = {id: site_id,
                name: destination_str,
                extension: extension,
                other_extensions: [],
                records: [],
                value: 0,
                connected: false
               };
        site_id += 1;
        destination[extension] = site;
    }
    return site;
}

var log_time_reader = d3.time.format("%d/%b/%Y:%H:%M:%S %Z").parse
function log_time_to_unix(time) {return +log_time_reader(time);}

function preprocess_record(record) {
    if (record.method !== "GET") {
        return;
    }
    if (record.extension &&
        record.extension !== "" &&
        !record.extension.startsWith("/") &&
        pages_extensions.indexOf(record.extension) === -1) {
        return;
    }

    record.time = log_time_reader(record.time);
    record.unix = +record.time;
    // record.unix = log_time_to_unix(record.time);

    if (record.status == 200) {
        var ext_count = extensions.get(record.extension) || 0;
        extensions.set(record.extension, ext_count+1);
    } else {
        return;
    }

    var site = get_site(record.destination, record.extension);
    site.records.push(record);
    record.site = site;

    all_records.push(record);

    var records = records_by_remote.get(record.remote);
    if (records === undefined) {
        records = [record];
        records_by_remote.set(record.remote, records);
    } else {
        records.push(record);
    }
}

function process() {
    console.log("processing");
    consolidate_sites();
    data.records.add(all_records);
}

function postprocess() {
    data.time.filter(settings.extent);

    all_sites.forEach(function(site){
        site.records = [];
        site.value = 0;
    });
    var records = data.time.bottom(Infinity);
    records.forEach(function(record) {
        record.site.records.push(record);
        record.site.value += 1;
    });

    filtered.sites = all_sites.filter(function(site) {
        site.connected = false;
        return site.value >= settings.min_activity;
    });
    after = filtered.sites.length;


    var remotes = {};
    records.forEach(function(record) {
        var remote = remotes[record.remote];
        if (!remote) {
            remote = [];
            remotes[record.remote] = remote;
        }
        remote.push(record);
    });
    links = {};
    diffs = [];
    _.each(remotes, function(records) {
        for (var i = 0; i < records.length; i++) {
            for (var j = i+1; j < records.length; j++) {
                a = records[i];
                b = records[j];
                if (a.site.id === b.site.id) {
                    continue;
                }

                var time_diff = (b.unix - a.unix)/1000;
                if (time_diff > settings.max_time_diff) {
                    break;
                }
                var between = j - i; // Never zero
                var local_weight
                if (time_diff === 0) {
                    local_weight = 1 / between;
                } else {
                    local_weight = 1 / (time_diff * between);
                }
                diffs.push({b:between, d:time_diff, w:local_weight});

                var source;
                var target;
                 // Source is always the one with the smaller id, never equal
                if (a.site.id < b.site.id) {
                    source = a.site
                    target = b.site;
                } else {
                    source = b.site;
                    target = a.site;
                }
                var id = source.id + "-" + target.id;

                var link = links[id];
                if (!link) {
                    link = {id:id,
                            source: source,
                            target: target,
                            weight_st: 0,
                            weight_ts: 0,
                            weight: 0}
                    links[id] = link;
                }
                link.weight_st += local_weight;
            }
        }
    });

    var max = -1;
    avg = 0;
    filtered.links = [];
    _.each(links, function(link) {
        link.weight = link.weight_st + link.weight_ts
        if (link.weight > max) {
            max = link.weight;
        }
        avg += link.weight;
        filtered.links.push(link);
    });
    avg = avg/filtered.links.length;
    avg = avg / max;
    // filtered.links = _.values(links);
    // var threshold = settings.min_weight_threshold * max;
    ws = [];
    filtered.links = filtered.links.filter(function(link) {
        link.weight = link.weight / max;
        return link.weight >= settings.min_weight_threshold});
    filtered.links.sort(function(x, y) {return x.id - y.id;});

    if (settings.only_connected) {
        filtered.links.forEach(function(link) {
            link.source.connected = true;
            link.target.connected = true;
        });
        filtered.sites = filtered.sites.filter(function(site) {return site.connected;});
    }
}

function consolidate_sites() {
    consolidated = [];
    for (var dest in destinations) {
        var destination = destinations[dest];
        var site_names = Object.keys(destination);

        if (site_names.length > 1) {
            var unnamed = [];
            var named = null;
            var rating = 0;
            for (var extension in destination) {
                var current_rating = 0;
                if (extension === "") {
                    unnamed.push(extension);
                    current_rating = 4;
                } else if (extension.startsWith("/")) {
                    unnamed.push(extension);
                    current_rating = 7;
                } else if (extension === ".html") {
                    current_rating = 100;
                } else if (pages_extensions.indexOf(extension) != -1) {
                    current_rating = 70;
                    named = named || extension;
                } else if (media_extensions.indexOf(extension) != -1) {
                    current_rating = 2;
                } else {
                    current_rating = 50;
                }

                if (current_rating > rating || !named) {
                    named = extension;
                    rating = current_rating;
                }
            }
            if (rating > 0) {
                consolidated.push(destination);
                unnamed.forEach(function(extension) {
                    if (extension === named) {
                        return;
                    }
                    var site = destination[extension];
                    delete destination[extension];
                    site.records.forEach(function(record) {
                        record.site = destination[named];
                        site.records.push(record);
                    });
                });
            }
        }
    }

    _.each(destinations, function(destination, dest) {
        _.each(destination, function(site, ext) {
            all_sites.push(site);
        });
    });
    all_sites.sort(function(x, y) {return x.id - y.id;});
    console.log("Consolidated " + (all_sites.length - _.size(destinations)) + " pages");
    // destinations = {};
}

function count_time_samples(records, n) {
    var buckets = [];
    // var bucket = [];
    var count = 0;
    var start = records[0].unix;
    var end = records[records.length - 1].unix;
    var step = Math.ceil((end - start) / n);
    var current = start
    var next = current + step;
    records.forEach(function(record) {
        while (record.unix > next) {
            buckets.push({start:new Date(current), count:count});
            // bucket = [];
            count = 0;
            current = next;
            next += step;
        }
        // bucket.push(record);
        count += 1;
    });

    buckets.push({start:new Date(current), count:count});
    // console.log("start: "+start+"\nend: "+end+"\nstep: "+step+"\npushed later: "+count+"\nlength: "+buckets.length);

    // sum = 0;
    // buckets.forEach(function(b) {sum += b.length;});
    // if (sum !== records.length) {console.log("Assertion failed");}

    return {samples: buckets,
            start: start,
            end: end+step+1};

}

var pages_extensions = [
    ".asp",
    ".aspx",
    ".cgi",
    ".htm",
    ".html",
    ".perl",
    ".php",
    ".pl",
    ".py",
    ".xhtml"]
var media_extensions = [
    ".bmp",
    ".doc",
    ".eps",
    ".exe",
    ".gif",
    ".ico",
    ".ini",
    ".jpeg",
    ".jpg",
    ".mp3",
    ".mp4",
    ".mpg",
    ".pdf",
    ".png",
    ".ps",
    ".svg",
    ".txt",
    ".txt~",
    ".wav",
    ".xbm",
    ".zip"]


function verify() {
    failed_verification = [];
    all_sites.forEach(function(site) {
        site.records.forEach(function (record) {
            if (all_records.indexOf(record) === -1) {
                failed_verification.push([site, record]);
            }
        })
    });

    all_records.forEach(function(record) {
        if (all_sites.indexOf(record.site) === -1) {
            failed_verification.push(record)
        }
    })

    if (failed_verification.length > 0) {
        throw "error";
    }
};
