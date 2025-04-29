import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import ParkingForm from "./components/ui/ParkingForm";
import BookingForm from "./components/layout/BookingForm";
import { MyBooking } from "./components/ui/MyBooking";
import MarkEntry from "./components/ui/MarkEntry";
import MarkExit from "./components/ui/MarkExit";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Login from "./components/ui/Login";
import { AuthProvider, AuthContext } from "./components/layout/AuthContext";
import { BookingHistory } from "./components/ui/BookingHistory";
import { DashBoard } from "./components/ui/DashBoard";
import { TotalUser } from "./components/ui/TotalUser";
import { UserDetails } from "./components/ui/UserDetails";
import UpdateUser from "./components/ui/UpdateUser";
import { TotalSlot } from "./components/ui/TotalSlot";
import "./App.css";

function AppRoutes() {
  const { auth } = useContext(AuthContext); // ✅ Access auth from context

  return (
    <Routes>
      <Route path="/login" element={auth ? <Navigate to="/" replace /> : <Login />} />
      <Route
        path="/"
        element={<ProtectedRoute element={ParkingForm} allowedRoles={["user", "admin"]} />}
      />
      <Route
        path="/booking/:slotId"
        element={<ProtectedRoute element={BookingForm} allowedRoles={["user", "admin"]} />}
      />
      <Route
        path="/mybooking"
        element={<ProtectedRoute element={MyBooking} allowedRoles={["user", "admin"]} />}
      />
      <Route
        path="/history"
        element={<ProtectedRoute element={BookingHistory} allowedRoles={["user"]} />}
      />
      <Route
        path="/markEntry"
        element={<ProtectedRoute element={MarkEntry} allowedRoles={["admin"]} />}
      />
      <Route
        path="/markExit"
        element={<ProtectedRoute element={MarkExit} allowedRoles={["admin"]} />}
      />
      <Route
        path="/dashboard"
        element={<ProtectedRoute element={DashBoard} allowedRoles={["admin"]} />}
      >
        <Route index element={<Navigate to="totalslot" replace />} />
        <Route path="totalslot" element={<TotalSlot />} />
        <Route path="totaluser" element={<TotalUser />}>
          <Route path=":phonenumber" element={<UserDetails />} />
        </Route>
        <Route path="update/:phonenumber" element={<UpdateUser />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
