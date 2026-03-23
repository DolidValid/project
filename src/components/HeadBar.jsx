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
      expand="md"
      fixed="top"
      className="px-4 py-2 shadow-sm justify-content-between"
      style={{
        background: 'linear-gradient(90deg, #ed1c24 0%, #b31217 100%)',
        color: '#ffffff'
      }}
    >
      {/* Left side: Batch App + toggle */}
      <div className="d-flex align-items-center">
        <button
          className="btn btn-link text-white p-0 me-3"
          onClick={onToggleSidebar}
          style={{ textDecoration: 'none', fontSize: '1.5rem' }}
        >
          ☰
        </button>
        <div className="d-flex align-items-center pe-auto" style={{ cursor: "pointer" }} onClick={() => navigate('/home')}>
           <div className="bg-white rounded-circle d-flex justify-content-center align-items-center me-2" style={{ width: '36px', height: '36px' }}>
             <span className="fw-bold fs-5 text-danger">O</span>
           </div>
           <span className="fw-bold text-white fs-5 tracking-wide" style={{ letterSpacing: '1px' }}>BATCH MANAGER</span>
        </div>
      </div>

      {/* Center: Search bar (hidden on small screens) */}
      <Form className="flex-grow-1 d-none d-md-flex justify-content-center">
        <div className="input-group shadow-sm" style={{ maxWidth: '500px' }}>
          <FormControl
            type="search"
            placeholder="Search ESB_LOG (MSISDN, File ID, Transaction ID)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            className="border-0 shadow-none px-3 py-2"
            style={{ borderRadius: '25px 0 0 25px' }}
          />
          <button type="button" className="btn btn-light bg-white border-0 px-3 text-danger" onClick={() => {
              if (query.trim()) navigate(`/search?query=${encodeURIComponent(query.trim())}`);
            }} style={{ borderRadius: '0 25px 25px 0' }}>
            <span style={{ fontWeight: 'bold' }}>&#128269;</span>
          </button>
        </div>
      </Form>

      {/* Right: User icon dropdown */}
      <UserDropdown onLogout={onLogout} />
    </Navbar>
  );
};

const UserDropdown = ({ onLogout }) => {
  return (
    <Dropdown align="end">
      <Dropdown.Toggle
        as="div"
        className="p-0 border-0 bg-transparent d-flex align-items-center gap-2"
        style={{ cursor: "pointer", color: "white" }}
      >
        <span className="d-none d-md-inline fw-semibold small">Admin</span>
        <FaUserCircle style={{ fontSize: "2rem" }} />
      </Dropdown.Toggle>

      <Dropdown.Menu className="shadow-sm border-0 mt-2 rounded-3">
        <Dropdown.Item onClick={onLogout} className="text-danger fw-bold d-flex align-items-center gap-2">
           Logout
        </Dropdown.Item>
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
