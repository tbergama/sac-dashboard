// Defines functions to create the avalanche danger heatmap

function forecastToInt(forecast){
    var severity = forecast.slice(0,1);
    return +severity;
}
  
function createBNAtrace(data){
    // Define 'y' values and y labels
    var levels = ['Below Treeline', 'Near Treeline', 'Above Treeline'];
    var yLabels = ['Below', 'Near', 'Above'];
    // Map dates for xAxis
    var dates = data.forecasts.map(d => d.Date);
    // Map forecast data as heatmap values
    var zSeverity = levels.map(function(level){
        return data.forecasts.map(function(d){
        return forecastToInt(d[level]);
    })});
    // console.log(zSeverity);

    // Define the colorscale to be used
    var colorscaleValue = [
        [0, '#b3e5fc'],
        [0.25, '#b3e5fc'],
        [0.25, '#4fc3f7'],
        [0.5, '#4fc3f7'],
        [0.5, '#03a9f4'],
        [0.75, '#03a9f4'],
        [0.75, '#0288d1'],
        [0.75, '#01579b'],
        [1, '#01579b']
    ];

    // Return Trace
    return {
        z: zSeverity,
        x: dates,
        y: yLabels,
        yaxis: 'y2',
        type: 'heatmap',
        hoverongaps: false,
        colorscale: colorscaleValue,
        colorbar:{
            autotick: false,
            tick1: 0,
            dtick: 1,
            title: 'Avalanche<br>Danger', //set title
            titleside:'top', //set position
        },
        ygap: 4,
        showscale: false,
        name: 'Danger Lvl'
    };
}

function precipTempTraces(dataCache, selectedSeason) {

    var activeArray = dataCache[selectedSeason]['weather']
    var avgHighLow = [];
    var dates = [];
    var totalSnow = [];
    var totalRain = [];
    var totalPrecip;
    var rain;
    var snow;

    activeArray.forEach((data) => {
        var highLow = Math.round(data['temp']['max']) + " °F    /    " + Math.round(data['temp']['min']) + " °F";
        avgHighLow.push(highLow);
        dates.push(data['date']);
        rain = 0;
        snow = 0;
        if (data['rain_1h'] != "NaN") {
            rain += parseFloat(data['rain_1h']);
        };
        if (data['snow_1h'] != "NaN") {
            snow += parseFloat(data['snow_1h']);
        };
        totalSnow.push(snow);
        totalRain.push(rain);
    });


    var trace1 = {
        x: dates,
        y: totalSnow,
        name: 'Snowfall',
        type: 'bar',
        text: avgHighLow,
        textposition: 'outside',
        yaxis: 'y3'
    };

    var trace2 = {
        x: dates,
        y: totalRain,
        name: 'Rainfall',
        type: 'bar',
        yaxis: 'y3'
    };



    return [trace2, trace1];
}

function probToZ(p) {
    switch(p) {
        case 'Deep Slab':
            return 1;
        case 'Storm Slab':
            return 2;
        case 'Wind Slab':
            return 3;
        case 'Wet Slab':
            return 4;
        case 'Persistent Slab':
            return 5;
        case 'Normal Caution':
            return 6;
        case 'Cornice':
            return 7;
        case 'Loose Dry':
            return 8;
        case 'Loose Wet':
            return 9;
    }
};

function problemCategories(inputData) {
    console.log("You called problemCategories");
    // console.log(Object.keys(inputData["forecasts"]));

    forecasts = inputData["forecasts"];

    // define problem types
    var probTypes = [
        'Deep Slab',
        'Storm Slab',
        'Wind Slab',
        'Wet Slab',
        'Persistent Slab',
        'Normal Caution',
        'Cornice',
        'Loose Dry',
        'Loose Wet'
    ];

    // map dates
    var dates = forecasts.map(d => d.Date);

    // create z values
    avProbKeys = [
        "Avalanche Problem 1 Issue",
        "Avalanche Problem 2 Issue",
        "Avalanche Problem 3 Issue"
    ];

    zVals = probTypes.map(function(problem){
        return forecasts.map(function(f) {
            if (f['Avalanche Problem 1 Issue'] == problem){
                return probToZ(problem);
            } else if (f['Avalanche Problem 2 Issue'] == problem) {
                return probToZ(problem);
            } else if (f['Avalanche Problem 3 Issue'] == problem){
                return probToZ(problem);
            } else {
                return null;
            }
        })
    });

    // console.log(zVals);

    return {
        x: dates,
        y: probTypes,
        z: zVals,
        type: 'heatmap',
        //colorscale: colorscaleValue,
        showscale: false
      };
}

function createStackedPlot(dataCache, selectedSeason){
    var bnaTrace = createBNAtrace(dataCache[selectedSeason]);
    var plotData = precipTempTraces(dataCache, selectedSeason);
    var problemTrace = problemCategories(dataCache[selectedSeason]);
    plotData.push(bnaTrace);
    plotData.push(problemTrace);

    var layout = {
        yaxis: {domain: [0, 0.33]},
        legend: {traceorder: 'reversed'},
        yaxis2: {domain: [0.33, 0.66]},
        yaxis3: {domain: [0.66, 1],
            title: 'Precipitation (In.)' },
        barmode: 'stack',
        legend: { "orientation": "h", x: 0.4, y: .95 },
        margin: {
                    l: 105,
                    r: 5,
                    b: 35,
                    t: 0
                }
    };
  
    Plotly.newPlot('stackedCharts', plotData, layout);
}