import React from 'react';
import PropTypes from 'prop-types';
import { theme } from '../theme';

const Fraud = ({ fraudAlerts }) => (
  <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
    <h5 className="mb-3">Fraud Alerts</h5>
    {fraudAlerts.map(f => (
      <div key={f.id} className="mb-3 p-3 border rounded-3">
        <div className="fw-bold">{f.name} <small className="text-muted">({f.id})</small></div>
        <div className="small text-secondary">{f.activity} — Risk: <strong>{f.risk}</strong></div>
        <div className="small text-muted">{f.location} • {f.date}</div>
      </div>
    ))}
  </div>
);

Fraud.propTypes = {
  fraudAlerts: PropTypes.array.isRequired,
};

export default Fraud;
