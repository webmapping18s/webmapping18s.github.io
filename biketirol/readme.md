# Bike Tirol GPX Track Beispiel

## https://webmapping.github.io/biketirol/

## Ausgangspunkt Grundkarte:

* siehe Workload 8: https://github.com/webmapping/18s/blob/master/wl8.md
* Template Vorlage: https://github.com/webmapping/webmapping.github.io/commit/64f093add3c7212242d6a3bfd2c6bba028423ac5#diff-faa162a83376f2840587a5a346065ad4
* Muster Lösung: https://github.com/webmapping/webmapping.github.io/commit/f324350817fdd43c8ebbc7cb885ab04dd9364f68#diff-faa162a83376f2840587a5a346065ad4

## Einbau der Elektronischen Karte Tirol

* Quelle: https://www.data.gv.at/katalog/dataset/a0535d6d-4c34-4524-9591-e9e51e3d28c4
* GetCapabilities: http://wmts.kartetirol.at/wmts

1. Layer definieren
    ```
    const grundkartenLayer = {
        tiris_sommer: L.tileLayer(
            "http://wmts.kartetirol.at/wmts/gdi_base_summer/GoogleMapsCompatible/{z}/{x}/{y}    .jpeg80", {
                attribution: "Datenquelle: <a   href='https://www.data.gv.at/katalog/dataset/land-tirol_elektronischekartetirol'>eK   arte Tirol</a>"
            }
        ),
        tiris_winter: L.tileLayer(
            "http://wmts.kartetirol.at/wmts/gdi_base_winter/GoogleMapsCompatible/{z}/{x}/{y}    .jpeg80", {
                attribution: "Datenquelle: <a   href='https://www.data.gv.at/katalog/dataset/land-tirol_elektronischekartetirol'>eK   arte Tirol</a>"
            }
        ),
        tiris_ortho: L.tileLayer(
            "http://wmts.kartetirol.at/wmts/gdi_ortho/GoogleMapsCompatible/{z}/{x}/{y}.jpeg80", {
                attribution: "Datenquelle: <a   href='https://www.data.gv.at/katalog/dataset/land-tirol_elektronischekartetirol'>eK   arte Tirol</a>"
            }
        ),
        tiris_nomenklatur: L.tileLayer(
            "http://wmts.kartetirol.at/wmts/gdi_nomenklatur/GoogleMapsCompatible/{z}/{x}/{y}.png8",  {
                attribution: "Datenquelle: <a   href='https://www.data.gv.at/katalog/dataset/land-tirol_elektronischekartetirol'>eK   arte Tirol</a>",
                pane: "overlayPane",
            }
        ),
    }
    ```

    **Wichtig**: die Property `pane: "overlayPane"` beim Nomenklatur Layer angeben damit die Stapelordnung auch funktioniert

2. Layer Gruppen mit Beschriftung erzeugen
    ```
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
    ```

3. Die Gruppen bei der Layer control hinzufügen
    ```
    let kartenAuswahl = L.control.layers({
        // ...
        "Elektronische Karte Tirol - Sommer" : tirisSommer,
        "Elektronische Karte Tirol - Winter" : tirisWinter,
        "Elektronische Karte Tirol - Orthophoto" : tirisOrtho,
    },{
        // ...
    })
    ```


## Ausbaustufe 1: Fullscreen control

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

siehe https://github.com/webmapping/webmapping.github.io/commit/69b027061c6d2f8459a9d1723b1f28238a64e862


## Ausbaustufe 2: GPX Modul zum Laden des Tracks direkt verwenden

1. Plugin downloaden von https://github.com/mpetazzoni/leaflet-gpx und in `js/leaflet.gpx` ablegen


2. Track mit GPX Modul laden

    * alten Skriptverweis auf etappe07.geojson.js im index.html löschen
    * alten Code für das Laden des GeoJSON Tracks über .geojson.js löschen


    * leaflet-gpx Skript im index.html einbauen
        ```
        <script src="../js/leaflet.gpx/gpx.js"></script>
        ```

    * GPX Track im .js direkt laden und nach erfolgreichem Laden auf den Track zoomen
        ```
        // GPX Track direkt laden und auf Ausschnitt zoomen
        let gpxTrack = new L.GPX("data/etappe07.gpx", {
            async: true
        }).addTo(overlayTrack);
        gpxTrack.on('loaded', function(evt) {
            karte.fitBounds(evt.target.getBounds());
        });
        ```

    siehe https://github.com/webmapping/webmapping.github.io/commit/a8983d32a3bfe1b99402d15e4c535de45d50df7f


3. Statistiken zum GPX Track in der Konsole ausgeben

    ```
    gpxTrack.on("loaded", function(evt) {
        let track = evt.target;
        console.log("get_distance",       track.get_distance().toFixed(0))
        console.log("get_elevation_min",  track.get_elevation_min().toFixed(0))
        console.log("get_elevation_max",  track.get_elevation_max().toFixed(0))
        console.log("get_elevation_gain", track.get_elevation_gain().toFixed(0))
        console.log("get_elevation_loss", track.get_elevation_loss().toFixed(0))
        karte.fitBounds(track.getBounds());
    });
    ```

    siehe https://github.com/webmapping/webmapping.github.io/commit/313884f5c2cffdc9f724f317cb7ae2f936bc45d7

4. Statistiken in der HTML Seite anzeigen (Beispiel Länge)

    zuerst ein leeres SPAN Element mit ID im index.html hinzufügen

    ```
    <p><strong>Tourdaten</strong>: Länge <span id="get_distance"></span>m</p>
    ```

    dann die Länge des GPX tracks in den SPAN schreiben

    ```
    document.getElementById("get_distance").innerHTML = track.get_distance().toFixed(0);
    ```

    siehe https://github.com/webmapping/webmapping.github.io/commit/ca028181a327414ee044ad7081392fe15f7fc275

5. Alle Statistiken über eine for-Schleife anzeigen

    in index.html

    ```
    <p>
        <strong>Tourdaten</strong>:
        Länge <span id="get_distance"></span>m,
        tiefster Punkt <span id="get_elevation_min"></span>m,
        höchster Punkt <span id="get_elevation_max"></span>m,
        Aufstieg <span id="get_elevation_gain"></span>m,
        Abstieg <span id="get_elevation_loss"></span>m.
    </p>
    ```

    in biketirol.js

    ```
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
    ```

    siehe https://github.com/webmapping/webmapping.github.io/commit/2ca424f6ff5a53ded76c63ac3a5d211ce68dc745

## Ausbaustufe 3: mit leafelt.elevation ein interaktives Höhenprofil aus dem GPX Track erzeugen

1. Plugin leaflet-elevation downloaden und in js/leaflet.elevation ablegen
    * https://github.com/MrMufflon/Leaflet.Elevation
    * **Achtung:** bei den Releases ist nur eine Version gelistet und die ist die uralte erste ... also über .zip Download aus dem dist/ Verzeichnis auspacken

2. Plugin d3 downloaden und in js/d3/d3.v3.min.js ablegen
    * https://d3js.org/
    * **unbedingt das alte Skript verwenden**: https://d3js.org/d3.v3.min.js
    * zwei Beispiel für d3 Applikationen:
        * https://bost.ocks.org/mike/nations/
        * http://fcc.github.io/calltraffic/trafficbyyear.html

3. Höhenprofil implementieren

    Skripts und Stylesheets im index.html einbauen
    ```
    <script src="../js/d3/d3.v3.min.js"></script>
    <link rel="stylesheet" href="../js/leaflet.elevation/leaflet.elevation-0.0.4.css" />
    <script src="../js/leaflet.elevation/leaflet.elevation-0.0.4.min.js"></script>
    ```

    Höhenprofil control hinzufügen und mit Daten belegen (vor dem GPX Track laden Codeblock)

    ```
    // Höhenprofil control hinzufügen
    let hoehenProfil = L.control.elevation({
        position: "topright",
        theme: "steelblue-theme",
        collapsed : false,
    }).addTo(karte);
    ```

    im Event-Handler "addline" des GPX-Plugins die Daten hinzufügen

    ```
    gpxTrack.on("addline",function(evt) {
        hoehenProfil.addData(evt.line);
    });
    ```

    siehe https://github.com/webmapping/webmapping.github.io/commit/84b6e841c25bf6745e5569f5a8fd83a64d5564d2

4. einen BUG in leaflet-elevation Fixen
    * das Profil ist zwar sichtbar, hat aber nicht alle Funktionalitäten
    * Grund: die neue Leaflet Bibliothek 1.0 hat eine gravierende Änderung beim Erkennen von Mobilgeräten, die das alte leaflet-elevation Plugin dazu bringt, alles als Mobilgerät zu erkennen. Damit fehlen mouseover Events zur Gänze und die Trackposition wird onmouseover beim Profil nicht angezeigt
    * Workaround: den BUG durch Suchen / Ersetzen im Plugin Skript fixen

    ```
    // in leaflet.elevation-0.0.4.min.js und leaflet.elevation-0.0.4.src.js
    L.Browser.touch mit L.Browser.mobile ersetzen
    ```

    * Hintergrund der Geschichte:
        * https://github.com/MrMufflon/Leaflet.Elevation/pulls
        * https://github.com/MrMufflon/Leaflet.Elevation/pull/73
        * https://github.com/MrMufflon/Leaflet.Elevation/pull/73/files

    siehe https://github.com/webmapping/webmapping.github.io/commit/ddf0b771e099d3af2eabea5e3962d619f6a87d26

## Ausbaustufe 4: GPS-Track nach Steigung einfärben

1. Koordinaten und Höhen finden und in der Konsole anzeigen

    ```
    gpxTrack.on("addline", function(evt) {
        hoehenProfil.addData(evt.line);

        // Liniendaten in der Konsole anzeigen
        console.log(evt.line);
        console.log(evt.line.getLatLngs());
        console.log(evt.line.getLatLngs()[0]);
        console.log(evt.line.getLatLngs()[0].lat);
        console.log(evt.line.getLatLngs()[0].lng);
        console.log(evt.line.getLatLngs()[0].meta);
        console.log(evt.line.getLatLngs()[0].meta.ele);
    });
    ```
    siehe https://github.com/webmapping/webmapping.github.io/commit/46a6cf032860d6374762c524b769b5dbfac3ffca

2. eine featureGroup für die farbige Steigungslinie definieren und als Overlay hinzufügen
    ```
    // Layer für die Stiegungslinie hinzufügen (ganz oben im Skript)
    let overlaySteigung = L.featureGroup().addTo(karte);

    // und bei der Overlay control:
    {
        // ...
        "Steigungslinie" : overlaySteigung,
    }
    ```
    siehe https://github.com/webmapping/webmapping.github.io/commit/85dc51fa736260bd520d5c3181277fd96dd4ace0

3. alle Segmente der Steigungslinie über L.polyline hinzufügen
    ```
    // alle Segmente der Steigungslinie hinzufügen
    const gpxLinie = evt.line.getLatLngs();
    for (let i = 1; i < gpxLinie.length; i += 1) {
        // letzten und aktuellen Punkt definieren
        let p1 = gpxLinie[i-1];
        let p2 = gpxLinie[i];
        // Linie zeichnen
        let segement = L.polyline(
            [
                [p1.lat,p1.lng],
                [p2.lat,p2.lng],
            ], {
                color : "red",
            }
        ).addTo(overlaySteigung);
    }
    ```

    und die Standard GPX Linie ausblenden (auskommentieren oder ganz löschen):
    ```
    //"GPS-Track": overlayTrack,
    
    let gpxTrack = new L.GPX("data/etappe07.gpx", {
        async: true
    });//.addTo(overlayTrack);
    ```

    siehe https://github.com/webmapping/webmapping.github.io/commit/c79c1436e841f162174be2298a9d1aba6128722c


4. die Steigungen berechnen (direkt nach den Punktvariablen p1, p2)

    Entfernung und Höhenunterschied zwischen den beiden Punkten berechnen - https://leafletjs.com/reference-1.3.0.html#map-distance
    ```
    let dist = karte.distance(
        [ p1.lat,p1.lng ],
        [ p2.lat,p2.lng ]
    );
    let delta = (p2.meta.ele - p1.meta.ele);
    ```


     Steigung in Prozent berechnen (Genauigkeit Zehntelprozent) - https://www.e-education.psu.edu/natureofgeoinfo/book/export/html/1837

    ```
    let proz = (dist != 0 ? delta / dist * 100.0 : 0).toFixed(1);
    ```

    Info: neues Javascript Konstrukt bei *let proz*: Conditional (ternary) Operator
        * Bedingung ? Ausdruck1: Ausdruck2
        * https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Operators/Conditional_Operator

    siehe https://github.com/webmapping/webmapping.github.io/commit/746bca9f90ea9350757a510276fdac28bd46739e

5. die Farbkodierung bestimmen

    Segementfarbe nach Steigung bestimmen

    * Palette von http://colorbrewer2.org
    * http://colorbrewer2.org/?type=diverging&scheme=RdYlGn&n=7

    ```
    // Farbe nach Steigung definieren
    let color = 
        proz >=  10 ? "#d73027" :
        proz >=   6 ? "#fc8d59" :
        proz >=   2 ? "#fee08b" :
        proz >=   0 ? "#ffffbf" :
        proz >=  -6 ? "#d9ef8b" :
        proz >= -10 ? "#91cf60" :
                      "#1a9850";
    ```

    siehe https://github.com/webmapping/webmapping.github.io/commit/8e31bc935f1db170c77d521d3f7d3c36deb4bda6
