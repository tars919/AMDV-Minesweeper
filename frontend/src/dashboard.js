import React, { useState } from 'react';
import MapComponent from './Map';
import './Dashboard.css';

function Dashboard() {
  const [mode, setMode] = useState('manual'); // 'manual' or 'auto'

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Mine Detection Dashboard</h1>
      </div>

      {/* Two Panel Layout */}
      <div className="dashboard-panels">
        {/* Left Panel - Map (45%) */}
        <div className="map-panel">
          <MapComponent />
        </div>

        {/* Right Panel - Video Feed (55%) */}
        <div className="video-panel">
          {/* Mode Toggle Buttons - Top Right */}
          <div className="mode-controls">
            <button
              className={`mode-button ${mode === 'manual' ? 'active' : ''}`}
              onClick={() => setMode('manual')}
            >
              Manual
            </button>
            <button
              className={`mode-button ${mode === 'auto' ? 'active' : ''}`}
              onClick={() => setMode('auto')}
            >
              Auto
            </button>
          </div>

          {/* Video Feed Area */}
          <div className="video-container">
            <div className="video-placeholder">
              {/* Placeholder for video - we'll add actual video later */}
              <p>Camera Feed</p>
              <p style={{ fontSize: '14px', opacity: 0.7 }}>
                {mode === 'manual' ? 'Manual Control Mode' : 'Autonomous Mode'}
              </p>
            </div>
          </div>

          {/* Joystick Control - Bottom Right */}
          <div className="joystick-container">
            <div className="joystick">
              {/* Up Arrow */}
              <button className="joystick-btn up">▲</button>
              
              {/* Left and Right Arrows */}
              <div className="joystick-middle">
                <button className="joystick-btn left">◄</button>
                <div className="joystick-center"></div>
                <button className="joystick-btn right">►</button>
              </div>
              
              {/* Down Arrow */}
              <button className="joystick-btn down">▼</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
