let myMap = L.map("mapdiv");

// const citybikeGroup = L.featureGroup();
const citybikeGroup = L.markerClusterGroup();

let myLayers = {
  "Basemap" : L.tileLayer(
    "https://{s}.wien.gv.at/basemap/geolandbasemap/normal/google3857/{z}/{y}/{x}.png", {
      subdomains : ["maps", "maps1", "maps2", "maps3", "maps4"],
      attribution : "Datenquelle: <a href ='https://basemap.at'> basemap.at </a>"
    }
  )
};


myMap.addLayer(myLayers.Basemap);

let myMapControl  = L.control.layers(myLayers, {
  "CityBikes" : citybikeGroup,
}, {
  collapsed:false} );


myMap.addControl(myMapControl);

let myScale = L.control.scale({
  position : "bottomleft",
  imperial : false,
});

myScale.addTo(myMap);


async function addGeojson(url) {
  const response = await fetch(url);
  const citybike = await response.json();
  const geojson = L.geoJSON(citybike, {
    style: function(feature) {
      return {color: "#ff0000"};
    },
    pointToLayer: function(geoJsonPoint, latlng) {
      // console.log("G: ", geoJsonPoint);
      return L.marker(latlng, {icon: L.icon({
        iconUrl: 'icons/cycling.png',
        iconSize: [ 32, 37 ],
        iconAnchor: [ 16, 37 ],
      })}).bindPopup(`<h1>${geoJsonPoint.properties.STATION}</h1>
        <p> Bezirk: ${geoJsonPoint.properties.BEZIRK} </p>`);
    }
  }).addTo(citybikeGroup);
  citybikeGroup.addLayer(geojson);
  myMap.fitBounds(citybikeGroup.getBounds());

  myMap.addControl( new L.Control.Search({
    layer: citybikeGroup,
    propertyName: 'STATION',
    zoom: 15
  }) );
  new L.Hash(myMap);
}

const url = "https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:CITYBIKEOGD&srsName=EPSG:4326&outputFormat=json";

addGeojson(url);

myMap.addLayer(citybikeGroup);
