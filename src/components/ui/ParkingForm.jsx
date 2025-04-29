import { useContext, useState } from "react";
import { Form } from "react-bootstrap";
import axios from "axios";
import SearchBar from "../layout/SearchBar";
import { SlotSection } from "../layout/SlotSection";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../layout/AuthContext";

function ParkingForm() {
  const [formData, setFormData] = useState({
    parkingPlace: "",
  });
  const [slot, setSlot] = useState([]);
  const { auth } = useContext(AuthContext);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(
        `http://localhost:5000/parkingSlot?placeId=${formData.parkingPlace}`
      );
      setSlot(response.data);
    } catch (error) {
      console.log("failed to fetch slot:", error);
    }
  };

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="parking-page" id="parkingPage">
      <div className="header-nav" id="headerNav">
        {auth?.role === "admin" && (
          <>
            <NavLink to="/markEntry">
              <button className="nav-btn">Mark Entry</button>
            </NavLink>
            <NavLink to="/markExit">
              <button className="nav-btn">Mark Exit</button>
            </NavLink>
            <NavLink to="/dashboard">
              <button className="nav-btn">Dashboard</button>
            </NavLink>
          </>
        )}
        {auth.role === "user" && (
          <>
            <NavLink to="/mybooking">
              <button className="nav-btn">My Booking</button>
            </NavLink>
            <NavLink to="/history">
              <button className="nav-btn">History</button>
            </NavLink>
          </>
        )}
        <button onClick={handleLogout} className="nav-btn logout-btn">
          Log out
        </button>
      </div>

      <Form className="parking-form" id="parkingForm" onSubmit={handleSubmit}>
        <SearchBar
          label="Parking Place"
          name="parkingPlace"
          value={formData.parkingPlace}
          onChange={handleChange}
        />
        <button className="submit-btn" type="submit">
          Submit
        </button>
      </Form>

      <div className="slots-section" id="slotsSection">
        <h1 className="slots-title">Available Slots</h1>
        <div className="slot-grid-container">
          <ul className="slot-grid grid grid-four-cols">
            {slot.map((slotData, index) => (
              <SlotSection {...slotData} key={index} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ParkingForm;
