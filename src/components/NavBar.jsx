// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCogs,
  FaUser,
  FaSyncAlt,
  FaPhone,
  FaSignOutAlt,
} from "react-icons/fa";
import { FaFileContract, FaSimCard } from "react-icons/fa6";
import "bootstrap/dist/css/bootstrap.min.css";
import "./NavBarStyle.css";

function NavBar() {
  const [activeMenu, setActiveMenu] = useState("");
  const navigate = useNavigate();

  const handleMenuClick = (menuItem) => {
    setActiveMenu((prev) => (prev === menuItem ? "" : menuItem));
  };

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <>
      {/* Toggle button for small screens */}
      <button
        className="btn btn-danger d-md-none m-2 menu-toggle-btn"
        type="button"
        data-bs-toggle="offcanvas"
        data-bs-target="#sidebar"
        aria-controls="sidebar"
      >
        <span className="menu-icon">☰</span>
        <span className="menu-text">Menu</span>
      </button>

      {/* Sidebar (offcanvas on mobile, static on desktop) */}
      <div
        className="offcanvas-md offcanvas-start d-flex flex-column bg-light p-3"
        tabIndex="-1"
        id="sidebar"
        style={{ width: "250px" }}
      >
        <div className="offcanvas-header d-md-none">
          <h5 className="offcanvas-title">Menu</h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>

        <ul className="menu list-unstyled flex-grow-1">
          <li
            className={activeMenu === "Contracts" ? "active" : ""}
            onClick={() => handleMenuClick("Contracts")}
          >
            <FaFileContract className="icon" /> <span>Contracts</span>
          </li>
          {activeMenu === "Contracts" && (
            <ul className="submenu list-unstyled ms-3">
              <li onClick={() => navigate("/create-contract")}>
                Create Contract
              </li>
              <li onClick={() => navigate("/set-contract-status")}>
                Set Contract Status
              </li>
              <li onClick={() => navigate("/update-rate-plan")}>
                Update Rate Plan
              </li>
            </ul>
          )}

          <li
            className={activeMenu === "Services" ? "active" : ""}
            onClick={() => handleMenuClick("Services")}
          >
            <FaCogs className="icon" /> <span>Services</span>
          </li>
          {activeMenu === "Services" && (
            <ul className="submenu list-unstyled ms-3">
              <li>Set Service Status</li>
              <li>Activate Service Parameter</li>
            </ul>
          )}

          <li
            className={activeMenu === "Customer" ? "active" : ""}
            onClick={() => handleMenuClick("Customer")}
          >
            <FaUser className="icon" /> <span>Customer</span>
          </li>
          {activeMenu === "Customer" && (
            <ul className="submenu list-unstyled ms-3">
              <li>Blacklist Customers</li>
              <li>Update Customers</li>
            </ul>
          )}

          <li>
            <FaSimCard className="icon" /> <span>Release resource</span>
          </li>
          <li>
            <FaSyncAlt className="icon" /> <span>Set refill</span>
          </li>
          <li>
            <FaPhone className="icon" /> <span>Simulate first call</span>
          </li>
        </ul>

        <div className="mt-auto">
          <li
            className="logout list-unstyled"
            onClick={handleLogout}
            style={{ cursor: "pointer" }}
          >
            <FaSignOutAlt className="icon" /> <span>Logout</span>
          </li>
        </div>
      </div>
    </>
  );
}

export default NavBar;
