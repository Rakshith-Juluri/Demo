import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Search, Bell, ChevronDown, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { theme } from './theme';

const Navbar = () => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  return (
    <header className="navbar navbar-expand bg-white border-bottom px-4 py-2 sticky-top shadow-sm w-100">
      <div className="container-fluid justify-content-between">
        <div className="input-group bg-light rounded-pill px-3 py-1 border-0 w-25">
          <span className="input-group-text bg-transparent border-0 text-muted"><Search size={18} /></span>
          <input type="text" className="form-control bg-transparent border-0 ps-0 shadow-none small" placeholder="Search systems..." />
        </div>
        <div className="d-flex align-items-center gap-4">
          <div className="position-relative cursor-pointer text-secondary"><Bell size={20} /></div>
          <div className="position-relative border-start ps-4" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <div className="d-flex align-items-center gap-3 cursor-pointer">
              <div className="text-end d-none d-sm-block">
                <div className="fw-black small mb-0" style={{ color: theme.darkBlue }}>Administrator</div>
                <div className="text-muted" style={{ fontSize: '10px' }}>Super User</div>
              </div>
              <div className="text-white d-flex align-items-center justify-content-center rounded-circle fw-bold shadow-sm" style={{ width: '40px', height: '40px', backgroundColor: theme.primary }}>AD</div>
              <ChevronDown size={14} className="text-muted" />
            </div>
            {isHovered && (
              <div className="position-absolute end-0 pt-2" style={{ width: '180px', zIndex: 1000 }}>
                <div className="bg-white border-0 shadow-lg rounded-4 py-2 overflow-hidden">
                  <button className="dropdown-item py-2 d-flex align-items-center gap-2 text-danger small fw-bold" onClick={() => navigate("/")}>
                    <LogOut size={14} /> Log Out System
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

Navbar.propTypes = {};
