// Popover
$(document).ready(function() {
    $('[data-toggle="popover"]').popover();
});

// "Initialize" myMap variable
var myMap = null;

// Season Object Lookup
var seasonLookup = {
    '2013/2014': { min: '2013-11-01', max: '2014-04-30' },
    '2014/2015': { min: '2014-11-01', max: '2015-04-30' },
    '2015/2016': { min: '2015-11-01', max: '2016-04-30' },
    '2016/2017': { min: '2016-11-01', max: '2017-04-30' },
    '2017/2018': { min: '2017-11-01', max: '2018-04-30' },
    '2018/2019': { min: '2018-11-01', max: '2019-04-30' },
    '2019/2020': { min: '2019-11-01', max: '2020-04-30' }
}


var dataCache = {};
var selectedSeason = d3.select('#seasonPicker').property('value');
// console.log(selectedSeason);
var lookupURL = '/api/v1/' + seasonLookup[selectedSeason]['min'] + '/' + seasonLookup[selectedSeason]['max'];
// console.log(lookupURL);
document.getElementById("spinner-container").style.display = "block";
d3.json(lookupURL).then(data => {
    dataCache[selectedSeason] = data;
    // console.log(dataCache);
    console.log("Loading data for " + selectedSeason);
    // Graph/Map Function calls
    document.getElementById("spinner-container").style.display = "none";
    callPlots(dataCache, selectedSeason);
});

function callPlots(dataCache, selectedSeason) {
    mapObservations(dataCache[selectedSeason].observations);
    precipTempGraph(dataCache, selectedSeason);
    createBNA(dataCache[selectedSeason]);
    createStackedPlot(dataCache, selectedSeason);
}


// Load data on change
d3.select('#seasonPicker')
    .on("change", function() {
        console.log("You changed the dropdown!");
        var selectedSeason = d3.select(this).property('value');
        // console.log(selectedSeason);
        document.getElementById("spinner-container").style.display = "block";
        if (!(dataCache.hasOwnProperty(selectedSeason))) {
            var lookupURL = '/api/v1/' + seasonLookup[selectedSeason]['min'] + '/' + seasonLookup[selectedSeason]['max'];
            d3.json(lookupURL).then(data => {
                // console.log(lookupURL);
                dataCache[selectedSeason] = data;
                console.log("Loading data for " + selectedSeason);
                document.getElementById("spinner-container").style.display = "none";
                callPlots(dataCache, selectedSeason);
            })
        } else {
            console.log("Data already pulled from API. Referencing cached JSON...");
            console.log(dataCache);
            callPlots(dataCache, selectedSeason);
            document.getElementById("spinner-container").style.display = "none";
        }

    });