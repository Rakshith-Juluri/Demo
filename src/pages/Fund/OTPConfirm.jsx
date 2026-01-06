import React from 'react';

export default function OTPConfirm({ selectedAccount, selectedBeneficiary, transferType, amount, scheduleType, scheduleDate, scheduleTime, otp, setOtp, error, handleConfirmTransfer, setStep, submitting }) {
  return (
    <div className="text-center py-2">
      <div className="mb-4">
        <div className="bg-primary-subtle rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: "60px", height: "60px" }}>
          <i className="bi bi-shield-lock-fill text-primary fs-3"></i>
        </div>
        <h4 className="fw-bold mt-3" style={{ color: "#0C4A6E" }}>Verify Transfer</h4>
        <p className="text-muted small">Please review the details and enter the OTP</p>
      </div>

      <div className="card bg-light border-0 rounded-4 p-3 mb-4 text-start">
        <div className="row g-3 small">
          <div className="col-6">
            <label className="text-muted d-block x-small fw-bold">FROM</label>
            <span className="fw-bold">{selectedAccount?.displayName}</span>
          </div>
          <div className="col-6 text-end">
            <label className="text-muted d-block x-small fw-bold">METHOD</label>
            <span className="fw-bold text-primary">{transferType}</span>
          </div>
          <div className="col-6">
            <label className="text-muted d-block x-small fw-bold">TO</label>
            <span className="fw-bold">{selectedBeneficiary?.nickname || selectedBeneficiary?.name}</span>
          </div>
          <div className="col-6 text-end">
            <label className="text-muted d-block x-small fw-bold">AMOUNT</label>
            <span className="fw-bold fs-6">₹{Number(amount).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="mb-4 px-md-5">
        <label className="form-label fw-bold small mb-2">6-DIGIT OTP</label>
        <input
          type="text" className="form-control form-control-lg text-center fw-bold letter-spacing-lg"
          placeholder="0 0 0 0 0 0" value={otp} onChange={e => setOtp(e.target.value)}
          inputMode="numeric" maxLength={6} style={{ letterSpacing: '0.5rem', fontSize: '1.5rem' }}
        />
        <p className="text-muted mt-2 x-small">The OTP was sent to your registered mobile ending in ••42</p>
      </div>

      {error && <div className="alert alert-danger py-2 small mb-4">{error}</div>}

      <div className="d-grid gap-2 px-md-5">
        <button className="btn btn-success btn-lg rounded-pill fw-bold shadow-sm py-3" onClick={handleConfirmTransfer} disabled={submitting}>
          {submitting ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-check-circle-fill me-2"></i>}
          Confirm & Pay
        </button>
        <button className="btn btn-link text-muted fw-bold text-decoration-none" onClick={() => setStep('FORM')} disabled={submitting}>Edit Details</button>
      </div>
    </div>
  );
}