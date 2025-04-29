import { Form } from "react-bootstrap";
import axios from "axios";
import { useEffect, useState } from "react";

function SearchBar({ label, value, onChange, name }) {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await axios.get(`http://localhost:5000/parkingplace`);
        const results = data.map((place) => ({
          key: place.place_name,
          value: place.place_id,
        }));
        setOptions([{ key: "Select a parking place", value: "" }, ...results]);
      } catch (err) {
        console.error("Failed to load parking places", err);
      }
    }

    fetchData();
  }, []);

  return (
    <Form.Group className="search-bar-group">
      <Form.Label htmlFor={name}>{label}</Form.Label>
      <Form.Select id={name} name={name} value={value} onChange={onChange}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.key}
          </option>
        ))}
      </Form.Select>
    </Form.Group>
  );
}

export default SearchBar;
