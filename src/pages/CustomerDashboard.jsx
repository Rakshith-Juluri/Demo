import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function CustomerDashboard() {
  const [userData, setUserData] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // KYC State: "Not Started", "Pending", or "Approved"
  const [kycStatus, setKycStatus] = useState("Not Started");
  const [showKycError, setShowKycError] = useState(false);

  const navigate = useNavigate();

  const theme = {
    primary: "#0284C7",
    darkBlue: "#0C4A6E",
    bgGradient: "linear-gradient(180deg, #E0F2FE 0%, #F8FAFC 600px)",
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetching user 90f2 (Ananya) from your merged DB
        const [userRes, accountsRes, transRes] = await Promise.all([
          fetch("http://localhost:4001/users/90f2"),
          fetch("http://localhost:4001/accounts?customerId=90f2"),
          fetch("http://localhost:4001/transactions?accountId=ACC001&_limit=5")
        ]);

        const user = await userRes.json();
        setUserData(user);
        setAccounts(await accountsRes.json());
        setTransactions(await transRes.json());

        // Set status based on accountRequests in db.json
        if (user?.accountRequests?.length > 0) {
          const status = user.accountRequests[0].status;
          // Capitalize first letter: approved -> Approved
          setKycStatus(status.charAt(0).toUpperCase() + status.slice(1));
        }
      } catch (e) {
        console.error("Data Load Error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // Protection Function (Replaces Alerts)
  const handleServiceClick = (e, targetPath) => {
    if (kycStatus !== "Approved") {
      e.preventDefault();
      setShowKycError(true);
      // Auto-hide error message after 4 seconds
      setTimeout(() => setShowKycError(false), 4000);
    } else {
      navigate(targetPath);
    }
  };

  if (loading) return (
    <div className="vh-100 d-flex justify-content-center align-items-center" style={{ background: theme.bgGradient }}>
      <div className="spinner-grow text-primary" role="status"></div>
    </div>
  );

  return (
    <div style={{ background: theme.bgGradient, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      
      {/* BOOTSTRAP TOAST / NOTIFICATION BOX (REPLACES ALERT) */}
      <div className={`position-fixed top-0 start-50 translate-middle-x mt-4 z-3 shadow-lg p-3 rounded-4 bg-white border-start border-danger border-5 animate__animated ${showKycError ? 'd-block' : 'd-none'}`} 
           style={{ minWidth: "300px", transition: "0.3s" }}>
        <div className="d-flex align-items-center gap-3">
          <i className="bi bi-shield-lock-fill text-danger fs-3"></i>
          <div>
            <h6 className="mb-0 fw-bold text-danger">Access Restricted</h6>
            <p className="mb-0 small text-secondary">KYC Verification is mandatory for this service.</p>
          </div>
          <button type="button" className="btn-close ms-auto" onClick={() => setShowKycError(false)}></button>
        </div>
      </div>

      <main className="container py-5">
        <div className="row g-4">
          
          <div className="col-12 mb-2 d-flex justify-content-between align-items-center">
            <div>
               <h1 className="fw-black display-6" style={{ color: theme.darkBlue, fontWeight: 900 }}>
                Hello, {userData?.name || "User"}
              </h1>
              <p className="text-secondary fs-5 fw-medium">Welcome back to our Bank.</p>
            </div>
          </div>

          {/* Card 1: Balance */}
          <div className="col-md-4">
            <div className="card border-0 p-4 h-100 shadow-sm rounded-4 bg-white">
              <span className="text-muted small fw-bold mb-2 d-block">TOTAL AVAILABLE BALANCE</span>
              <h2 className="fw-black mb-4" style={{ color: theme.darkBlue }}>₹{userData?.balance?.toLocaleString() || "0"}</h2>
              <button 
                onClick={(e) => handleServiceClick(e, "/app/funds")}
                className="btn btn-primary rounded-pill fw-bold py-2 w-100"
              >
                Send Money
              </button>
            </div>
          </div>

          {/* Card 2: KYC Dynamic Status */}
          <div className="col-md-4">
            <div className={`card border-0 p-4 h-100 shadow-sm rounded-4 ${kycStatus === 'Approved' ? 'bg-dark text-white' : 'bg-white'}`}>
              <div className="d-flex justify-content-between mb-3">
                <span className={`small fw-bold text-uppercase ${kycStatus === 'Approved' ? 'opacity-75' : 'text-muted'}`}>KYC Profile</span>
                <i className={`bi ${kycStatus === 'Approved' ? 'bi-check-circle-fill text-info' : 'bi-clock-history text-warning'}`}></i>
              </div>
              
              <h3 className="fw-black">
                {kycStatus === "Approved" ? "Verified" : kycStatus}
              </h3>
              
              <p className={`small mb-4 ${kycStatus === 'Approved' ? 'opacity-50' : 'text-secondary'}`}>
                {kycStatus === "Approved" 
                  ? "Full banking access enabled." 
                  : "Complete verification to unlock transfers."}
              </p>
              
              {kycStatus !== "Approved" && kycStatus !== "Pending" ? (
                <Link to="/app/kyc" className="btn btn-primary rounded-pill fw-bold btn-sm py-2">
                   Complete KYC <i className="bi bi-arrow-right ms-1"></i>
                </Link>
              ) : kycStatus === "Pending" ? (
                <button className="btn btn-light rounded-pill fw-bold btn-sm py-2 text-warning" disabled>
                   <span className="spinner-border spinner-border-sm me-2"></span> Under Review
                </button>
              ) : (
                <div className="badge bg-success bg-opacity-10 text-success p-2 rounded-pill">
                  <i className="bi bi-shield-check me-1"></i> Trusted Member
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Credit Score */}
          <div className="col-md-4">
            <div className="card border-0 p-4 h-100 shadow-sm rounded-4 bg-white">
              <span className="text-muted small fw-bold mb-2 d-block">CREDIT SCORE</span>
              <div className="d-flex align-items-center gap-3">
                <h2 className="fw-black text-success mb-0">{userData?.cibilScore || "710"}</h2>
                <div className="bg-success text-white px-2 py-1 rounded-pill" style={{fontSize: '10px', fontWeight: 'bold'}}>
                  {userData?.healthStatus?.toUpperCase() || "GOOD"}
                </div>
              </div>
              <hr className="opacity-5" />
              <button 
                onClick={(e) => handleServiceClick(e, "/app/loans")}
                className="btn btn-link p-0 text-decoration-none small fw-bold text-primary"
              >
                apply for new loans →
              </button>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0">Recent Activity</h5>
                <button className="btn btn-light btn-sm rounded-pill px-3 fw-bold text-primary small">View Statement</button>
              </div>
              <div className="table-responsive">
                <table className="table table-borderless align-middle">
                  <thead className="table-light">
                    <tr style={{fontSize: '11px'}}>
                      <th className="text-muted px-3">METHOD</th>
                      <th className="text-muted text-center">TIMESTAMP</th>
                      <th className="text-muted text-end px-3">AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(t => (
                      <tr key={t.id} className="border-bottom-subtle">
                        <td className="fw-semibold py-3 px-3">
                           <span className="badge bg-light text-dark me-2">{t.transferType}</span>
                           Sent to {t.beneficiaryId}
                        </td>
                        <td className="text-center text-secondary small">{new Date(t.timestamp).toLocaleTimeString()}</td>
                        <td className={`text-end px-3 fw-bold ${t.status === 'SUCCESS' ? 'text-success' : 'text-danger'}`}>
                          ₹{t.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Accounts Sidebar */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
              <h6 className="fw-bold text-muted mb-4 text-uppercase small" style={{letterSpacing: '1px'}}>My Linked Accounts</h6>
              {accounts.map(acc => (
                <div key={acc.id} className="d-flex align-items-center justify-content-between mb-3 p-3 bg-light rounded-4">
                   <div className="d-flex align-items-center gap-2">
                      <div className="bg-white p-2 rounded-circle shadow-sm">
                        <i className={`bi bi-piggy-bank text-primary`}></i>
                      </div>
                      <div>
                        <div className="fw-bold small">{acc.displayName}</div>
                        <div className="text-muted" style={{fontSize: '10px'}}>{acc.status}</div>
                      </div>
                   </div>
                   <div className="fw-bold">₹{acc.balance?.toLocaleString()}</div>
                </div>
              ))}
              <button className="btn btn-outline-primary w-100 rounded-pill fw-bold mt-2 py-2 small">Manage Accounts</button>
            </div>
          </div>
        </div>
      </main>

      {/* Global Style overrides */}
      <style>{`
        .fw-black { font-weight: 900 !important; }
        .rounded-4 { border-radius: 1.25rem !important; }
        .z-3 { z-index: 1050 !important; }
      `}</style>
    </div>
  );
}