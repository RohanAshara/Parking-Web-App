import React, { useEffect, useState } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import axios from "axios";

const UpdateUser = () => {
  const { phonenumber } = useParams();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  // Fetch user data (to pre-fill the name field)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/user`);
        const user = res.data.find((u) => u.phone_number === phonenumber);
        if (user) setUsername(user.username);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, [phonenumber]);

  // Handle form submit
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/user/update/${phonenumber}`, {
        username,
      });
      alert("Username updated successfully");
      navigate("/dashboard/totaluser");
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Failed to update username");
    }
  };

  return (
    <div className="update-user-container">
      <h2>Update Username</h2>
      <form onSubmit={handleUpdate}>
        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="text"
            value={phonenumber}
            disabled
            className="w-full px-4 py-2 border rounded bg-gray-100 cursor-not-allowed"
          />
        </div>
        <div className="form-group">
          <label>New Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded"
          />
        </div>
        <div className="button-group">
          <button type="submit" className="button confirm">
            Update Name
          </button>
          <NavLink to="/dashboard/totaluser">
            <button type="button" className="button secondary">
              Back
            </button>
          </NavLink>
        </div>
      </form>
    </div>
  );
};

export default UpdateUser;
