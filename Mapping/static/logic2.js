// We create the tile layer that will be the background of our map.
var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidGZveDI3OTEiLCJhIjoiY2pkd2drbjRzMXNuMzMybXVpcjlmNnQ4bSJ9.EmpawwEjbZqoWF6-MF7e8Q", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 15
});

var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidGZveDI3OTEiLCJhIjoiY2pkd2drbjRzMXNuMzMybXVpcjlmNnQ4bSJ9.EmpawwEjbZqoWF6-MF7e8Q", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 15
});

var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidGZveDI3OTEiLCJhIjoiY2pkd2drbjRzMXNuMzMybXVpcjlmNnQ4bSJ9.EmpawwEjbZqoWF6-MF7e8Q", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 15
});
// We create the map object with options.
var map = L.map("mapid", {
  center: [
    37.7, -122.4
  ],
  zoom: 3,
  layer: [darkmap,lightmap, satellite],
});

// Then we add our 'map' tile layer to the map.
satellite.addTo(map);

// New variables to add layers to map.
var tectonicplates = new L.LayerGroup();
var earthquakes =  new L.LayerGroup();
var overlays = {"Tectonic Plates": tectonicplates, "Earthquakes": earthquakes};

// Add ability to switch light or dark map
var mymaps = {
    "Lightmap":lightmap,
    "Darkmap":darkmap,
    "Satellite":satellite
};

//add control for layers

L.control.layers(overlays,mymaps,satellite).addTo(map);


// Here we make an AJAX call that retrieves our earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", function(data) {

  // Return the style data for each of the earthquakes we plot on
  // the map. Pass the magnitude of the earthquake into two separate functions
  // to calculate the color and radius.
  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.properties.mag),
      color: "black",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  // This function determines the color of the marker based on the magnitude of the earthquake.
  function getColor(magnitude) {
    switch (true) {
      case magnitude > 5:
        return "purple";
      case magnitude > 4:
        return "red";
      case magnitude > 3:
        return "orange";
      case magnitude > 2:
        return "yellow";
      case magnitude > 1:
        return "green";
      default:
        return "aquamarine";
    }
  }

  // This function determines the radius of the earthquake marker based on its magnitude.
  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }

    return magnitude * 4;
  }

  // Here we add a GeoJSON layer to the map once the file is loaded.
  L.geoJson(data, {
    // We turn each feature into a circleMarker on the map.
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng);
    },
    // We set the style for each circleMarker using our styleInfo function.
    style: styleInfo,
    // We create a popup for each marker to display the magnitude and location of the earthquake after the marker has been created and styled
    onEachFeature: function(feature, layer) {
      layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
    }
  }).addTo(map);

  // Here we create a legend control object.
  var legend = L.control({
    position: "bottomright"
  });

  // Then add all the details for the legend
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var grades = [0, 1, 2, 3, 4, 5];
    var colors = ["aquamarine","green","yellow","orange","red","purple"];

    // Looping through our intervals to generate a label with a colored square for each interval.
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' + "Magnitude "+
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
}

return div;
};

legend.addTo(map);

// AJAX call to get our Tectonic Plate geoJSON data
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json",
function(platedata) {
  // Adding our geoJSON data, along with style information, to the tectonicplates
  // layer.
  L.geoJson(platedata, {
    color: "magenta",
    weight: 2
    
  })
  .addTo(tectonicplates);

  // Then add the tectonicplates layer to the map.
  tectonicplates.addTo(map);
});



});