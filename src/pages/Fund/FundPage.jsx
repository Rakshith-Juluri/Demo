import React from 'react';
import { useNavigate, Outlet } from 'react-router-dom';

const FundPage = ({ onSelfTransfer, onTransferToSomeone }) => {
  const navigate = useNavigate();

  const theme = {
    primary: "#0284C7",
    darkBlue: "#0C4A6E",
    bgGradient: "linear-gradient(180deg, #E0F2FE 0%, #F8FAFC 600px)",
  };

  const handleSelfTransfer = () => {
    if (onSelfTransfer) return onSelfTransfer();
    if (navigate) navigate('/funds/self-transfer');
  };

  const handleTransferToSomeone = () => {
    if (onTransferToSomeone) return onTransferToSomeone();
    if (navigate) navigate('/funds/transfer');
  };

  return (
    <div style={{ background: theme.bgGradient, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <div className="container py-5">
        
        {/* Header Section */}
        <div className="mb-5 text-center text-md-start">
          <h1 className="fw-black display-6" style={{ color: theme.darkBlue, fontWeight: 900 }}>
            Money Transfer
          </h1>
          <p className="text-secondary fs-5 fw-medium">
            Move money instantly between accounts or send to someone new.
          </p>
        </div>

        {/* Security Banner */}
        <div className="alert border-0 shadow-sm rounded-4 bg-white d-flex align-items-center gap-3 p-3 mb-4">
          <div className="bg-success bg-opacity-10 p-2 rounded-circle">
            <i className="bi bi-shield-check text-success fs-4"></i>
          </div>
          <div>
            <div className="fw-bold small text-uppercase" style={{ letterSpacing: '0.5px' }}>Bank-Grade Security</div>
            <div className="text-muted small">Your transfers are protected with multi-factor authentication.</div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="row g-4 mb-5">
          {/* Self Transfer Card */}
          <div className="col-md-6">
            <div className="card border-0 shadow-sm rounded-4 h-100 bg-white p-4">
              <div className="d-flex align-items-center mb-4">
                <div className="bg-primary bg-opacity-10 p-3 rounded-4">
                  <i className="bi bi-arrow-left-right text-primary fs-3"></i>
                </div>
                <h4 className="ms-3 fw-bold mb-0" style={{ color: theme.darkBlue }}>Self Transfer</h4>
              </div>
              <p className="text-secondary mb-4 flex-grow-1">
                Move funds between your own Savings and Checking accounts instantly.
              </p>
              <button className="btn btn-primary w-100 rounded-pill py-3 fw-bold shadow-sm" onClick={handleSelfTransfer}>
                Start Self Transfer
              </button>
            </div>
          </div>

          {/* Transfer to Someone Card */}
          <div className="col-md-6">
            <div className="card border-0 shadow-sm rounded-4 h-100 bg-dark text-white p-4">
              <div className="d-flex align-items-center mb-4">
                <div className="bg-white bg-opacity-10 p-3 rounded-4">
                  <i className="bi bi-send text-white fs-3"></i>
                </div>
                <h4 className="ms-3 fw-bold mb-0">Send Money</h4>
              </div>
              <p className="opacity-75 mb-4 flex-grow-1">
                Pay friends, family, or vendors using Account Details or UPI.
              </p>
              <button className="btn btn-light rounded-pill py-3 fw-bold text-dark shadow-sm" onClick={handleTransferToSomeone}>
                Transfer to Beneficiary
              </button>
            </div>
          </div>
        </div>

        {/* --- NEW: BENEFICIARY MANAGEMENT SECTION --- */}
        <div className="p-4 rounded-4 bg-white shadow-sm border-0 mb-5">
          <div className="row align-items-center">
            <div className="col-md-7 text-center text-md-start">
              <div className="d-flex align-items-center justify-content-center justify-content-md-start mb-2">
                <div className="bg-info bg-opacity-10 p-2 rounded-3 me-3">
                  <i className="bi bi-people-fill text-info fs-5"></i>
                </div>
                <h5 className="fw-bold mb-0" style={{ color: theme.darkBlue }}>Manage Payees</h5>
              </div>
              <p className="text-muted small mb-0">
                Register new beneficiaries or view your existing list for faster transfers.
              </p>
            </div>
            <div className="col-md-5 mt-4 mt-md-0">
              <div className="d-flex gap-3 justify-content-center justify-content-md-end">
                {/* ADD BENEFICIARY BUTTON */}
                <button 
                  className="btn btn-outline-primary rounded-pill px-4 fw-bold"
                  onClick={() => navigate('/funds/add-beneficiary')}
                >
                  <i className="bi bi-person-plus me-2"></i> Add New
                </button>

                {/* MANAGE BENEFICIARIES BUTTON */}
                <button 
                  className="btn btn-dark rounded-pill px-4 fw-bold"
                  onClick={() => navigate('/funds/manage-beneficiaries')}
                >
                  <i className="bi bi-person-lines-fill me-2"></i> Manage List
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-5">
          <h5 className="fw-bold mb-4 px-2" style={{ color: theme.darkBlue }}>Frequently Asked Questions</h5>
          <div className="accordion accordion-flush rounded-4 overflow-hidden shadow-sm" id="fundsHelp">
            <div className="accordion-item border-0">
              <h2 className="accordion-header">
                <button className="accordion-button fw-bold py-3 px-4" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne">
                  How do transaction limits work?
                </button>
              </h2>
              <div id="collapseOne" className="accordion-collapse collapse show" data-bs-parent="#fundsHelp">
                <div className="accordion-body text-secondary small py-3 px-4">
                  Daily and per-transaction limits depend on the transfer type (NEFT/IMPS/UPI) and your account tier.
                </div>
              </div>
            </div>
            <div className="accordion-item border-0 border-top">
              <h2 className="accordion-header">
                <button className="accordion-button collapsed fw-bold py-3 px-4" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo">
                  Are there any hidden fees?
                </button>
              </h2>
              <div id="collapseTwo" className="accordion-collapse collapse" data-bs-parent="#fundsHelp">
                <div className="accordion-body text-secondary small py-3 px-4">
                  Self transfers are completely free. External transfers may have nominal charges based on the channel.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Nested routes render here */}
        <div className="mt-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default FundPage;