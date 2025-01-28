import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const carIcon = new L.Icon({
  iconUrl:
    "https://banner2.cleanpng.com/20231220/whs/transparent-cartoon-red-car-white-rims-front-facing-car-missin-red-car-with-white-rims-missing-rear-view-1710963764469.webp",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

// Custom start and end marker icons
const startIcon = new L.Icon({
  iconUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Flag_map_marker.svg/120px-Flag_map_marker.svg.png", // Flag icon for start
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const endIcon = new L.Icon({
  iconUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Red_flag_map_marker.svg/120px-Red_flag_map_marker.svg.png", // Flag icon for end
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Smooth movement helper
const lerp = (start, end, t) => start + (end - start) * t;

// Helper component to animate map panning
const SmoothMarker = ({ position, icon, popupContent, onClick, animate }) => {
  const map = useMap();
  const markerRef = useRef(null);
  const [currentPos, setCurrentPos] = useState(position);

  useEffect(() => {
    if (!animate) return; 
    let animationFrame;
    let startTime;
    const duration = 2000;
    const startPos = currentPos;

    const animateMovement = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const t = Math.min(elapsed / duration, 1);
      const newPos = [
        lerp(startPos[0], position[0], t),
        lerp(startPos[1], position[1], t),
      ];
      setCurrentPos(newPos);

      if (t < 1) {
        animationFrame = requestAnimationFrame(animateMovement);
      } else {
        cancelAnimationFrame(animationFrame);
      }
    };

    animationFrame = requestAnimationFrame(animateMovement);
    return () => cancelAnimationFrame(animationFrame);
  }, [position, animate]);

  useEffect(() => {
    map.panTo(currentPos, { animate: true, duration: 2 });
  }, [currentPos, map]);

  return (
    <Marker position={currentPos} icon={icon} ref={markerRef} eventHandlers={{ click: onClick }}>
      <Popup>{popupContent}</Popup>
    </Marker>
  );
};

const MapComponent = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showRouteHistory, setShowRouteHistory] = useState(false);
  const [animateCar, setAnimateCar] = useState(false);
  const [selectedDate, setSelectedDate] = useState("today"); 

  useEffect(() => {
    const interval = setInterval(() => {
      axios
        .get("https://vehicle-movement-backend-xzuu.onrender.com/api/positions")
        .then((response) => {
          setVehicles(response.data);
        })
        .catch((error) => console.error("Error fetching vehicle data:", error));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Handle when a car marker is clicked
  const handleMarkerClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowRouteHistory(false); // Hide route history when showing vehicle details
    setAnimateCar(false); // Stop animation when a vehicle is clicked
  };

  // Handle date selection (Today, Tomorrow, etc.)
  const handleDateChange = (date) => {
    setSelectedDate(date);
    // Logic to fetch or update vehicle data based on selected date
    setAnimateCar(true); // Start car animation when date is selected
  };

  // Toggle route history visibility
  const handleToggleRouteHistory = () => {
    setShowRouteHistory(!showRouteHistory);
  };

  return (
    <div>
      <div className="header">
        <button onClick={() => handleDateChange("today")}>Today</button>
        <button onClick={() => handleDateChange("tomorrow")}>Tomorrow</button>
      </div>

      <MapContainer
        center={[22.5405, 88.3375]}
        zoom={14}
        style={{ height: "100vh", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {vehicles.map((vehicle) => (
          <React.Fragment key={vehicle.id}>
            <SmoothMarker
              position={[vehicle.current.latitude, vehicle.current.longitude]}
              icon={carIcon}
              onClick={() => handleMarkerClick(vehicle)}
              popupContent={
                <>
                  <p><strong>Vehicle ID:</strong> {vehicle.id}</p>
                  <p><strong>Speed:</strong> {vehicle.speed} km/h</p>
                </>
              }
              animate={animateCar} 
            />

            {/* Display route history if toggled */}
            {showRouteHistory && vehicle.route && vehicle.route.length > 1 && (
              <Polyline
                positions={vehicle.route.map((point) => [
                  point.latitude,
                  point.longitude,
                ])}
                color="blue"
                weight={3}
                opacity={0.7}
              />
            )}
          </React.Fragment>
        ))}
      </MapContainer>

      {selectedVehicle && (
        <div className="vehicle-details">
          <h3>Vehicle Details</h3>
          <p><strong>Vehicle ID:</strong> {selectedVehicle.id}</p>
          <p><strong>Speed:</strong> {selectedVehicle.speed} km/h</p>
          <p><strong>Current Location:</strong> Lat: {selectedVehicle.current.latitude}, Lng: {selectedVehicle.current.longitude}</p>
          <p><strong>Stops:</strong></p>
          {selectedVehicle.route && selectedVehicle.route.length > 0 ? (
            <ul>
              {selectedVehicle.route.map((stop, index) => (
                <li key={index}>
                  <p><strong>Stop:</strong> {stop.stop}</p>
                  <p><strong>Time:</strong> {new Date(stop.time).toLocaleString()}</p>
                  <p><strong>Coordinates:</strong> Lat: {stop.latitude}, Lng: {stop.longitude}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No route data available</p>
          )}
          <button onClick={handleToggleRouteHistory}>
            {showRouteHistory ? "Hide Route History" : "Show Route History"}
          </button>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
