// Initialize the map
var map = L.map('map').setView(coordinates, 13);

// Add tile layer (OpenStreetMap)
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Add a marker at the coordinates
// Add a marker at the coordinates
var marker = L.marker(coordinates).addTo(map);

// Show popup only on hover
marker.on('mouseover', function () {
  marker.bindPopup(content).openPopup();
});
marker.on('mouseout', function () {
  marker.closePopup();
});


// Add geocoder (search box)
L.Control.geocoder({
  defaultMarkGeocode: true
}).addTo(map);

// ======= Extra Features Added Below ======= //

// 1. Add Zoom Control at bottom-right
L.control.zoom({
  position: 'bottomright'
}).addTo(map);

// 2. Add Scale bar
L.control.scale().addTo(map);

// 3. Show coordinates on map click
map.on('click', function (e) {
  const { lat, lng } = e.latlng;
  L.popup()
    .setLatLng([lat, lng])
    .setContent(`Latitude: ${lat.toFixed(5)}<br>Longitude: ${lng.toFixed(5)}`)
    .openOn(map);
});

// 4. Add a circle around the marker (e.g. 500 meter radius)
var circle = L.circle(coordinates, {
  color: 'blue',
  fillColor: '#30f',
  fillOpacity: 0.2,
  radius: 500
}).addTo(map);

// 5. Add fullscreen control (optional if you use the plugin)
if (L.control.fullscreen) {
  map.addControl(new L.Control.Fullscreen());
}

// 6. Layer group for future dynamic markers
var markersGroup = L.layerGroup().addTo(map);


