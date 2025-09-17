import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCogs, FaUser, FaSyncAlt, FaPhone, FaSignal } from "react-icons/fa";
import { FaFileContract, FaSimCard } from "react-icons/fa6";
import "bootstrap/dist/css/bootstrap.min.css";
import "./NavBarStyle.css";
import PropTypes from "prop-types";

function NavBar({ isOpen, onClose }) {
  const [activeMenu, setActiveMenu] = useState("");
  const [activeSubmenu, setActiveSubmenu] = useState(""); // ✅ new state
  const navigate = useNavigate();

  const handleMenuClick = (menuItem) => {
    setActiveMenu((prev) => (prev === menuItem ? "" : menuItem));
    setActiveSubmenu(""); // reset submenu when switching main menu
  };

  const handleSubmenuClick = (submenu, path) => {
    setActiveSubmenu(submenu); // ✅ set submenu active
    navigate(path);
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
          <li>
            <FaFileContract className="icon" /> <span>Contracts</span>
          </li>

          <li
            className={activeMenu === "Services" ? "active" : ""}
            onClick={() => handleMenuClick("Services")}
          >
            <FaCogs className="icon" /> <span>Services</span>
          </li>
          {activeMenu === "Services" && (
            <ul className="submenu list-unstyled ms-3">
              <li
                className={activeSubmenu === "Activation" ? "active" : ""} // ✅ highlight
                onClick={() =>
                  handleSubmenuClick("Activation", "/create-contract")
                }
              >
                <FaSignal className="me-2 text-danger" /> Activation 4G
              </li>
            </ul>
          )}

          <li>
            <FaUser className="icon" /> <span>Customer</span>
          </li>

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
