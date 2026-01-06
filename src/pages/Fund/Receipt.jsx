import React from 'react';

export default function Receipt({ receipt, selectedAccount, selectedBeneficiary, resetAll }) {
  const fmtIST = (d) => {
    if (!d) return '—';
    const dt = new Date(d);
    return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' }).format(dt) + ' IST';
  };

  const isSuccess = receipt.status === 'SUCCESS';
  const isPending = receipt.status === 'PENDING';

  return (
    <div className="text-center">
      <div className={`mb-4 p-4 rounded-4 ${isSuccess ? 'bg-success-subtle text-success' : isPending ? 'bg-info-subtle text-info' : 'bg-danger-subtle text-danger'}`}>
        <i className={`bi ${isSuccess ? 'bi-check-circle-fill' : isPending ? 'bi-clock-fill' : 'bi-x-circle-fill'} display-4`}></i>
        <h4 className="fw-black mt-2 mb-0">Payment {receipt.status}</h4>
        <p className="small mb-0 opacity-75">{isPending ? "Transaction is being processed" : "Transaction Reference: " + (receipt.utr || receipt.transactionId)}</p>
        {!isSuccess && receipt.failureReason && (
          <p className="mt-2 small text-danger fw-bold">Reason: {receipt.failureReason}</p>
        )}
      </div>

      <div className="card border-0 bg-white shadow-sm rounded-4 overflow-hidden mb-4">
        <div className="card-body p-4 text-start">
          <div className="d-flex justify-content-between mb-4">
            <div>
              <p className="text-muted x-small fw-bold mb-0">DATE</p>
              <p className="small fw-bold">{fmtIST(receipt.timestamp)}</p>
            </div>
            <div className="text-end">
              <p className="text-muted x-small fw-bold mb-0">METHOD</p>
              <span className="badge bg-dark rounded-pill">{receipt.transferType}</span>
            </div>
          </div>

          <div className="mb-3">
            <p className="text-muted x-small fw-bold mb-1 uppercase">SENDER</p>
            <p className="small fw-bold mb-0">{selectedAccount?.displayName}</p>
          </div>

          <div className="mb-4">
            <p className="text-muted x-small fw-bold mb-1 uppercase">RECEIVER</p>
            <p className="small fw-bold mb-0">{selectedBeneficiary?.nickname || selectedBeneficiary?.name}</p>
            <p className="x-small text-muted">{selectedBeneficiary?.bank} | {selectedBeneficiary?.ifsc}</p>
          </div>

          <div style={{ borderTop: "2px dashed #e2e8f0", margin: "1.5rem 0" }}></div>

          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-muted fw-bold small">Amount</span>
            <span className="fw-bold fs-5">₹{Number(receipt.amount).toLocaleString()}</span>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted fw-bold small">Service Charges</span>
            <span className="small">{receipt.charges || '₹0.00'}</span>
          </div>

          {receipt.scheduledFor && (
            <div className="mt-3 p-2 bg-light rounded text-center">
              <span className="x-small fw-bold text-muted uppercase d-block">SCHEDULED FOR</span>
              <span className="small fw-bold">{fmtIST(receipt.scheduledFor)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="d-flex gap-2 justify-content-center mt-4 d-print-none">
        <button className="btn btn-outline-dark rounded-pill px-4" onClick={() => window.print()}>
          <i className="bi bi-printer me-2"></i>Print
        </button>
        <button className="btn btn-primary rounded-pill px-4 fw-bold" onClick={resetAll}>
          Make Another Transfer
        </button>
      </div>
    </div>
  );
}