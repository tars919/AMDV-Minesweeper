import React, { useState, useEffect } from 'react';

const GPSCoordinates = () => {
  const [coordinates, setCoordinates] = useState({
    latitude: 21.798,
    longitude: 95.2055
  });

  useEffect(() => {
    const ws = new WebSocket('ws://192.168.137.225:5000/ws');

    ws.onopen = () => {
      console.log('GPS: Connected to Jetson');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'GPS_UPDATE') {
          setCoordinates({
            latitude: data.latitude,
            longitude: data.longitude
          });
        }
      } catch (error) {
        console.error('GPS: Error parsing message', error);
      }
    };

    ws.onerror = (error) => {
      console.error('GPS: WebSocket error', error);
    };

    ws.onclose = () => {
      console.log('GPS: Disconnected from Jetson');
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="gps-info-bar">
      <div className="info-module">
        <div className="info-label">GPS Position</div>
        <div className="info-value-container">
          <span className="gps-value">
            {coordinates.latitude.toFixed(4)}°N<br/>
            {coordinates.longitude.toFixed(4)}°E
          </span>
          <div className="gps-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" fill="currentColor"/>
              <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" opacity="0.4"/>
              <path d="M12 2L12 6M12 18L12 22M2 12L6 12M18 12L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GPSCoordinates;