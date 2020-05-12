// Popover
$(document).ready(function() {
    $('[data-toggle="popover"]').popover();
});

// Season Object Lookup

var seasonLookup = {
    '2013/2014': { min: '2013-06-01', max: '2014-05-31' },
    '2014/2015': { min: '2014-06-01', max: '2015-05-31' },
    '2015/2016': { min: '2015-06-01', max: '2016-05-31' },
    '2016/2017': { min: '2016-06-01', max: '2017-05-31' },
    '2017/2018': { min: '2017-06-01', max: '2018-05-31' },
    '2018/2019': { min: '2018-06-01', max: '2019-05-31' },
    '2019/2020': { min: '2019-06-01', max: '2020-05-31' }
}

// Initialize cached data
var dataCache = {}

var selectedSeason = d3.select('#seasonPicker').property('value');
console.log(selectedSeason);
var lookupURL = '/api/v1/' + seasonLookup[selectedSeason]['min'] + '/' + seasonLookup[selectedSeason]['max'];
console.log(lookupURL);
d3.json(lookupURL).then(data => {
    dataCache[selectedSeason] = data;
    console.log(dataCache);
})

// Load data on change
d3.select('#seasonPicker')
    .on("change", function() {
        console.log("You changed the dropdown!")
        selectedSeason = d3.select(this).property('value');
        console.log(selectedSeason);

        if (!(dataCache.hasOwnProperty(selectedSeason))) {
            d3.json(lookupURL).then(data => {
                lookupURL = '/api/v1/' + seasonLookup[selectedSeason]['min'] + '/' + seasonLookup[selectedSeason]['max'];
                console.log(lookupURL);
                dataCache[selectedSeason] = data;
                console.log(dataCache);
            })
        } else {
            console.log("Data already pulled from API. Referencing cached JSON...");
        }

    });