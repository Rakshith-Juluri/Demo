import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

export default function AccountControl() {
  const navigate = useNavigate();
  const location = useLocation();

  // Theme configuration
  const theme = {
    darkBlue: "#0C4A6E",
    primary: "#0284C7",
    lightBg: "linear-gradient(180deg, #E0F2FE 0%, #F8FAFC 600px)"
  };

  // State
  const [account, setAccount] = useState(location.state?.account || {
    id: 1,
    accNo: "6740-8829-001",
    type: "Current Account",
    balance: 425400,
    status: "Active",
  });

  const [linkedAccounts, setLinkedAccounts] = useState([]);
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

  // Transfer Type Logic
  const [transferType, setTransferType] = useState("internal"); // "internal" or "external"
  const [beneficiaryAcc, setBeneficiaryAcc] = useState("");
  const [beneficiaryIfsc, setBeneficiaryIfsc] = useState("");

  useEffect(() => {
    const fetchOtherAccounts = async () => {
      try {
        const res = await fetch("http://localhost:4001/accountRequests");
        if (res.ok) {
          const data = await res.json();
          const others = data.filter(acc => acc.status === "approved" && acc.id !== account.id);
          setLinkedAccounts(others);
        }
      } catch (err) {
        console.error("Error fetching linked accounts:", err);
      }
    };
    fetchOtherAccounts();
  }, [account.id]);

  const validatePan = (val) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val);

  const onSendOtp = () => {
    if (!validatePan(pan)) return;
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

  const handleFinalSubmit = async () => {
    setBusy(true);
    try {
      const newStatus = account.status === "Active" ? "Deactivated" : "approved";
      await fetch(`http://localhost:4001/accountRequests/${account.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: newStatus,
          balance: account.status === "Active" ? "0.00" : account.balance 
        }),
      });
      setSubmitted(true);
    } catch (error) {
      alert("Database connection failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ background: theme.lightBg, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <div className="container py-4">
        
        <div className="mb-4">
          <button onClick={() => navigate(-1)} className="btn btn-white rounded-pill px-4 fw-bold shadow-sm border-0" style={{ color: theme.primary }}>
            <i className="bi bi-arrow-left me-2"></i>Back
          </button>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-6">
            
            <div className="text-center mb-5">
              <h2 className="display-6 mb-2" style={{ letterSpacing: "-1.5px", color: theme.darkBlue, fontWeight: 900 }}>
                {account.status === 'Active' ? "Account Deactivate" : "Account Activation"}
              </h2>
              <p className="text-secondary fw-medium">Security & Status Management</p>
            </div>

            <div className="card border-0 shadow-lg mb-4 overflow-hidden" style={{ borderRadius: "35px" }}>
               <div className="p-4 text-white" style={{ backgroundColor: account.status === 'Active' ? theme.darkBlue : '#10b981' }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <small className="opacity-75 fw-bold text-uppercase" style={{fontSize: '10px'}}>Current Status</small>
                        <h4 style={{fontWeight: 900}} className="mb-0">{account.status.toUpperCase()}</h4>
                    </div>
                    <div className="text-end">
                        <small className="opacity-75 d-block fw-bold text-uppercase" style={{fontSize: '10px'}}>Available Balance</small>
                        <h3 style={{fontWeight: 900}} className="mb-0">₹{account.balance}</h3>
                    </div>
                  </div>
               </div>
               <div className="p-3 bg-white border-top d-flex justify-content-between px-4">
                  <span className="small text-muted fw-bold">ID: {account.accNo}</span>
                  <span className="small fw-bold text-uppercase" style={{ color: theme.primary }}>{account.type}</span>
               </div>
            </div>

            <div className="card border-0 shadow-lg p-4 p-md-5 bg-white" style={{ borderRadius: "35px" }}>
              {!submitted ? (
                <>
                  <div className="mb-4">
                    <label className="form-label fw-bold text-dark small">VERIFY PAN CARD</label>
                    <input 
                       className={`form-control form-control-lg bg-light border-0 px-4 py-3 rounded-4 fs-6 fw-bold ${pan && !validatePan(pan) ? 'is-invalid' : ''}`}
                       maxLength={10} 
                       value={pan} 
                       onChange={e => setPan(e.target.value.toUpperCase())} 
                       placeholder="ABCDE1234F" 
                    />
                  </div>

                  {!otpRequested ? (
                    <button className="btn w-100 py-3 fw-bold rounded-pill shadow text-white" style={{ backgroundColor: theme.primary, border: 'none' }} onClick={onSendOtp} disabled={pan.length < 10}>
                       {busy ? "SECURIING..." : "CONTINUE VERIFICATION"}
                    </button>
                  ) : (
                    <div className="animate__animated animate__fadeIn">
                        <div className="text-center mb-3">
                            <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold">DEBUG OTP: {otpGenerated}</span>
                        </div>
                        <input className="form-control form-control-lg text-center fs-2 mb-3 bg-light border-0 rounded-4" style={{fontWeight: 900}} placeholder="000000" onChange={e => setOtpInput(e.target.value)} />
                        {!otpVerified && <button className="btn w-100 fw-bold py-3 rounded-pill shadow mb-4 text-white" style={{backgroundColor: theme.darkBlue}} onClick={onVerifyOtp}>VERIFY IDENTITY</button>}
                        {otpVerified && <div className="text-success text-center fw-bold mb-4">✓ Identity Authenticated</div>}
                    </div>
                  )}

                  {otpVerified && (
                    <div className="animate__animated animate__fadeInUp">
                        {account.status === "Active" ? (
                          <>
                            <label className="form-label fw-bold text-dark small mt-2">TRANSFER REMAINING FUNDS TO</label>
                            <div className="btn-group w-100 mb-3" role="group">
                              <button type="button" className={`btn btn-sm rounded-start-pill ${transferType === 'internal' ? 'btn-primary shadow' : 'btn-outline-primary border-0'}`} onClick={() => setTransferType('internal')}>My Accounts</button>
                              <button type="button" className={`btn btn-sm rounded-end-pill ${transferType === 'external' ? 'btn-primary shadow' : 'btn-outline-primary border-0'}`} onClick={() => setTransferType('external')}>Other Bank Account</button>
                            </div>

                            {transferType === 'internal' ? (
                              <div className="mb-4">
                                {linkedAccounts.length > 0 ? (
                                  linkedAccounts.map(acc => (
                                    <div key={acc.id} onClick={() => setTransferTarget(acc.id)} 
                                        className={`p-3 border rounded-4 mb-2 d-flex justify-content-between align-items-center transition-all ${transferTarget === acc.id ? 'border-primary bg-primary-subtle' : 'bg-light border-0'}`}
                                        style={{ cursor: 'pointer' }}>
                                        <div><div className="fw-bold">{acc.accountNumber || "N/A"}</div><small className="text-muted">{acc.accountype}</small></div>
                                        {transferTarget === acc.id && <i className="bi bi-check-circle-fill text-primary fs-4"></i>}
                                    </div>
                                  ))
                                ) : (
                                  /* EMPTY STATE FOR INTERNAL ACCOUNTS */
                                  <div className="text-center p-4 bg-light rounded-4 border border-dashed border-2">
                                    <i className="bi bi-wallet2 text-muted mb-2 d-block" style={{fontSize: '2rem'}}></i>
                                    <p className="small text-muted fw-bold mb-3">No secondary accounts found.</p>
                                    <button className="btn btn-sm btn-primary rounded-pill px-3 fw-bold" onClick={() => navigate("/app/accounts")}>
                                      CREATE SAVINGS ACCOUNT
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              /* EXTERNAL BENEFICIARY FIELDS */
                              <div className="mb-4 animate__animated animate__fadeIn">
                                <input className="form-control bg-light border-0 rounded-4 mb-2 py-3 px-4 fw-bold" placeholder="Beneficiary Account Number" value={beneficiaryAcc} onChange={e => setBeneficiaryAcc(e.target.value)} />
                                <input className="form-control bg-light border-0 rounded-4 mb-2 py-3 px-4 fw-bold" placeholder="IFSC Code" value={beneficiaryIfsc} onChange={e => setBeneficiaryIfsc(e.target.value.toUpperCase())} />
                              </div>
                            )}

                            <div className="mb-4">
                                <label className="form-label fw-bold text-dark small">REASON FOR FREEZING</label>
                                <select className="form-select form-select-lg bg-light border-0 px-4 py-3 rounded-4 fs-6 fw-bold text-muted" value={reason} onChange={e => setReason(e.target.value)}>
                                    <option value="">Choose Reason</option>
                                    <option value="Security">Security Concern</option>
                                    <option value="Temporary">Temporary Closure</option>
                                </select>
                            </div>
                          </>
                        ) : (
                          <div className="mb-4">
                              <label className="form-label fw-bold text-dark small">PURPOSE OF REACTIVATION</label>
                              <textarea className="form-control bg-light border-0 px-4 py-3 rounded-4" rows="2" placeholder="Describe reason..." onChange={e => setReason(e.target.value)}></textarea>
                          </div>
                        )}

                        <div className="form-check mb-4 ms-2">
                            <input className="form-check-input" type="checkbox" id="c" onChange={e => setConfirm(e.target.checked)} />
                            <label className="form-check-label small fw-bold text-secondary" htmlFor="c">I confirm this security request</label>
                        </div>

                        <button 
                            className={`btn w-100 py-3 fw-bold rounded-pill shadow-lg text-white`} 
                            style={{backgroundColor: account.status === 'Active' ? '#dc3545' : '#10b981'}}
                            disabled={busy || !confirm || (account.status === 'Active' && transferType === 'internal' && linkedAccounts.length === 0)} 
                            onClick={handleFinalSubmit}
                        >
                            {busy ? "PROCESSING..." : (account.status === 'Active' ? 'CONFIRM FREEZE & TRANSFER' : 'ACTIVATE ACCOUNT NOW')}
                        </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                    <div className="mb-4 d-inline-flex p-4 rounded-circle bg-success bg-opacity-10">
                      <i className="bi bi-shield-check display-1 text-success"></i>
                    </div>
                    <h2 style={{fontWeight: 900}} className="mb-2">SUCCESSFUL</h2>
                    <p className="text-muted mb-4 px-4">Your security request has been processed and saved.</p>
                    <button className="btn mt-4 px-5 py-2 rounded-pill fw-bold btn-outline-primary" style={{borderColor: theme.primary, color: theme.primary}} onClick={() => navigate("/app/accounts")}>RETURN TO DASHBOARD</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}