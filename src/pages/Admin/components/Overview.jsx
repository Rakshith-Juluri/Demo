import React from 'react';
import PropTypes from 'prop-types';
import { theme } from '../theme';

const Overview = ({ users }) => {
  return (
    <div className="row g-4">
      {[
        { label: 'REVENUE', val: '₹4.2 Cr', bg: theme.primary, text: 'white' },
        { label: 'LOANS DISBURSED', val: '₹1.8 Cr', border: theme.primary },
        { label: 'TOTAL CLIENTS', val: users.length, border: theme.primary },
        { label: 'RISK INDEX', val: '0.82%', border: '#ef4444', color: '#ef4444' }
      ].map((c, i) => (
        <div className="col-md-3" key={i}>
          <div className={`card border-0 shadow-sm p-4 rounded-4 h-100 ${c.bg ? '' : 'bg-white'}`} 
               style={{ backgroundColor: c.bg || '#fff', borderBottom: c.border ? `4px solid ${c.border}` : 'none' }}>
            <span className={`small fw-bold mb-2 d-block ${c.bg ? 'opacity-75' : 'text-muted'}`}>{c.label}</span>
            <h2 className="fw-black mb-0" style={{ color: c.text || theme.darkBlue, color: c.color }}>{c.val}</h2>
          </div>
        </div>
      ))}
    </div>
  );
};

Overview.propTypes = {
  users: PropTypes.array.isRequired,
};

export default Overview;
