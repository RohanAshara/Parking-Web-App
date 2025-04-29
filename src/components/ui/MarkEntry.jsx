import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const MarkEntry = () => {
  const [userNumber, setUserNumber] = useState("");
  const [uniqueCode, setUniqueCode] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userNumber || !uniqueCode) {
      setErrorMessage("Please fill in both fields.");
      return;
    }

    const entryData = {
      user_number: userNumber,
      unique_code: uniqueCode,
    };

    try {
      const response = await fetch("http://localhost:5000/api/entry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entryData),
      });

      if (response.ok) {
        alert("Entry recird successfully! SLot is now Booked");
      } else {
        const errorMessage = await response.text();
        alert(`Failed to record entry: ${errorMessage}`);
      }
    } catch (error) {
      alert("An error occured while recoarding the entry");
      console.error("Error:", error);
    }
  };

  return (
    <div className="mark-entry-container">
      <h1>Mark Entry</h1>
      <form onSubmit={handleSubmit} className="mark-entry-form">
        <div className="form-group">
          <label>User Number:</label>
          <input
            type="text"
            value={userNumber}
            placeholder="Enter phone number"
            onChange={(e) => setUserNumber(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Unique Code:</label>
          <input
            type="number"
            value={uniqueCode}
            placeholder="Enter Unique code"
            onChange={(e) => setUniqueCode(e.target.value)}
          />
        </div>
        <div className="button-group">
          <button type="submit" className="button confirm">
            Submit
          </button>
          <button
            type="button"
            className="button secondary"
            onClick={() => navigate("/")}
          >
            Home Page
          </button>
        </div>
      </form>
    </div>
  );
};

export default MarkEntry;
