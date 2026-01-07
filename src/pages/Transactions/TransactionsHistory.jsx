import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TransactionHistory({ transactions, onViewDetails }) {
  const [filterId, setFilterId] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterMonth, setFilterMonth] = useState('ALL');
  const theme = {
    darkBlue: "#0C4A6E",
    primary: "#0284C7",
    bgGradient: "linear-gradient(180deg, #E0F2FE 0%, #F8FAFC 600px)",
  };

  const filteredData = useMemo(() => {
    return transactions.filter(txn => {
      const matchesId = txn.transactionId.toLowerCase().includes(filterId.toLowerCase());
      const matchesType = filterType === 'ALL' || txn.transferType === filterType;
      const matchesMonth = filterMonth === 'ALL' || new Date(txn.timestamp).getMonth() === parseInt(filterMonth);
      return matchesId && matchesType && matchesMonth;
    });
  }, [transactions, filterId, filterType, filterMonth]);

  return (
    <div style={{ background: theme.bgGradient, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <div className="container py-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
          <div>
            <h1 className="fw-black display-6 mb-0" style={{ color: theme.darkBlue, fontWeight: 900 }}>Transaction Ledger</h1>
            <p className="fs-5 text-secondary fw-medium">Monitor your money trail and download official statements.</p>
          </div>
          <button className="btn btn-primary rounded-pill px-4 py-3 fw-bold shadow-sm d-flex align-items-center justify-content-center" onClick={() => window.print()}>
            <i className="bi bi-download me-2"></i> Download Statement
          </button>
        </div>
        <div className="card border-0 shadow-sm rounded-5 p-4 bg-white mb-4">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="input-group input-group-sm bg-light rounded-pill px-2">
                <span className="input-group-text bg-transparent border-0 text-muted"><i className="bi bi-search"></i></span>
                <input type="text" className="form-control bg-transparent border-0 ps-0 shadow-none" placeholder="Search ID..." value={filterId} onChange={e => setFilterId(e.target.value)} />
              </div>
            </div>
            <div className="col-md-3">
              <select className="form-select form-select-sm border-0 bg-light rounded-pill px-3 shadow-none" value={filterType} onChange={e => setFilterType(e.target.value)}>
                <option value="ALL">All Methods</option>
                <option value="IMPS">IMPS</option>
                <option value="NEFT">NEFT</option>
                <option value="RTGS">RTGS</option>
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select form-select-sm border-0 bg-light rounded-pill px-3 shadow-none" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
                <option value="ALL">All Months</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i} value={i}>{new Date(0, i).toLocaleString('en', { month: 'long' })}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <button className="btn btn-dark btn-sm w-100 rounded-pill fw-bold py-2" onClick={() => {setFilterId(''); setFilterType('ALL'); setFilterMonth('ALL');}}>Reset</button>
            </div>
          </div>
        </div>
        <div className="card border-0 shadow-sm rounded-5 overflow-hidden bg-white">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead style={{ backgroundColor: "#F8FAFC" }}>
                <tr className="small text-muted text-uppercase fw-bold">
                  <th className="ps-4 py-4 border-0">Date & Time</th>
                  <th className="border-0">Details</th>
                  <th className="border-0">Money Trail</th>
                  <th className="border-0">Type</th>
                  <th className="text-end border-0">Amount</th>
                  <th className="text-center pe-4 border-0">Action</th>
                </tr>
              </thead>
              <tbody className="border-top-0">
                {filteredData.map(txn => (
                  <tr key={txn.transactionId}>
                    <td className="ps-4">
                      <div className="fw-bold small text-dark">{new Date(txn.timestamp).toLocaleDateString('en-IN')}</div>
                      <div className="x-small text-muted">{new Date(txn.timestamp).toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'})}</div>
                    </td>
                    <td>
                      <div className="fw-bold text-primary small">{txn.transactionId}</div>
                      <div className="x-small text-muted text-truncate" style={{maxWidth:'150px'}}>{txn.remarks || 'No remarks'}</div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <code className="bg-light px-1 rounded text-dark" style={{fontSize:'0.7rem'}}>{txn.senderAccountId}</code>
                        <i className="bi bi-arrow-right text-muted"></i>
                        <code className="bg-info-subtle px-1 rounded text-info-emphasis" style={{fontSize:'0.7rem'}}>{txn.receiverAccountId}</code>
                      </div>
                    </td>
                    <td><span className="badge rounded-pill bg-secondary-subtle text-secondary small px-3">{txn.transferType}</span></td>
                    <td className="text-end">
                      <span className={`fw-bold ${txn.status === 'FAILED' ? 'text-decoration-line-through text-muted' : 'text-dark'}`}>₹{txn.amount.toLocaleString()}</span>
                      {txn.status === 'FAILED' && <div className="x-small text-danger fw-bold">Failed</div>}
                    </td>
                    <td className="text-center pe-4">
                      <button className="btn btn-light btn-sm rounded-circle shadow-sm border-0" style={{width:'32px', height:'32px'}} onClick={() => onViewDetails(txn)}>
                        <i className="bi bi-eye-fill text-primary"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <style>{`.fw-black{font-weight:900!important}.rounded-5{border-radius:2rem!important}.x-small{font-size:0.7rem}.table-hover tbody tr:hover{background-color:#F8FAFC!important}`}</style>
    </div>
  );
}