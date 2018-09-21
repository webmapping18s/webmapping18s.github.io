# Wien OGD Beispiel

## https://webmapping.github.io/wien_ogd/

Ausgangstemplate im OLAT: s8_wien_ogd_template.zip

siehe https://github.com/webmapping/webmapping.github.io/commit/dc47874130101078ee047f36d79d4fea5dc2ac23

## Ausbaustufe 1: Unterschiedliche JSON-Datensätze für Wien über ein Menü wählbar machen und anzeigen.

1. Javascript-Objekt mit Titel, Quelle, Attributen, JSON-Link, Icon der Datensätze erzeugen
    * Datensätze: Datenauftritt - Stadt Wien / JSON / Sport und Freizeit [21]
    * https://www.data.gv.at/auftritte/?organisation=stadt-wien&formatFilter=JSON&katFilter=sport-und-freizeit#showresults

    ```
    let wienDatensaetze = [
        {
            titel : "",
            info : "",
            metadaten : "",
            attribute : "",
            json : "",
            icon : null,
        },
        // ...
    ]
    ```
    alle 21 Einträge: https://webmapping.github.io/wien_ogd/map_datasets.js

    ```
    // den ersten GeoJSON Layer laden
    let jsonUrl = wienDatensaetze[0].json;
    ladeGeojsonLayer(jsonUrl);
    ```


2. aus diesem Objekt dynamisch ein Auswahlmenü erstellen und oberhalb der Karte anzeigen

    zuerst in index.html
    ```
    <select id="layerAuswahl"></select>
    ```

    dann in map.js
    ```

    // Auswahlmenü generieren
    let layerAuswahl = document.getElementById("layerAuswahl");
    for (datensatz of wienDatensaetze) {
        //console.log(datensatz.titel)
        layerAuswahl.innerHTML += `<option value="${datensatz.json}">${datensatz.titel}</option>`
    }
    ```

3. beim Auswählen eines Datensatzes im Menü, die Karte mit den neuen Inhalten neu zeichnen
    ```
    // nach Wechsel im Auswahlmenü neuen Datensatz laden
    layerAuswahl.onchange = function(evt) {
        //console.log(evt)
        let jsonUrl = evt.target.value;
        ladeGeojsonLayer(jsonUrl);
    }
    ```

4. vor dem Neuzeichnen, den bestehenden Content löschen
    ```
    layerAuswahl.onchange = function(evt) {
        geojsonGruppe.clearLayers();
        // ...
    }
    ```

5. das Datenobjekt vor dem Erzeugen des Menüs alphabetisch nach dem Titel sortieren
    ```
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
    ```

## Ausbaustufe 2: Popup für jeden Marker mit allen Attributen im properties-Objekt erstellen

1. das Popup erzeugen
    ```
    const geojsonObjekt = L.geoJSON(response_json, {
        onEachFeature : function(feature,layer) {
            // Popup mit allen Properties und maximal 600 Pixel Breite hinzufügen
            let popup = "<h3>Attribute</h3>";
            for (attribut in feature.properties) {
                let wert = feature.properties[attribut];
                popup += `${attribut}: ${wert}<br/>`;
            }
            layer.bindPopup(popup, {
                maxWidth : 600,
            });
        }
    });
    ```
    siehe https://github.com/webmapping/webmapping.github.io/commit/fa5186d7e8eab3ace3fe468e568854a313de10dc

2. Links als Hyperlinks formatieren
    ```
        if (wert && wert.toString().startsWith("http:")) {
            // Hyperlink zur angegebenen URL erzeugen
            popup += `${attribut}: <a href="${wert}">Weblink</a><br/>`;
        } else {
            // Attribut und Wert ohne Verlinkung anzeigen
            popup += `${attribut}: ${wert}<br/>`;
        }
    ```
    siehe https://github.com/webmapping/webmapping.github.io/commit/90c9a36b5f982f4d51a15ed7599ce9b34557eca3

## Ausbaustufe 3: Icons als Marker verwenden, sofern vorhanden

Dazu ist ein kleiner Umbau der Skriptlogik nötig, weil wir das Icon in unserem Datensatzobjekt stehen haben und beim Aufruf zum GeoJSON laden nur die URL übergeben - **also**: statt der URL das ganze Datensatzobjekt übergeben. Damit das auch beim Wechseln des Menüs funktioniert, verwenden wir den Index des Objekt Arrays als *value* beim Auswahlmenüeintrag

```
for (let i=0; i<wienDatensaetze.length; i+=1) {
    let datenObjekt = wienDatensaetze[i] // der "ganze Koffer" ;-)
    let datenPosition = i;
    layerAuswahl.innerHTML += `<option value="${datenPosition}">${datenObjekt.titel}tion>`
    //console.log(datenObjekt)
}
```

damit können wir statt der JSON URL, das ganze Objekt übergeben

```
// beim ersten Laden
let datenObjekt = wienDatensaetze[0];
ladeGeojsonLayer(datenObjekt);

// onchange beim Wechsel im Auswahlmenü
let datenPosition = evt.target.value;
let datenObjekt = wienDatensaetze[datenPosition];
ladeGeojsonLayer(datenObjekt)

// und in ladeGeojsonLayer
async function ladeGeojsonLayer(datenObjekt) {
    const response = await fetch(datenObjekt.json);
}
```

jetzt haben wir das Datensatzobjekt in der Ladefunktion

siehe https://github.com/webmapping/webmapping.github.io/commit/63a2ee456958161b676d46862b793cddc211042a

... und können Icons zeichnen sofern vorhanden

```
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
```

siehe https://github.com/webmapping/webmapping.github.io/commit/42d8340d034a6c8ddf44a810866d257e119d872c

## Ausbaustufe 4: Fullscreen control

1. Plugin downloaden von https://github.com/Leaflet/Leaflet.fullscreen und nach `js/leaflet.fullscreen/` kopieren

2. Stylesheet und Script im index.html referenzieren
    ```
    <link rel="stylesheet" href="../js/leaflet.fullscreen/leaflet.fullscreen.css" />
    <script src="../js/leaflet.fullscreen/Leaflet.fullscreen.js"></script>
    ```

3. Fullscreen control Button zu Zoom/Pan in biketirol.js hinzufügen
    ```
    let karte = L.map("map", {
        fullscreenControl: true,
    });
    ```

siehe https://github.com/webmapping/webmapping.github.io/commit/5f4e45db875aefa157a6707056dab32b6ff94e25
