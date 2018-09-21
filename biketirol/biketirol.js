/*
    Vorbereitung: GPX Track herunterladen und nach GeoJSON konvertieren
    -------------------------------------------------------------------
    Datenquelle https://www.data.gv.at/suche/?search-term=bike+trail+tirol&searchIn=catalog
    Download Einzeletappen / Zur Ressource ...
    Alle Dateien im unterverzeichnis data/ ablegen
    Die .gpx Datei der eigenen Etappe als etappe00.gpx speichern
    Die .gpx Datei über https://mapbox.github.io/togeojson/ in .geojson umwandeln und als etappe00.geojson speichern
    Die etappe00.geojson Datei in ein Javascript Objekt umwandeln und als etappe00.geojson.js speichern

    -> statt 00 natürlich die eigene Etappe (z.B. 01,02, ...25)
*/

// Leaflet Karte initialisieren
let karte = L.map("map", {
    fullscreenControl: true,
});

// Layer für Track und Marker hinzufügen
let overlayTrack = L.featureGroup().addTo(karte);
let overlayMarker = L.featureGroup().addTo(karte);
let overlaySteigung = L.featureGroup().addTo(karte);

// Grundkartenlayer mit OSM, basemap.at, Elektronische Karte Tirol (Sommer, Winter, Orthophoto jeweils mit Beschriftung)
const grundkartenLayer = {
    osm: L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            subdomains: ["a", "b", "c"],
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
    ),
    geolandbasemap: L.tileLayer(
        "https://{s}.wien.gv.at/basemap/geolandbasemap/normal/google3857/{z}/{y}/{x}.png", {
            subdomains: ["maps", "maps1", "maps2", "maps3", "maps4"],
            attribution: "Datenquelle: <a href='https://www.basemap.at'>basemap.at</a>"
        }
    ),
    bmapoverlay: L.tileLayer(
        "https://{s}.wien.gv.at/basemap/bmapoverlay/normal/google3857/{z}/{y}/{x}.png", {
            subdomains: ["maps", "maps1", "maps2", "maps3", "maps4"],
            attribution: "Datenquelle: <a href='https://www.basemap.at'>basemap.at</a>"
        }
    ),
    bmapgrau: L.tileLayer(
        "https://{s}.wien.gv.at/basemap/bmapgrau/normal/google3857/{z}/{y}/{x}.png", {
            subdomains: ["maps", "maps1", "maps2", "maps3", "maps4"],
            attribution: "Datenquelle: <a href='https://www.basemap.at'>basemap.at</a>"
        }
    ),
    bmaphidpi: L.tileLayer(
        "https://{s}.wien.gv.at/basemap/bmaphidpi/normal/google3857/{z}/{y}/{x}.jpeg", {
            subdomains: ["maps", "maps1", "maps2", "maps3", "maps4"],
            attribution: "Datenquelle: <a href='https://www.basemap.at'>basemap.at</a>"
        }
    ),
    bmaporthofoto30cm: L.tileLayer(
        "https://{s}.wien.gv.at/basemap/bmaporthofoto30cm/normal/google3857/{z}/{y}/{x}.jpeg", {
            subdomains: ["maps", "maps1", "maps2", "maps3", "maps4"],
            attribution: "Datenquelle: <a href='https://www.basemap.at'>basemap.at</a>"
        }
    ),
    tiris_sommer: L.tileLayer(
        "http://wmts.kartetirol.at/wmts/gdi_base_summer/GoogleMapsCompatible/{z}/{x}/{y}.jpeg80", {
            attribution: "Datenquelle: <a href='https://www.data.gv.at/katalog/dataset/land-tirol_elektronischekartetirol'>eKarte Tirol</a>"
        }
    ),
    tiris_winter: L.tileLayer(
        "http://wmts.kartetirol.at/wmts/gdi_base_winter/GoogleMapsCompatible/{z}/{x}/{y}.jpeg80", {
            attribution: "Datenquelle: <a href='https://www.data.gv.at/katalog/dataset/land-tirol_elektronischekartetirol'>eKarte Tirol</a>"
        }
    ),
    tiris_ortho: L.tileLayer(
        "http://wmts.kartetirol.at/wmts/gdi_ortho/GoogleMapsCompatible/{z}/{x}/{y}.jpeg80", {
            attribution: "Datenquelle: <a href='https://www.data.gv.at/katalog/dataset/land-tirol_elektronischekartetirol'>eKarte Tirol</a>"
        }
    ),
    tiris_nomenklatur: L.tileLayer(
        "http://wmts.kartetirol.at/wmts/gdi_nomenklatur/GoogleMapsCompatible/{z}/{x}/{y}.png8", {
            attribution: "Datenquelle: <a href='https://www.data.gv.at/katalog/dataset/land-tirol_elektronischekartetirol'>eKarte Tirol</a>",
            pane: "overlayPane",
        }
    ),
}

// Layergruppen für die Elektronische Karte Tirol definieren
const tirisSommer = L.layerGroup([
    grundkartenLayer.tiris_sommer,
    grundkartenLayer.tiris_nomenklatur
]);
const tirisWinter = L.layerGroup([
    grundkartenLayer.tiris_winter,
    grundkartenLayer.tiris_nomenklatur
]);
const tirisOrtho = L.layerGroup([
    grundkartenLayer.tiris_ortho,
    grundkartenLayer.tiris_nomenklatur
]);

// Map control mit Grundkarten und GeoJSON Overlay definieren
let kartenAuswahl = L.control.layers({
    "Openstreetmap": grundkartenLayer.osm,
    "basemap.at Grundkarte": grundkartenLayer.geolandbasemap,
    "basemap.at grau": grundkartenLayer.bmapgrau,
    "basemap.at Orthofoto": grundkartenLayer.bmaporthofoto30cm,
    "Elektronische Karte Tirol - Sommer" : tirisSommer,
    "Elektronische Karte Tirol - Winter" : tirisWinter,
    "Elektronische Karte Tirol - Orthophoto" : tirisOrtho,
}, {
    "Start / Ziel": overlayMarker,
    "Steigungslinie" : overlaySteigung,
});
karte.addControl(kartenAuswahl);
karte.addLayer(tirisSommer);
karte.setView([47.426944, 11.421667],10);   // Karwendelhaus

// Maßstabsleiste metrisch hinzufügen
L.control.scale({
    maxWidth: 200,
    imperial: false,
}).addTo(karte);

// Start- und Endpunkte der Route als Marker mit Popup, Namen, Wikipedia Link und passenden Icons für Start/Ziel von https://mapicons.mapsmarker.com/
L.marker([47.388953,11.263952],{
    icon : L.icon({
        iconUrl : "images/start-race-2.png",
        iconAnchor : [16,37],
        popupAnchor : [0,-37],
    })
}).bindPopup(
    "<h3>Scharnitz</h3><p><a href='https://de.wikipedia.org/wiki/Scharnitz'>Wikipedia Link</a></p>"
).addTo(overlayMarker);

L.marker([47.431094,11.737579],{
    icon : L.icon({
        iconUrl : "images/finish.png",
        iconAnchor : [16,37],
        popupAnchor : [0,-37],
    })
}).bindPopup(
    "<h3>Maurach - Buchau</h3><p><a href='https://de.wikipedia.org/wiki/Eben_am_Achensee'>Wikipedia Link</a></p>"
).addTo(overlayMarker)

// Höhenprofil control hinzufügen
let hoehenProfil = L.control.elevation({
    position: "topright",
    theme: "steelblue-theme",
    collapsed : false,
}).addTo(karte);

// GPX Track direkt laden und auf Ausschnitt zoomen
let gpxTrack = new L.GPX("data/etappe07.gpx", {
    async: true
});
gpxTrack.on('loaded', function(evt) {
    let track = evt.target;

    // Statistiken über eine for-Schleife in der HTML Seite anzeigen
    let statistikMethoden = [
        "get_distance",
        "get_elevation_min",
        "get_elevation_max",
        "get_elevation_gain",
        "get_elevation_loss",
    ];
    for (methode of statistikMethoden) {
        //console.log(methode,":",evt.target[methode]().toFixed(0));
        document.getElementById(methode).innerHTML = track[methode]().toFixed(0);
    }

    karte.fitBounds(track.getBounds());
});
gpxTrack.on("addline",function(evt) {
    hoehenProfil.addData(evt.line);

    // Liniendaten in der Konsole anzeigen
    //console.log(evt.line);
    //console.log(evt.line.getLatLngs());
    //console.log(evt.line.getLatLngs()[0]);
    //console.log(evt.line.getLatLngs()[0].lat);
    //console.log(evt.line.getLatLngs()[0].lng);
    //console.log(evt.line.getLatLngs()[0].meta);
    //console.log(evt.line.getLatLngs()[0].meta.ele);

    // alle Segmente der Steigungslinie hinzufügen
    const gpxLinie = evt.line.getLatLngs();
    for (let i = 1; i < gpxLinie.length; i += 1) {
        // letzten und aktuellen Punkt definieren
        let p1 = gpxLinie[i-1];
        let p2 = gpxLinie[i];

        // Entfernung und Höhenunterschied zwischen den beiden Punkten berechnen
        let dist = karte.distance(
            [ p1.lat,p1.lng ],
            [ p2.lat,p2.lng ]
        );
        let delta = (p2.meta.ele - p1.meta.ele);

        // Steigung zwischen den beiden Punkten berechnen (Genauigkeit Zehntelprozent)
        // https://www.e-education.psu.edu/natureofgeoinfo/book/export/html/1837
        let proz = (dist != 0 ? delta / dist * 100.0 : 0).toFixed(1);

        //console.log(p1.lat,p1.lng,p2.lat,p2.lng,dist,delta,proz);

        // Farbe nach Steigung definieren
        // Paletten von http://colorbrewer2.org
        // http://colorbrewer2.org/?type=diverging&scheme=RdYlGn&n=7
        let farbe = 
            proz >=  10 ? "#d73027" :
            proz >=   6 ? "#fc8d59" :
            proz >=   2 ? "#fee08b" :
            proz >=   0 ? "#ffffbf" :
            proz >=  -6 ? "#d9ef8b" :
            proz >= -10 ? "#91cf60" :
                          "#1a9850";

        // Linie zeichnen
        let segement = L.polyline(
            [
                [p1.lat,p1.lng],
                [p2.lat,p2.lng],
            ], {
                color : farbe,
            }
        ).addTo(overlaySteigung);
    }
});
