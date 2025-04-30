# Parking-Web-App

A web application for managing parking spaces, allowing users to register, book slots, and view their parking history. Admins can manage users, slots, and monitor bookings.

---

## 🚀 Features

- 👤 User & Admin Authentication
- 📅 Book Parking Slots with Time Duration
- 🅿️ View Available Slots in Real-Time
- 🧾 Booking History Tracking
- 📊 Admin Dashboard for Slot and Booking Management
- 📱 Responsive UI Design

---

## 🛠️ Technologies Used

### Frontend
- React (with Vite)
- JavaScript 
- CSS3

### Backend
- Node.js
- Express.js

### Database
- Microsoft SQL Server

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/RohanAshara/Parking-Web-App.git
cd Parking-Web-App
```

---

### 2. Install Frontend Dependencies

```bash
cd src
npm install
```

---

### 3. Install Backend Dependencies

```bash
cd ../server
npm install
```

---

### 4. SQL Server Setup

1. Open **SQL Server Management Studio (SSMS)**.
2. Create a database (e.g., `ParkingDB`).
3. Run the SQL schema file (if available in the repo) or create required tables:
   - `auth_Table`, `user_Table`, `booking_Table`, `slot_Table`, `place_Table`, etc.
4. Update `server/config/db.js` (or wherever your DB connection is defined) with your SQL Server credentials:

```js
const sql = require('mssql');

const config = {
  user: 'your_username',
  password: 'your_password',
  server: 'localhost',
  database: 'ParkingDB',
  options: {
    encrypt: false, // Set to true if you're using Azure or SSL
    trustServerCertificate: true,
  },
};

module.exports = config;
```

---

## ▶️ Running the Application

### Start Backend Server

```bash
cd server
npm start
```

Starts the Express server on `http://localhost:5000`.

---

### Start Frontend Dev Server

```bash
cd ../src
npm run dev
```

Launches the app on `http://localhost:3000`.

---

