import React, { useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import Lottie from "lottie-react";
import animationData from "../assets/animation.json"; // Path to your JSON

export default function ForgetUserName() {
  const [accountNumber, setAccountNumber] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  
  const navigate = useNavigate();
  const REQUIRED_ACC_LENGTH = 11;

  // Theme matching your Sample.jsx
  const theme = {
    darkBlue: "#0C4A6E",
    primary: "#0284C7",
    bgGradient: "linear-gradient(180deg, #E0F2FE 0%, #F8FAFC 600px)",
  };

  const isValidAccountNumber = (value) => {
    const digitsOnly = /^[0-9]+$/.test(value);
    if (!digitsOnly) return false;
    return value.length === REQUIRED_ACC_LENGTH;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValidAccountNumber(accountNumber)) {
      setError("");
      setSubmitted(true);
    } else {
      setSubmitted(false);
      setError(`Please enter exactly ${REQUIRED_ACC_LENGTH} digits.`);
    }
  };

  const handleChange = (e) => {
    const cleaned = e.target.value.replace(/\D/g, "");
    setAccountNumber(cleaned);
    if (error) setError("");
  };

  return (
    <div style={{ background: theme.bgGradient, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }} className="d-flex align-items-center">
      <div className="container">
        <div className="row align-items-center g-5">
          
          {/* Left Side: Recovery Card */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-lg rounded-5 p-4 p-md-5 bg-white">
              
              {!submitted ? (
                <form onSubmit={handleSubmit} noValidate>
                  <div className="text-center mb-4">
                    <h2 className="fw-black mb-2" style={{ color: theme.darkBlue, fontWeight: 900 }}>
                      Forgot Username?
                    </h2>
                    <p className="text-secondary small">Enter your 11-digit account number to retrieve your credentials.</p>
                  </div>

                  <div className="mb-4">
                    <div className={`input-group bg-light rounded-pill px-3 py-1 border ${error ? 'border-danger' : 'border-0'}`}>
                      <span className="input-group-text bg-transparent border-0 text-muted">
                        <i className="bi bi-hash"></i>
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        className="form-control bg-transparent border-0 ps-0 shadow-none"
                        placeholder="Account Number"
                        maxLength={REQUIRED_ACC_LENGTH}
                        value={accountNumber}
                        onChange={handleChange}
                      />
                    </div>
                    {error && (
                      <p className="text-danger x-small fw-bold ms-3 mt-2 mb-0" style={{ fontSize: '0.75rem' }}>
                        <i className="bi bi-exclamation-circle-fill me-1"></i>{error}
                      </p>
                    )}
                  </div>

                  <div className="row g-3">
                    <div className="col-12">
                      <button 
                        type="submit"
                        className="btn btn-primary w-100 rounded-pill py-3 fw-black shadow-sm mb-2" 
                        style={{ backgroundColor: theme.primary, border: 'none' }}
                      >
                        RECOVER USERNAME
                      </button>
                    </div>
                    <div className="col-12 text-center">
                      <button
                        type="button"
                        className="btn btn-link text-decoration-none small fw-bold text-secondary"
                        onClick={() => navigate("/login")}
                      >
                        Cancel and Go Back
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="text-center py-4">
                  <div className="bg-success-subtle text-success rounded-circle d-inline-flex p-4 mb-4">
                    <i className="bi bi-check-circle-fill fs-1"></i>
                  </div>
                  <h2 className="fw-black" style={{ color: theme.darkBlue, fontWeight: 900 }}>Success!</h2>
                  <p className="text-secondary mb-4">
                    If the account number matches our records, your username has been sent via SMS to your registered mobile number.
                  </p>
                  <Link to="/login" className="btn btn-primary w-100 rounded-pill py-3 fw-black shadow-sm" style={{ backgroundColor: theme.primary, border: 'none' }}>
                    BACK TO LOGIN
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Lottie Animation (Module 4.5 Design) */}
          <div className="col-lg-7 d-none d-lg-block">
            <div className="text-center">
              <Lottie
                animationData={animationData}
                loop
                autoplay
                style={{ height: '450px', background: 'transparent' }}
              />
              <h3 className="fw-black mt-4" style={{ color: theme.darkBlue, fontWeight: 900 }}>Identity Protection</h3>
              <p className="text-secondary opacity-75">Securely retrieving your access details via encrypted channels.</p>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        .fw-black { font-weight: 900 !important; }
        .rounded-5 { border-radius: 2rem !important; }
        .transition-all { transition: all 0.3s ease; }
        .input-group:focus-within { ring: 2px solid ${theme.primary}; background: #fff !important; border: 1px solid #dee2e6 !important; }
      `}</style>
    </div>
  );
}