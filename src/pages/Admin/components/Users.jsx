import React from 'react';
import PropTypes from 'prop-types';
import { theme } from '../theme';

const Users = ({ users, triggerAction }) => (
  <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
    <div className="table-responsive">
      <table className="table align-middle table-borderless">
        <thead className="table-light small">
          <tr><th className="ps-4">CLIENT NAME</th><th>NET BALANCE</th><th>STATUS</th><th className="text-end pe-4">ACCESS CONTROL</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td className="ps-4 fw-bold">{u.name}</td>
              <td className="fw-black text-primary">₹{u.balance.toLocaleString()}</td>
              <td><span className={`badge rounded-pill ${u.status === 'Active' ? 'bg-success' : 'bg-warning'}`}>{u.status}</span></td>
              <td className="text-end pe-4">
                <button onClick={() => triggerAction(u, 'freeze', 'user')} className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-bold">RESTRICT</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

Users.propTypes = {
  users: PropTypes.array.isRequired,
  triggerAction: PropTypes.func.isRequired,
};

export default Users;
