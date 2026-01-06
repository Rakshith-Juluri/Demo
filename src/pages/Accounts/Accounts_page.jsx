import React, { useState } from 'react';

const AccountsPage = () => {
  // State to track which account is currently active/selected
  const [selectedAccId, setSelectedAccId] = useState(null);
  
  // Dynamic Account Data (In a real app, this comes from an API/JSON Server)
  const [accounts, setAccounts] = useState([
    { id: 1, type: "Savings", bank: "Sky Bank", balance: "45,250.00", accNo: "6621 0082 4582", ifsc: "SKYB00012", status: "Active", branch: "Main Corporate" },
    { id: 2, type: "Current", bank: "Sky Bank", balance: "1,12,000.00", accNo: "8892 1100 9910", ifsc: "SKYB00012", status: "Active", branch: "Digital Hub" },
    { id: 3, type: "Fixed Deposit", bank: "Sky Bank", balance: "5,00,000.00", accNo: "FD-4421-990", ifsc: "SKYB00012", status: "Deactivated", branch: "Main Corporate" }
  ]);

  const transactions = [
    { id: 101, title: "Groceries Store", date: "Jan 02", amount: "-1,200", type: "debit", category: "Shopping" },
    { id: 102, title: "Salary Credit", date: "Jan 01", amount: "+85,000", type: "credit", category: "Income" },
    { id: 103, title: "Electric Bill", date: "Dec 30", amount: "-4,500", type: "debit", category: "Bills" },
  ];

  const theme = {
    darkBlue: "#0C4A6E",
    primary: "#0284C7",
    bgGradient: "linear-gradient(180deg, #E0F2FE 0%, #F8FAFC 600px)",
  };

  // Logic to toggle account status
  const toggleAccountStatus = (id) => {
    setAccounts(accounts.map(acc => {
      if (acc.id === id) {
        return { ...acc, status: acc.status === "Active" ? "Deactivated" : "Active" };
      }
      return acc;
    }));
  };

  const selectedAccount = accounts.find(acc => acc.id === selectedAccId);

  return (
    <div style={{ background: theme.bgGradient, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <div className="container py-5">
        
        {/* Header Section */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
          <div>
            <h1 className="fw-black display-6 mb-0" style={{ color: theme.darkBlue, fontWeight: 900 }}>My Accounts</h1>
            <p className="text-secondary fw-medium">Select an account to view details and manage security.</p>
          </div>
          <button className="btn btn-primary rounded-pill px-4 py-3 fw-bold shadow-sm d-flex align-items-center justify-content-center">
            <i className="bi bi-plus-circle-fill me-2"></i> Open New Account
          </button>
        </div>

        {/* Account Cards - Responsive Grid */}
        <div className="row g-4 mb-5">
          {accounts.map((acc) => (
            <div className="col-12 col-md-6 col-lg-4" key={acc.id}>
              <div 
                onClick={() => setSelectedAccId(acc.id)}
                className={`card border-0 rounded-5 p-4 shadow-sm transition-all h-100 ${selectedAccId === acc.id ? 'bg-dark text-white' : 'bg-white'}`}
                style={{ cursor: 'pointer', transform: selectedAccId === acc.id ? 'scale(1.02)' : 'scale(1)', transition: '0.3s' }}
              >
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div>
                    <span className={`badge rounded-pill px-3 py-2 ${selectedAccId === acc.id ? 'bg-primary' : 'bg-primary bg-opacity-10 text-primary'}`}>
                      {acc.type}
                    </span>
                    {acc.status === "Deactivated" && (
                      <span className="badge rounded-pill bg-danger ms-2 px-2"><i className="bi bi-snow"></i> Frozen</span>
                    )}
                  </div>
                  <i className={`bi bi-bank2 fs-3 ${selectedAccId === acc.id ? 'text-white-50' : 'text-primary opacity-25'}`}></i>
                </div>
                <h2 className="fw-black mb-1">₹{acc.balance}</h2>
                <p className={`fw-medium mb-0 ${selectedAccId === acc.id ? 'text-light opacity-50' : 'text-muted'}`}>
                  {acc.accNo}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic Detail Section - Only shows when account is clicked */}
        {selectedAccount ? (
          <div className="row g-4 animate__animated animate__fadeInUp">
            
            {/* Left: Account Management & Details */}
            <div className="col-lg-5">
              <div className="card border-0 shadow-sm rounded-5 p-4 bg-white h-100">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold mb-0" style={{ color: theme.darkBlue }}>Management</h5>
                  
                  {/* ACTIVATE/DEACTIVATE SWITCH */}
                  <div className="form-check form-switch">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      role="switch" 
                      id="statusSwitch"
                      checked={selectedAccount.status === "Active"}
                      onChange={() => toggleAccountStatus(selectedAccount.id)}
                      style={{ cursor: 'pointer', width: '2.5rem', height: '1.25rem' }}
                    />
                    <label className="form-check-label small fw-bold ms-2" htmlFor="statusSwitch">
                      {selectedAccount.status === "Active" ? "Active" : "Frozen"}
                    </label>
                  </div>
                </div>

                <div className="bg-light rounded-4 p-3 mb-4 text-center">
                   <p className="small text-muted mb-1">Status Message</p>
                   <p className={`small fw-bold mb-0 ${selectedAccount.status === "Active" ? 'text-success' : 'text-danger'}`}>
                     {selectedAccount.status === "Active" 
                       ? "Your account is secure and ready for transactions." 
                       : "All outgoing transactions are currently restricted."}
                   </p>
                </div>

                <div className="d-flex justify-content-between border-bottom py-3">
                  <span className="text-muted small fw-medium">Bank / Branch</span>
                  <span className="fw-bold small text-end">{selectedAccount.bank} <br/> <small className="text-muted fw-normal">{selectedAccount.branch}</small></span>
                </div>
                <div className="d-flex justify-content-between border-bottom py-3">
                  <span className="text-muted small fw-medium">IFSC Code</span>
                  <span className="fw-bold small">{selectedAccount.ifsc}</span>
                </div>
                <div className="d-flex gap-2 mt-4">
                   <button className="btn btn-outline-primary rounded-pill w-100 fw-bold small">Download PDF</button>
                   <button className="btn btn-light rounded-pill w-100 fw-bold small">Settings</button>
                </div>
              </div>
            </div>

            {/* Right: Transactions list */}
            <div className="col-lg-7">
              <div className="card border-0 shadow-sm rounded-5 p-4 bg-white">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold mb-0" style={{ color: theme.darkBlue }}>Recent Transactions</h5>
                  <span className="badge bg-light text-dark rounded-pill fw-medium">Monthly View</span>
                </div>

                <div className="transaction-list">
                  {transactions.map(tx => (
                    <div key={tx.id} className="d-flex align-items-center justify-content-between py-3 border-bottom border-light">
                      <div className="d-flex align-items-center">
                        <div className={`p-2 rounded-4 me-3 ${tx.type === 'credit' ? 'bg-success bg-opacity-10' : 'bg-danger bg-opacity-10'}`}>
                          <i className={`bi bi-arrow-${tx.type === 'credit' ? 'down-left' : 'up-right'} ${tx.type === 'credit' ? 'text-success' : 'text-danger'}`}></i>
                        </div>
                        <div>
                          <div className="fw-bold text-dark mb-0" style={{ fontSize: '0.95rem' }}>{tx.title}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{tx.date} • {tx.category}</div>
                        </div>
                      </div>
                      <div className={`fw-black ${tx.type === 'credit' ? 'text-success' : 'text-dark'}`}>
                        {tx.amount}
                      </div>
                    </div>
                  ))}
                </div>
                
                <button className="btn btn-link text-decoration-none text-primary fw-bold w-100 mt-3 small">
                  View Full Statement <i className="bi bi-chevron-right ms-1"></i>
                </button>
              </div>
            </div>

          </div>
        ) : (
          /* Empty State - Prompt user to click */
          <div className="text-center py-5 bg-white rounded-5 shadow-sm border-dashed border-2">
            <i className="bi bi-cursor-fill display-4 text-primary opacity-25 mb-3"></i>
            <h4 className="fw-bold text-muted">Select an account to see more</h4>
            <p className="text-secondary small">Click on any card above to view details and manage its security.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default AccountsPage;