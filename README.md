# AMDV - Autonomous Mine Detection Vehicle

**Team MineSweeper | Northeastern University Senior Capstone Project**

A low-cost, remote-controlled vehicle system for detecting and mapping landmines using dual detection methods (magnetic coil and AI computer vision), real-time GPS mapping, and SLAM navigation.

---

## 🎯 Project Overview

The AMDV addresses the global landmine crisis by providing a safer, more affordable alternative to traditional mine clearance methods. Our system costs approximately $714 compared to millions for traditional approaches, making humanitarian mine detection accessible to affected regions worldwide.

### Target Application
Our demonstration simulates terrain in **Sagaing Region, Myanmar**, which accounts for 35% of the country's landmine casualties. This area has extensive contamination in rural agricultural lands where civilians work and live.

---

## 🚀 Current Progress

### ✅ Completed Components

#### **1. Interactive Mapping Dashboard**
- Real-time web-based interface using React + Mapbox GL
- Satellite view centered on Sagaing Region, Myanmar
- Custom terrain overlay representing 4ft × 6ft physical demo (scaled to 30m × 45m real-world area)
- Pre-mapped mine locations with toggle visibility
- Real-time detection marker system
- Responsive UI with terrain statistics panel

#### **2. Demo Terrain Design**
- 6-tile modular terrain (3 tiles wide × 2 tiles tall)
- Physical dimensions: 4 feet × 6 feet
- 5 pre-marked mine locations for detection testing
- Obstacles and features for SLAM navigation testing
- Coordinate mapping system (300px × 445px virtual → GPS coordinates)

#### **3. System Architecture**
- **Frontend**: React.js with Mapbox GL for mapping interface
- **Hardware Components Specified**:
  - Traxxas RC vehicle chassis (4×4 AWD)
  - NVIDIA Jetson Nano (AI/SLAM processing)
  - Arduino Uno (sensor integration)
  - Custom LC oscillator metal detector coil
  - Stereo cameras for SLAM
  - GPS module for positioning
  - IMU for navigation
- **Target Weight**: < 2kg (below typical mine trigger threshold)

---

## 📋 System Architecture
```
┌─────────────────────────────────────────────────────┐
│                   Web Dashboard                      │
│          (React + Mapbox - Real-time UI)            │
└────────────────┬────────────────────────────────────┘
                 │ WebSocket
                 ↓
┌─────────────────────────────────────────────────────┐
│              Backend Server (Node.js)                │
│         (Detection logging & data routing)           │
└────────────────┬────────────────────────────────────┘
                 │ Serial/GPIO
                 ↓
┌─────────────────────────────────────────────────────┐
│            Jetson Nano (ROS Core)                   │
│  • SLAM (RTAB-Map)                                  │
│  • GPS coordinate processing                         │
│  • Metal detector signal monitoring                  │
└─────────┬──────────────────────┬────────────────────┘
          │                      │
    ┌─────▼──────┐        ┌─────▼──────────┐
    │  Arduino   │        │ Stereo Cameras │
    │  (Sensors) │        │     + IMU      │
    └─────┬──────┘        └────────────────┘
          │
    ┌─────▼──────────┐
    │ Metal Detector │
    │   + GPS Module │
    └────────────────┘
```

---

## 🗺️ Dashboard Features

### Mine Detection Visualization
- **Yellow markers**: Pre-marked mine locations (toggle on/off)
- **Red markers**: Real-time detected mines during operation
- **Info panel**: Displays detection statistics and terrain metadata

### Terrain Representation
- **Physical scale**: 4ft × 6ft modular tile system
- **Virtual scale**: Represents 30m × 45m real-world minefield
- **Coordinate precision**: GPS-mapped with 19° rotation compensation
- **Location context**: Embedded in actual Myanmar satellite imagery

---

## 🛠️ Technology Stack

### Software
- **Frontend**: React.js, Mapbox GL JS
- **Backend**: Node.js, WebSocket
- **Robotics**: ROS 2, RTAB-Map (SLAM)
- **Languages**: JavaScript, C++ (ROS), Arduino (C)

### Hardware
| Component | Model/Type | Purpose |
|-----------|------------|---------|
| Chassis | Traxxas 4×4 AWD RC | Vehicle platform |
| Main Computer | NVIDIA Jetson Nano | AI processing, SLAM |
| Microcontroller | Arduino Uno | Sensor integration |
| Metal Detector | Custom LC oscillator (4.2" coil) | Mine detection |
| Cameras | Stereo camera pair | SLAM navigation |
| GPS | GPS module | Position tracking |
| IMU | 9-DOF sensor | Odometry |
| Battery | 7.4V LiPo (750mAh+) | Power system |

**Total Project Cost**: ~$714

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Mapbox API key (free tier available)

### Frontend Setup
```bash
# Clone repository
git clone https://github.com/your-username/amdv-dashboard.git
cd amdv-dashboard/frontend

# Install dependencies
npm install

# Add your Mapbox token to src/Map.js
# const MAPBOX_TOKEN = 'your_token_here';

# Start development server
npm start
```

The dashboard will open at `http://localhost:3000`

---

## 🎮 Usage

### Dashboard Controls
1. **Show/Hide Mine Locations**: Toggle button (top-left) reveals pre-marked mine positions
2. **Map Navigation**: Click and drag to pan, scroll to zoom
3. **Info Panel**: View terrain stats and detection count (bottom-right)

### Demo Terrain Setup
```
Tile Layout (Top view):
[Tile 4] [Tile 1]
[Tile 5] [Tile 2]
[Tile 6] [Tile 3]

Mine Locations:
- Mine 1: Tile 1 (226px, 74px from top-left)
- Mine 2: Tile 2 (168px, 210px from top-left)
- Mine 3: Tile 3 (202px, 360px from top-left)
- Mine 4: Tile 5 (80px, 233px from top-left)
- Mine 5: Tile 6 (127px, 326px from top-left)
```

---

## 🚧 In Progress

### Hardware Integration
- [ ] Metal detector circuit assembly and testing
- [ ] RC vehicle motor control via Arduino
- [ ] Power distribution system
- [ ] Sensor mounting brackets (3D printing)

### Software Development
- [ ] Backend WebSocket server
- [ ] ROS 2 nodes for sensor fusion
- [ ] RTAB-Map SLAM configuration
- [ ] Video feed streaming to dashboard
- [ ] Real-time detection pipeline

### Physical Demo
- [ ] Terrain construction (modular tiles)
- [ ] Obstacle placement for SLAM
- [ ] Washer burial for mine simulation
- [ ] Full system testing

---

## 📊 Project Impact

### Problem Statement
- **58 countries** contaminated by landmines (2023)
- **~6,000 casualties** annually
- **81% civilian victims** (including 2,141 children)
- Current solutions are expensive, slow, or risk human lives

### Our Solution Benefits
- **Cost**: $714 vs. millions for traditional methods
- **Safety**: Zero human operators in danger zone
- **Efficiency**: Autonomous navigation + dual detection
- **Scalability**: Open-source, reproducible design
- **Accessibility**: Affordable for affected nations

---

## 👥 Team MineSweeper

**Northeastern University - Department of Electrical and Computer Engineering**

- Edwin Yang
- Ronan Hinshaw
- Tarika Selvaraj
- Woobens Fleurime
- Luke Sanders
- Akshaj Sirineni

**Advisor**: Professor Sarah Ostadabbas  
**Mentor**: Xiangyu Bai

---

## 📅 Timeline

- **Summer 2024**: Concept development and proposal
- **Fall 2024**: Hardware selection and software architecture
- **November 2024**: Dashboard development and terrain design *(Current)*
- **December 2024**: Hardware integration and system testing
- **December 2024**: Final presentation and demonstration

---

## 📄 License

This project is developed for educational purposes as part of Northeastern University's Senior Capstone program.

---

## 🔗 Resources

- [Project Proposal](docs/proposal.pdf)
- [Mapbox Documentation](https://docs.mapbox.com/)
- [ROS 2 Documentation](https://docs.ros.org/)
- [RTAB-Map](http://introlab.github.io/rtabmap/)

---

## 📧 Contact

For questions or collaboration opportunities, please contact the team through Northeastern University's ECE department.

---

**Status**: 🟡 Active Development | 📍 Milestone: Dashboard Complete
