import React from 'react';
import PropTypes from 'prop-types';
import { LayoutDashboard, UserPlus, ShieldAlert, Users, Banknote } from 'lucide-react';
import { theme } from './theme';

const Sidebar = ({ activeView, setActiveView, counts }) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'requests', label: 'Account Requests', icon: <UserPlus size={20} />, badge: counts.requests },
    { id: 'loans', label: 'Loan Management', icon: <Banknote size={20} />, badge: counts.loans },
    { id: 'users', label: 'User Management', icon: <Users size={20} /> },
    { id: 'fraud', label: 'Fraud Monitoring', icon: <ShieldAlert size={20} />, badge: counts.fraud },
  ];

  return (
    <nav className="bg-white border-end d-none d-md-flex flex-column shadow-sm" style={{ width: '280px', height: '100vh', position: 'sticky', top: 0 }}>
      <div className="p-4 mb-2">
        <h3 className="fw-black mb-0" style={{ color: theme.darkBlue, letterSpacing: '-1px' }}>
          DiGi<span style={{ color: theme.primary }}>BANK</span>
        </h3>
        <small className="text-muted fw-bold" style={{ fontSize: '10px' }}>ADMIN CONTROL PANEL</small>
      </div>
      <div className="list-group list-group-flush px-3 flex-grow-1">
        {menuItems.map((item) => (
          <button 
            key={item.id} 
            onClick={() => setActiveView(item.id)} 
            className={`list-group-item list-group-item-action border-0 rounded-4 py-3 mb-2 d-flex align-items-center justify-content-between transition-all ${activeView === item.id ? 'active shadow-sm' : 'text-secondary opacity-75'}`}
            style={{ backgroundColor: activeView === item.id ? theme.primary : 'transparent', color: activeView === item.id ? 'white' : '' }}
          >
            <div className="d-flex align-items-center gap-3">{item.icon} <span className="fw-bold small">{item.label}</span></div>
            {item.badge > 0 && <span className={`badge rounded-pill ${activeView === item.id ? 'bg-white text-primary' : 'bg-danger'}`}>{item.badge}</span>}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Sidebar;

Sidebar.propTypes = {
  activeView: PropTypes.string.isRequired,
  setActiveView: PropTypes.func.isRequired,
  counts: PropTypes.shape({ requests: PropTypes.number, loans: PropTypes.number, fraud: PropTypes.number }).isRequired,
};
