import React, { useState, useEffect } from 'react'
import 'ol/ol.css';
import Feature from 'ol/Feature';
import Map from 'ol/Map';
import Point from 'ol/geom/Point';
import View from 'ol/View';
import { Circle as CircleStyle, Stroke, Style, Icon } from 'ol/style';
import { XYZ, Vector as VectorSource } from 'ol/source';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { easeOut } from 'ol/easing';
import { fromLonLat, get as getProjection } from 'ol/proj'; //* 위경도
import { getVectorContext } from 'ol/render';
import { unByKey } from 'ol/Observable';

import UseInterval from '../customHooks/UseInterval';
import markPoint from './arrow.svg';
import { coordData as polyline } from '../coordData/CoordData';

const PointAnimation = () => {
    const DURATION = 3000;
    let COUNT = 0;

    const [mapObject, setMapObject] = useState(null);
    const [tileLayer, setTileLayer] = useState(null);
    const [source, setSource] = useState(null);
    const [vector, setVector] = useState(null);

    const createMap = () => {
        let tileLayer = new TileLayer({
            name: 'Base',
            visible: true,
            source: new XYZ({
                url: `http://mt0.google.com/vt/lyrs=m&hl=kr&x={x}&y={y}&z={z}&s=Ga`
            })
        });
        let source = new VectorSource({
            wrapX: false,
        });
        let vector = new VectorLayer({
            source: source,
            style: new Style({
                image: new Icon({
                    src: markPoint
                })
            })
        });
        let map = new Map({
            layers: [tileLayer, vector],
            target: 'map',
            view: new View({
                projection: getProjection('EPSG:3857'),
                center: fromLonLat([129.3097937, 35.5428678], getProjection('EPSG:3857')),
                zoom: 14,
                multiWorld: false,
            }),
        });
        setTileLayer(tileLayer);
        setSource(source);
        setVector(vector);
        setMapObject(map);
    }

    const createFeature = (idx) => {
        const geom = new Point(polyline[idx]).transform('EPSG:4326', 'EPSG:3857');
        const feature = new Feature(geom);
        source.addFeature(feature);
    }

    const flash = (feature) => {
        const start = Date.now();
        const flashGeom = feature.getGeometry().clone();
        const listenerKey = tileLayer.on('postrender', animate);

        function animate(event) {
            if (mapObject) {
                const frameState = event.frameState;
                const elapsed = frameState.time - start;
                if (elapsed >= DURATION) {
                    unByKey(listenerKey);
                    return;
                }
                const vectorContext = getVectorContext(event);
                const elapsedRatio = elapsed / DURATION;
                // radius will be 5 at start and 30 at end.
                const radius = easeOut(elapsedRatio) * 25 + 5;
                const opacity = easeOut(1 - elapsedRatio);


                const style = new Style({
                    image: new CircleStyle({
                        radius: radius,
                        stroke: new Stroke({
                            color: 'rgba(32, 99, 177, ' + opacity + ')',
                            width: 0.25 + opacity,
                        }),
                    }),
                });

                if (radius > 29.8) source.removeFeature(feature);

                vectorContext.setStyle(style);
                vectorContext.drawGeometry(flashGeom);
                // tell OpenLayers to continue postrender animation
                mapObject.render();
            }
        }
    }

    //* 화면 첫 렌더링 시, 지도 그리기.
    useEffect(() => {
        createMap();
    }, [])

    //* source 값이 있을 때, flash 함수 출력.
    useEffect(() => {
        if (source) {
            source.on('addfeature', function (e) {
                flash(e.feature);
            });
        };
    }, [source])


    //* 저장된 좌표값 Interval 로 하나씩 feature 추가.
    UseInterval(() => {
        if (COUNT === polyline.length) {
            COUNT = 0;
        };
        createFeature(COUNT);
        COUNT++;
    }, 500)

    return (
        <div id="map"
            value={mapObject}
            style={{ height: '50rem' }}>
        </div>
    )
}

export default PointAnimation