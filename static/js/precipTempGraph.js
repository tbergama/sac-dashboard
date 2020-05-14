function precipTempGraph(dataCache, selectedSeason) {

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

    // console.log(avgHighLow);
    // console.log(dates);
    // console.log(totalSnow);
    // console.log(totalRain);

    var trace1 = {
        x: dates,
        y: totalSnow,
        name: 'Snowfall',
        type: 'bar',
        text: avgHighLow,
        textposition: 'outside'
    };

    var trace2 = {
        x: dates,
        y: totalRain,
        name: 'Rainfall',
        type: 'bar'
    };



    var data = [trace2, trace1];

    var layout = {
        barmode: 'stack',
        autosize: true,
        legend: { "orientation": "h", x: 0.4, y: .95 },
        margin: {
            l: 30,
            r: 85,
            b: 4,
            t: 0
        }
    };

    Plotly.newPlot('precipTempGraph', data, layout);





}