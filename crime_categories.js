var crime_categories = [
    {
        "color_hue": 240,
        "category": "economics",
        "crimes": ["SUSPICIOUS OCC",
                   "FRAUD",
                   "FORGERY/COUNTERFEITING",
                   "BAD CHECKS",
                   "EMBEZZLEMENT",
                   "EXTORTION",
                   "BRIBERY"]
    },
    {
        "color_hue": 0,
        "category": "violence",
        "crimes": ["ASSAULT",
                   "SEX OFFENSES FORCIBLE",
                   "SEX OFFENSES NON FORCIBLE",
                   "FAMILY OFFENSES"]
    },
    {
        "color_hue": 60,
        "category": "missing",
        "crimes": ["MISSING PERSON",
                   "KIDNAPPING",
                   "RUNAWAY"]
    },
    {
        "color_hue": 120,
        "category": "theft",
        "crimes": ["BURGLARY",
                   "LARCENY/THEFT",
                   "VEHICLE THEFT",
                   "STOLEN PROPERTY",
                   "ROBBERY"]
    },
    {
        "color_hue": 180,
        "category": "property",
        "crimes": ["VANDALISM",
                   "TRESPASS",
                   "ARSON"]
    },
    {
        "color_hue": 290,
        "category": "drug",
        "crimes": ["DRUG/NARCOTIC"]
    },
    {
        "color_hue": 30,
        "category": "misconduct",
        "crimes": ["PROSTITUTION",
                   "DRUNKENNESS",
                   "DISORDERLY CONDUCT",
                   "DRIVING UNDER THE INFLUENCE",
                   "LOITERING"]
    },
    {
        "color_hue": 70,
        "category": "other",
        "crimes": ["OTHER OFFENSES",
                   "WARRANTS",
                   "NON-CRIMINAL",
                   "RECOVERED VEHICLE",
                   "WEAPON LAWS",
                   "SECONDARY CODES",
                   "LIQUOR LAWS",
                   "GAMBLING",
                   "SUICIDE"]
    },
    {
        "color_hue": "black",
        "category": "unidentified",
        "crimes": []
    }];

var all_crimes = new Set([].concat.apply([], crime_categories.map(function(d){return d.crimes})));

// for (var i = 0; i < crime_categories.length; i++) {
//     var crime = crime_categories[i];

//     var color_hue_start = d3.hsl(crime.color_hue-20, 0.8, 0.5);
//     var color_hue_end = d3.hsl(crime.color_hue+20, 0.8, 0.5);

// };
