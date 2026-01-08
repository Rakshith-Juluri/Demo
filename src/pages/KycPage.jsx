import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function KycPage({ userData }) {
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(30);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const theme = {
    primary: "#0284C7",
    darkBlue: "#0C4A6E",
    bgGradient: "linear-gradient(180deg, #E0F2FE 0%, #F8FAFC 600px)",
  };

  useEffect(() => {
    let interval = setInterval(() => {
      if (timer > 0) setTimer(timer - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleConfirm = async (e) => {
    e.preventDefault();
    setError(false);
    if (otp === "123456") {
      setIsSubmitted(true);
    } else {
      setError(true);
    }
  };

  const returnToDashboard = () => {
    navigate("/app/home");
  };

  return (
    <div style={{ background: theme.bgGradient, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }} className="d-flex align-items-center justify-content-center p-3">
      
      <div className="card border-0 shadow-sm p-4" style={{ width: '100%', maxWidth: '420px', borderRadius: '1.5rem', backgroundColor: '#fff' }}>
        
        {!isSubmitted ? (
          <>
            <div className="text-center mb-4">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                <i className="bi bi-shield-check text-primary fs-2"></i>
              </div>
              <h4 className="fw-black mb-1" style={{ color: theme.darkBlue, fontWeight: 900 }}>KYC Verification</h4>
              <p className="text-secondary fw-medium small px-3">
                Verify your identity to unlock full banking services and fund transfers.
              </p>
            </div>

            <div className="bg-light p-3 rounded-4 mb-4 border-start border-primary border-4">
               <div className="d-flex justify-content-between mb-2">
                  <small className="text-muted fw-bold">LINKED MOBILE</small>
                  <small className="fw-bold text-dark">+91 {userData?.mobile?.replace(/.(?=.{4})/g, 'X') || "XXXXXX8209"}</small>
               </div>
               <div className="d-flex justify-content-between">
                  <small className="text-muted fw-bold">AADHAR CARD</small>
                  <small className="fw-bold text-dark">XXXX-XXXX-{userData?.aadhar?.slice(-4) || "3345"}</small>
               </div>
            </div>

            <form onSubmit={handleConfirm}>
              <div className="mb-3">
                <label className="small fw-bold text-muted mb-2 ms-1">ENTER 6-DIGIT OTP</label>
                <input 
                  type="text" 
                  className={`form-control form-control-lg text-center fw-bold rounded-4 ${error ? 'border-danger' : 'border-0'}`} 
                  placeholder="X X X X X X"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, ''));
                    if(error) setError(false);
                  }}
                  style={{ 
                    background: error ? '#fff5f5' : '#f8fafc', 
                    letterSpacing: '8px', 
                    fontSize: '1.5rem',
                    height: '60px'
                  }}
                />
              </div>

              {error && (
                <div className="text-danger small text-center mb-3 fw-bold">
                  <i className="bi bi-exclamation-circle me-1"></i> Invalid code. Use 123456 for demo.
                </div>
              )}

              <div className="text-center mb-4">
                {timer > 0 ? (
                  <span className="badge bg-light text-secondary rounded-pill py-2 px-3 fw-medium">
                    Resend available in {timer}s
                  </span>
                ) : (
                  <button type="button" className="btn btn-link text-primary fw-bold text-decoration-none p-0" onClick={() => setTimer(30)}>
                    Resend Code
                  </button>
                )}
              </div>

              <button 
                type="submit" 
                className={`btn btn-primary w-100 rounded-pill fw-bold py-3 shadow-sm ${otp.length !== 6 ? 'disabled opacity-50' : ''}`}
                style={{ fontSize: '1.1rem' }}
              >
                Confirm & Verify
              </button>
            </form>
          </>
        ) : (
          /* SUCCESS STATE - REPLACED CYCLING SPINNER */
          <div className="text-center py-4">
            <div className="mb-4 position-relative d-inline-block">
              <div className="bg-warning bg-opacity-10 p-4 rounded-circle pulse-animation">
                <i className="bi bi-shield-lock text-warning" style={{ fontSize: '3.5rem' }}></i>
              </div>
              <div className="position-absolute bottom-0 end-0 bg-white rounded-circle shadow-sm p-1">
                <i className="bi bi-clock-history text-warning fs-4"></i>
              </div>
            </div>

            

            <h4 className="fw-black" style={{ color: theme.darkBlue, fontWeight: 900 }}>Under Review</h4>
            <p className="text-muted small px-4">We are currently validating your documents with the national registry.</p>
            
            <div className="alert border-0 rounded-4 mt-3 small fw-medium text-start" style={{ backgroundColor: '#FFFBEB', color: '#92400E' }}>
              <div className="d-flex gap-2">
                <i className="bi bi-hourglass-split"></i>
                <span>Status: <b>PENDING</b><br/>Mapping will be completed within 2 hours.</span>
              </div>
            </div>
            
            <button 
              className="btn btn-dark w-100 rounded-pill fw-bold py-3 mt-3 shadow-sm" 
              onClick={returnToDashboard}
            >
              Return to Dashboard
            </button>
          </div>
        )}
      </div>

      <style>{`
        .fw-black { font-weight: 900 !important; }
        .pulse-animation {
          animation: pulse-yellow 2s infinite;
        }
        @keyframes pulse-yellow {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
        }
      `}</style>
    </div>
  );
}