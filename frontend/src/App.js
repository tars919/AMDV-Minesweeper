import React from 'react';
import MapComponent from './Map';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1 style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 1,
        color: 'white',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: '15px 20px',
        borderRadius: '8px',
        margin: 0,
        fontFamily: 'Arial, sans-serif'
      }}>
        AMDV Mine Detection Dashboard
      </h1>
      <MapComponent />
    </div>
  );
}

export default App;