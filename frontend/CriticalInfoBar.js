import React, { useState, useEffect } from 'react';

const CriticalInfoBar = () => {
  const [battery, setBattery] = useState(87);
  const [coverage, setCoverage] = useState(2.4);
  const [timeRemaining, setTimeRemaining] = useState(45);
  const [signalStrength, setSignalStrength] = useState(4);

  useEffect(() => {
    // Simulate battery drain (0.1% every 5 seconds)
    const batteryInterval = setInterval(() => {
      setBattery(prev => {
        const newValue = Math.max(0, prev - 0.1);
        return Math.round(newValue * 10) / 10;
      });
    }, 5000);

    // Simulate signal fluctuation
    const signalInterval = setInterval(() => {
      setSignalStrength(Math.floor(Math.random() * 2) + 3); // 3 or 4 bars
    }, 3000);

    return () => {
      clearInterval(batteryInterval);
      clearInterval(signalInterval);
    };
  }, []);

  const getBatteryClass = () => {
    if (battery < 20) return 'battery-value critical';
    if (battery < 50) return 'battery-value warning';
    return 'battery-value';
  };

  return (
    <div className="critical-info-bar">
      {/* Battery Module */}
      <div className="info-module">
        <div className="info-label">Battery</div>
        <div className="info-value-container">
          <span className={getBatteryClass()}>
            {battery.toFixed(0)}%
          </span>
          <div className="battery-icon" style={{ color: battery < 20 ? '#ff4444' : battery < 50 ? '#ffaa00' : '#00ff88' }}>
            <div 
              className="battery-fill" 
              style={{ width: `${battery}%` }}
            />
          </div>
          <div className="signal-bars" style={{ color: battery < 20 ? '#ff4444' : battery < 50 ? '#ffaa00' : '#00ff88' }}>
            {[1, 2, 3, 4].map(bar => (
              <div 
                key={bar}
                className={`signal-bar ${bar <= signalStrength ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Coverage Range Module */}
      <div className="info-module">
        <div className="info-label">Coverage Range</div>
        <div className="info-value-container">
          <span className="range-value">
            {coverage.toFixed(1)}km
          </span>
          <div className="range-icon" style={{ color: '#4da6ff' }}>
            <div className="range-pulse" />
            <div className="range-beam" />
          </div>
        </div>
        <div className="info-secondary">
          ~{timeRemaining}min remaining
        </div>
      </div>
    </div>
  );
};

export default CriticalInfoBar;