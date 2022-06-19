import React, { useState, useEffect } from 'react';
import 'ol/ol.css';  //* 스타일
import { Map as OlMap, View, Control } from 'ol';  //* 뷰 관리
import { fromLonLat, get as getProjection } from 'ol/proj'; //* 위경도
import TileLayer from 'ol/layer/Tile'; //* 지도타일
import { Vector as VectorLayer } from 'ol/layer';
import VectorSource from 'ol/source/Vector';
import { XYZ } from 'ol/source';  //* 지도정보
import Point from 'ol/geom/Point'; //* mark 지정
import { Icon, Style, Circle, Fill, Stroke } from 'ol/style'; //* mark style 모양
import LineString from 'ol/geom/LineString.js';
import Feature from 'ol/Feature';
import Polyline from 'ol/format/Polyline'

import markPoint from './arrow.svg'
function GPSMap() {
    const [mapObject, setMapObject] = useState(null);
    const [vectorLayer, setVectorLayer] = useState(null);

    const polyline = [
        [
            129.265123057,
            35.54015264
        ],
        [
            129.264747471,
            35.53980517
        ],
        [
            129.26254542,
            35.54098106
        ],
        [
            129.261552579,
            35.54273488
        ],
        [
            129.261731956,
            35.54565363
        ],
        [
            129.263825113,
            35.54732048
        ],
        [
            129.264338519,
            35.54988372
        ],
        [
            129.268254114,
            35.55225531
        ],
        [
            129.27112555,
            35.5533172
        ],
        [
            129.274519066,
            35.55501618
        ],
        [
            129.277869075,
            35.55678592
        ],
        [
            129.281958696,
            35.55788314
        ],
        [
            129.284917146,
            35.55721065
        ],
        [
            129.288832741,
            35.55660895
        ],
        [
            129.296489904,
            35.55912191
        ],
        [
            129.299796407,
            35.56046685
        ],
        [
            129.306409412,
            35.56167019
        ],
        [
            129.314719175,
            35.56290891
        ],
        [
            129.316938012,
            35.56053763
        ],
        [
            129.31284839,
            35.55848483
        ],
        [
            129.309367861,
            35.55653816
        ],
        [
            129.308541236,
            35.55193675
        ],
        [
            129.307540584,
            35.5488218
        ],
        [
            129.309106822,
            35.54744127
        ],
        [
            129.310368513,
            35.54421994
        ],
        [
            129.312034458,
            35.5420076
        ],
        [
            129.318533113,
            35.54376373
        ],
        [
            129.324330932,
            35.5452671
        ],
        [
            129.326170625,
            35.54139197
        ],
        [
            129.327142238,
            35.53743889
        ],
        [
            129.318377596,
            35.53514301
        ],
        [
            129.312125826,
            35.53355519
        ],
        [
            129.307753569,
            35.53268026
        ],
        [
            129.302411822,
            35.53320289
        ],
        [
            129.300791144,
            35.53404018
        ],
        [
            129.300582675,
            35.53433022
        ],
        [
            129.3005894,
            35.53464215
        ],
        [
            129.299681551,
            35.53424266
        ],
        [
            129.297798606,
            35.53397451
        ],
        [
            129.293387134,
            35.5346312
        ],
        [
            129.290313898,
            35.53517297
        ],
        [
            129.285976399,
            35.53585701
        ],
        [
            129.282176884,
            35.53648633
        ]
    ];
    const styles = {
        'route': new Style({
            stroke: new Stroke({
                width: 6,
                color: [237, 212, 0, 1]
            })
        }),
        'icon': new Style({
            image: new Circle({
                radius: 7,
                snapToPixel: false,
                fill: new Fill({ color: 'black' }),
                stroke: new Stroke({
                    color: 'white', width: 2
                })
            }),

        }),
        'geoMarker': new Style({
            image: new Icon({
                src: markPoint
            })
        })
    };
    let center = [129.3097937, 35.5428678];
    let animating = false;
    let speed, now;
    let speedInput = document.getElementById('speed');
    let startButton = document.getElementById('start-animation');

    let routeFeature = new Feature({
        type: 'route',
        geometry: new LineString(polyline).transform('EPSG:4326', 'EPSG:3857'),
    });
    let startMarker = new Feature({
        type: 'icon',
        geometry: new Point(polyline[0]).transform('EPSG:4326', 'EPSG:3857')
    });
    let endMarker = new Feature({
        type: 'icon',
        geometry: new Point(polyline[polyline.length - 1]).transform('EPSG:4326', 'EPSG:3857')
    });
    let geoMarker = new Feature({
        type: 'geoMarker',
        geometry: new Point(polyline[0]).transform('EPSG:4326', 'EPSG:3857')
    });

    const makeLayer = () => {
        // let routeFeature = new Feature({
        //     type: 'route',
        //     geometry: new LineString(polyline).transform('EPSG:4326', 'EPSG:3857'),
        // });
        // let startMarker = new Feature({
        //     type: 'icon',
        //     geometry: new Point(polyline[0]).transform('EPSG:4326', 'EPSG:3857')
        // });
        // let endMarker = new Feature({
        //     type: 'icon',
        //     geometry: new Point(polyline[polyline.length - 1]).transform('EPSG:4326', 'EPSG:3857')
        // });
        // let geoMarker = new Feature({
        //     type: 'geoMarker',
        //     geometry: new Point(polyline[0]).transform('EPSG:4326', 'EPSG:3857')
        // });

        let vectorLayer = new VectorLayer({
            source: new VectorSource({
                features: [routeFeature, geoMarker, startMarker, endMarker]
            }),
            style: function (feature) {
                // hide geoMarker if animation is active
                if (animating && feature.get('type') === 'geoMarker') {
                    return null;
                }
                return styles[feature.get('type')];
            }
        });
        setVectorLayer(vectorLayer);

    }


    let moveFeature = function (event) {
        // console.log(event)
        let vectorContext = event.vectorContext;
        let frameState = event.frameState;

        if (animating) {
            let elapsedTime = frameState.time - now;
            // here the trick to increase speed is to jump some indexes
            // on lineString coordinates
            let index = Math.round(speed * elapsedTime / 1000);

            if (index >= polyline.length) {
                stopAnimation(true);
                return;
            }

            let currentPoint = new Point(polyline[index]).transform('EPSG:4326', 'EPSG:3857');
            let feature = new Feature(currentPoint);
            // vectorContext.drawFeature(feature, styles.geoMarker);
        }
        // tell OpenLayers to continue the postcompose animation
        mapObject.render();
    };

    function startAnimation() {
        if (animating) {
            stopAnimation(false);
        } else {
            // console.log(mapObject)
            if (Object.values(mapObject).length) {
                animating = true;
                now = new Date().getTime();
                speed = 2;
                // startButton.textContent = 'Cancel Animation';
                // hide geoMarker
                geoMarker.setStyle(null);
                // just in case you pan somewhere else
                mapObject.getView().setCenter(center);
                mapObject.on('postcompose', moveFeature);
                mapObject.render();
            }
        }
    }

    function stopAnimation(ended) {
        animating = false;
        startButton.textContent = 'Start Animation';

        // if animation cancelled set the marker at the beginning
        var coord = ended ? polyline[polyline.length - 1] : polyline[0];
        /** @type {ol.geom.Point} */ (geoMarker.getGeometry())
            .setCoordinates(coord);
        //remove listener
        mapObject.un('postcompose', moveFeature);
    }

    useEffect(() => {
        makeLayer();
        // startAnimation();
    }, [])

    //* 처음 렌더링 될 때, 맵 그리기.
    useEffect(() => {
        if (vectorLayer) {
            const map = new OlMap({
                target: 'map',
                view: new View({
                    projection: getProjection('EPSG:3857'),
                    center: fromLonLat([129.3097937, 35.5428678], getProjection('EPSG:3857')),
                    zoom: 14
                }),
                layers: [
                    new TileLayer({
                        name: 'Base',
                        visible: true,
                        source: new XYZ({
                            url: `http://mt0.google.com/vt/lyrs=m&hl=kr&x={x}&y={y}&z={z}&s=Ga`
                        })
                    }),
                    vectorLayer
                ],
            })
            setMapObject(map)
        }
    }, [vectorLayer])



    return (
        <>
            <div id="map"
                // value={mapObject} 
                style={{ height: '50rem' }}>
                {/* <div id='marker' style={{ backgroundColor: 'black', zIndex: 2000 }}></div> */}
            </div>
            <button id="start-animation" onClick={startAnimation}>Start Animation</button>
            <button id="stop-animation" onClick={stopAnimation}>stop Animation</button>
        </>
    )
}

export default GPSMap