import { Outlet, Navigate, Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { Navbar } from "../../components/Navbar";
import { useState } from "react";

export default function AdminLayout() {
  const { store, actions } = useGlobalReducer();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);


  const handleLogout = () => {
    actions.logout();
    navigate("/");
  };

  return (
    <>
      <div className="d-flex">
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="flex-grow-1 p-4" style={{ marginLeft: sidebarOpen ? "250px" : "80px", transition: "margin-left 0.3s ease" }} >
          <Outlet />
        </div>
      </div>
    </>
    
  );
}
