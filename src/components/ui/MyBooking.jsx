import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../layout/AuthContext";

export const MyBooking = () => {
  const [userNumber, setUserNumber] = useState("");
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);

  useEffect(() => {
    console.log("AUTH CONTEXT:", auth);
    if (auth?.role === "user") {
      setUserNumber(auth.phone_number);
    }
  }, [auth]);

  const handleFetch = async () => {
    if (!userNumber) return alert("Enter your mobile number");

    try {
      const res = await axios.get(
        `http://localhost:5000/getMyBooking/${userNumber}`
      );
      setBookings(res.data);
    } catch (error) {
      console.error("Failed to fetch bookings", error);
      alert("No bookings found or something went wrong.");
    }
  };

  return (
    <div className="my-booking-container">
      <h2>My Booking Info</h2>

      <form className="booking-info-form">
        <label htmlFor="mobile">Enter Your Mobile Number</label>
        <input
          type="text"
          id="mobile"
          value={userNumber || ""}
          onChange={(e) => setUserNumber(e.target.value)}
          placeholder="e.g., 9876543210"
          readOnly={auth?.role === "user"}
        />
        <button type="button" onClick={handleFetch}>
          Show Bookings
        </button>
      </form>

      <div>
        {Array.isArray(bookings) && bookings.length === 0 ? (
          <p>No bookings found.</p>
        ) : (
          bookings.map((booking, index) => (
            <div key={index} className="booking-card">
              <h3>Booking #{index + 1}</h3>
              <p>
                <strong>Slot Name:</strong> {booking.slot_name}
              </p>
              <p>
                <strong>Place Name:</strong> {booking.place_name}
              </p>
              <p>
                <strong>Entry Time:</strong>{" "}
                {new Date(booking.entry_time).toLocaleString()}
              </p>
              <p>
                <strong>Exit Time:</strong>{" "}
                {new Date(booking.exit_time).toLocaleString()}
              </p>
              <p>
                <strong>Unique Code:</strong> <span>{booking.unique_code}</span>
              </p>
            </div>
          ))
        )}
      </div>

      <button className="home-btn" onClick={() => navigate("/")}>
        Home Page
      </button>
    </div>
  );
};
