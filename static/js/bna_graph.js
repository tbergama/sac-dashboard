queryUrl = "http://127.0.0.1:5000/api/v1/sample";


d3.json(queryUrl).then(function(data){
  // Grab forecasts and transform as needed
  // Transpose the data into layers

  var levels = ['Below Treeline', 'Near Treeline', 'Above Treeline'];
  var yLabels = ['Below', 'Near', 'Above'];
  var dates = data.forecasts.map(d => d.Date);
  var zSeverity = levels.map(function(level){
    return data.forecasts.map(function(d){
      return forecastToInt(d[level]);
  })});
  console.log(zSeverity);

  var colorscaleValue = [
    [0, '#b3e5fc'],
    [0.25, '#4fc3f7'],
    [0.5, '#03a9f4'],
    [0.75, '#0288d1'],
    [1, '#01579b']
  ];

  var dataset = [
    {
      z: zSeverity,
      x: dates,
      y: yLabels,
      type: 'heatmap',
      hoverongaps: false,
      colorscale: colorscaleValue
    }
  ];
  console.log(dataset);

  var layout = {
    title: 'Avalanche Danger by Proximity to Treeline',
    xaxis: {
      range: [dates[-1], dates[0]],
      type: 'date'
    },
    autosize: true
  };
  
  Plotly.newPlot('bna', dataset, layout);
});

function forecastToInt(forecast){
  var severity = forecast.slice(0,1);
  return +severity;
}

function getColor(forecast){
  switch (forecastToInt(forecast)){
    case 1:
      return '#EEE';
    case 2:
      return '#AAA';
    case 3:
      return '#777';
    case 4:
      return '#444';
    case 5:
      return '#111';
    default:
      return '#FFF';
  }
}

function getY(level){
  if (level == 'Above Treeline'){
    return 3;
  } else if (level == 'Near Treeline'){
    return 2;
  } else {
    return 1;
  }
}