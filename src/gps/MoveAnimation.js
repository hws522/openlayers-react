import React, { useState, useEffect } from 'react';
import 'ol/ol.css';  //* 스타일
import Feature from 'ol/Feature';
import { Map, View } from 'ol';  //* 뷰 관리
import Point from 'ol/geom/Point'; //* mark 지정
import { Icon, Style, Circle, Fill, Stroke } from 'ol/style'; //* mark style 모양
import { XYZ, Vector as VectorSource } from 'ol/source';  //* 지도정보
import { fromLonLat, get as getProjection } from 'ol/proj'; //* 위경도
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'; //* 지도타일
import { getVectorContext } from 'ol/render'; //* event.vectorContext
import LineString from 'ol/geom/LineString.js'; //* 좌표로 지도에 경로 그리기
import UseInterval from '../customHooks/UseInterval';
import markPoint from './arrow.svg'
import { coordData as polyline } from '../coordData/CoordData';

function MoveAnimation() {
    const CENTER = [129.3097937, 35.5428678];

    const [center, setCenter] = useState(null);
    const [count, setCount] = useState(0);
    const [now, setNow] = useState(0);
    const [animate, setAnimate] = useState(false);
    const [mapObject, setMapObject] = useState(null);
    const [tileLayer, setTileLayer] = useState(null);
    const [source, setSource] = useState(null);
    const [vectorLayer, setVectorLayer] = useState(null);

    const route = new LineString(polyline).transform('EPSG:4326', 'EPSG:3857');
    const routeCoords = route.getCoordinates();
    const routeLength = routeCoords.length;

    const routeFeature = new Feature({
        type: 'route',
        // geometry: new LineString(polyline).transform('EPSG:4326', 'EPSG:3857'),
        geometry: route,
    });
    const geoMarker = new Feature({
        type: 'geoMarker',
        // geometry: new Point(polyline[0]).transform('EPSG:4326', 'EPSG:3857')
        geometry: new Point(routeCoords[0])
    });
    const startMarker = new Feature({
        type: 'icon',
        // geometry: new Point(polyline[0]).transform('EPSG:4326', 'EPSG:3857')
        geometry: new Point(routeCoords[0])
    });
    const endMarker = new Feature({
        type: 'icon',
        // geometry: new Point(polyline[polyline.length - 1]).transform('EPSG:4326', 'EPSG:3857')
        geometry: new Point(routeCoords[routeLength - 1])
    });

    const styles = {
        'route': new Style({
            stroke: new Stroke({
                width: 6,
                color: [137, 112, 200, 0.7]
            })
        }),
        'icon': new Style({
            image: new Circle({
                radius: 5,
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

    const createMap = () => {
        let tileLayer = new TileLayer({
            source: new XYZ({
                url: `http://mt0.google.com/vt/lyrs=m&hl=kr&x={x}&y={y}&z={z}&s=Ga`
            })
        });
        let source = new VectorSource({
            features: [routeFeature, geoMarker, startMarker, endMarker],
        });
        let vectorLayer = new VectorLayer({
            source: source,
            style: function (feature) {
                if (animate && feature.get('type') === 'geoMarker') {
                    return null;
                }
                else return styles[feature.get('type')];
            }
        });
        let map = new Map({
            layers: [tileLayer, vectorLayer],
            target: document.getElementById('map'),
            loadTilesWhileAnimating: true,
            view: new View({
                // projection: getProjection('EPSG:3857'), 기본값 3857
                center: fromLonLat(CENTER),
                zoom: 13,
            }),
        });

        setCenter(map.getView().getCenter());
        setTileLayer(tileLayer);
        setSource(source);
        setVectorLayer(vectorLayer);
        setMapObject(map)
    }

    function moveFeature(event) {
        if (mapObject) {
            let vectorContext = getVectorContext(event);
            let frameState = event.frameState;

            if (animate && now) {
                let elapsedTime = frameState.time - now;
                // here the trick to increase speed is to jump some indexes
                // on lineString coordinates
                let index = Math.round(12 * elapsedTime / 1000);

                if (index >= routeLength) {
                    stopAnimation(true);
                    return;
                }
                else {
                    let feature = new Feature({
                        type: 'geoMarker',
                        geometry: new Point(routeCoords[index])
                    });
                    vectorContext.drawFeature(feature, styles.geoMarker);
                }
            }
            // tell OL3 to continue the postcompose animation
            mapObject.render();
        }
    };

    function startAnimation() {
        // console.log('start');
        if (vectorLayer) {
            if (!animate) {
                console.log('animate')
                stopAnimation(false);
            } else {
                // setAnimate(true);
                setNow(Date.now());
                // hide geoMarker
                geoMarker.setStyle(null);
                // just in case you pan somewhere else
                mapObject.getView().setCenter(center);
                vectorLayer.on('postrender', moveFeature);
                mapObject.render();
            }
        }
    }

    function stopAnimation(ended) {
        if (vectorLayer) {
            // setAnimate(false);
            // if animation cancelled set the marker at the beginning
            let coord = ended ? polyline[polyline.length - 1] : polyline[0];
            geoMarker.getGeometry().setCoordinates(coord);
            //remove listener
            vectorLayer.un('postrender', moveFeature);
        }
    }

    UseInterval(() => {
        if (animate) {
            if (count >= polyline.length) {
                setCount(0);
            };
            if (now) {
                setNow(Date.now())
                setCount(count + 1);
            }
        }
    }, 4500)

    useEffect(() => {
        if (animate) startAnimation()
        else stopAnimation()
    }, [now, animate])

    //* 처음 렌더링 될 때, 맵 그리기.
    useEffect(() => {
        createMap();
        //* 시작하자마자 움직이도록.
        setAnimate(true);
    }, []);

    return (
        <>
            <div id="map"
                value={mapObject}
                style={{ height: 500 }}>
            </div>
            <button id="start-animation" onClick={() => setAnimate(!animate)}>{animate ? `Stop Animation` : `Start Animation`}</button>
        </>
    )
}

export default MoveAnimation