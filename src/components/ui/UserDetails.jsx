import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const formatUtcTime = (timeString, label) => {
  if (!timeString) {
    if (label === "entry") return "Not Entered";
    if (label === "exit") return "Not Exited";
    return "N/A";
  }
  const date = new Date(timeString);
  return date.toLocaleString();
};

export const UserDetails = () => {
  const { phonenumber } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/user/details/${phonenumber}`
        );
        setHistory(res.data);
      } catch (err) {
        console.error("Failed to fetch user details", err);
      }
    };

    fetchDetails();
  }, [phonenumber]);

  if (history.length === 0) {
    return (
      <div className="user-details-container">
        <p className="user-basic-info">User not parked yet!!</p>
        <button className="user-btn outline" onClick={() => navigate("/dashboard/totaluser")}>
          Back
        </button>
      </div>
    );
  }

  const { user_name, user_number } = history[0];

  return (
    <div className="user-details-container">
      <h2 className="user-details-heading">User Details</h2>
      <div className="user-basic-info">
        <p><strong>Name:</strong> {user_name}</p>
        <p><strong>Phone Number:</strong> {user_number}</p>
      </div>

      <h3 className="parking-info-heading">Parking Information</h3>

      <div className="user-card-grid">
        {history.map((item, index) => (
          <div className="user-card" key={index}>
            <h3>{item.user_name}</h3>
            <p><strong>Car Number:</strong> {item.car_number}</p>
            <p><strong>Place:</strong> {item.place_name}</p>
            <p><strong>Slot:</strong> {item.slot_name}</p>

            <table className="user-details-table">
              <tbody>
                <tr>
                  <td><strong>Entry Time</strong></td>
                  <td>{formatUtcTime(item.entry_time, "entry")}</td>
                </tr>
                <tr>
                  <td><strong>Actual Entry Time</strong></td>
                  <td>{formatUtcTime(item.actual_entry_time, "entry")}</td>
                </tr>
                <tr>
                  <td><strong>Exit Time</strong></td>
                  <td>{formatUtcTime(item.exit_time, "exit")}</td>
                </tr>
                <tr>
                  <td><strong>Actual Exit Time</strong></td>
                  <td>{formatUtcTime(item.actual_exit_time, "exit")}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <div className="user-back-button-container">
        <button className="user-btn outline" onClick={() => navigate("/dashboard/totaluser")}>
          Back
        </button>
      </div>
    </div>
  );
};
