import React from 'react';
import MapComponent from './components/MapComponent';
import './styles.css';

const App = () => {
    return (
        <div>
            <h1 className="header">Vehicle Movement Tracker</h1>
            <MapComponent />
        </div>
    );
};

export default App;
