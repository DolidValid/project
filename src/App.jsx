import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import MainLayout from "./components/MainLayout";
import LoginPage from "./pages/LoginPage";
import CreateContract from "./pages/Contract/CreateContract";
import SetContractStatus from "./pages/Contract/SetContractStatus";
import UpdateRatePlan from "./pages/Contract/UpdateRatePlan";
import ActivateServiceParametre from "./pages/Services/ActivateServiceParametre";
import Home from "./pages/Home";
import InfoFile from "./pages/InfoFile";
import ImportBatch from "./components/ImportBatch";
import Search from "./components/Search";
import Activation3G from "./pages/Services/Activation3g";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route element={<MainLayout />}>
          <Route path="/InfoFile" element={<InfoFile />} />
          <Route path="/Search" element={<Search />} />
          <Route path="/ImportBatch" element={<ImportBatch />} />
          <Route path="/home" element={<Home />} />
          <Route path="/create-contract" element={<CreateContract />} />
          <Route path="/set-contract-status" element={<SetContractStatus />} />
          <Route path="/update-rate-plan" element={<UpdateRatePlan />} />

          <Route path="/activation3G" element={<Activation3G />} />
          <Route
            path="/activate-service-param"
            element={<ActivateServiceParametre />}
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
