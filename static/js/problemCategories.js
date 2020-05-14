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

    forecasts = inputData["forecasts"]

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

    // zVals = probTypes.map(function(problem){
    //     return forecasts.map(function(f) {
    //         avProbKeys.forEach(function(key){
    //             return 1;
    //             // if (f[key] == problem){
    //             //     return probToZ(problem);
    //             // } else {
    //             //     return null;
    //             // }
    //         })
    //     })
    // });

    // zVals = probTypes.map(function(problem){
    //     return forecasts.map(function(f) {
    //         if (f['Avalanche Problem 1 Issue'] == problem){
    //             return 1;
    //         } else {
    //             return 0;
    //         }
    //     })
    // });

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

    console.log(zVals);

    var data = [{
        x: dates,
        y: problemCategories,
        z: zVals,
        type: 'heatmap',
        //colorscale: colorscaleValue,
        showscale: false
      }
    ];

    var layout = {
        xaxis: {
          range: [dates[-1], dates[0]],
          type: 'date'
        },
        autosize: true,
        showlegend: false
    };

    Plotly.newPlot('problemCategories', data, layout);

}
