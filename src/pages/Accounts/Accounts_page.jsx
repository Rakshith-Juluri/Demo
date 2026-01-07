import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Badge } from 'react-bootstrap';
import AccountTypeModal from './AccountTypeModal';

const AccountsPage = () => {
  const navigate = useNavigate();
  const [selectedAccId, setSelectedAccId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showStatusTracker, setShowStatusTracker] = useState(false);
  
  // State for active/approved accounts
  const [accounts, setAccounts] = useState([
    { id: 1, type: "Savings", bank: "Sky Bank", balance: "45,250.00", accNo: "6621 0082 4582", ifsc: "SKYB00012", status: "Active", branch: "Main Corporate" },
  ]);

  // State for pending application requests
  const [pendingRequests, setPendingRequests] = useState([]);

  const theme = {
    darkBlue: "#0C4A6E",
    primary: "#0284C7",
    warning: "#F59E0B",
    bgGradient: "linear-gradient(180deg, #E0F2FE 0%, #F8FAFC 600px)",
  };

  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        const res = await fetch("http://localhost:4001/accountRequests");
        if (res.ok) {
          const allData = await res.json();
          
          const approved = allData
            .filter(item => item.status === "approved")
            .map(item => ({
              id: item.id,
              type: item.accountype === 'saving' ? "Savings" : "Current",
              bank: "Sky Bank",
              balance: "0.00",
              accNo: item.accountNumber || "Wait...",
              ifsc: "SKYB00012",
              status: "Active",
              branch: "Main Corporate"
            }));
          
          setAccounts(prev => [...prev.filter(a => a.id === 1), ...approved]);

          const pending = allData.filter(item => item.status === "pending");
          setPendingRequests(pending);
        }
      } catch (err) {
        console.error("Error connecting to JSON server:", err);
      }
    };
    fetchAccountData();
  }, []);

  const transactions = [
    { id: 101, title: "Groceries Store", date: "Jan 02", amount: "-1,200", type: "debit", category: "Shopping" },
    { id: 102, title: "Salary Credit", date: "Jan 01", amount: "+85,000", type: "credit", category: "Income" },
  ];

  const handleCreateAccount = (type) => {
    setIsModalOpen(false);
    if (type === 'savings') navigate('/app/accounts/savings-account');
    else if (type === 'current') navigate('/open-current-account');
  };

  const toggleAccountStatus = (id) => {
    setAccounts(accounts.map(acc => acc.id === id ? { ...acc, status: acc.status === "Active" ? "Deactivated" : "Active" } : acc));
  };

  const selectedAccount = accounts.find(acc => acc.id === selectedAccId);

  return (
    <div style={{ background: theme.bgGradient, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      
      <AccountTypeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={handleCreateAccount} 
        theme={theme} 
      />

      <Modal 
        show={showStatusTracker} 
        onHide={() => setShowStatusTracker(false)}
        centered
        size="lg"
        contentClassName="border-0 rounded-5 shadow-lg overflow-hidden"
        backdropClassName="custom-backdrop"
      >
        <div className="d-flex flex-column flex-md-row" style={{ minHeight: '500px' }}>
          <div className="p-5 text-white d-flex flex-column justify-content-between" style={{ backgroundColor: theme.darkBlue, width: '35%' }}>
            <div>
              <i className="bi bi-shield-check display-4 mb-3 d-block"></i>
              <h3 className="fw-black">Live Tracker</h3>
              <p className="opacity-75 small">Verifying your credentials for secure banking.</p>
            </div>
            <div className="small opacity-50">© 2026 Sky Bank</div>
          </div>

          <div className="p-5 bg-white flex-grow-1 position-relative">
            <button onClick={() => setShowStatusTracker(false)} className="btn-close position-absolute top-0 end-0 m-4"></button>
            <h5 className="fw-bold mb-4" style={{ color: theme.darkBlue }}>Application Progress</h5>
            {pendingRequests.length > 0 ? (
              pendingRequests.map((req) => (
                <div key={req.id} className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2 fw-bold">
                      {req.accountype.toUpperCase()}
                    </span>
                    <small className="text-muted fw-bold small">ID: #SK{req.requestId}</small>
                  </div>
                  <div className="ms-2">
                    <div className="step-item active"><div className="step-line"></div><div className="step-dot"></div><div className="step-content"><div className="fw-bold small">Submitted</div></div></div>
                    <div className="step-item current"><div className="step-line"></div><div className="step-dot pulse"></div><div className="step-content"><div className="fw-bold small">Compliance Review</div></div></div>
                    <div className="step-item"><div className="step-dot"></div><div className="step-content"><div className="fw-bold small opacity-50">Activation</div></div></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-5"><p className="text-secondary">No active applications.</p></div>
            )}
          </div>
        </div>
      </Modal>

      <div className="container py-5">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
          <div>
            <h1 className="fw-black display-6 mb-0" style={{ color: theme.darkBlue, fontWeight: 900 }}>My Accounts</h1>
            <p className="fs-5 text-secondary fw-medium">Manage your digital assets and security.</p>
          </div>
          <div className="d-flex gap-2">
            <button 
              onClick={() => setShowStatusTracker(true)}
              className="btn btn-white border border-2 rounded-pill px-4 py-3 fw-bold shadow-sm d-flex align-items-center"
              style={{ color: theme.darkBlue, borderColor: '#e2e8f0', background: 'white' }}
            >
              <i className="bi bi-activity me-2 text-primary"></i> Track Status
              {pendingRequests.length > 0 && <span className="ms-2 badge bg-primary rounded-pill">{pendingRequests.length}</span>}
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary rounded-pill px-4 py-3 fw-bold shadow-sm d-flex align-items-center"
              style={{ backgroundColor: theme.primary, border: 'none' }}
            >
              <i className="bi bi-plus-circle-fill me-2"></i> Open New Account
            </button>
          </div>
        </div>

        {/* --- ACTIVE ACCOUNTS GRID --- */}
        <h6 className="text-uppercase fw-bold text-muted small mb-3" style={{ letterSpacing: '1px' }}>
          <i className="bi bi-check-circle-fill me-2 text-primary"></i>Active Accounts
        </h6>
        <div className="row g-4 mb-5">
          {accounts.map((acc) => (
            <div className="col-12 col-md-6 col-lg-4" key={acc.id}>
              <div 
                onClick={() => setSelectedAccId(acc.id)}
                className={`card border-0 rounded-5 p-4 shadow-sm transition-all h-100 ${selectedAccId === acc.id ? 'bg-dark text-white' : 'bg-white'}`}
                style={{ cursor: 'pointer', transform: selectedAccId === acc.id ? 'scale(1.02)' : 'scale(1)', transition: '0.3s' }}
              >
                <div className="d-flex justify-content-between align-items-start mb-4">
                   <span className={`badge rounded-pill px-3 py-2 ${selectedAccId === acc.id ? 'bg-primary' : 'bg-primary bg-opacity-10 text-primary'}`}>
                      {acc.type}
                   </span>
                   <i className={`bi bi-bank2 fs-3 ${selectedAccId === acc.id ? 'text-white-50' : 'text-primary opacity-25'}`}></i>
                </div>
                <h2 className="fw-black mb-1">₹{acc.balance}</h2>
                <p className={`fw-medium mb-0 ${selectedAccId === acc.id ? 'text-light opacity-50' : 'text-muted'}`}>{acc.accNo}</p>
              </div>
            </div>
          ))}
        </div>

        {/* --- DETAILS & TRANSACTIONS SECTION --- */}
        {selectedAccount && (
          <div className="row g-4 animate__animated animate__fadeInUp">
            <div className="col-lg-5">
              <div className="card border-0 shadow-sm rounded-5 p-4 bg-white h-100">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold mb-0" style={{ color: theme.darkBlue }}>Account Management</h5>
                  <span className={`badge rounded-pill px-3 py-1 ${selectedAccount.status === "Active" ? "bg-success" : "bg-danger"}`}>
                    {selectedAccount.status}
                  </span>
                </div>

                <div className="bg-light rounded-4 p-3 mb-3">
                  <small className="text-muted d-block text-uppercase fw-bold" style={{fontSize: '10px'}}>Branch</small>
                  <span className="fw-bold">{selectedAccount.branch}</span>
                </div>
                
                <div className="bg-light rounded-4 p-3 mb-4">
                  <small className="text-muted d-block text-uppercase fw-bold" style={{fontSize: '10px'}}>IFSC Code</small>
                  <span className="fw-bold">{selectedAccount.ifsc}</span>
                </div>

                <button 
                  onClick={() => navigate('/app/accounts/control', { state: { account: selectedAccount } })}
                  className={`btn w-100 py-3 rounded-pill fw-black shadow-sm d-flex align-items-center justify-content-center gap-2 ${
                    selectedAccount.status === "Active" ? "btn-outline-danger" : "btn-outline-success"
                  }`}
                  style={{ borderWidth: '2px' }}
                >
                  {selectedAccount.status === "Active" ? (
                    <>
                      <i className="bi bi-snow2"></i> DEACTIVATE ACCOUNT
                    </>
                  ) : (
                    <>
                      <i className="bi bi-unlock-fill"></i> REACTIVATE ACCOUNT
                    </>
                  )}
                </button>
                
                <p className="text-center text-muted small mt-3">
                  Proceeding will require PAN & OTP verification.
                </p>
              </div>
            </div>

            <div className="col-lg-7">
              <div className="card border-0 shadow-sm rounded-5 p-4 bg-white">
                <h5 className="fw-bold mb-4" style={{ color: theme.darkBlue }}>Recent Transactions</h5>
                {transactions.map(tx => (
                  <div key={tx.id} className="d-flex align-items-center justify-content-between py-3 border-bottom border-light">
                    <div className="d-flex align-items-center">
                      <div className={`p-2 rounded-3 me-3 ${tx.type === 'credit' ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>
                        <i className={`bi bi-arrow-${tx.type === 'credit' ? 'down-left' : 'up-right'}`}></i>
                      </div>
                      <div>
                        <div className="fw-bold small">{tx.title}</div>
                        <div className="text-muted" style={{fontSize: '0.7rem'}}>{tx.date}</div>
                      </div>
                    </div>
                    <div className="fw-black">{tx.amount}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .fw-black { font-weight: 900 !important; }
        .rounded-5 { border-radius: 2rem !important; }
        .custom-backdrop { background-color: rgba(12, 74, 110, 0.4) !important; backdrop-filter: blur(8px); }
        .step-item { position: relative; padding-bottom: 25px; display: flex; gap: 15px; }
        .step-line { position: absolute; left: 7px; top: 15px; bottom: 0; width: 2px; background: #e2e8f0; }
        .step-dot { width: 16px; height: 16px; border-radius: 50%; background: #cbd5e1; z-index: 1; border: 3px solid white; }
        .step-item.active .step-dot, .step-item.active .step-line { background: ${theme.primary}; }
        .step-item.current .step-dot.pulse { background: ${theme.warning}; animation: statusPulse 2s infinite; }
        @keyframes statusPulse { 0% { box-shadow: 0 0 0 0px rgba(245,158,11,0.4); } 70% { box-shadow: 0 0 0 10px rgba(245,158,11,0); } 100% { box-shadow: 0 0 0 0px rgba(245,158,11,0); } }
        .transition-all:hover { transform: translateY(-5px); box-shadow: 0 1rem 3rem rgba(0,0,0,.1) !important; }
      `}</style>
    </div>
  );
};

export default AccountsPage;