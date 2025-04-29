import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MarkExit = () => {
  const [userNumber, setUserNumber] = useState('');
  const [uniqueCode, setUniqueCode] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const exitData = {
      user_number: userNumber,
      unique_code: uniqueCode
    };

    try {
      const response = await fetch('http://localhost:5000/api/exit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(exitData)
      });

      if (response.ok) {
        alert("Exit recorded successfully! Slot is now available.");
      } else {
        const errorMessage = await response.text();
        alert(`Failed to record exit: ${errorMessage}`);
      }
    } catch (error) {
      alert("An error occurred while recording the exit.");
      console.error("Error:", error);
    }
  };

  return (
    <div className="mark-exit-container">
      <h1>Mark Exit</h1>
      <form onSubmit={handleSubmit} className="mark-exit-form">
        <div className="form-group">
          <label>User Number:</label>
          <input
            type="text"
            value={userNumber}
            placeholder='Enter phone number'
            onChange={(e) => setUserNumber(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Unique Code:</label>
          <input
            type="number"
            value={uniqueCode}
            placeholder='Enter Unique code'
            onChange={(e) => setUniqueCode(e.target.value)}
            required
          />
        </div>
        <div className="button-group">
          <button type="submit" className="button confirm">Submit</button>
          <button type="button" className="button secondary" onClick={() => navigate("/")}>
            Home Page
          </button>
        </div>
      </form>
    </div>
  );
};

export default MarkExit;
