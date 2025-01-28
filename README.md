# 🚗 Real-Time Vehicle Tracking System

A real-time vehicle tracking system that displays live vehicle positions, speeds, routes, and stoppages on an interactive map. This project uses a **React frontend** with Leaflet for the map and a **Node.js/Express backend** to serve vehicle data.

---

## 📚 Table of Contents
1. [Features](#features)
2. [Demo](#demo)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Setup Instructions](#setup-instructions)
   - [Backend](#backend-setup)
   - [Frontend](#frontend-setup)
6. [API Documentation](#api-documentation)
7. [Screenshots](#screenshots)
8. [Future Improvements](#future-improvements)

---

## 🚀 Features
- Real-time vehicle tracking using an interactive map.
- Smooth marker animation for vehicle movement.
- Display detailed vehicle information, including:
  - Current speed.
  - Current location.
  - Route history with timestamps and stoppage details.
- Route history visualization with polylines.
- Filter vehicles by date (e.g., today, tomorrow).
- Toggle route history display.

---

## 🎥 Demo
[Live Demo](https://vehicle-movement-map-prajit96s-projects.vercel.app/)

---

## 🛠 Tech Stack
### Frontend
- **React**: JavaScript library for building the user interface.
- **React Leaflet**: For interactive map integration.
- **Axios**: For API requests.

### Backend
- **Node.js**: JavaScript runtime for the server.
- **Express.js**: Web framework for handling API requests.

---

## 📂 Project Structure

```
├── backend/                  # Backend API code
│   ├── server.js             # Main server file
│   ├── vehicle-data.json     # Fetching vehicle data
├── frontend/                 # Frontend React app
│   ├── src/
│   │   ├── App.js            # Main React component
│   │   ├── components/       # React components (Map, Marker, etc.)
│   │   ├── styles/           # Optional: CSS files
├── README.md                 # Project documentation
└── package.json              # Project dependencies
```

---

## 🛠️ Setup Instructions

### 🔧 Backend Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/prajit96/backend
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```
   PORT=5000
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. API will be live at `http://localhost:5000`.

---

### 🌐 Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd vehicle-movement-map/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the API endpoint:
   Update the API URL in `frontend/src/App.js`:
   ```javascript
   const API_URL = "http://localhost:5000/api/positions";
   ```

4. Start the React development server:
   ```bash
   npm start
   ```

5. The app will be live at `http://localhost:3000`.

---

## 📑 API Documentation

### Base URL:
`http://localhost:5000/api`

### Endpoints:

1. **Get Vehicle Positions**  
   **`GET /api/positions`**  
   - **Response:**  
     ```json
     [
       {
         "id": "1",
         "current": {
           "latitude": 22.5405,
           "longitude": 88.3375
         },
         "speed": 30,
         "route": [
           {
             "latitude": 22.5410,
             "longitude": 88.3380,
             "time": "2025-01-28T12:00:00Z",
             "stop": "Stop 1"
           },
           {
             "latitude": 22.5420,
             "longitude": 88.3390,
             "time": "2025-01-28T12:15:00Z",
             "stop": "Stop 2"
           }
         ]
       }
     ]
     ```

---
### Demo Video

[Download and Watch the Demo Video](videos/Screen%20Recording%202025-01-28%20222833.mp4)


## 📸 Screenshots

### 1. Vehicle Tracking on Map
![Screenshot 2025-01-28 233001](https://github.com/user-attachments/assets/7be4c699-6716-476d-9a91-98054f7c1716)


### 2. Vehicle Details Section
![Screenshot 2025-01-28 233107](https://github.com/user-attachments/assets/de184646-b887-4055-9538-f7c070e58eea)


---

## ✨ Future Improvements
- Add support for multiple vehicle types (e.g., buses, trucks).
- Add a search feature to find vehicles by ID or name.
- Implement WebSocket for real-time updates instead of polling.
- Add user authentication for managing vehicles.

---

