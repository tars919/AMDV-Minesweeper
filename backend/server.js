const express = require('express');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const WebSocket = require('ws');

const app = express();
const PORT = 3001;

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// Start HTTP server
const server = app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
});

// WebSocket server
const wss = new WebSocket.Server({ server });

let clients = [];

wss.on('connection', (ws) => {
  console.log('✅ Frontend connected via WebSocket');
  clients.push(ws);
  
  ws.on('close', () => {
    console.log('❌ Frontend disconnected');
    clients = clients.filter(client => client !== ws);
  });
});

// Broadcast to all connected clients
function broadcast(data) {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// Arduino Serial Connection
const ARDUINO_PORT = '/dev/cu.usbserial-130';

// 🆕 Detection cooldown to prevent spam
let lastDetectionTime = 0;
const DETECTION_COOLDOWN = 3000; // 3 seconds between detections

let arduinoPort;

try {
  arduinoPort = new SerialPort({
    path: ARDUINO_PORT,
    baudRate: 9600
  });

  const parser = arduinoPort.pipe(new ReadlineParser({ delimiter: '\n' }));

  arduinoPort.on('open', () => {
    console.log('✅ Arduino connected on', ARDUINO_PORT);
  });

  parser.on('data', (data) => {
    const message = data.trim();
    console.log('📡 Arduino:', message);

    // Check if line contains "METAL DETECTED"
    if (message.includes('METAL DETECTED')) {
      const currentTime = Date.now();
      
      // 🆕 Only send detection if cooldown period has passed
      if (currentTime - lastDetectionTime > DETECTION_COOLDOWN) {
        console.log('🚨 MINE DETECTED! Sending to frontend...');
        lastDetectionTime = currentTime;
        
        // Send detection event to frontend
        broadcast({
          type: 'MINE_DETECTED',
          timestamp: new Date().toISOString()
        });
      } else {
        console.log('⏱️  Detection ignored (cooldown active)');
      }
    }

    if (message === 'READY') {
      console.log('✅ Arduino is ready');
    }
  });

  arduinoPort.on('error', (err) => {
    console.error('❌ Arduino error:', err.message);
  });

} catch (err) {
  console.error('❌ Could not connect to Arduino:', err.message);
  console.log('💡 Make sure Arduino is plugged in and update ARDUINO_PORT in server.js');
}

// Health check endpoint
app.get('/status', (req, res) => {
  res.json({
    status: 'running',
    arduino: arduinoPort ? 'connected' : 'disconnected',
    clients: clients.length
  });
});

console.log('🎯 Waiting for Arduino and frontend connections...');