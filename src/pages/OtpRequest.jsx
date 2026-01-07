import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import otpAnimation from '../assets/OtpRequest.json'; 

function Otp() {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(300);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const theme = {
    darkBlue: "#0C4A6E",
    primary: "#0284C7",
    bgGradient: "linear-gradient(180deg, #E0F2FE 0%, #F8FAFC 600px)",
  };

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  const handleVerify = () => {
    setError('');
    setSuccess('');
    
    if (otp === '123456') {
      setSuccess('OTP Verified! Completing registration...');
      setTimeout(() => {
        setOtp('');
        navigate('/');
      }, 2000);
    } else {
      setError('Invalid OTP. Please check the code and try again.');
      setOtp('');
    }
  };

  const handleResend = () => {
    setTimer(300);
    setOtp('');
    setError('');
    setSuccess('A new OTP has been sent to your device.');
    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    if (error) setError('');
  };

  return (
    <div style={{ background: theme.bgGradient, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }} className="d-flex align-items-center">
      <div className="container">
        <div className="row align-items-center g-5">
          
          {/* Left Side: OTP Card */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-lg rounded-5 p-4 p-md-5 bg-white">
              
              <div className="text-center mb-4">
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                  <i className="bi bi-shield-lock-fill text-primary fs-2"></i>
                </div>
                <h2 className="fw-black" style={{ color: theme.darkBlue, fontWeight: 900 }}>
                  Verify OTP
                </h2>
                <p className="text-secondary small">We've sent a 6-digit code to your registered device.</p>
              </div>

              {/* OTP Input Field */}
              <div className="mb-3">
                <div className={`input-group bg-light rounded-pill px-3 py-1 border-0 ${error ? 'border border-danger' : ''}`}>
                  <span className="input-group-text bg-transparent border-0 text-muted">
                    <i className="bi bi-safe2-fill"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control bg-transparent border-0 ps-0 shadow-none text-center fw-bold"
                    placeholder="0 0 0 0 0 0"
                    style={{ letterSpacing: '8px', fontSize: '1.2rem' }}
                    value={otp}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Feedback Messages */}
              {error && (
                <div className="alert alert-danger border-0 rounded-4 py-2 small fw-bold mb-3">
                  <i className="bi bi-exclamation-circle-fill me-2"></i>{error}
                </div>
              )}
              
              {success && (
                <div className="alert alert-success border-0 rounded-4 py-2 small fw-bold mb-3">
                  <i className="bi bi-check-circle-fill me-2"></i>{success}
                </div>
              )}

              <div className="text-center mb-4">
                <span className={`badge rounded-pill py-2 px-3 fw-medium ${timer > 0 ? 'bg-light text-secondary' : 'bg-danger text-white'}`}>
                  {timer > 0 ? (
                    `Expires in: ${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}`
                  ) : (
                    "OTP Expired"
                  )}
                </span>
              </div>

              <button 
                className={`btn btn-primary w-100 rounded-pill py-3 fw-black shadow-sm mb-3 ${otp.length !== 6 ? 'disabled opacity-50' : ''}`}
                style={{ backgroundColor: theme.primary, border: 'none' }}
                onClick={handleVerify}
              >
                VERIFY & PROCEED
              </button>

              <button 
                className="btn btn-link w-100 text-decoration-none text-primary fw-bold small"
                onClick={handleResend}
              >
                Didn't receive code? Resend
              </button>
            </div>
          </div>

          {/* Right Side: Fully Transparent Animation */}
          <div className="col-lg-7 d-none d-lg-block">
            <div className="d-flex justify-content-center align-items-center bg-transparent">
              <Lottie
                animationData={otpAnimation}
                loop={true}
                autoplay={true}
                style={{ 
                  width: '80%', 
                  maxWidth: '500px', 
                  background: 'transparent' 
                }} 
              />
            </div>
          </div>

        </div>
      </div>

      <style>{`
        .fw-black { font-weight: 900 !important; }
        .rounded-5 { border-radius: 2rem !important; }
        .input-group:focus-within { 
          ring: 2px solid ${theme.primary}; 
          background: #fff !important; 
          border: 1px solid #dee2e6 !important; 
        }
      `}</style>
    </div>
  );
}

export default Otp;