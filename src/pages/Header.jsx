import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import NotificationDrawer from "./Notification"; 

export default function Header({ userData }) {
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  // Define nav items array for easier management
  const navItems = [
    { path: "/app/home", label: "HOME" },
    { path: "/app/accounts", label: "ACCOUNTS" },
    { path: "/app/transactions", label: "HISTORY" }, // New Section Added
    { path: "/app/loans", label: "LOANS" },
    { path: "/app/funds", label: "TRANSFER MONEY" }
  ];

  return (
    <>
      <nav className="navbar bg-white border-bottom sticky-top shadow-sm py-3" style={{ zIndex: 1040 }}>
        <div className="container px-4 d-flex justify-content-between align-items-center">
          
          {/* Brand - Left */}
          <Link to="/app/home" className="navbar-brand d-flex align-items-center">
            <div className="bg-primary rounded-3 d-flex align-items-center justify-content-center me-2 shadow-sm" style={{ width: "38px", height: "38px" }}>
              <i className="bi bi-bank2 text-white fs-5"></i>
            </div>
            <span className="fw-bolder text-dark" style={{ fontSize: "1.5rem", letterSpacing: "-1px" }}>
              DIGIBANK
            </span>
          </Link>

          {/* Center Navigation Links - Updated to include Transactions */}
          <ul className="navbar-nav flex-row gap-4 d-none d-lg-flex">
            {navItems.map((item) => (
              <li key={item.path} className="nav-item">
                <NavLink 
                  to={item.path} 
                  className={({ isActive }) => `nav-link fw-bold ${isActive ? "text-primary border-bottom border-primary border-2" : "text-secondary opacity-75"}`} 
                  style={{ fontSize: "13px" }}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Tools - Right */}
          <div className="d-flex align-items-center gap-4">
            {/* Notification Bell */}
            <div
              className="position-relative text-secondary"
              style={{ cursor: "pointer" }}
              onClick={() => setIsNotifyOpen(true)}
            >
              <i className={`bi bi-bell fs-4 ${isNotifyOpen ? 'text-primary' : ''}`}></i>
              {unreadCount > 0 && (
                <span
                  className="position-absolute translate-middle badge rounded-pill bg-danger border border-white"
                  style={{ 
                      top: '10px',
                      left: '100%',
                      fontSize: "10px",
                      minWidth: "18px",
                      height: "18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      animation: "pulse-red 2s infinite"
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </div>

            {/* Profile Icon */}
            <Link to="/app/profile" className="text-decoration-none">
              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: "45px", height: "45px", fontSize: "15px", border: "2px solid #E0F2FE" }}>
                {userData?.name ? userData.name.split(" ").map((n) => n[0]).join("") : "NA"}
              </div>
            </Link>

            <div className="vr opacity-10 d-none d-md-block" style={{ height: "30px" }}></div>

            {/* Logout Button */}
            <button onClick={handleLogout} className="btn btn-link text-danger text-decoration-none fw-bold p-0 d-flex align-items-center gap-1">
              <i className="bi bi-power fs-4"></i>
              <span className="d-none d-md-inline" style={{ fontSize: "12px", letterSpacing: "1px" }}>LOGOUT</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Notification Drawer Component */}
      <NotificationDrawer 
        isOpen={isNotifyOpen} 
        onClose={() => setIsNotifyOpen(false)} 
        setUnreadCount={setUnreadCount} 
      />

      {/* Overlay Background */}
      {isNotifyOpen && (
        <div 
          onClick={() => setIsNotifyOpen(false)}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1045, backdropFilter: 'blur(3px)'
          }}
        />
      )}

      <style>
        {`
          @keyframes pulse-red {
            0% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7); }
            70% { box-shadow: 0 0 0 8px rgba(220, 53, 69, 0); }
            100% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); }
          }
        `}
      </style>
    </>
  );
}