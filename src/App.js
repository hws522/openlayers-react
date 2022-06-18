import React, { useState, useEffect } from 'react';
import 'ol/ol.css';  //* 스타일
import { Map as OlMap, View } from 'ol';  //* 뷰 관리
import { fromLonLat, get as getProjection } from 'ol/proj'; //* 위경도
import { Tile as TileLayer } from 'ol/layer';  //* 지도타일
import { XYZ } from 'ol/source';  //* 지도정보
import Point from 'ol/geom/Point'; //* mark 지정
import { Icon, Style, Circle, Fill, Stroke } from 'ol/style'; //* mark style 모양
import LineString from 'ol/geom/LineString.js';
import Feature from 'ol/Feature';

function App() {
  const [mapObject, setMapObject] = useState({})

  //* 처음 렌더링 될 때, 맵 그리기.
  useEffect(() => {
    const map = new OlMap({
      layers: [
        new TileLayer({
          name: 'Base',
          visible: true,
          source: new XYZ({
            url: `http://mt0.google.com/vt/lyrs=m&hl=kr&x={x}&y={y}&z={z}&s=Ga`
          })
        })
      ],
      target: 'map',
      view: new View({
        projection: getProjection('EPSG:3857'),
        center: fromLonLat([129.3097937, 35.5428678], getProjection('EPSG:3857')),
        zoom: 14
      })
    })
    setMapObject({ map })
    return () => null
  }, [])



  return (
    <>
      <div id="map" value={mapObject} style={{ height: '50rem' }}>
        <div id='marker' style={{ backgroundColor: 'black', zIndex: 2000 }}></div>
      </div>
    </>
  )
}

export default App