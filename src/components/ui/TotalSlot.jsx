import React, { useEffect, useState } from "react";
import axios from "axios";

export const TotalSlot = () => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);

  const fetchSlots = async () => {
    try {
      const response = await axios.get("http://localhost:5000/slot");
      const slots = response.data;

      const available = slots.filter(
        (slot) => slot.availability === "Available"
      );
      const booked = slots.filter((slot) => slot.availability === "Booked");

      setAvailableSlots(available);
      setBookedSlots(booked);
    } catch (error) {
      console.error("Error fetching slots:", error);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  return (
    <div className="total-slot-container">
      <h2>Total Slots: {availableSlots.length + bookedSlots.length}</h2>
      <h2 className="availableSlots">Total Available Slots: {availableSlots.length}</h2>
      <h2 className="bookedSlots">Total Booked Slots: {bookedSlots.length}</h2>

      <div className="slot-section">
        <div className="slot-box">
          <h3>Available Slots</h3>
          <div className="scroll-table">
            <table>
              <thead>
                <tr>
                  <th>Place Name</th>
                  <th>Slot Name</th>
                </tr>
              </thead>
              <tbody>
                {availableSlots.map((slot, index) => (
                  <tr key={index}>
                    <td>{slot.place_name}</td>
                    <td>{slot.slot_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="slot-box booked">
          <h3>Booked Slots</h3>
          <div className="scroll-table">
            <table>
              <thead>
                <tr>
                  <th>Place Name</th>
                  <th>Slot Name</th>
                </tr>
              </thead>
              <tbody>
                {bookedSlots.map((slot, index) => (
                  <tr key={index}>
                    <td>{slot.place_name}</td>
                    <td>{slot.slot_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
