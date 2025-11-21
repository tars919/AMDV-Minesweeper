import React, { useState, useEffect } from 'react';
import { Map, Marker, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

function MapComponent() {
  const MAPBOX_TOKEN = 'pk.eyJ1IjoiYW1kdi10ZWFtIiwiYSI6ImNtaHU0OGhieDF5bXUyaW9wa3NyZmVybmkifQ.eExiSTlk_im1HTxn4NMqPg';

  // Central Sagaing Region, Myanmar
  const terrainCenter = {
    longitude: 95.2055,
    latitude: 21.798
  };

  const [viewState, setViewState] = useState({
    longitude: terrainCenter.longitude,
    latitude: terrainCenter.latitude,
    zoom: 19
  });

  const [showMines, setShowMines] = useState(false);
  const [detectedMines, setDetectedMines] = useState([]);

  
  // Your terrain dimensions: 300px wide × 445px tall
  // Real world representation: 30m wide × 45m tall

  const terrainWidthMeters = 30;
  const terrainHeightMeters = 45;

  // Convert meters to degrees (approximate for Myanmar latitude)
  const metersToDegreesLat = 1 / 111000;
  const metersToDegreesLon = 1 / 102000;

  const halfWidth = (terrainWidthMeters / 2) * metersToDegreesLon;
  const halfHeight = (terrainHeightMeters / 2) * metersToDegreesLat;

  // Rotation angle (your image is rotated)
  const rotationDegrees = 18;
  const rotationRadians = (rotationDegrees * Math.PI) / 180;
  const cos = Math.cos(rotationRadians);
  const sin = Math.sin(rotationRadians);

  // Calculate rotated corners for the terrain overlay
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

  const pixelToGPS = (pixelX, pixelY) => {
    // Normalize to -0.5 to 0.5 range (centered)
    const xNorm = (pixelX / 300) - 0.5;
    const yNorm = (pixelY / 445) - 0.5;
    
    // Convert to meters
    const xMeters = xNorm * terrainWidthMeters;
    const yMeters = -yNorm * terrainHeightMeters;
    
    // Apply rotation
    const xRotated = xMeters * cos - yMeters * sin;
    const yRotated = xMeters * sin + yMeters * cos;
    
    // Convert to GPS
    const lon = terrainCenter.longitude + (xRotated * metersToDegreesLon);
    const lat = terrainCenter.latitude + (yRotated * metersToDegreesLat);
    
    return { lat, lon };
  };

  // Mine locations based on your pixel coordinates
  const mineLocations = [
    { ...pixelToGPS(226, 74), id: 1, tile: 1, name: 'Mine 1' },
    { ...pixelToGPS(168, 210), id: 2, tile: 2, name: 'Mine 2' },
    { ...pixelToGPS(202, 360), id: 3, tile: 3, name: 'Mine 3' },
    { ...pixelToGPS(80, 233), id: 4, tile: 5, name: 'Mine 4' },
    { ...pixelToGPS(127, 326), id: 5, tile: 6, name: 'Mine 5' }
  ];

  // WebSocket connection to backend for Arduino detection
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001');

    ws.onopen = () => {
      console.log('✅ Connected to backend');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'MINE_DETECTED') {
        console.log('🚨 Mine detection received from Arduino!');
        
        // Add next mine in sequence
        if (detectedMines.length < mineLocations.length) {
          const nextMine = mineLocations[detectedMines.length];
          setDetectedMines(prev => [...prev, {
            ...nextMine,
            timestamp: data.timestamp,
            method: 'Metal Detector (Arduino)'
          }]);
        } else {
          console.log('All mines already detected');
        }
      }
    };

    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('❌ Disconnected from backend');
    };

    // Cleanup on component unmount
    return () => {
      ws.close();
    };
  }, [detectedMines.length, mineLocations]);

  // Export detected mine locations to text file
  const exportMineLocationsText = () => {
    if (detectedMines.length === 0) {
      alert('No mines detected yet!');
      return;
    }

    // Prepare export data as formatted text
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

    // Create blob and download as .txt
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AMDV-Mine-Report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Success message
    alert(`Successfully exported ${detectedMines.length} mine location(s) to text file!`);
  };

  // Export detected mine locations to CSV file
  const exportMineLocationsCSV = () => {
    if (detectedMines.length === 0) {
      alert('No mines detected yet!');
      return;
    }

    // CSV Header
    let csvContent = 'Mine ID,Latitude,Longitude,Timestamp,Detection Method,Tile\n';

    // CSV Data Rows
    detectedMines.forEach((mine, index) => {
      const timestamp = mine.timestamp ? new Date(mine.timestamp).toLocaleString() : 'N/A';
      const method = mine.method || 'Metal Detector';
      const tile = mine.tile || 'N/A';
      
      csvContent += `${index + 1},${mine.lat.toFixed(8)},${mine.lon.toFixed(8)},"${timestamp}","${method}",${tile}\n`;
    });

    // Create blob and download as .csv
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AMDV-Mine-Locations-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Success message
    alert(`Successfully exported ${detectedMines.length} mine location(s) to CSV file!`);
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/satellite-v9"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        {/* Terrain overlay */}
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

        {/* Show mine locations when toggle is ON */}
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

        {/* Detected mines (red markers) */}
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

      {/* Toggle Button */}
      <button
        onClick={() => setShowMines(!showMines)}
        style={{
          position: 'absolute',
          top: '20px',
          left: '10px',
          zIndex: 1,
          backgroundColor: showMines ? '#ff9800' : '#4CAF50',
          color: 'white',
          border: 'none',
          padding: '12px 20px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          fontFamily: 'Arial, sans-serif'
        }}
      >
        {showMines ? '🔒 Hide Mine Locations' : '🗺️ Show Mine Locations'}
      </button>

      {/* Simulate Detection Button */}
      <button
        onClick={() => {
          if (detectedMines.length < mineLocations.length) {
            const nextMine = mineLocations[detectedMines.length];
            setDetectedMines([...detectedMines, {
              ...nextMine,
              timestamp: new Date().toISOString(),
              method: 'Metal Detector (Simulated)'
            }]);
          } else {
            alert('All mines have been detected!');
          }
        }}
        style={{
          position: 'absolute',
          top: '80px',
          left: '10px',
          zIndex: 1,
          backgroundColor: '#FF9800',
          color: 'white',
          border: 'none',
          padding: '12px 20px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          fontFamily: 'Arial, sans-serif'
        }}
      >
        🎯 Simulate Detection
      </button>

      {/* Info Panel */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        backgroundColor: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        fontSize: '12px',
        fontFamily: 'monospace'
      }}>
        <div><strong>Location:</strong></div>
        <div>Sagaing Region, Myanmar</div>
        <div style={{ marginTop: '10px' }}><strong>Demo Scale:</strong></div>
        <div>Physical: 4ft × 6ft</div>
        <div>Represents: 30m × 45m</div>
        <div style={{ marginTop: '10px' }}><strong>Status:</strong></div>
        <div>Total Mines: {mineLocations.length}</div>
        <div>Detected: {detectedMines.length}</div>
        <div style={{ fontSize: '10px', marginTop: '8px', opacity: 0.8 }}>
          Tile Grid: 3×2 (4ft × 6ft)
        </div>
        
        {/* Export as Text Button */}
        <button
          onClick={exportMineLocationsText}
          style={{
            marginTop: '15px',
            width: '100%',
            padding: '10px',
            backgroundColor: detectedMines.length > 0 ? '#4CAF50' : '#666',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: detectedMines.length > 0 ? 'pointer' : 'not-allowed',
            fontFamily: 'Arial, sans-serif',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            if (detectedMines.length > 0) {
              e.target.style.backgroundColor = '#45a049';
              e.target.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            if (detectedMines.length > 0) {
              e.target.style.backgroundColor = '#4CAF50';
              e.target.style.transform = 'translateY(0)';
            }
          }}
          disabled={detectedMines.length === 0}
        >
          📄 Export as Text
        </button>

        {/* Export as CSV Button */}
        <button
          onClick={exportMineLocationsCSV}
          style={{
            marginTop: '10px',
            width: '100%',
            padding: '10px',
            backgroundColor: detectedMines.length > 0 ? '#2196F3' : '#666',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: detectedMines.length > 0 ? 'pointer' : 'not-allowed',
            fontFamily: 'Arial, sans-serif',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            if (detectedMines.length > 0) {
              e.target.style.backgroundColor = '#1976D2';
              e.target.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            if (detectedMines.length > 0) {
              e.target.style.backgroundColor = '#2196F3';
              e.target.style.transform = 'translateY(0)';
            }
          }}
          disabled={detectedMines.length === 0}
        >
          📊 Export as CSV
        </button>
      </div>
    </div>
  );
}

export default MapComponent;
