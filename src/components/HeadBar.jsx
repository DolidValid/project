import { useState } from "react";
import { Navbar, Form, FormControl, Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import PropTypes from "prop-types";

const HeadBar = ({ onToggleSidebar, onLogout }) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (query.trim()) {
        navigate(`/search?query=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  return (
    <Navbar
      bg="light"
      expand="md"
      fixed="top"
      className="px-3 shadow-sm justify-content-between"
    >
      {/* Left side: Batch App + toggle */}
      <div className="d-flex align-items-center">
        <span className="fw-bold text-dark me-3">Batch App</span>
        <button
          className="btn btn-outline-dark btn-sm"
          onClick={onToggleSidebar}
        >
          ☰
        </button>
      </div>

      {/* Center: Search bar (hidden on small screens) */}
      <Form className="flex-grow-1 d-none d-md-flex justify-content-center">
        <FormControl
          type="search"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          className="w-50 text-center"
        />
      </Form>

      {/* Right: User icon dropdown */}
      <UserDropdown onLogout={onLogout} />
    </Navbar>
  );
};

/* ---------------- User Icon Dropdown ---------------- */
const UserDropdown = ({ onLogout }) => {
  return (
    <Dropdown align="end">
      <Dropdown.Toggle
        as="div"
        className="p-0 border-0 bg-transparent"
        style={{ cursor: "pointer", fontSize: "1.6rem", color: "black" }}
      >
        <FaUserCircle />
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item onClick={onLogout}>Logout</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

HeadBar.propTypes = {
  onToggleSidebar: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};

UserDropdown.propTypes = {
  onLogout: PropTypes.func.isRequired,
};

export default HeadBar;
