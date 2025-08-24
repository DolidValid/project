import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";
import HeadBar from "./headBar";

//import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
//
//import CreateContract from "../pages/Contract/CreateContract";
//import SetContractStatus from "../pages/Contract/SetContractStatus";
//import UpdateRatePlan from "../pages/Contract/UpdateRatePlan";
//import SetServiceStatus from "../pages/Services/SetServicStatus";
//import ActivateServiceParametre from "../pages/Services/ActivateServiceParametre";

const MainLayout = () => {
  return (
    <React.Fragment>
      <HeadBar />
      <div className="d-flex">
        <NavBar />
        <main className="p-3 flex-grow-1" id="main">
          <Outlet />
        </main>
      </div>
    </React.Fragment>
  );
};

export default MainLayout;
