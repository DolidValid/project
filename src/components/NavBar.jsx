import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCogs, FaUser, FaSyncAlt, FaPhone } from "react-icons/fa";
import { FaFileContract, FaSimCard } from "react-icons/fa6";
import "bootstrap/dist/css/bootstrap.min.css";
import "./NavBarStyle.css";
import PropTypes from "prop-types";

function NavBar({ isOpen, onClose }) {
  const [activeMenu, setActiveMenu] = useState("");
  const navigate = useNavigate();

  const handleMenuClick = (menuItem) => {
    setActiveMenu((prev) => (prev === menuItem ? "" : menuItem));
  };

  return (
    <div
      className={`sidebar bg-light p-3 d-flex flex-column shadow-sm ${
        isOpen ? "show" : "d-none d-md-block"
      }`}
      style={{
        width: isOpen ? "250px" : "0",
        minHeight: "100vh",
        transition: "width 0.3s ease",
        overflowX: "hidden",
        position: "fixed",
        top: "56px", // below HeadBar
        left: 0,
        zIndex: 1040,
      }}
    >
      {/* Close button on small screens */}
      <div className="d-md-none d-flex justify-content-end">
        <button className="btn-close" onClick={onClose}></button>
      </div>

      {isOpen && (
        <ul className="menu list-unstyled flex-grow-1 mt-3">
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
      )}
    </div>
  );
}
NavBar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default NavBar;
