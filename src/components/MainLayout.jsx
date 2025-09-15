import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import HeadBar from "./HeadBar";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="d-flex flex-column" style={{ minHeight: "100vh" }}>
      <HeadBar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onLogout={handleLogout}
      />

      <div className="d-flex flex-grow-1" style={{ marginTop: "56px" }}>
        {/* Sidebar */}
        <NavBar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content - expands when sidebar is closed */}
        <main
          className="p-3 flex-grow-1"
          id="main"
          style={{
            marginLeft: sidebarOpen ? "250px" : "0",
            transition: "margin-left 0.3s ease",
            width: "100%",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
