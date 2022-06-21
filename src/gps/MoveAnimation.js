import React, { useState, useEffect } from 'react';
import 'ol/ol.css';  //* 스타일
import Feature from 'ol/Feature';
import { Map, View, Control } from 'ol';  //* 뷰 관리
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

/**
 * I think the feature-move-animation example was misleading for you. 
 * There is no need to use ol.format.PolyLine to programmatically create a polyline. 
 * Instead, you just create a feature with a polyline geometry and add that to your vector source:
 */

function MoveAnimation() {
    const CENTER = [129.3097937, 35.5428678];
    let distance = 0;

    const [lastTime, setLastTime] = useState();
    const [animate, setAnimate] = useState(false);
    const [mapObject, setMapObject] = useState(null);
    const [tileLayer, setTileLayer] = useState(null);
    const [source, setSource] = useState(null);
    const [vectorLayer, setVectorLayer] = useState(null);


    const routeFeature = new Feature({
        type: 'route',
        geometry: new LineString(polyline).transform('EPSG:4326', 'EPSG:3857'),
    });
    const startMarker = new Feature({
        type: 'icon',
        geometry: new Point(polyline[0]).transform('EPSG:4326', 'EPSG:3857')
    });
    const endMarker = new Feature({
        type: 'icon',
        geometry: new Point(polyline[polyline.length - 1]).transform('EPSG:4326', 'EPSG:3857')
    });
    const position = startMarker.getGeometry().clone();
    const geoMarker = new Feature({
        type: 'geoMarker',
        geometry: position,
    });

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

    const createMap = () => {
        let tileLayer = new TileLayer({
            name: 'Base',
            visible: true,
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
                return styles[feature.get('type')];
            }
        });
        let map = new Map({
            layers: [tileLayer, vectorLayer],
            target: 'map',
            view: new View({
                projection: getProjection('EPSG:3857'),
                center: fromLonLat(CENTER, getProjection('EPSG:3857')),
                zoom: 14,
                multiWorld: false,
            }),
        });

        setTileLayer(tileLayer);
        setSource(source);
        setVectorLayer(vectorLayer);
        setMapObject(map)
    }

    function moveFeature(event) {
        if (mapObject) {
            const speed = 2;
            const time = event.frameState.time;
            const elapsedTime = time - lastTime;
            distance = (distance + (speed * elapsedTime) / 1000000.0) % 2;
            setLastTime(time);

            const currentCoordinate = new LineString(polyline).transform('EPSG:4326', 'EPSG:3857').getCoordinateAt(
                distance > 1 ? 2 - distance : distance
            );
            position.setCoordinates(currentCoordinate);
            const vectorContext = getVectorContext(event);
            vectorContext.setStyle(styles.geoMarker);
            vectorContext.drawGeometry(position);

            console.log(currentCoordinate)

            mapObject.render();
        }
    };

    function startAnimation(vectorLayer) {
        if (vectorLayer) {
            setLastTime(Date.now());
            vectorLayer.on('postrender', moveFeature);
            geoMarker.setGeometry(null);
        }
    }

    function stopAnimation(vectorLayer) {
        if (vectorLayer) {
            geoMarker.setGeometry(position);
            vectorLayer.un('postrender', moveFeature);
        }
    }

    //* 처음 렌더링 될 때, 맵 그리기.
    useEffect(() => {
        createMap();
    }, []);

    useEffect(() => {
        if (!animate) {
            stopAnimation(vectorLayer);
        } else {
            startAnimation(vectorLayer);
        }
    }, [animate, vectorLayer])

    return (
        <>
            <div id="map"
                className='map'
                style={{ height: '50rem' }}>
            </div>
            <button id='start-animation'
                onClick={() => setAnimate(!animate)}>
                {animate ? 'stop' : 'start'}
            </button>
        </>
    )
}

export default MoveAnimation