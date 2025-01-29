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

// Car icon
const carIcon = new L.Icon({
  iconUrl:
    "https://banner2.cleanpng.com/20231220/whs/transparent-cartoon-red-car-white-rims-front-facing-car-missin-red-car-with-white-rims-missing-rear-view-1710963764469.webp",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

// Smooth movement helper
const lerp = (start, end, t) => start + (end - start) * t;

// Animated Marker Component with Pause & Resume
const SmoothMarker = ({ position, icon, popupContent, onClick, animate }) => {
  const map = useMap();
  const markerRef = useRef(null);
  const [currentPos, setCurrentPos] = useState(position);

  useEffect(() => {
    if (!animate) return; // If paused, don't move

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
  const [selectedDate, setSelectedDate] = useState("today");
  const [pausedVehicles, setPausedVehicles] = useState({}); // Store paused state

  useEffect(() => {
    const fetchVehicles = () => {
      axios
        .get("https://vehicle-movement-backend-xzuu.onrender.com/api/positions")
        .then((response) => {
          setVehicles(response.data);
        })
        .catch((error) => console.error("Error fetching vehicle data:", error));
    };

    fetchVehicles();
    const interval = setInterval(fetchVehicles, 2000);
    return () => clearInterval(interval);
  }, []);

  // Handle when a car marker is clicked (Toggle Pause/Resume)
  const handleMarkerClick = (vehicle) => {
    setPausedVehicles((prev) => ({
      ...prev,
      [vehicle.id]: !prev[vehicle.id], // Toggle pause state
    }));
    setSelectedVehicle((prev) => (prev?.id === vehicle.id ? null : vehicle));
  };

  // Handle date selection (Today, Tomorrow, etc.)
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedVehicle(null); 
    setPausedVehicles({}); 
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
            {/* Moving Car Marker (Pauses when clicked) */}
            <SmoothMarker
              position={[vehicle.current.latitude, vehicle.current.longitude]}
              icon={carIcon}
              onClick={() => handleMarkerClick(vehicle)}
              popupContent={
                <>
                  <p><strong>Vehicle ID:</strong> {vehicle.id}</p>
                  <p><strong>Speed:</strong> {vehicle.speed} km/h</p>
                  <p><strong>Status:</strong> {pausedVehicles[vehicle.id] ? "Paused" : "Moving"}</p>
                </>
              }
              animate={!pausedVehicles[vehicle.id]} // Stop animation if paused
            />

            {/* Always Show Route */}
            {vehicle.route && vehicle.route.length > 1 && (
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

      {/* Vehicle Details Panel */}
      {selectedVehicle && (
        <div className="vehicle-details">
          <h3>Vehicle Details</h3>
          <p><strong>Vehicle ID:</strong> {selectedVehicle.id}</p>
          <p><strong>Speed:</strong> {selectedVehicle.speed} km/h</p>
          <p><strong>Current Location:</strong> Lat: {selectedVehicle.current.latitude}, Lng: {selectedVehicle.current.longitude}</p>
          <p><strong>Route Stops:</strong></p>
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
        </div>
      )}
    </div>
  );
};

export default MapComponent;
