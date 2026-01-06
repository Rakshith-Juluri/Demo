import React, { useState, useEffect } from "react";

export default function AccountControl() {

  // DYNAMIC STATE: In a real app, this would come from an API
  const [account, setAccount] = useState({
    accNo: "6740-8829-001",
    type: "Current Account",
    balance: 425400,
    status: "ACTIVE", // Try changing this to "INACTIVE" to see the Reactivation flow
  });

  const linkedAccounts = [
    { id: "SAV-1102-005", type: "Savings Account" }
  ];

  // Form State
  const [action, setAction] = useState(""); 
  const [pan, setPan] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpGenerated, setOtpGenerated] = useState(""); 
  const [otpInput, setOtpInput] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [transferTarget, setTransferTarget] = useState("");
  const [reason, setReason] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Initialize action based on current status
  useEffect(() => {
    setAction(account.status === "ACTIVE" ? "FREEZE" : "REACTIVATE");
  }, [account.status]);

  // --- VALIDATIONS ---
  const validatePan = (val) => {
    // Standard PAN Regex: 5 Alphas, 4 Digits, 1 Alpha
    const regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return regex.test(val);
  };

  const onSendOtp = () => {
    if (!validatePan(pan)) {
      alert("Invalid PAN Format! Example: ABCDE1234F");
      return;
    }
    setBusy(true);
    setTimeout(() => {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      setOtpGenerated(code);
      setOtpRequested(true);
      setBusy(false);
    }, 800);
  };

  const onVerifyOtp = () => {
    if (otpInput === otpGenerated) setOtpVerified(true);
    else alert("Incorrect OTP. Please check the debug badge.");
  };

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100vh", padding: "40px 0" }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            
            {/* 1. DYNAMIC STATUS CARD */}
            <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
               <div className={`p-4 text-white ${account.status === 'ACTIVE' ? 'bg-dark' : 'bg-danger'}`}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <small className="opacity-50 fw-bold">ACCOUNT STATUS</small>
                        <h4 className="fw-black mb-0">{account.status}</h4>
                    </div>
                    <div className="text-end">
                        <small className="opacity-50 d-block">BALANCE</small>
                        <h3 className="fw-black mb-0">₹{account.balance.toLocaleString()}</h3>
                    </div>
                  </div>
               </div>
               <div className="p-3 bg-white border-top d-flex justify-content-between">
                  <span className="small text-muted fw-bold">ID: {account.accNo}</span>
               </div>
            </div>

            {/* 2. CONTROL FORM */}
            <div className="card border-0 shadow-lg p-4 p-md-5 rounded-4">
              <h2 className="fw-black text-center mb-1">
                {account.status === 'ACTIVE' ? "Account Freeze" : "Reactivation"}
              </h2>
              <p className="text-center text-muted small mb-4">Security Verification Required</p>

              {!submitted ? (
                <>
                  {/* PAN Input with Validation Check */}
                  <div className="mb-4">
                    <label className="form-label small fw-bold">VERIFY PAN CARD</label>
                    <input 
                       className={`form-control form-control-lg fw-bold ${pan && !validatePan(pan) ? 'is-invalid' : pan && validatePan(pan) ? 'is-valid' : ''}`}
                       maxLength={10} 
                       value={pan} 
                       onChange={e => setPan(e.target.value.toUpperCase())} 
                       placeholder="ABCDE1234F" 
                    />
                    <div className="invalid-feedback">Format: 5 Letters, 4 Digits, 1 Letter</div>
                  </div>

                  {!otpRequested ? (
                    <button className="btn btn-primary w-100 py-3 fw-bold rounded-3 shadow-sm" onClick={onSendOtp} disabled={pan.length < 10}>
                       CONTINUE
                    </button>
                  ) : (
                    <div className="animate__animated animate__fadeIn border p-4 rounded-4 bg-light mb-4">
                        <div className="text-center mb-3">
                            <span className="badge bg-dark px-3 py-2">DEBUG OTP: {otpGenerated}</span>
                        </div>
                        <input className="form-control text-center fs-3 fw-bold mb-3" placeholder="000000" onChange={e => setOtpInput(e.target.value)} />
                        {!otpVerified && <button className="btn btn-dark w-100 fw-bold py-2" onClick={onVerifyOtp}>VERIFY</button>}
                        {otpVerified && <div className="text-success text-center fw-bold">✓ Identity Confirmed</div>}
                    </div>
                  )}

                  {/* 3. DYNAMIC WORKFLOWS */}
                  {otpVerified && (
                    <div className="animate__animated animate__fadeIn">
                        
                        {/* CASE A: ACCOUNT IS ACTIVE (NEEDS FREEZING + FUND TRANSFER) */}
                        {account.status === "ACTIVE" ? (
                          <>
                            <div className="alert alert-warning border-0 rounded-4 small mb-4">
                                <b>Required:</b> Select where to move your <b>₹{account.balance.toLocaleString()}</b>.
                            </div>
                            <div className="mb-4">
                                {linkedAccounts.map(acc => (
                                    <div key={acc.id} onClick={() => setTransferTarget(acc.id)} className={`p-3 border rounded-4 mb-2 cursor-pointer d-flex justify-content-between ${transferTarget === acc.id ? 'border-primary bg-primary-subtle' : 'bg-white'}`}>
                                        <div><div className="fw-bold">{acc.id}</div><small className="text-muted">{acc.type}</small></div>
                                        {transferTarget === acc.id && <i className="bi bi-check-circle-fill text-primary"></i>}
                                    </div>
                                ))}
                            </div>
                            <div className="mb-4">
                                <label className="form-label small fw-bold">REASON FOR FREEZING</label>
                                <select className="form-select" value={reason} onChange={e => setReason(e.target.value)}>
                                    <option value="">Select Reason</option>
                                    <option value="Security">Security Concern</option>
                                    <option value="Lost SIM">Lost Registered SIM</option>
                                    <option value="Temporary">Temporary Closure</option>
                                </select>
                            </div>
                          </>
                        ) : (
                          /* CASE B: ACCOUNT IS INACTIVE (NEEDS REACTIVATION) */
                          <div className="mb-4">
                              <div className="alert alert-info border-0 rounded-4 small">
                                  Your account was frozen on <b>{account.lastUpdated}</b>. Reactivating will restore all digital services immediately.
                              </div>
                              <label className="form-label small fw-bold">DECLARATION</label>
                              <textarea className="form-control" rows="2" placeholder="State your purpose for reactivation..." onChange={e => setReason(e.target.value)}></textarea>
                          </div>
                        )}

                        <div className="form-check mb-4">
                            <input className="form-check-input" type="checkbox" id="c" onChange={e => setConfirm(e.target.checked)} />
                            <label className="form-check-label small fw-bold text-secondary" htmlFor="c">Confirm this request</label>
                        </div>

                        <button 
                            className={`btn w-100 py-3 fw-black rounded-pill shadow ${account.status === 'ACTIVE' ? 'btn-danger' : 'btn-success'}`} 
                            disabled={!confirm || (account.status === 'ACTIVE' && !transferTarget)} 
                            onClick={() => setSubmitted(true)}
                        >
                            {account.status === 'ACTIVE' ? 'TRANSFER & FREEZE' : 'REACTIVATE ACCOUNT'}
                        </button>
                    </div>
                  )}
                </>
              ) : (
                /* SUCCESS VIEW */
                <div className="text-center py-4">
                   <div className={`display-1 mb-3 ${account.status === 'ACTIVE' ? 'text-danger' : 'text-success'}`}>
                      {account.status === 'ACTIVE' ? <i className="bi bi-snow2"></i> : <i className="bi bi-unlock-fill"></i>}
                   </div>
                   <h3 className="fw-black">Request Processed</h3>
                   <p className="text-muted small">Your request to <b>{action}</b> {account.accNo} has been submitted for final approval.</p>
                   <button className="btn btn-dark px-5 py-2 rounded-pill mt-3" onClick={() => navigate("/")}>HOME</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}