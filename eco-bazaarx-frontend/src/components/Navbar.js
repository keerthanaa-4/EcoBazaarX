import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success">
      <div className="container">
        <Link className="navbar-brand" to="/">EcoBazaarX</Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto">
            {role && (
              <li className="nav-item">
                <Link className="nav-link" to={`/${role.toLowerCase()}`}>Dashboard</Link>
              </li>
            )}
          </ul>
          <span className="navbar-text me-3 text-white">
            {name ? `Hello, ${name}` : ""}
          </span>
          {role && <button className="btn btn-danger" onClick={handleLogout}>Logout</button>}
        </div>
      </div>
    </nav>
  );
}
