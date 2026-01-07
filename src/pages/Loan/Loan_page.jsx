import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";


export default function Loan() {
  const [expandedLoan, setExpandedLoan] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    navigate('/app/loans/apply');
  };

  const handlePayNow = (loanId, amount) => {
    // FUNCTIONALITY PLACEHOLDER: Integrate your payment gateway here
    alert(`Redirecting to payment for Loan ${loanId}. Amount: ₹${amount.toLocaleString()}`);
  };

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
              <h1 className="fw-black display-6 mb-0" style={{ color: "#0C4A6E", letterSpacing: "-2px", fontWeight: 900 }}>
                Welcome back, {userData?.name || "User"}.
              </h1>
              <p className="fs-5 text-secondary fw-medium">
                Your financial health is looking <span className={userData?.healthStatus === 'Excellent' ? "text-success fw-bold" : "text-warning fw-bold"}>{userData?.healthStatus || "Good"}</span> this month.
              </p>
              <div className="d-flex gap-2 mt-4">
                <button
                  onClick={navigateToApply}
                  className="btn btn-dark px-5 py-3 rounded-pill fw-bold shadow-lg transition-all"
                  style={{ fontSize: '1.1rem' }}
                >
                  Apply for A Loan
                </button>
              </div>
            </div>

            <div className="col-md-5">
              <div className="card border-0 shadow-lg p-4 position-relative overflow-hidden"
                   style={{ borderRadius: "35px", background: "white" }}>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="text-muted fw-bold small text-uppercase mb-1" style={{ letterSpacing: '1px' }}>CIBIL Credit Score</h6>
                    <h2 className="fw-black mb-0" style={{ color: "#0284C7", fontSize: "3.5rem", fontWeight: 900 }}>{cibilScore}</h2>
                  </div>
                  <div style={{
                    width: "120px", height: "120px",
                    borderRadius: "50%",
                    background: `conic-gradient(#0284C7 ${cibilPercentage}%, #f0f9ff 0%)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "inset 0 0 10px rgba(0,0,0,0.05)"
                  }}>
                    <div className="bg-white rounded-circle shadow-sm" style={{ width: "95px", height: "95px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className="bi bi-speedometer2 text-info fs-2"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <h4 className="fw-bold mb-4 px-2" style={{ color: "#0C4A6E" }}>Active Loans</h4>
              
              {activeLoans.length === 0 ? (
                <div className="card border-0 shadow-sm p-5 text-center rounded-5 bg-white mb-5">
                  <div className="mb-4">
                    <i className="bi bi-bank2 text-info" style={{ fontSize: "4rem" }}></i>
                  </div>
                  <h3 className="fw-bold" style={{ color: "#0C4A6E" }}>No Active Loans Found</h3>
                  <p className="text-secondary mx-auto mb-4" style={{ maxWidth: "450px" }}>
                    It looks like you don't have any active loans yet. Apply now to get started.
                  </p>
                  <div>
                    <button onClick={navigateToApply} className="btn btn-outline-info rounded-pill px-4 fw-bold">
                      Apply for Loan
                    </button>
                  </div>
                </div>
              ) : (
                activeLoans.map((loan) => (
                  <div key={loan.id} className="mb-4">
                    <div
                      className={`card border-0 shadow-sm p-4 transition-all ${expandedLoan === loan.id ? 'rounded-top-5 border-bottom' : 'rounded-5 shadow-sm'}`}
                      style={{ cursor: "pointer", background: "white", zIndex: 2, position: "relative" }}
                    >
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
                          <div className="d-flex justify-content-between align-items-end mb-1">
                             <small className="text-muted fw-bold" style={{ fontSize: '10px' }}>PROGRESS</small>
                             <small className="fw-bold text-primary" style={{ fontSize: '10px' }}>{loan.tenureRemaining} DUE</small>
                          </div>
                          <div className="progress mb-2" style={{ height: "10px", borderRadius: "20px", background: "#f1f5f9" }}>
                            <div className="progress-bar bg-info shadow-sm" style={{ width: `${loan.progress}%`, borderRadius: "20px" }}></div>
                          </div>
                        </div>

                        <div className="col-6 col-md-2 text-end">
                           <button 
                             onClick={(e) => {
                               e.stopPropagation(); // Prevents card expansion when clicking the button
                               handlePayNow(loan.id, loan.monthlyEmi);
                             }}
                             className="btn btn-primary btn-sm rounded-pill px-3 fw-bold shadow-sm"
                           >
                             Pay Now
                           </button>
                           <i 
                             onClick={() => setExpandedLoan(expandedLoan === loan.id ? null : loan.id)}
                             className={`bi bi-chevron-${expandedLoan === loan.id ? 'up' : 'down'} fs-5 text-primary ms-3 d-none d-md-inline-block`}
                           ></i>
                        </div>
                      </div>
                    </div>

                    {expandedLoan === loan.id && (
                      <div className="card border-0 shadow-lg rounded-bottom-5 bg-white p-4 p-md-5"
                           style={{ marginTop: "-25px", paddingTop: "50px", borderTop: "1px solid #f8fafc", zIndex: 1 }}>
                        <div className="row g-5">
                          <div className="col-lg-4 border-end">
                            <h6 className="fw-black text-muted mb-4 small">LOAN ARCHITECTURE</h6>
                            <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                                <span className="text-secondary">Principal</span>
                                <span className="fw-bold">₹{loan.principal?.toLocaleString()}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                                <span className="text-secondary">Interest Rate</span>
                                <span className="fw-bold text-primary">{loan.interest} p.a.</span>
                            </div>
                            <div className="p-3 bg-success-subtle rounded-4 mt-4 d-flex justify-content-between align-items-center">
                              <span className="fw-bold text-success small">NEXT EMI DUE</span>
                              <span className="fw-black text-success">{loan.nextDue}</span>
                            </div>
                          </div>
                          <div className="col-lg-8">
                             <h6 className="fw-black text-muted mb-4 small">PAYMENT HISTORY</h6>
                             {loan.history?.map((entry, idx) => (
                               <div key={idx} className="d-flex justify-content-between py-2 border-bottom">
                                  <span className="text-secondary">{entry.date} - {entry.type}</span>
                                  <span className="fw-bold">₹{entry.amt?.toLocaleString()}</span>
                               </div>
                             ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}

              {completedLoans.length > 0 && (
                <div className="mt-5">
                  <h4 className="fw-bold mb-4 px-2" style={{ color: "#0C4A6E" }}>Past / Completed Loans</h4>
                  {completedLoans.map((loan) => (
                    <div key={loan.id} className="card border-0 shadow-sm p-4 rounded-5 bg-light mb-3 opacity-75">
                      <div className="row align-items-center">
                         <div className="col-md-4">
                            <span className="badge bg-secondary mb-1">COMPLETED</span>
                            <div className="fw-bold fs-5">{loan.id}</div>
                         </div>
                         <div className="col-md-4">
                            <small className="text-muted d-block">Total Principal</small>
                            <span className="fw-bold">₹{loan.principal?.toLocaleString()}</span>
                         </div>
                         <div className="col-md-4 text-end text-success fw-bold">
                            <i className="bi bi-check-circle-fill me-2"></i> Fully Repaid
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}