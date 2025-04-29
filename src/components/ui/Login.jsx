// src/components/Login.js
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../layout/AuthContext";


const Login = () => {
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          username,
          phone_number: phoneNumber,
        }
      );

      if (response.data.success) {
        login(response.data.user); // { username, role }
        navigate("/");
      } else {
        setError("Invalid login");
      }
    } catch (err) {
      setError("Login failed. Invalid credentials.");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <h2 className="login">Login</h2>
        {error && <p className="error">{error}</p>}
        <form className="login-form" onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Phone Number"
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
