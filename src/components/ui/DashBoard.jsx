import { NavLink, Outlet } from "react-router-dom";

export const DashBoard = () => {
  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <NavLink to="/dashboard/totalslot" className={({ isActive }) => isActive ? "active" : ""}>
          <button>Total slot</button>
        </NavLink>
        <NavLink to="/dashboard/totaluser" className={({ isActive }) => isActive ? "active" : ""}>
          <button>Total user</button>
        </NavLink>
        <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>
          <button>Home page</button>
        </NavLink>
      </nav>
      <Outlet />
    </div>
  );
};
