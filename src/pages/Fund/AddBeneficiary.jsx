import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
 
const AddBeneficiary = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [accountType, setAccountType] = useState('savings');
  const [error, setError] = useState('');
 
  const theme = {
    primary: "#0284C7",
    darkBlue: "#0C4A6E",
    bgGradient: "linear-gradient(180deg, #E0F2FE 0%, #F8FAFC 600px)",
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
 
    // basic validation
    if (!name.trim()) { setError('Beneficiary name is required'); return; }
    if (!accountNumber.trim()) { setError('Account number is required'); return; }
    if (accountNumber !== confirmAccountNumber) { setError('Account numbers do not match'); return; }
    if (!ifsc.trim()) { setError('IFSC code is required'); return; }
 
    setLoading(true);
    try {
      // attach logged-in user id if present
      const stored = localStorage.getItem('loggedInUser');
      const userId = stored ? JSON.parse(stored).id : null;
 
      const payload = {
        userId,
        beneficiaryName: name,
        accountNumber,
        ifsc,
        accountType,
        createdAt: new Date().toISOString()
      };
 
      const res = await fetch('http://localhost:4001/beneficiaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
 
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
 
      setLoading(false);
      // success
      alert('Beneficiary Added Successfully!');
      navigate('/app/funds');
    } catch (err) {
      console.error('Failed to add beneficiary', err);
      setError('Failed to add beneficiary. Please try again.');
      setLoading(false);
    }
  };
 
  return (
    <div style={{ background: theme.bgGradient, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <div className="container py-5">
       
        {/* Navigation & Header */}
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-link text-decoration-none p-0 mb-3 d-flex align-items-center"
            style={{ color: theme.primary, fontWeight: 600 }}
          >
            <i className="bi bi-arrow-left me-2"></i> Back to Money Transfer
          </button>
          <h1 className="fw-black display-6" style={{ color: theme.darkBlue, fontWeight: 900 }}>
            Add New Beneficiary
          </h1>
          <p className="text-secondary fs-6 fw-medium">
            Register a new recipient for faster and secure fund transfers.
          </p>
        </div>
 
        <div className="row">
          <div className="col-lg-8">
            {/* Form Card */}
            <div className="card border-0 shadow-sm rounded-4 bg-white p-4 p-md-5">
              <form onSubmit={handleSubmit}>
               
                {/* Section: Recipient Details */}
                <div className="mb-2">
                  <h5 className="fw-bold mb-4 d-flex align-items-center" style={{ color: theme.darkBlue }}>
                    <div className="bg-primary bg-opacity-10 text-primary rounded-3 p-2 me-3">
                      <i className="bi bi-person-badge fs-5"></i>
                    </div>
                    Account Information
                  </h5>
                 
                  <div className="row g-4">
                    <div className="col-md-12">
                      <label className="form-label small fw-bold text-muted">BENEFICIARY NAME (AS PER BANK)</label>
                      <input value={name} onChange={(e) => setName(e.target.value)} type="text" className="form-control form-control-lg rounded-3 border-light bg-light shadow-none fs-6 py-3" placeholder="e.g. Rahul Sharma" required />
                    </div>
                   
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">ACCOUNT NUMBER</label>
                      <input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} name="ac_no" className="form-control form-control-lg rounded-3 border-light bg-light shadow-none fs-6 py-3" placeholder="Enter Account Number" required />
                    </div>
 
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">RE-ENTER ACCOUNT NUMBER</label>
                      <input value={confirmAccountNumber} onChange={(e) => setConfirmAccountNumber(e.target.value)} type="text" className="form-control form-control-lg rounded-3 border-light bg-light shadow-none fs-6 py-3" placeholder="Confirm Account Number" required />
                    </div>
 
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">IFSC CODE</label>
                      <div className="input-group">
                        <input value={ifsc} onChange={(e) => setIfsc(e.target.value)} type="text" className="form-control form-control-lg rounded-start-3 border-light bg-light shadow-none fs-6" placeholder="DGBN0001234" required />
                      </div>
                    </div>
 
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">ACCOUNT TYPE</label>
                      <select value={accountType} onChange={(e) => setAccountType(e.target.value)} className="form-select form-select-lg rounded-3 border-light bg-light shadow-none fs-6 py-3">
                        <option value="savings">Savings Account</option>
                        <option value="current">Current Account</option>
                      </select>
                    </div>
                  </div>
                </div>
 
                <div className="mt-5 pt-2">
                  {/* Action Buttons */}
                  <div className="d-flex flex-column flex-md-row gap-3">
                    <button
                      type="submit"
                      className="btn btn-primary rounded-pill py-3 px-5 fw-bold shadow-sm d-flex align-items-center justify-content-center"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="spinner-border spinner-border-sm me-2"></span>
                      ) : (
                        <i className="bi bi-shield-lock-fill me-2"></i>
                      )}
                      Securely Add Beneficiary
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary rounded-pill py-3 px-5 fw-bold"
                      onClick={() => navigate(-1)}
                    >
                      Cancel
                    </button>
                  </div>
                  {error && <div className="mt-3 text-danger small fw-bold">{error}</div>}
                 
                  <p className="text-muted small mt-4 mb-0">
                    <i className="bi bi-info-circle me-1"></i> By adding this beneficiary, you agree to the bank's transfer terms and conditions.
                  </p>
                </div>
              </form>
            </div>
          </div>
 
          {/* Sidebar Tips */}
          <div className="col-lg-4 mt-4 mt-lg-0">
            <div className="card border-0 shadow-sm rounded-4 bg-dark text-white p-4">
              <h6 className="fw-bold mb-4 d-flex align-items-center">
                <i className="bi bi-shield-shaded text-info me-2 fs-5"></i>
                Security Protocol
              </h6>
              <ul className="list-unstyled small mb-0 opacity-75">
                <li className="mb-4 d-flex gap-3">
                  <div className="bg-white bg-opacity-10 p-2 rounded-circle flex-shrink-0" style={{width: '32px', height: '32px', textAlign: 'center'}}>1</div>
                  <span>Beneficiary details are encrypted before storage.</span>
                </li>
                <li className="mb-4 d-flex gap-3">
                  <div className="bg-white bg-opacity-10 p-2 rounded-circle flex-shrink-0" style={{width: '32px', height: '32px', textAlign: 'center'}}>2</div>
                  <span>New payees are subject to a cooling-off period for large transfers.</span>
                </li>
                <li className="d-flex gap-3">
                  <div className="bg-white bg-opacity-10 p-2 rounded-circle flex-shrink-0" style={{width: '32px', height: '32px', textAlign: 'center'}}>3</div>
                  <span>Always verify the IFSC code to ensure funds reach the correct branch.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default AddBeneficiary;