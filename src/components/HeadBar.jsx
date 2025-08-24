// eslint-disable-next-line no-unused-vars
import React from "react";

const HeadBar = () => {
  return (
    <div>
      <button
        className="navbar-toggler d-md-none"
        type="button"
        onClick={() =>
          document.querySelector(".sidebar").classList.toggle("show")
        }
      >
        <span className="navbar-toggler-icon"></span>
      </button>
      <nav className="navbar bg-body-tertiary px-3">
        <div className="container-fluid">
          <a className="navbar-brand">
            <img src="/Logo.png" alt="Batch App Logo" className="logo-img" />{" "}
            batchApp
          </a>
          <form className="d-flex" role="search">
            <input
              className="form-control me-2"
              type="search"
              placeholder="Search"
              aria-label="Search"
            />
            <button className="btn btn-outline-success" type="submit">
              Search
            </button>
          </form>
        </div>
      </nav>
    </div>
  );
};

export default HeadBar;
