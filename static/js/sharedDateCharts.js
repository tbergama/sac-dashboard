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
        yaxis: 'y2'
    };

    var trace2 = {
        x: dates,
        y: totalRain,
        name: 'Rainfall',
        type: 'bar',
        yaxis: 'y2'
    };



    return [trace2, trace1];

    // var layout = {
    //     barmode: 'stack',
    //     autosize: true,
    //     legend: { "orientation": "h" },
    //     margin: {
    //         l: 0,
    //         r: 0,
    //         b: 0,
    //         t: 0
    //     }
    // };
}

function createStackedPlot(dataCache, selectedSeason){
    var bnaTrace = createBNAtrace(dataCache[selectedSeason]);
    var plotData = precipTempTraces(dataCache, selectedSeason);
    plotData.push(bnaTrace);

    var layout = {
        yaxis: {domain: [0, 0.5]},
        legend: {traceorder: 'reversed'},
        yaxis2: {domain: [0.5, 1],
             title: 'Precipitation (In.)' },
        barmode: 'stack',
        legend: { "orientation": "h", x: 0.4, y: .95 },
        margin: {
                    l: 55,
                    r: 5,
                    b: 35,
                    t: 0
                }
    };
  
    Plotly.newPlot('stackedCharts', plotData, layout);
}
