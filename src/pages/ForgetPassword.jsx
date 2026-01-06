import React, { useState } from "react";
import Lottie from "lottie-react";
import animationData from "../assets/ForgetPassword.json";
import { useNavigate, Link } from 'react-router-dom';

const Forget = () => {
  const [countryCode, setCountryCode] = useState("+91");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  // Theme matching your Sample.jsx
  const theme = {
    darkBlue: "#0C4A6E",
    primary: "#0284C7",
    bgGradient: "linear-gradient(180deg, #E0F2FE 0%, #F8FAFC 600px)",
  };

  const validateMobile = (number) => /^\d{7,15}$/.test(number);

  const handleRequestOtp = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!mobile) { setError("Mobile number is required."); return; }
    if (!validateMobile(mobile)) { setError("Please enter a valid mobile number."); return; }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(`OTP sent to ${countryCode} ${mobile}`);
      setStep(2);
    }, 2000);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError("");
    if (!otp || otp.length !== 6) { setError("Please enter a valid 6-digit OTP."); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess("OTP verified successfully!");
      setStep(3);
    }, 2000);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setError("");
    if (!password || !confirmPassword) { setError("Both password fields are required."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess("Password has been reset successfully!");
      navigate("/"); // Redirect to login
    }, 2000);
  };

  return (
    <div style={{ background: theme.bgGradient, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }} className="d-flex align-items-center">
      <div className="container">
        <div className="row align-items-center g-5">
          
          {/* Left Side: Reset Card */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-lg rounded-5 p-4 p-md-5 bg-white">
              
              <div className="text-center mb-4">
                <h2 className="fw-black" style={{ color: theme.darkBlue, fontWeight: 900 }}>
                  {step === 1 && "Reset Password"}
                  {step === 2 && "Verify OTP"}
                  {step === 3 && "New Password"}
                </h2>
                <p className="text-secondary small">
                  {step === 1 && "Enter mobile number to receive security code"}
                  {step === 2 && "Enter the 6-digit code sent to your phone"}
                  {step === 3 && "Secure your account with a new password"}
                </p>
              </div>

              {/* Step 1: Mobile Input */}
              {step === 1 && (
                <form onSubmit={handleRequestOtp}>
                  <div className="d-flex gap-2 mb-3">
                    <select
                      className="form-select bg-light border-0 rounded-pill shadow-none fw-bold"
                      style={{ width: '100px', fontSize: '0.9rem' }}
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                    >
                      <option value="+91">+91</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                    </select>
                    <div className="input-group bg-light rounded-pill px-3 py-1 border-0 flex-grow-1">
                      <span className="input-group-text bg-transparent border-0 text-muted">
                        <i className="bi bi-phone-fill"></i>
                      </span>
                      <input
                        type="tel"
                        className="form-control bg-transparent border-0 ps-0 shadow-none"
                        placeholder="Mobile Number"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                      />
                    </div>
                  </div>
                  <button className="btn btn-primary w-100 rounded-pill py-3 fw-black shadow-sm" style={{ backgroundColor: theme.primary, border: 'none' }} disabled={loading}>
                    {loading ? "SENDING..." : "REQUEST OTP"}
                  </button>
                </form>
              )}

              {/* Step 2: OTP Input */}
              {step === 2 && (
                <form onSubmit={handleVerifyOtp}>
                  <div className="mb-4">
                    <div className="input-group bg-light rounded-pill px-3 py-1 border-0 text-center">
                      <span className="input-group-text bg-transparent border-0 text-muted"><i className="bi bi-shield-lock-fill"></i></span>
                      <input
                        type="text"
                        className="form-control bg-transparent border-0 ps-0 shadow-none text-center fw-bold"
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        style={{ letterSpacing: '4px' }}
                      />
                    </div>
                  </div>
                  <button className="btn btn-primary w-100 rounded-pill py-3 fw-black shadow-sm" style={{ backgroundColor: theme.primary, border: 'none' }} disabled={loading}>
                    {loading ? "VERIFYING..." : "VERIFY OTP"}
                  </button>
                </form>
              )}

              {/* Step 3: Password Input */}
              {step === 3 && (
                <form onSubmit={handleResetPassword}>
                  <div className="mb-3">
                    <div className="input-group bg-light rounded-pill px-3 py-1 border-0">
                      <span className="input-group-text bg-transparent border-0 text-muted"><i className="bi bi-key-fill"></i></span>
                      <input
                        type="password"
                        className="form-control bg-transparent border-0 ps-0 shadow-none"
                        placeholder="New Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="input-group bg-light rounded-pill px-3 py-1 border-0">
                      <span className="input-group-text bg-transparent border-0 text-muted"><i className="bi bi-check-all"></i></span>
                      <input
                        type="password"
                        className="form-control bg-transparent border-0 ps-0 shadow-none"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <button className="btn btn-primary w-100 rounded-pill py-3 fw-black shadow-sm" style={{ backgroundColor: theme.primary, border: 'none' }} disabled={loading}>
                    {loading ? "RESETTING..." : "RESET PASSWORD"}
                  </button>
                </form>
              )}

              {error && <p className="text-danger small fw-bold text-center mt-3"><i className="bi bi-exclamation-circle me-1"></i>{error}</p>}
              {success && <p className="text-success small fw-bold text-center mt-3"><i className="bi bi-check-circle me-1"></i>{success}</p>}

              <div className="text-center mt-4">
                <Link to="/login" className="text-decoration-none small fw-bold text-primary">Back to Login</Link>
              </div>
            </div>
          </div>

          {/* Right Side: Lottie Animation */}
          <div className="col-lg-7 d-none d-lg-block">
            <div className="text-center">
              <Lottie
                animationData={animationData}
                loop
                autoplay
                style={{ height: '450px' }}
              />
              <h3 className="fw-black mt-4" style={{ color: theme.darkBlue, fontWeight: 900 }}>Secure Core Recovery</h3>
              <p className="text-secondary opacity-75">Your security is our priority. We use encrypted OTP channels.</p>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        .fw-black { font-weight: 900 !important; }
        .rounded-5 { border-radius: 2rem !important; }
        .input-group:focus-within { ring: 2px solid ${theme.primary}; background: #fff !important; border: 1px solid #dee2e6 !important; }
      `}</style>
    </div>
  );
};

export default Forget;