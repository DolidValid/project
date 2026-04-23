import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

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
import ResultBatchPage from "./pages/ResultBatchPage";
import BatchHistory from "./pages/BatchHistory";
import AuditPage from "./pages/AuditPage";


// A simple wrapper for protected routes
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/" />;
};

// Admin-only route wrapper — redirects non-admins to /home
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  return user?.role === "admin" ? children : <Navigate to="/home" />;
};

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Only show Login if NOT authenticated, otherwise redirect home */}
        <Route 
          path="/" 
          element={!isAuthenticated ? <LoginPage /> : <Navigate to="/home" />} 
        />

        {/* Protect internal routes */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
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
          <Route path="/batch-results/:fileId" element={<ResultBatchPage />} />
          <Route path="/batch-history" element={<BatchHistory />} />
          <Route path="/audit" element={<AdminRoute><AuditPage /></AdminRoute>} />
        </Route>
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
