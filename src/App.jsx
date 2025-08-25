import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import MainLayout from "./components/MainLayout";
import LoginPage from "./pages/LoginPage";
import CreateContract from "./pages/Contract/CreateContract";
import SetContractStatus from "./pages/Contract/SetContractStatus";
import UpdateRatePlan from "./pages/Contract/UpdateRatePlan";
import SetServiceStatus from "./pages/Services/SetServicStatus";
import ActivateServiceParametre from "./pages/Services/ActivateServiceParametre";
import Home from "./pages/Home";
import InfoFile from "./pages/InfoFile";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route element={<MainLayout />}>
          <Route path="/InfoFile" element={<InfoFile />} />

          <Route path="/home" element={<Home />} />
          <Route path="/create-contract" element={<CreateContract />} />
          <Route path="/set-contract-status" element={<SetContractStatus />} />
          <Route path="/update-rate-plan" element={<UpdateRatePlan />} />

          <Route path="/update-rate-plan" element={<SetServiceStatus />} />
          <Route
            path="/update-rate-plan"
            element={<ActivateServiceParametre />}
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
