import React, { useState, useEffect, useMemo, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Map, Marker, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MapComponent = forwardRef((props, ref) => {
  const MAPBOX_TOKEN = 'pk.eyJ1IjoiYW1kdi10ZWFtIiwiYSI6ImNtaHU0OGhieDF5bXUyaW9wa3NyZmVybmkifQ.eExiSTlk_im1HTxn4NMqPg';

  const terrainCenter = useMemo(() => ({
    longitude: 95.2055,
    latitude: 21.798
  }), []);

  const [viewState, setViewState] = useState({
    longitude: terrainCenter.longitude,
    latitude: terrainCenter.latitude,
    zoom: 19
  });

  const [showMines, setShowMines] = useState(false);
  const [detectedMines, setDetectedMines] = useState([]);

  const terrainWidthMeters = 30;
  const terrainHeightMeters = 45;
  const metersToDegreesLat = 1 / 111000;
  const metersToDegreesLon = 1 / 102000;

  const halfWidth = (terrainWidthMeters / 2) * metersToDegreesLon;
  const halfHeight = (terrainHeightMeters / 2) * metersToDegreesLat;

  const rotationDegrees = 18;
  const rotationRadians = (rotationDegrees * Math.PI) / 180;
  const cos = Math.cos(rotationRadians);
  const sin = Math.sin(rotationRadians);

  const corners = {
    topLeft: {
      lon: terrainCenter.longitude + (-halfWidth * cos - halfHeight * sin),
      lat: terrainCenter.latitude + (-halfWidth * sin + halfHeight * cos)
    },
    topRight: {
      lon: terrainCenter.longitude + (halfWidth * cos - halfHeight * sin),
      lat: terrainCenter.latitude + (halfWidth * sin + halfHeight * cos)
    },
    bottomRight: {
      lon: terrainCenter.longitude + (halfWidth * cos + halfHeight * sin),
      lat: terrainCenter.latitude + (halfWidth * sin - halfHeight * cos)
    },
    bottomLeft: {
      lon: terrainCenter.longitude + (-halfWidth * cos + halfHeight * sin),
      lat: terrainCenter.latitude + (-halfWidth * sin - halfHeight * cos)
    }
  };

  const terrainImageBounds = [
    [corners.topLeft.lon, corners.topLeft.lat],
    [corners.topRight.lon, corners.topRight.lat],
    [corners.bottomRight.lon, corners.bottomRight.lat],
    [corners.bottomLeft.lon, corners.bottomLeft.lat]
  ];

  const pixelToGPS = useCallback((pixelX, pixelY) => {
    const xNorm = (pixelX / 300) - 0.5;
    const yNorm = (pixelY / 445) - 0.5;
    const xMeters = xNorm * terrainWidthMeters;
    const yMeters = -yNorm * terrainHeightMeters;
    const xRotated = xMeters * cos - yMeters * sin;
    const yRotated = xMeters * sin + yMeters * cos;
    const lon = terrainCenter.longitude + (xRotated * metersToDegreesLon);
    const lat = terrainCenter.latitude + (yRotated * metersToDegreesLat);
    return { lat, lon };
  }, [terrainWidthMeters, terrainHeightMeters, cos, sin, terrainCenter, metersToDegreesLon, metersToDegreesLat]);

  const mineLocations = useMemo(() => [
    { ...pixelToGPS(226, 74), id: 1, tile: 1, name: 'Mine 1' },
    { ...pixelToGPS(168, 210), id: 2, tile: 2, name: 'Mine 2' },
    { ...pixelToGPS(80, 233), id: 3, tile: 6, name: 'Mine 3' },
    { ...pixelToGPS(127, 326), id: 4, tile: 3, name: 'Mine 4' },
    { ...pixelToGPS(202, 360), id: 5, tile: 5, name: 'Mine 5' }
  ], [pixelToGPS]);

  // Export functions FIRST
  const exportMineLocationsText = useCallback(() => {
    if (detectedMines.length === 0) {
      alert('No mines detected yet!');
      return;
    }

    let textContent = `AMDV Mine Detection Report
========================================
Export Date: ${new Date().toLocaleString()}
Location: Sagaing Region, Myanmar
Terrain Center: ${terrainCenter.latitude.toFixed(6)}°N, ${terrainCenter.longitude.toFixed(6)}°E

TERRAIN INFORMATION
----------------------------------------
Physical Size: 4ft × 6ft
Represented Size: 30m × 45m
Tile Grid: 3×2 (6 tiles total)

DETECTION SUMMARY
----------------------------------------
Total Mines Detected: ${detectedMines.length}
Detection Method: Metal Detector

DETECTED MINE LOCATIONS
----------------------------------------
`;

    detectedMines.forEach((mine, index) => {
      textContent += `
Mine #${index + 1}
  Latitude:  ${mine.lat.toFixed(8)}°
  Longitude: ${mine.lon.toFixed(8)}°
  Timestamp: ${mine.timestamp ? new Date(mine.timestamp).toLocaleString() : 'N/A'}
  Method:    ${mine.method || 'Metal Detector'}
`;
    });

    textContent += `
========================================
End of Report
`;

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AMDV-Mine-Report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert(`Successfully exported ${detectedMines.length} mine location(s) to text file!`);
  }, [detectedMines, terrainCenter]);

  const exportMineLocationsCSV = useCallback(() => {
    if (detectedMines.length === 0) {
      alert('No mines detected yet!');
      return;
    }

    let csvContent = 'Mine ID,Latitude,Longitude,Timestamp,Detection Method,Tile\n';

    detectedMines.forEach((mine, index) => {
      const timestamp = mine.timestamp ? new Date(mine.timestamp).toLocaleString() : 'N/A';
      const method = mine.method || 'Metal Detector';
      const tile = mine.tile || 'N/A';
      csvContent += `${index + 1},${mine.lat.toFixed(8)},${mine.lon.toFixed(8)},"${timestamp}","${method}",${tile}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AMDV-Mine-Locations-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert(`Successfully exported ${detectedMines.length} mine location(s) to CSV file!`);
  }, [detectedMines]);

  const exportMineLocationsXLSX = useCallback(() => {
    if (detectedMines.length === 0) {
      alert('No mines detected yet!');
      return;
    }

    let xlsxContent = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Worksheet ss:Name="Mine Detections">
<Table>
<Row>
<Cell><Data ss:Type="String">Mine ID</Data></Cell>
<Cell><Data ss:Type="String">Latitude</Data></Cell>
<Cell><Data ss:Type="String">Longitude</Data></Cell>
<Cell><Data ss:Type="String">Timestamp</Data></Cell>
<Cell><Data ss:Type="String">Detection Method</Data></Cell>
<Cell><Data ss:Type="String">Tile</Data></Cell>
</Row>
`;

    detectedMines.forEach((mine, index) => {
      const timestamp = mine.timestamp ? new Date(mine.timestamp).toLocaleString() : 'N/A';
      const method = mine.method || 'Metal Detector';
      const tile = mine.tile || 'N/A';
      xlsxContent += `<Row>
<Cell><Data ss:Type="Number">${index + 1}</Data></Cell>
<Cell><Data ss:Type="Number">${mine.lat.toFixed(8)}</Data></Cell>
<Cell><Data ss:Type="Number">${mine.lon.toFixed(8)}</Data></Cell>
<Cell><Data ss:Type="String">${timestamp}</Data></Cell>
<Cell><Data ss:Type="String">${method}</Data></Cell>
<Cell><Data ss:Type="Number">${tile}</Data></Cell>
</Row>
`;
    });

    xlsxContent += `</Table></Worksheet></Workbook>`;

    const blob = new Blob([xlsxContent], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AMDV-Mine-Locations-${new Date().toISOString().split('T')[0]}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert(`Successfully exported ${detectedMines.length} mine location(s) to Excel file!`);
  }, [detectedMines]);

  const exportMineLocationsSHP = useCallback(() => {
    if (detectedMines.length === 0) {
      alert('No mines detected yet!');
      return;
    }

    const geojson = {
      type: 'FeatureCollection',
      features: detectedMines.map((mine, index) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [mine.lon, mine.lat]
        },
        properties: {
          id: index + 1,
          name: mine.name || `Mine ${index + 1}`,
          tile: mine.tile || 'N/A',
          timestamp: mine.timestamp || new Date().toISOString(),
          method: mine.method || 'Metal Detector',
          latitude: mine.lat.toFixed(8),
          longitude: mine.lon.toFixed(8)
        }
      }))
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AMDV-Mine-Locations-${new Date().toISOString().split('T')[0]}.geojson`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert(`Successfully exported ${detectedMines.length} mine location(s) to GeoJSON file!`);
  }, [detectedMines]);

  // Expose functions AFTER they're defined
  useImperativeHandle(ref, () => ({
    toggleShowMines: () => setShowMines(prev => !prev),
    simulateDetection: () => {
      if (detectedMines.length < mineLocations.length) {
        const nextMine = mineLocations[detectedMines.length];
        setDetectedMines(prev => [...prev, {
          ...nextMine,
          timestamp: new Date().toISOString(),
          method: 'Metal Detector (Simulated)'
        }]);
        return true;
      }
      alert('All mines have been detected!');
      return false;
    },
    exportAsText: exportMineLocationsText,
    exportAsCSV: exportMineLocationsCSV,
    exportAsXLSX: exportMineLocationsXLSX,
    exportAsSHP: exportMineLocationsSHP,
    getDetectedCount: () => detectedMines.length,
    getTotalCount: () => mineLocations.length
  }), [detectedMines, mineLocations, exportMineLocationsText, exportMineLocationsCSV, exportMineLocationsXLSX, exportMineLocationsSHP]);

  // WebSocket for Arduino metal detection
  useEffect(() => {
    const ws = new WebSocket('ws://192.168.137.245:5000/ws');

    ws.onopen = () => {
      console.log('✅ Map: Connected to Jetson WebSocket');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 Map received:', data);
        
        if (data.type === 'MINE_DETECTED') {
          console.log('🚨 MINE DETECTED! Current count:', detectedMines.length);
          
          if (detectedMines.length < mineLocations.length) {
            const nextMine = mineLocations[detectedMines.length];
            console.log('➕ Adding mine:', nextMine.name);
            setDetectedMines(prev => [...prev, {
              ...nextMine,
              timestamp: data.timestamp,
              method: 'Metal Detector (Arduino)'
            }]);
          } else {
            console.log('⚠️ All 5 mines already detected');
          }
        }
      } catch (error) {
        console.error('❌ Error in WebSocket handler:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('❌ Map WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('❌ Map WebSocket disconnected');
    };

    return () => ws.close();
  }, [detectedMines.length, mineLocations]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/satellite-v9"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        <Source
          id="terrain-overlay"
          type="image"
          url="/terrain.png"
          coordinates={terrainImageBounds}
        >
          <Layer
            id="terrain-layer"
            type="raster"
            paint={{ 'raster-opacity': 0.95 }}
          />
        </Source>

        {showMines && mineLocations.map((mine) => (
          <Marker key={mine.id} longitude={mine.lon} latitude={mine.lat}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: '25px',
                height: '25px',
                borderRadius: '50%',
                backgroundColor: 'yellow',
                border: '2px solid orange',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'black',
                fontWeight: 'bold',
                fontSize: '12px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                opacity: 0.9
              }}>
                {mine.id}
              </div>
              <div style={{
                backgroundColor: 'rgba(255,165,0,0.9)',
                color: 'white',
                padding: '2px 6px',
                borderRadius: '3px',
                fontSize: '10px',
                marginTop: '2px'
              }}>
                {mine.name}
              </div>
            </div>
          </Marker>
        ))}

        {detectedMines.map((mine, index) => (
          <Marker key={`detected-${index}`} longitude={mine.lon} latitude={mine.lat}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: 'red',
                border: '3px solid white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '14px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
              }}>
                !
              </div>
              <div style={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                color: 'white',
                padding: '3px 8px',
                borderRadius: '3px',
                fontSize: '11px',
                marginTop: '2px'
              }}>
                Detected
              </div>
            </div>
          </Marker>
        ))}
      </Map>
    </div>
  );
});

export default MapComponent;