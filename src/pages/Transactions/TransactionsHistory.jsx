import React, { useMemo, useState } from 'react';

export default function TransactionHistory({ transactions, beneficiaries = [], onViewDetails }) {
  const [searchTerm, setSearchTerm] = useState('');

  const getBeneficiaryName = (beneficiaryId) => {
    const beneficiary = beneficiaries.find(b => b.id === beneficiaryId);
    return beneficiary?.name || 'Unknown';
  };

  const getTransactionIcon = (type) => {
    return type === 'CREDIT' ? 'bi-arrow-down-circle-fill text-success' : 'bi-arrow-up-circle-fill text-danger';
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const search = searchTerm.toLowerCase();
      return (
        (tx.remarks || '').toLowerCase().includes(search) ||
        (tx.utr || '').toLowerCase().includes(search) ||
        (tx.transferType || '').toLowerCase().includes(search) ||
        (tx.beneficiaryName || getBeneficiaryName(tx.beneficiaryId) || '').toLowerCase().includes(search)
      );
    });
  }, [transactions, searchTerm, beneficiaries]);

  return (
    <div className="p-3">
      <div className="mb-3">
        <div className="input-group">
          <span className="input-group-text bg-white border-end-0">
            <i className="bi bi-search text-muted"></i>
          </span>
          <input
            type="text"
            className="form-control border-start-0 ps-0"
            placeholder="Search by remarks, UTR, type, or beneficiary..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Date/Time</th>
              <th>Details</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((tx) => (
              <tr key={tx.id}>
                <td>
                  <small className="d-block fw-bold">
                    {tx.timestamp ? new Date(tx.timestamp).toLocaleDateString() : 'N/A'}
                  </small>
                  <small className="text-muted">
                    {tx.timestamp ? new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </small>
                </td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <i className={`bi ${getTransactionIcon(tx.type)} fs-5`}></i>
                    <div>
                      <div className="fw-bold">{tx.remarks || 'No Remarks'}</div>
                      <small className="text-muted">
                        {tx.beneficiaryName || getBeneficiaryName(tx.beneficiaryId) || 'Self'}
                      </small>
                      {tx.utr && <div><small className="text-muted">UTR: {tx.utr}</small></div>}
                    </div>
                  </div>
                </td>
                <td>
                  <span className="badge bg-light text-dark border">{tx.transferType}</span>
                </td>
                <td className={`fw-bold ${tx.type === 'CREDIT' ? 'text-success' : 'text-danger'}`}>
                  {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                </td>
                <td>
                  <span className={`badge ${
                    tx.status === 'SUCCESS' ? 'bg-success-subtle text-success' : 
                    tx.status === 'SCHEDULED' ? 'bg-info-subtle text-info' :
                    'bg-warning-subtle text-warning'
                  }`}>
                    {tx.status}
                  </span>
                </td>
                <td>
                  <button 
                    className="btn btn-sm btn-outline-primary rounded-pill px-3"
                    onClick={() => onViewDetails(tx)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}