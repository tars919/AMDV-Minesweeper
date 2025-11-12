import React, { useState } from 'react';
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

  
  // Your terrain dimensions: 298px wide × 444px tall
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
  const xNorm = (pixelX / 300) - 0.5;  // Changed from 298 to 300
  const yNorm = (pixelY / 445) - 0.5;  // Changed from 444 to 445
  
  // Convert to meters
  const xMeters = xNorm * terrainWidthMeters;
  const yMeters = -yNorm * terrainHeightMeters; // Negative because image Y goes down, map Y goes up
  
  // Apply rotation
  const xRotated = xMeters * cos - yMeters * sin;
  const yRotated = xMeters * sin + yMeters * cos;
  
  // Convert to GPS
  const lon = terrainCenter.longitude + (xRotated * metersToDegreesLon);
  const lat = terrainCenter.latitude + (yRotated * metersToDegreesLat);
  
  return { lat, lon };
};

  // Mine locations based on your pixel coordinates
  // Total terrain: 300px wide × 445px tall
  const mineLocations = [
    { ...pixelToGPS(226, 74), id: 1, tile: 1, name: 'Mine 1' },
    { ...pixelToGPS(168, 210), id: 2, tile: 2, name: 'Mine 2' },
    { ...pixelToGPS(202, 360), id: 3, tile: 3, name: 'Mine 3' },  // 300 - 96 = 204 (adjusted from right edge)
    { ...pixelToGPS(80, 233), id: 4, tile: 5, name: 'Mine 4' },
    { ...pixelToGPS(127, 326), id: 5, tile: 6, name: 'Mine 5' }
  ];

  return (
    <div style={{ width: '100%', height: '100vh' }}>
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
          top: '80px',
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
      </div>
    </div>
  );
}

export default MapComponent;