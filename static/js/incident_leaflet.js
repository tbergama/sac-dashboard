// Defines function for leaflet based map of observations and incidents.

// Overhead function for the map
function mapObservations(data){
    createFeatures(createLayerData(data));
}

// Split data into obs and inc for different layers
function createLayerData(data){
    var observations = filterFeatures(data, 'observation');
    var incidents = filterFeatures(data, 'incident');
    return [observations, incidents];
}

// Filter data by 'type' property
function filterFeatures(data, obstype){
    return data.filter(function(feature){
        if (feature.properties.type == obstype) {
            return feature;
        }
    });
}


// Create custom icon based on incident or observation
function createCustomMarker(feature, latlng) {
    switch (feature.properties.type) {
        case "observation":
            var obsIcon = new L.icon({
                iconUrl: 'static/icons/binocs.svg',
                iconSize: [22, 30], // size of the icon
                iconAnchor: [22, 22], // point of the icon which will correspond to marker's location
                popupAnchor: [-3, -26] // point from which the popup should open relative to the iconAnchor    
            });
            return L.marker(latlng, { icon: obsIcon });
        case "incident":
            var incIcon = new L.icon({
                iconUrl: 'static/icons/shovel-color.svg',
                iconSize: [30, 30], // size of the icon
                iconAnchor: [22, 22], // point of the icon which will correspond to marker's location
                popupAnchor: [-3, -26] // point from which the popup should open relative to the iconAnchor    
            });
            return L.marker(latlng, { icon: incIcon });
    }
}

// Create overlay layers and bind popups
function createFeatures(data_list) {

    // Give each feature a popup describing the observation/incident report
    function onEachFeature(feature, layer) {
        switch (feature.properties.type) {
            case "observation":
                return layer.bindPopup("<h6>" + feature.properties.location +
                    "</h6><hr>" +
                    "<p>" + feature.properties.datetime + "</p>" +
                    "<p>" + feature.properties.title + "</p>" +
                    "<hr><a href=\"" + feature.properties.url + "\">Full Report</a>");
            case "incident":
                return layer.bindPopup("<h5>" + feature.properties.title +
                    "</h5><hr><h6>" + feature.properties.datetime + "</h6>" +
                    "<ul>" +
                    "<li>Location: " + feature.properties.location + "</li>" +
                    "<li>Avalanche Size: " + feature.properties.av_width + " ft wide X " + feature.properties.av_length + " ft long</li>" +
                    "<li>Relative Size: " + feature.properties.rel_size + "</li>" +
                    "<li>People Caught: " + feature.properties.people_caught + "</li>" +
                    "<li>Partial Burials: " + feature.properties.partial_burials + "</li>" +
                    "</ul>" +
                    "<hr><a href=\"" + feature.properties.url + "\">Full Report</a>");
        }
    }

    // Create GeoJSON layers and add their icons and popups
    var observations = L.geoJSON(data_list[0], {
        pointToLayer: createCustomMarker,
        onEachFeature: onEachFeature
    });
    var incidents = L.geoJSON(data_list[1], {
        pointToLayer: createCustomMarker,
        onEachFeature: onEachFeature
    });

    // Define the icon size based on the cluster child count
    function getClusterSize(childCount) {
        switch (true) {
            case (childCount > 100):
                return [80, 80];
            case (childCount > 50):
                return [60, 60];
            case (childCount > 30):
                return [childCount + 10, childCount + 10];
            default:
                return [35, 35];
        }
    }

    // Convert the observations layer to a marker cluster with updated icon
    var obsCluster = L.markerClusterGroup({
        iconCreateFunction: function(cluster) {
        var clusterSize = getClusterSize(cluster.getChildCount());
        return new L.divIcon({
            iconUrl: 'static/icons/binocs.svg',
            iconSize:     clusterSize, // size of the icon
            iconAnchor:   [22, 22], // point of the icon which will correspond to marker's location
            popupAnchor:  [-3, -26], // point from which the popup should open relative to the iconAnchor
            html: ('<div style=\"padding-top:10%;\">' + 
                    '<div class=\"bg-light\" style=\"width:18px; margin:auto; border-radius:50%; padding:0px;\">' + 
                    '<strong>' + cluster.getChildCount() + '</strong>' +
                    '</div>' +
                '</div>')
        });
        },
        maxClusterRadius: 55
    });
    obsCluster.addLayer(observations);

    // Define the layers to be passed to our map
    var layerList = [obsCluster, incidents];
    createMap(layerList);
}

// Build the map and define all other layers/controls/etc.
function createMap(layerList) {

    // Define streetmap and darkmap layers
    var hikemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        minZoom: 8,
        id: "mapbox.run-bike-hike",
        accessToken: API_KEY
    });

    var topomap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        minZoom: 8,
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
        Incidents: layerList[1],
        Observations: layerList[0]
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("incident-map-main", {
        center: [39.0968, -120.0324],
        zoom: 9,
        layers: [topomap, layerList[0], layerList[1]]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Set up the legend
    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function() {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = ["  Observations", "  Incidents"],
            labels = ["static/icons/binocs.svg", "static/icons/shovel-color.svg"];

        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                ("<img src=" + labels[i] + " height='25' width='25'>") + grades[i] + "<br>";
        }

        return div;
    };
    legend.addTo(myMap);
}