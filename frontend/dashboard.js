import React, { useState, useRef, useEffect, useMemo } from 'react';
import MapComponent from './Map';
import CriticalInfoBar from './CriticalInfoBar';
import GPSCoordinates from './GPSCoordinates';
import LiveIndicator from './LiveIndicator';
import './Dashboard.css';

function Dashboard() {
  const [mode, setMode] = useState('manual');
  const [streamError, setStreamError] = useState(false);
  const [pressedKeys, setPressedKeys] = useState(new Set());
  const [detectedCount, setDetectedCount] = useState(0);
  const [totalMines, setTotalMines] = useState(5);
  const [autonomousRunning, setAutonomousRunning] = useState(false);
  const videoRef = useRef(null);
  const mapRef = useRef(null);

  const JETSON_BASE_URL = 'http://192.168.137.245:5000';
  const CAMERA_STREAM_URL = `${JETSON_BASE_URL}/video_feed`;

  const ALLOWED_KEYS = useMemo(() => new Set(['w', 'W', 'a', 's', 'd', 'x', 'c', 'p', 'o']), []);

  const isDirectionPressed = (direction) => {
    const keyMap = {
      'up': ['w', 'W'],
      'down': ['s'],
      'left': ['a'],
      'right': ['d']
    };
    return keyMap[direction]?.some(key => pressedKeys.has(key)) || false;
  };

  const isAutonomousPressed = () => {
    if (autonomousRunning) return pressedKeys.has('o');
    return pressedKeys.has('p');
  };

  const sendCommand = async (eventType, key) => {
    try {
      const response = await fetch(`${JETSON_BASE_URL}/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: eventType,
          key: key
        })
      });

      if (!response.ok) {
        console.error('Command failed:', response.statusText);
      } else {
        const data = await response.json();
        console.log('Command sent successfully:', data);
      }
    } catch (error) {
      console.error('Error sending command:', error);
    }
  };

  useEffect(() => {
    const updateCounts = setInterval(() => {
      if (mapRef.current) {
        const detected = mapRef.current.getDetectedCount?.() || 0;
        const total = mapRef.current.getTotalCount?.() || 5;
        setDetectedCount(detected);
        setTotalMines(total);
      }
    }, 500);

    return () => clearInterval(updateCounts);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key;
      if (!ALLOWED_KEYS.has(key)) return;
      e.preventDefault();
      if (pressedKeys.has(key)) return;
      
      if (mode === 'auto') {
        if (key === 'p' && !autonomousRunning) {
          setAutonomousRunning(true);
          setPressedKeys(prev => new Set([...prev, key]));
          sendCommand('down', key);
          setTimeout(() => {
            sendCommand('up', key);
            setPressedKeys(prev => {
              const newSet = new Set(prev);
              newSet.delete(key);
              return newSet;
            });
          }, 200);
          return;
        } else if (key === 'o' && autonomousRunning) {
          setAutonomousRunning(false);
          setPressedKeys(prev => new Set([...prev, key]));
          sendCommand('down', key);
          setTimeout(() => {
            sendCommand('up', key);
            setPressedKeys(prev => {
              const newSet = new Set(prev);
              newSet.delete(key);
              return newSet;
            });
          }, 200);
          return;
        }
      }
      
      if (mode !== 'manual') return;
      
      setPressedKeys(prev => new Set([...prev, key]));
      sendCommand('down', key);
      console.log('Key pressed:', key);
    };

    const handleKeyUp = (e) => {
      const key = e.key;
      if (!ALLOWED_KEYS.has(key)) return;
      e.preventDefault();
      if (!pressedKeys.has(key)) return;
      
      if (mode !== 'manual') return;
      
      setPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
      
      sendCommand('up', key);
      console.log('Key released:', key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [mode, pressedKeys, ALLOWED_KEYS, autonomousRunning]);

  const handleJoystickClick = (direction) => {
    const keyMap = {
      'up': 'w',
      'down': 's',
      'left': 'a',
      'right': 'd'
    };

    const key = keyMap[direction];
    console.log('Joystick clicked:', direction, '→', key);
    
    sendCommand('down', key);
    setPressedKeys(prev => new Set([...prev, key]));

    setTimeout(() => {
      sendCommand('up', key);
      setPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }, 200);
  };

  const handleAutonomousToggle = () => {
    const key = autonomousRunning ? 'o' : 'p';
    const action = autonomousRunning ? 'stop' : 'start';
    console.log('Autonomous toggle clicked:', action, '→', key);
    
    sendCommand('down', key);
    setPressedKeys(prev => new Set([...prev, key]));

    setAutonomousRunning(!autonomousRunning);

    setTimeout(() => {
      sendCommand('up', key);
      setPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }, 200);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Mine Detection Dashboard</h1>
        <GPSCoordinates />
        <CriticalInfoBar />
      </div>

      <div className="dashboard-panels">
        <div className="map-panel">
          <MapComponent ref={mapRef} />
        </div>

        <div className="video-panel">
          <div className="control-buttons">
            <button 
              className="control-btn green"
              onClick={() => mapRef.current?.toggleShowMines()}
            >
              📍 Show Mine Locations
            </button>
            <button 
              className="control-btn orange"
              onClick={() => mapRef.current?.simulateDetection()}
            >
              ⚡ Simulate Detection
            </button>

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
          </div>

          <div className="video-container">
            {!streamError && <LiveIndicator />}
            
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <img
                ref={videoRef}
                src={CAMERA_STREAM_URL}
                alt="Stereo Camera Feed"
                className="video-feed"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  display: streamError ? 'none' : 'block'
                }}
                onError={() => {
                  console.error('Failed to load camera stream');
                  setStreamError(true);
                }}
                onLoad={() => {
                  console.log('Camera stream loaded successfully');
                  setStreamError(false);
                }}
              />

              {mode === 'manual' && pressedKeys.size > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  background: 'rgba(0, 0, 0, 0.7)',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  zIndex: 5,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  fontWeight: '600',
                  letterSpacing: '0.5px'
                }}>
                  {Array.from(pressedKeys).join(', ').toUpperCase()}
                </div>
              )}
              
              {streamError && (
                <div className="stream-error">
                  <p style={{ fontSize: '18px', marginBottom: '10px' }}>⚠️ Camera Stream Unavailable</p>
                  <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '5px' }}>
                    Check Jetson connection at:
                  </p>
                  <p style={{ fontSize: '12px', opacity: 0.5, marginBottom: '15px' }}>
                    {CAMERA_STREAM_URL}
                  </p>
                  <button 
                    onClick={() => {
                      setStreamError(false);
                      if (videoRef.current) {
                        videoRef.current.src = CAMERA_STREAM_URL + '?t=' + new Date().getTime();
                      }
                    }}
                  >
                    🔄 Retry Connection
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="status-info-bar">
            <div className="status-section">
              <div className="status-label">Location:</div>
              <div className="status-value">Sagaing Region, Myanmar</div>
              <div className="status-label" style={{ marginTop: '8px' }}>Demo Scale:</div>
              <div className="status-value">
                Physical: 4ft × 6ft | Represents: 30m × 45m
              </div>
            </div>
            
            <div className="status-section">
              <div className="status-label">Status:</div>
              <div className="status-value">
                <span className="status-highlight">Total Mines: {totalMines}</span>
              </div>
              <div className="status-value">
                <span className="status-danger">Detected: {detectedCount}</span>
              </div>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                Tile Grid: 3×2 (4ft × 6ft)
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="export-button"
                  onClick={() => mapRef.current?.exportAsText()}
                >
                  📄 TXT
                </button>
                <button 
                  className="export-button" 
                  style={{ background: '#0066cc' }}
                  onClick={() => mapRef.current?.exportAsCSV()}
                >
                  📊 CSV
                </button>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="export-button" 
                  style={{ background: '#c88614ff' }}
                  onClick={() => mapRef.current?.exportAsXLSX()}
                >
                  📗 XLSX
                </button>
                <button 
                  className="export-button" 
                  style={{ background: '#9c27b0' }}
                  onClick={() => mapRef.current?.exportAsSHP()}
                >
                  🗺️ SHP
                </button>
              </div>
            </div>
          </div>

          {mode === 'manual' && (
            <div className="joystick-container">
              <div className="joystick">
                <button 
                  className={`joystick-btn up ${isDirectionPressed('up') ? 'active' : ''}`}
                  onClick={() => handleJoystickClick('up')}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  ▲
                </button>
                
                <div className="joystick-middle">
                  <button 
                    className={`joystick-btn left ${isDirectionPressed('left') ? 'active' : ''}`}
                    onClick={() => handleJoystickClick('left')}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    ◄
                  </button>
                  <div className="joystick-center"></div>
                  <button 
                    className={`joystick-btn right ${isDirectionPressed('right') ? 'active' : ''}`}
                    onClick={() => handleJoystickClick('right')}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    ►
                  </button>
                </div>
                
                <button 
                  className={`joystick-btn down ${isDirectionPressed('down') ? 'active' : ''}`}
                  onClick={() => handleJoystickClick('down')}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  ▼
                </button>
              </div>
            </div>
          )}

          {mode === 'auto' && (
            <div className="autonomous-controls">
              <button 
                className={`auto-btn-toggle ${autonomousRunning ? 'stop' : 'start'} ${isAutonomousPressed() ? 'active' : ''}`}
                onClick={handleAutonomousToggle}
                onMouseDown={(e) => e.preventDefault()}
              >
                {autonomousRunning ? (
                  <>■ STOP</>
                ) : (
                  <>▶ START</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;