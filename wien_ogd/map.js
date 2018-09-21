// Leaflet Karte initialisieren
let karte = L.map("divKarte", {
    fullscreenControl: true,
});

// Gruppe für GeoJSON Layer definieren
let geojsonGruppe = L.featureGroup().addTo(karte);

// Grundkartenlayer definieren
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
}

// Map control mit Grundkarten und GeoJSON Overlay definieren
let kartenAuswahl = L.control.layers({
    "Openstreetmap": grundkartenLayer.osm,
    "basemap.at Grundkarte": grundkartenLayer.geolandbasemap,
    "basemap.at grau": grundkartenLayer.bmapgrau,
    "basemap.at Orthofoto": grundkartenLayer.bmaporthofoto30cm,
}, {
    "GeoJSON Layer": geojsonGruppe,
});
karte.addControl(kartenAuswahl);

// Grundkarte "grau" laden
karte.addLayer(grundkartenLayer.bmapgrau)

// Maßstabsleiste metrisch hinzufügen
L.control.scale({
    maxWidth: 200,
    imperial: false,
}).addTo(karte);

// asynchrone Funktion zum Laden eines GeoJSON Layers
async function ladeGeojsonLayer(datenObjekt) {
    const response = await fetch(datenObjekt.json);
    const response_json = await response.json();

    // GeoJSON Geometrien hinzufügen und auf Ausschnitt zoomen
    const geojsonObjekt = L.geoJSON(response_json, {
        onEachFeature : function(feature,layer) {
            // Popup mit allen Properties und maximal 600 Pixel Breite hinzufügen
            let popup = "<h3>Attribute</h3>";
            for (attribut in feature.properties) {
                let wert = feature.properties[attribut];
                if (wert && wert.toString().startsWith("http:")) {
                    // Hyperlink zur angegebenen URL erzeugen
                    popup += `${attribut}: <a href="${wert}">Weblink</a><br/>`;
                } else {
                    // Attribut und Wert ohne Verlinkung anzeigen
                    popup += `${attribut}: ${wert}<br/>`;
                }
            }
            layer.bindPopup(popup, {
                maxWidth : 600,
            });
        },
        pointToLayer : function(geoJsonPoint, latlng) {
            if (datenObjekt.icon) {
                return L.marker(latlng, {
                    icon : L.icon({
                        iconUrl : datenObjekt.icon,
                        iconAnchor : [16,32],
                        popupAnchor : [0,-32],
                    })
                })
            } else {
                return L.marker(latlng);
            }
        }
    });
    geojsonGruppe.addLayer(geojsonObjekt);
    karte.fitBounds(geojsonGruppe.getBounds());
}

// Datenobjekt vor dem Erzeugen des Menüs alphabetisch nach dem Titel sortieren
wienDatensaetze.sort(function(a,b) {
    if (a.titel < b.titel) {
        return -1;
    } else if (a.titel > b.titel) {
        return 1;
    } else {
        return 0;
    }
})

// den GeoJSON Layer für den ersten Datensatz laden
let datenObjekt = wienDatensaetze[0];
ladeGeojsonLayer(datenObjekt);

// Pulldown Menü erzeugen
let layerAuswahl = document.getElementById("layerAuswahl");
for (let i = 0; i < wienDatensaetze.length; i++) {
    let datenObjekt = wienDatensaetze[i] // der "ganze Koffer" ;-)
    let datenPosition = i;
    layerAuswahl.innerHTML += `<option value="${datenPosition}">${datenObjekt.titel}</option>`
    //console.log(datenObjekt)
}

// auf Änderungen im Pulldown Menü reagieren und neue Daten laden
layerAuswahl.onchange = function(evt) {
    geojsonGruppe.clearLayers();
    let datenPosition = evt.target.value;
    let datenObjekt = wienDatensaetze[datenPosition];
    ladeGeojsonLayer(datenObjekt);
}
