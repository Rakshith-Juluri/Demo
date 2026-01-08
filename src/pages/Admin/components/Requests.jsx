import React from 'react';
import PropTypes from 'prop-types';
import { Check } from 'lucide-react';
import { theme } from '../theme';

const Requests = ({ openReqs, approvedReqs, rejectedReqs, requestTab, setRequestTab, triggerAction }) => {
  const current = requestTab === 'pending' ? openReqs : requestTab === 'approved' ? approvedReqs : rejectedReqs;
  return (
    <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
      <div className="d-flex bg-light p-2 m-3 rounded-pill" style={{ width: 'fit-content' }}>
        {['pending', 'approved', 'rejected'].map(tab => (
          <button 
            key={tab}
            className={`btn rounded-pill px-4 fw-bold small transition-all ${requestTab === tab ? 'bg-white shadow-sm text-primary' : 'text-secondary'}`}
            onClick={() => setRequestTab(tab)}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="table-responsive px-3">
        <table className="table table-borderless align-middle">
          <thead className="table-light">
            <tr className="small text-muted" style={{ fontSize: '11px' }}>
              <th className="ps-4 py-3">CLIENT IDENTITY</th>
              <th>ACCOUNT TYPE</th>
              <th>SUBMISSION DATE</th>
              <th className="text-end pe-4">MANAGEMENT</th>
            </tr>
          </thead>
          <tbody>
            {current.map(i => (
              <tr key={i.id} className="border-bottom-subtle">
                <td className="ps-4 py-3">
                  <div className="fw-bold" style={{ color: theme.darkBlue }}>{i.name}</div>
                  <small className="text-muted">ID: {i.userId}</small>
                </td>
                <td><span className="badge bg-light text-primary rounded-pill px-3">{i.type}</span></td>
                <td className="text-secondary small">{i.date}</td>
                <td className="text-end pe-4">
                  {requestTab === 'pending' ? (
                    <div className="btn-group shadow-sm rounded-pill overflow-hidden">
                      <button onClick={() => triggerAction(i, 'approve', 'open')} className="btn btn-success btn-sm border-0 px-3 py-2"><Check size={16}/></button>
                      <button onClick={() => triggerAction(i, 'reject', 'open')} className="btn btn-danger btn-sm border-0 px-3 py-2">!</button>
                    </div>
                  ) : (
                    <span className={`badge rounded-pill px-3 py-2 ${requestTab === 'approved' ? 'bg-success text-white' : 'bg-danger text-white'}`}>
                      {requestTab.toUpperCase()}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

Requests.propTypes = {
  openReqs: PropTypes.array.isRequired,
  approvedReqs: PropTypes.array.isRequired,
  rejectedReqs: PropTypes.array.isRequired,
  requestTab: PropTypes.string.isRequired,
  setRequestTab: PropTypes.func.isRequired,
  triggerAction: PropTypes.func.isRequired,
};

export default Requests;
