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

// Custom car icon
const carIcon = new L.Icon({
  iconUrl:
    "https://banner2.cleanpng.com/20231220/whs/transparent-cartoon-red-car-white-rims-front-facing-car-missin-red-car-with-white-rims-missing-rear-view-1710963764469.webp",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

// Custom start and end marker icons (e.g., flag markers)
const startIcon = new L.Icon({
  iconUrl: "https://media.istockphoto.com/id/1308342065/vector/folded-location-map-with-marker-city-map-with-pin-pointer-gps-navigation-map-with-city.jpg?s=612x612&w=0&k=20&c=E9DP4dIwSdwaveNwcYU2LzBeKuBoKLa7nsTxTWDHObw=", // Flag icon for start
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const endIcon = new L.Icon({
  iconUrl: "https://media.istockphoto.com/id/1308342065/vector/folded-location-map-with-marker-city-map-with-pin-pointer-gps-navigation-map-with-city.jpg?s=612x612&w=0&k=20&c=E9DP4dIwSdwaveNwcYU2LzBeKuBoKLa7nsTxTWDHObw=", // Flag icon for end
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Smooth movement helper
const lerp = (start, end, t) => start + (end - start) * t;

// Helper component to animate map panning
const SmoothMarker = ({ position, icon, popupContent }) => {
  const map = useMap();
  const markerRef = useRef(null);
  const [currentPos, setCurrentPos] = useState(position);

  useEffect(() => {
    let animationFrame;
    let startTime;
    const duration = 2000; // Duration of animation in ms
    const startPos = currentPos;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const t = Math.min(elapsed / duration, 1); // Normalize time
      const newPos = [
        lerp(startPos[0], position[0], t),
        lerp(startPos[1], position[1], t),
      ];
      setCurrentPos(newPos);

      if (t < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        cancelAnimationFrame(animationFrame);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [position]);

  useEffect(() => {
    map.panTo(currentPos, { animate: true, duration: 2 });
  }, [currentPos, map]);

  return (
    <Marker position={currentPos} icon={icon} ref={markerRef}>
      <Popup>{popupContent}</Popup>
    </Marker>
  );
};

const MapComponent = () => {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      axios
        .get("http://localhost:5000/api/positions") // Replace with your API endpoint
        .then((response) => {
          setVehicles(response.data);
        })
        .catch((error) => console.error("Error fetching vehicle data:", error));
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <MapContainer
      center={[22.5405, 88.3375]} // Initial center
      zoom={14}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {vehicles.map((vehicle) => (
        <React.Fragment key={vehicle.id}>
          {/* Starting point marker */}
          {vehicle.route && vehicle.route.length > 0 && (
            <SmoothMarker
              position={[
                vehicle.route[0].latitude,
                vehicle.route[0].longitude,
              ]}
              icon={startIcon} // Start flag icon
              popupContent={<p><strong>Start Point</strong></p>}
            />
          )}

          {/* Ending point marker */}
          {vehicle.route && vehicle.route.length > 1 && (
            <SmoothMarker
              position={[
                vehicle.route[vehicle.route.length - 1].latitude,
                vehicle.route[vehicle.route.length - 1].longitude,
              ]}
              icon={endIcon} // End flag icon
              popupContent={<p><strong>End Point</strong></p>}
            />
          )}

          {/* Smooth marker for the vehicle */}
          <SmoothMarker
            position={[vehicle.current.latitude, vehicle.current.longitude]}
            icon={carIcon}
            popupContent={
              <>
                <p>
                  <strong>Vehicle ID:</strong> {vehicle.id}
                </p>
                <p>
                  <strong>Speed:</strong> {vehicle.speed} km/h
                </p>
              </>
            }
          />

          {/* Route line for the vehicle */}
          <Polyline
            positions={vehicle.route.map((point) => [
              point.latitude,
              point.longitude,
            ])}
            color="blue"
            weight={3}
            opacity={0.7}
          />
        </React.Fragment>
      ))}
    </MapContainer>
  );
};

export default MapComponent;
