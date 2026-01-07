import React from 'react';
import PropTypes from 'prop-types';
import { theme } from '../theme';

const Loans = ({ loanReqs }) => (
  <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
    <div className="table-responsive">
      <table className="table align-middle table-borderless">
        <thead className="table-light small">
          <tr><th className="ps-4">LOAN ID</th><th>CLIENT</th><th>AMOUNT</th><th>TENURE</th><th className="text-end pe-4">DATE</th></tr>
        </thead>
        <tbody>
          {loanReqs.map(l => (
            <tr key={l.id}>
              <td className="ps-4 fw-bold">{l.id}</td>
              <td>{l.name}</td>
              <td className="fw-black text-primary">₹{l.amount.toLocaleString()}</td>
              <td>{l.tenure} months</td>
              <td className="text-end pe-4 small text-secondary">{l.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

Loans.propTypes = {
  loanReqs: PropTypes.array.isRequired,
};

export default Loans;
