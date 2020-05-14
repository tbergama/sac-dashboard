// Defines functions to create the avalanche danger heatmap

function forecastToInt(forecast){
  var severity = forecast.slice(0,1);
  return +severity;
}

function createBNA(data){
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

  //Create Trace/Data
  var dataset = [
    {
      z: zSeverity,
      x: dates,
      y: yLabels,
      type: 'heatmap',
      hoverongaps: false,
      colorscale: colorscaleValue,
      colorbar:{
        autotick: false,
        tick1: 0,
        dtick: 1
      },
      ygap: 4,
      showscale: true
    }
  ];
  // console.log(dataset);

  // Define Layout
  var layout = {
    // title: 'Avalanche Danger by Proximity to Treeline',
    xaxis: {
      range: [dates[-1], dates[0]],
      type: 'date'
    },
    autosize: true,
    showlegend: false,
    margin: {
      l: 50,
      r: 10,
      b: 30,
      t: 0
  }
  };
  

  // Plot data
  Plotly.newPlot('bnaGraph', dataset, layout);
}