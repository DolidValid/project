// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import { Navbar, Form, FormControl } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
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
      {/* Sidebar toggle (always visible) */}
      <button
        className="btn btn-outline-primary me-2"
        onClick={onToggleSidebar}
      >
        ☰
      </button>

      {/* Centered search bar */}
      <Form className="flex-grow-1 d-flex justify-content-center">
        <FormControl
          type="search"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          className="w-50 text-center"
        />
      </Form>

      {/* Logout on right */}
      <button className="btn btn-outline-danger ms-2" onClick={onLogout}>
        Logout
      </button>
    </Navbar>
  );
};
HeadBar.propTypes = {
  onToggleSidebar: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
};

export default HeadBar;
