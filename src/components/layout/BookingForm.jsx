import { useParams, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import { AuthContext } from "./AuthContext";

function BookingForm() {
  const { slotId } = useParams();
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    user_name: "",
    user_number: "",
    car_number: "",
    slot_id: slotId,
    entry_time: "",
    exit_time: "",
  });

  const [price, setPrice] = useState(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingCode, setBookingCode] = useState(null);
  const { auth } = useContext(AuthContext);

  useEffect(() => {
    if (auth?.role === "user") {
      setUserData((prev) => ({
        ...prev,
        user_name: auth.username,
        user_number: auth.phone_number,
      }));
    }
  }, [auth]);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleConfirmBooking = () => {
    const start = dayjs(userData.entry_time);
    const end = dayjs(userData.exit_time);

    if (!start.isValid() || !end.isValid() || end.isBefore(start)) {
      alert("Invalid Entry or Exit Time");
      return;
    }

    const startUtc = start.utc().format(); // or .toISOString()
    const endUtc = end.utc().format();

    setUserData((prev) => ({
      ...prev,
      entry_time: startUtc,
      exit_time: endUtc,
    }));

    const duration = end.diff(start, "hour", true);
    const total = Math.ceil(duration) * 20;

    setPrice(total);
    setBookingConfirmed(true);
  };

  const handlePayment = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/bookSlot",
        userData
      );
      console.log(userData.entry_time);
      console.log(userData.exit_time);

      const code = response.data.unique_code;
      setBookingCode(code);
      alert("Booking & Payment successful!");
    } catch (error) {
      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data.message
      ) {
        alert(error.response.data.message); // show backend validation error
      } else {
        alert("Payment failed. Please try again.");
      }
    }
  };

  return (
    <div className="booking-container">
      <h2>Booking Form</h2>
      <form className="booking-form">
        <div className="form-group">
          <label>Name</label>
          <input
            placeholder="Name"
            name="user_name"
            value={userData.user_name || ""}
            onChange={handleChange}
            readOnly={auth?.role === "user"}
          />
        </div>

        <div className="form-group">
          <label>Contact Number</label>
          <input
            placeholder="Contact Number"
            name="user_number"
            value={userData.user_number || ""}
            onChange={handleChange}
            readOnly={auth?.role === "user"}
          />
        </div>

        <div className="form-group">
          <label>Car Number</label>
          <input
            placeholder="Car Number"
            name="car_number"
            value={userData.car_number || ""}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Entry-Time</label>
          <input
            type="datetime-local"
            name="entry_time"
            value={userData.entry_time || ""}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Exit-Time</label>
          <input
            type="datetime-local"
            name="exit_time"
            value={userData.exit_time || ""}
            onChange={handleChange}
          />
        </div>

        {!bookingConfirmed ? (
          <div className="button-group">
            <button
              type="button"
              className="button confirm"
              onClick={handleConfirmBooking}
            >
              Confirm Booking
            </button>
          </div>
        ) : (
          <>
            <div className="price-display">Total Price: ₹{price}</div>
            <div className="button-group">
              <button
                type="button"
                className="button pay"
                onClick={handlePayment}
              >
                Proceed to Payment
              </button>
            </div>
          </>
        )}

        {bookingCode && (
          <div className="code-box">
            <h4>Your 4-digit parking code:</h4>
            <div className="code-value">{bookingCode}</div>
            <p>Use this code to exit the parking</p>
          </div>
        )}
      </form>

      <div className="button-group">
        <button
          type="button"
          className="button secondary"
          onClick={() => navigate("/")}
        >
          Home Page
        </button>
      </div>
    </div>
  );
}

export default BookingForm;
