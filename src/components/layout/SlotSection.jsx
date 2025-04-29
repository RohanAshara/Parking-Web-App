import { useNavigate } from "react-router-dom";

export const SlotSection = ({ slot_name, availability, slot_id }) => {
  const navigate = useNavigate();

  console.log(availability); 
  const handleClick = () => {
    if (availability === "Available") {
      navigate(`/booking/${slot_id}`);
    }else{
      alert("Slot is already booked!!")
    }
  };

  const status = availability === "Available" ? "Available" : "Booked";
  return (
    <li className={`slot-card ${status}`} onClick={handleClick}>
      <p>{slot_name}</p>
    </li>
  );
};
