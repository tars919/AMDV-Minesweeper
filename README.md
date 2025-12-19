# Autonomous Mine Detection Vehicle (AMDV)

> A humanitarian engineering solution for autonomous landmine detection and mapping, developed as part of Northeastern University's senior capstone program.

## Project Overview

The AMDV addresses the global landmine crisis through an affordable, autonomous detection system. With over 5,700 casualties annually (including 2,141 children), traditional mine clearing methods are prohibitively expensive ($500K-$2M per vehicle) and put human lives at risk. Our solution delivers comparable functionality at **$714** - a **700x cost reduction**.

### Key Features

- **Dual Detection Systems**: Magnetic coil + AI computer vision for redundant detection
- **Real-time Mapping**: Live GPS tracking with MapBox satellite overlay
- **Sub-500ms Latency**: Detection to dashboard visualization
- **Dual Operation Modes**: Manual control (W/A/S/D + joystick) and autonomous navigation
- **NGO-Ready Export**: Multiple formats (TXT, CSV, XLSX, SHP/GeoJSON) following International Mine Action Standards
- **SLAM Navigation**: Simultaneous Localization and Mapping for autonomous pathfinding

## Technical Architecture

### Hardware Stack
- **Platform**: Traxxas RC car chassis (4x4 AWD)
- **Processing**: NVIDIA Jetson Nano + Arduino Uno
- **Sensors**:
  - Custom-wound copper coil metal detector
  - Stereo cameras for computer vision
  - GPS module for location tracking
  - IMU for motion sensing
- **Power**: 7.4V LiPo battery with DC-DC buck converters

### Software Stack
- **Frontend**: React, MapBox GL JS, WebSocket
- **Backend**: Flask, Python 3.8+
- **Navigation**: ROS (Robot Operating System), RTAB-Map SLAM
- **Communication**: Real-time WebSocket for instant mine detection updates
- **Firmware**: Arduino C++ for hardware control

## Getting Started

### Prerequisites

```bash
# Python dependencies
python >= 3.8
flask
flask-cors
flask-socketio
pyserial

# Node.js dependencies
node >= 14.0
react >= 18.0
mapbox-gl >= 2.0
socket.io-client
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/tars919/AMDV.git
cd AMDV
```

2. **Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **Frontend Setup**
```bash
cd frontend
npm install
```

4. **Environment Configuration**
```bash
# Create .env file in frontend directory
REACT_APP_MAPBOX_TOKEN=your_mapbox_token_here
REACT_APP_BACKEND_URL=http://localhost:5000
```

### Running the Application

1. **Start Backend Server**
```bash
cd backend
python app.py
```

2. **Start Frontend Dashboard**
```bash
cd frontend
npm start
```

3. **Arduino Setup**
Upload the firmware from `/arduino/metal_detector.ino` to your Arduino Uno using Arduino IDE.

## System Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Arduino Uno   │──────│  Jetson Nano     │──────│  React Dashboard│
│ Metal Detector  │Serial│  Flask Backend   │WebSck│  MapBox + UI    │
└─────────────────┘      └──────────────────┘      └─────────────────┘
        │                         │                         │
        │                         │                         │
    ┌───▼───┐              ┌──────▼──────┐         ┌───────▼────────┐
    │ Coil  │              │ GPS + IMU   │         │ Live Camera    │
    │ Sensor│              │ SLAM System │         │ Mine Markers   │
    └───────┘              └─────────────┘         └────────────────┘
```



## Performance Metrics

| Metric | Target | Achieved |
|--------|--------|----------|
| Detection Latency | < 500ms | 350ms avg |
| GPS Accuracy | ± 2m | ± 1.5m |
| Cost | < $1000 | $714 |
| Demo Area Coverage | 4ft × 6ft | Complete |
| Operating Modes | 2 (manual + auto) | Both functional |

## Project Structure

```
AMDV/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── MapView.jsx
│   │   │   └── CameraFeed.jsx
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── backend/
│   ├── app.py
│   ├── serial_handler.py
│   └── requirements.txt
├── arduino/
│   └── metal_detector.ino
├── docs/
│   ├── proposal.pdf
│   └── technical_specs.md
└── README.md
```


## Impact & Applications

### Target Regions
- Myanmar's Sagaing Region
- War-affected areas globally with legacy landmine contamination

### Potential Use Cases
- Humanitarian demining operations
- NGO mine clearance support
- Search and rescue operations
- Hazardous terrain exploration

## Future Enhancements

- [ ] Machine learning model for improved mine classification
- [ ] Extended battery life for longer missions
- [ ] Multi-vehicle coordination for larger area coverage
- [ ] Integration with drone surveillance for preliminary scanning
- [ ] Weather-resistant housing for all-condition operation


## Acknowledgments

- International Mine Action Standards (IMAS) for clearance guidelines
- MapBox for mapping infrastructure
- NVIDIA for Jetson Nano platform
- Traxxas for RC chassis platform

## Contact
**Tarika Selvaraj**
- Email: selvaraj.t@northeastern.edu
