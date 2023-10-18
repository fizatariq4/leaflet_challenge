// Fetch earthquake data from the provided API
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson")
    .then(function(data) {
        // Create a Leaflet map
        var map = L.map('map').setView([0, 0], 2);

        // Add a TileLayer and attempt the topomap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution:
                'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        }).addTo(map);

        // Create arrays for marker sizes and colors
        var markerSizes = [];
        var markerColors = [];

        // Customize marker sizing and color based on earthquake attributes
        data.features.forEach(function(feature) {
            var magnitude = feature.properties.mag;
            var depth = feature.geometry.coordinates[2];
            var markerSize = magnitude * 5;
            var markerColor = getColor(depth);

            markerSizes.push(markerSize);
            markerColors.push(markerColor);
        });

        // Adding legend
        var legend = L.control({ position: "bottomleft" });
        legend.onAdd = function(map) {
            var div = L.DomUtil.create("div", "info legend");
            var labels = [];
            var grades = [90, 70, 50, 30, 10, -10];
            var colors = [
                "#ea2c2c",
                "#ea822c",
                "#ee9c00",
                "#eecc00",
                "#d4ee00",
                "#98ee00"
            ];
            
            div.innerHTML = '<h4>Depth Legend</h4>'; 

            for (var i = 0; i < grades.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + colors[i] + '"></i> ' +
                    grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + ' km<br>' : '+ km');
            }

            return div;
        };
        legend.addTo(map);

        // Create a GeoJSON layer with custom markers
        L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
                var index = data.features.indexOf(feature);
                var markerSize = markerSizes[index];
                var markerColor = markerColors[index];

                return L.circleMarker(latlng, {
                    radius: markerSize,
                    fillColor: markerColor,
                    color: '#000',
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.7
                });
            },
            onEachFeature: function (feature, layer) {
                // Add a popup with earthquake information
                layer.bindPopup(`Magnitude: ${feature.properties.mag}<br>Location: ${feature.properties.place}<br>Depth: ${feature.geometry.coordinates[2]} km`);
            }
        }).addTo(map);
    })
    .catch(function(error) {
        console.error("Failed to fetch earthquake data from the URL:", error);
    });

// Function to get color based on depth
function getColor(depth) {
    switch (true) {
        case depth > 90:
            return "#ea2c2c";
        case depth > 70:
            return "#ea822c";
        case depth > 50:
            return "#ee9c00";
        case depth > 30:
            return "#eecc00";
        case depth > 10:
            return "#d4ee00";
        default:
            return "#98ee00";
    }
}
