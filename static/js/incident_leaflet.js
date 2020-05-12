queryUrl  = "http://127.0.0.1:5000/api/v1/sample";


// Custom Icon
function createCustomMarker(feature, latlng) {
  switch(feature.properties.type) {
      case "observation":
          var obsIcon = new L.icon({
              iconUrl: 'icons/avalanche.svg',
              iconSize:     [22, 30], // size of the icon
              iconAnchor:   [22, 22], // point of the icon which will correspond to marker's location
              popupAnchor:  [-3, -26] // point from which the popup should open relative to the iconAnchor    
          });
          return L.marker(latlng, {icon: obsIcon});
      case "incident":
          var incIcon = new L.icon({
              iconUrl: 'icons/tool.png',
              iconSize:     [22, 30], // size of the icon
              iconAnchor:   [22, 22], // point of the icon which will correspond to marker's location
              popupAnchor:  [-3, -26] // point from which the popup should open relative to the iconAnchor    
          });
          return L.marker(latlng, {icon: incIcon});              
      }       
}


d3.json(queryUrl).then(function(data) {
  console.log("Mapping... I think...");
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.observations);
});

function createFeatures(observationData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h4>Location: " + feature.properties.location +
      "</h4><hr><p>Date: " + feature.properties.datetime + "</p>" + 
      "<p>Title: " + feature.properties.title + "</p>");
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var observations = L.geoJSON(observationData, {
    pointToLayer: createCustomMarker,
    onEachFeature: onEachFeature
  });

  // Sending our earthquakes layer to the createMap function
  createMap(observations);
}

function createMap(observations) {

  // Define streetmap and darkmap layers
  var hikemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.run-bike-hike",
    accessToken: API_KEY
  });

  var topomap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Trails Map": hikemap,
    "Topo Map": topomap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Observations: observations
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("incident-map", {
    center:[39.0968, -120.0324],
    zoom: 8,
    layers: [topomap, observations]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
}