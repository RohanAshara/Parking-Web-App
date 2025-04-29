import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../layout/AuthContext";
import { useNavigate } from "react-router-dom";

export const BookingHistory = () => {
  const [userNumber, setUserNumber] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`http://localhost:5000/history/${userNumber}`);
      setHistory(res.data);
    } catch (err) {
      setError("Failed to fetch history.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log(auth);
    setUserNumber(auth.phone_number);
  }, [auth]);

  const formatUtcTime = (isoString) => {
    return new Date(isoString).toLocaleString("en-US", {
      timeZone: "UTC",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="history-container">
      <h2 className="history-heading">Parking History</h2>

      <div className="action-section">
        <button className="btn" onClick={fetchHistory}>Show History</button>
      </div>

      {loading && <p className="loading">Loading...</p>}

      {error && <p className="error">{error}</p>}

      <div className="card-grid">
        {history.map((item, index) => (
          <div className="history-card" key={index}>
            {/* <h3>{item.user_name}</h3> */}
            <p><strong>Car Number:</strong> {item.car_number}</p>
            <p><strong>Place:</strong> {item.place_name}</p>
            <p><strong>Slot:</strong> {item.slot_name}</p>

            <table className="history-table">
              <tbody>
                <tr>
                  <td><strong>Entry Time</strong></td>
                  <td>{formatUtcTime(item.entry_time)}</td>
                </tr>
                <tr>
                  <td><strong>Actual Entry Time</strong></td>
                  <td>{formatUtcTime(item.actual_entry_time)}</td>
                </tr>
                <tr>
                  <td><strong>Exit Time</strong></td>
                  <td>{formatUtcTime(item.exit_time)}</td>
                </tr>
                <tr>
                  <td><strong>Actual Exit Time</strong></td>
                  <td>{formatUtcTime(item.actual_exit_time)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <div className="home-btn-container">
        <button className="btn outline" onClick={() => navigate("/")}>Home Page</button>
      </div>
    </div>
  );
};
