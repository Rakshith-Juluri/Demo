import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
export default function Loan() {
  const [expandedLoan, setExpandedLoan] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const navigate = useNavigate();

  // --- START OF YOUR UNTOUCHED LOGIC ---
  let currentUserId = localStorage.getItem("userId");
  if (!currentUserId || currentUserId === 'null') {
    try {
      const logged = localStorage.getItem('loggedInUser');
      if (logged) {
        const parsed = JSON.parse(logged);
        if (parsed && parsed.id) currentUserId = parsed.id;
      }
    } catch (e) {
      console.warn('Error parsing loggedInUser from localStorage', e);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const tryFetchUser = async (id) => {
        if (!id) return null;
        try {
          let res = await fetch(`http://localhost:4001/users/${id}`);
          if (res.ok) {
            const json = await res.json();
            if (json && (typeof json === 'object')) return json;
          }
          res = await fetch(`http://localhost:4001/users?id=${id}`);
          if (res.ok) {
            const arr = await res.json();
            if (Array.isArray(arr) && arr.length > 0) return arr[0];
          }
        } catch (e) {
          console.warn('tryFetchUser error', e);
          return null;
        }
        return null;
      };

      try {
        let data = null;
        if (currentUserId && currentUserId !== 'null') {
          data = await tryFetchUser(currentUserId);
        }

        if (!data) {
          try {
            const all = await fetch('http://localhost:4001/users');
            if (all.ok) {
              const arr = await all.json();
              if (Array.isArray(arr) && arr.length > 0) {
                const first = arr[0];
                data = first;
                try { localStorage.setItem('userId', first.id); } catch(e) {}
              }
            }
          } catch (e) {
            console.error('Error fetching users list fallback', e);
          }
        }

        if (data) {
          setUserData(data);
          if (data.loans && data.loans.length > 0) {
            setExpandedLoan(data.loans[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUserId]);

  const navigateToApply = () => {
    navigate('/loans/apply');
  };

  const handlePayNow = (loanId, amount) => {
    alert(`Redirecting to payment for Loan ${loanId}. Amount: ₹${amount.toLocaleString()}`);
  };
  // --- END OF YOUR UNTOUCHED LOGIC ---

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: "100vh"}}>
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  const loanData = userData?.loans || [];
  const activeLoans = loanData.filter(l => l.status === "ACTIVE");
  const completedLoans = loanData.filter(l => l.status === "COMPLETED");
  const appliedLoans = userData?.applications || [];

  const cibilScore = userData?.cibilScore || 0;
  const cibilPercentage = (cibilScore / 900) * 100;

  return (
    <>
      <div style={{
        background: "linear-gradient(180deg, #E0F2FE 0%, #F8FAFC 600px)",
        minHeight: "100vh",
        fontFamily: "'Inter', sans-serif",
        paddingBottom: "80px"
      }}>
        <div className="container pt-5">
          <div className="row mb-5 align-items-center">
            <div className="col-md-7 mb-4 mb-md-0">
              <h1 className="fw-black display-5 mb-2" style={{ color: "#0C4A6E", letterSpacing: "-2px", fontWeight: 900 }}>
                Welcome back, {userData?.name || "User"}.
              </h1>
              <p className="fs-5 text-secondary fw-medium">
                Your financial health is looking <span className={userData?.healthStatus === 'Excellent' ? "text-success fw-bold" : "text-warning fw-bold"}>{userData?.healthStatus || "Good"}</span> this month.
              </p>
              <div className="d-flex gap-2 mt-4">
                <button onClick={navigateToApply} className="btn btn-dark px-5 py-3 rounded-pill fw-bold shadow-lg transition-all" style={{ fontSize: '1.1rem' }}>
                  Apply for A Loan
                </button>
              </div>
            </div>

            <div className="col-md-5">
              <div className="card border-0 shadow-lg p-4 position-relative overflow-hidden" style={{ borderRadius: "35px", background: "white" }}>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="text-muted fw-bold small text-uppercase mb-1" style={{ letterSpacing: '1px' }}>CIBIL Credit Score</h6>
                    <h2 className="fw-black mb-0" style={{ color: "#0284C7", fontSize: "3.5rem", fontWeight: 900 }}>{cibilScore}</h2>
                  </div>
                  <div style={{
                    width: "120px", height: "120px",
                    borderRadius: "50%",
                    background: `conic-gradient(#0284C7 ${cibilPercentage}%, #f0f9ff 0%)`,
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    <div className="bg-white rounded-circle shadow-sm" style={{ width: "95px", height: "95px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className="bi bi-speedometer2 text-info fs-2"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-center mb-4">
            <div className="bg-white p-2 rounded-pill shadow-sm d-flex border">
              <button 
                onClick={() => setActiveTab("applied")}
                className={`btn rounded-pill px-4 fw-bold ${activeTab === 'applied' ? 'btn-primary shadow' : 'text-muted'}`}
              >Applied</button>
              <button 
                onClick={() => setActiveTab("active")}
                className={`btn rounded-pill px-4 fw-bold ${activeTab === 'active' ? 'btn-primary shadow' : 'text-muted'}`}
              >Active</button>
              <button 
                onClick={() => setActiveTab("completed")}
                className={`btn rounded-pill px-4 fw-bold ${activeTab === 'completed' ? 'btn-primary shadow' : 'text-muted'}`}
              >Completed</button>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              {activeTab === "applied" && (
                <div>
                  <h4 className="fw-bold mb-4 px-2" style={{ color: "#0C4A6E" }}>Applied Loans</h4>
                  {appliedLoans.length === 0 ? (
                    <div className="card border-0 shadow-sm p-5 text-center rounded-5 bg-white mb-5">
                       <i className="bi bi-clock-history text-warning display-4 mb-3"></i>
                       <p className="text-muted fw-bold">No recent applications found.</p>
                    </div>
                  ) : (
                    appliedLoans.map(app => (
                      <div key={app.id} className="card border-0 shadow-sm p-4 rounded-5 bg-white mb-3 border-start border-4 border-warning">
                        <div className="row align-items-center">
                          <div className="col-md-4">
                            <span className="badge bg-warning-subtle text-warning mb-1">UNDER REVIEW</span>
                            <div className="fw-bold fs-5">{app.loanType} Loan</div>
                            <small className="text-muted">ID: {app.id}</small>
                          </div>
                          <div className="col-md-4">
                            <small className="text-muted d-block">Requested Amount</small>
                            <span className="fw-bold">₹{app.amount?.toLocaleString()}</span>
                          </div>
                          <div className="col-md-4 text-end">
                             <div className="spinner-grow spinner-grow-sm text-warning me-2"></div>
                             <span className="text-warning fw-bold">Verification in Progress</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "active" && (
                <div>
                  <h4 className="fw-bold mb-4 px-2" style={{ color: "#0C4A6E" }}>Active Loans</h4>
                  {activeLoans.length === 0 ? (
                    <div className="card border-0 shadow-sm p-5 text-center rounded-5 bg-white mb-5">
                      <h3 className="fw-bold" style={{ color: "#0C4A6E" }}>No Active Loans</h3>
                    </div>
                  ) : (
                    activeLoans.map((loan) => (
                      <div key={loan.id} className="mb-4">
                        <div className={`card border-0 shadow-sm p-4 transition-all ${expandedLoan === loan.id ? 'rounded-top-5 border-bottom' : 'rounded-5 shadow-sm'}`} style={{ cursor: "pointer", background: "white", zIndex: 2, position: "relative" }}>
                          <div className="row align-items-center">
                            <div className="col-md-3" onClick={() => setExpandedLoan(expandedLoan === loan.id ? null : loan.id)}>
                              <div className="d-flex align-items-center gap-3">
                                <div className={`p-3 rounded-4 ${loan.category === 'HOME' ? 'bg-info-subtle text-info' : 'bg-warning-subtle text-warning'}`}>
                                  <i className={`bi ${loan.category === 'HOME' ? 'bi-house-heart' : 'bi-person-badge'} fs-3`}></i>
                                </div>
                                <div>
                                  <div className="fw-black text-uppercase small opacity-50" style={{ fontSize: '10px', letterSpacing: '1px' }}>{loan.category} Loan</div>
                                  <div className="fw-bold fs-5 text-dark">{loan.id}</div>
                                </div>
                              </div>
                            </div>
                            <div className="col-6 col-md-2 text-center text-md-start" onClick={() => setExpandedLoan(expandedLoan === loan.id ? null : loan.id)}>
                              <small className="text-muted fw-bold d-block mb-1" style={{ fontSize: '10px' }}>MONTHLY EMI</small>
                              <span className="fw-black fs-5 text-dark">₹{loan.monthlyEmi?.toLocaleString()}</span>
                            </div>
                            <div className="col-6 col-md-3 text-center text-md-start" onClick={() => setExpandedLoan(expandedLoan === loan.id ? null : loan.id)}>
                              <div className="d-flex justify-content-between">
                                 <div>
                                   <small className="text-muted fw-bold d-block mb-1" style={{ fontSize: '10px' }}>PAID</small>
                                   <span className="fw-bold text-success small">₹{loan.paidAmount?.toLocaleString()}</span>
                                 </div>
                                 <div className="text-end me-3">
                                   <small className="text-muted fw-bold d-block mb-1" style={{ fontSize: '10px' }}>REMAINING</small>
                                   <span className="fw-bold text-danger small">₹{(loan.principal - loan.paidAmount)?.toLocaleString()}</span>
                                 </div>
                              </div>
                            </div>
                            <div className="col-6 col-md-2 text-center">
                              <div className="progress mb-2" style={{ height: "10px", borderRadius: "20px", background: "#f1f5f9" }}>
                                <div className="progress-bar bg-info shadow-sm" style={{ width: `${loan.progress}%`, borderRadius: "20px" }}></div>
                              </div>
                            </div>
                            <div className="col-6 col-md-2 text-end">
                               <button onClick={(e) => { e.stopPropagation(); handlePayNow(loan.id, loan.monthlyEmi); }} className="btn btn-primary btn-sm rounded-pill px-3 fw-bold shadow-sm">Pay Now</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "completed" && (
                <div>
                  <h4 className="fw-bold mb-4 px-2" style={{ color: "#0C4A6E" }}>Completed Loans</h4>
                  {completedLoans.length === 0 ? (
                    <div className="card border-0 shadow-sm p-5 text-center rounded-5 bg-white mb-5">
                       <i className="bi bi-shield-check text-success display-4 mb-3"></i>
                       <p className="text-muted fw-bold">No completed loans in your history.</p>
                    </div>
                  ) : (
                    completedLoans.map((loan) => (
                      <div key={loan.id} className="card border-0 shadow-sm p-4 rounded-5 bg-white mb-3 opacity-75">
                        <div className="row align-items-center">
                           <div className="col-md-4">
                              <span className="badge bg-success mb-1">PAID IN FULL</span>
                              <div className="fw-bold fs-5">{loan.id}</div>
                           </div>
                           <div className="col-md-4">
                              <small className="text-muted d-block">Total Principal Repaid</small>
                              <span className="fw-bold text-dark">₹{loan.principal?.toLocaleString()}</span>
                           </div>
                           <div className="col-md-4 text-end">
                              <button className="btn btn-outline-success btn-sm rounded-pill fw-bold">
                                <i className="bi bi-file-earmark-arrow-down me-2"></i>NOC Download
                              </button>
                           </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}