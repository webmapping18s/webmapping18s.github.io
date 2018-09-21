
let myMap = L.map("mapdiv");    // http://leafletjs.com/reference-1.3.0.html#map-l-map
let markerGroup = L.featureGroup();
let myLayers = {
    osm : L.tileLayer(  // http://leafletjs.com/reference-1.3.0.html#tilelayer-l-tilelayer
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            subdomains : ["a","b","c"],
            attribution : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
    ),
    geolandbasemap : L.tileLayer(
        "https://{s}.wien.gv.at/basemap/geolandbasemap/normal/google3857/{z}/{y}/{x}.png", {
            subdomains : ["maps","maps1","maps2","maps3","maps4"],                          // http://leafletjs.com/reference-1.3.0.html#tilelayer-subdomains
            attribution : "Datenquelle: <a href='https://www.basemap.at'>basemap.at</a>"    // http://leafletjs.com/reference-1.3.0.html#tilelayer-attribution
        }
    ),
    bmapoverlay : L.tileLayer(
        "https://{s}.wien.gv.at/basemap/bmapoverlay/normal/google3857/{z}/{y}/{x}.png", {
            subdomains : ["maps","maps1","maps2","maps3","maps4"],
            attribution : "Datenquelle: <a href='https://www.basemap.at'>basemap.at</a>"
        }
    ),
    bmapgrau : L.tileLayer(
        "https://{s}.wien.gv.at/basemap/bmapgrau/normal/google3857/{z}/{y}/{x}.png", {
            subdomains : ["maps","maps1","maps2","maps3","maps4"],
            attribution : "Datenquelle: <a href='https://www.basemap.at'>basemap.at</a>"
        }
    ),
    bmaphidpi : L.tileLayer(
        "https://{s}.wien.gv.at/basemap/bmaphidpi/normal/google3857/{z}/{y}/{x}.jpeg", {
            subdomains : ["maps","maps1","maps2","maps3","maps4"],
            attribution : "Datenquelle: <a href='https://www.basemap.at'>basemap.at</a>"
        }
    ),
    bmaporthofoto30cm : L.tileLayer(
        "https://{s}.wien.gv.at/basemap/bmaporthofoto30cm/normal/google3857/{z}/{y}/{x}.jpeg", {
            subdomains : ["maps","maps1","maps2","maps3","maps4"],
            attribution : "Datenquelle: <a href='https://www.basemap.at'>basemap.at</a>"
        }
    ),
};
myMap.addLayer(myLayers.geolandbasemap);    // http://leafletjs.com/reference-1.3.0.html#map-addlayer

let myMapControl = L.control.layers({       // http://leafletjs.com/reference-1.3.0.html#control-layers-l-control-layers
    "Openstreetmap" : myLayers.osm,
    "basemap.at Grundkarte" : myLayers.geolandbasemap,
    "basemap.at grau" : myLayers.bmapgrau,
    "basemap.at highdpi" : myLayers.bmaphidpi,
    "basemap.at Orthofoto" : myLayers.bmaporthofoto30cm,
},{
    "basemap.at Overlay" : myLayers.bmapoverlay,
    "Marker": markerGroup,
});
myMap.addControl(myMapControl);     // http://leafletjs.com/reference-1.3.0.html#map-addcontrol

myMap.setView([47.267,11.383], 11); // http://leafletjs.com/reference-1.3.0.html#map-setview

myMapControl.expand();      // http://leafletjs.com/reference-1.3.0.html#control-layers-expand

L.control.scale({           // http://leafletjs.com/reference-1.3.0.html#control-scale-l-control-scale
    maxWidth : 200,         // http://leafletjs.com/reference-1.3.0.html#control-scale-maxwidth
    metric : true,          // http://leafletjs.com/reference-1.3.0.html#control-scale-metric
    imperial : false,       // http://leafletjs.com/reference-1.3.0.html#control-scale-imperial
    position : "bottomleft" // http://leafletjs.com/reference-1.3.0.html#control-scale-position

}).addTo(myMap);            // http://leafletjs.com/reference-1.3.0.html#control-scale-addto

const uni = [47.264, 11.385];
const usi = [47.257, 11.356];
const technik = [47.263, 11.343];
myMap.addLayer(markerGroup);
const markerOptions = {
    title: "Universität Innsbruck",
    opacity: 0.8,
    draggable: true
};
L.marker(uni, markerOptions).addTo(markerGroup);
L.marker(usi, markerOptions).addTo(markerGroup);
L.marker(technik, markerOptions).addTo(markerGroup);



const patscherkoflCoords = [47.2086, 11.4606];
const iglsCoords = [47.2308, 11.4089];

L.marker(iglsCoords).addTo(markerGroup);
let patscherkoflMarker = L.marker(patscherkoflCoords).addTo(markerGroup);

patscherkoflMarker.bindPopup("<p>Patscherkofel von der Nordkette aus</p><img style='width:200px' src='https://apps.tirol.gv.at/luft/nordkette.jpg' alt='Patscherkofl' />");

let lift = L.polyline([iglsCoords, patscherkoflCoords], {
    color: 'red'
});
myMap.addLayer(lift);

let uniPolygon = L.polygon([uni, usi, technik]);
myMap.addLayer(uniPolygon);
uniPolygon.bindPopup("Ende!");
myMap.fitBounds(markerGroup.getBounds());
