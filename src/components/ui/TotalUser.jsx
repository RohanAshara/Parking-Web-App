import { useEffect, useState } from "react";
import axios from "axios";
import { NavLink, Outlet, useParams } from "react-router-dom";

export const TotalUser = () => {
  const [users, setUsers] = useState([]);
  const { phonenumber } = useParams(); // ✅ Check if we’re on a details page

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await axios.get(`http://localhost:5000/user`);
        setUsers(res.data);
      } catch (error) {
        console.log("Failed to load User", error);
      }
    }
    fetchUser();
  }, []);

  const handleDelete = async (phoneNumber) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await axios.delete(
        `http://localhost:5000/user/remove/${phoneNumber}`
      );

      if (response.status === 200) {
        alert(response.data.message);
        setUsers((prev) =>
          prev.filter((user) => user.phone_number !== phoneNumber)
        );
      } else {
        alert(response.data.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="total-user-container">
      {!phonenumber && (
        <>
          <div className="user-table-wrapper">
            <h2>Total Users</h2>
            <div className="user-table-scroll">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Index</th>
                    <th>User Name</th>
                    <th>User Number</th>
                    <th>User Info</th>
                    <th>Update</th>
                    <th>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user.auth_id}>
                      <td>{index + 1}</td>
                      <td>{user.username}</td>
                      <td>{user.phone_number}</td>
                      <td>
                        <NavLink
                          to={`/dashboard/totaluser/${user.phone_number}`}
                        >
                          <button className="button-blue">Details</button>
                        </NavLink>
                      </td>
                      <td>
                        <NavLink to={`/dashboard/update/${user.phone_number}`}>
                          <button className="button-blue">Update</button>
                        </NavLink>
                      </td>
                      <td>
                        <button
                          className="button-red"
                          onClick={() => handleDelete(user.phone_number)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      <Outlet />
    </div>
  );
};
