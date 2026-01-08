import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import registrationAnimation from '../assets/Registeration.json';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [aadhar, setAadhar] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const theme = {
    darkBlue: "#0C4A6E",
    primary: "#0284C7",
    bgGradient: "linear-gradient(180deg, #E0F2FE 0%, #F8FAFC 600px)",
  };

  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) setMobile(value);
  };

  const handleAadharChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 12) setAadhar(value);
  };

  const validatePassword = (pwd) => {
    const errs = [];
    if (!/[a-z]/.test(pwd)) errs.push("Lowercase");
    if (!/[A-Z]/.test(pwd)) errs.push("Uppercase");
    if (!/[0-9]/.test(pwd)) errs.push("Number");
    if (!/[!@#$%^&*()]/.test(pwd)) errs.push("Special Char");
    if (pwd.length < 8) errs.push("8+ Characters");
    return errs;
  };

  const getStrengthUI = () => {
    const errs = validatePassword(password);
    if (password.length === 0) return { width: '0%', color: '#dee2e6', label: '' };
    if (errs.length === 0) return { width: '100%', color: '#198754', label: 'Strong' };
    if (password.length >= 6) return { width: '50%', color: '#ffc107', label: 'Medium' };
    return { width: '25%', color: '#dc3545', label: 'Weak' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!name.trim()) newErrors.name = "Full name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Invalid email address";
    if (mobile.length !== 10) newErrors.mobile = "Mobile must be 10 digits";
    if (aadhar.length !== 12) newErrors.aadhar = "Aadhar must be 12 digits";
    if (!username.trim()) newErrors.username = "Username is required";
    
    const pwdErrors = validatePassword(password);
    if (pwdErrors.length > 0) newErrors.password = "Password is too weak";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // Persist to localStorage so Profile auto-fills even if API is offline
    try {
      const [firstName, ...lastNameParts] = String(name).trim().split(/\s+/);
      const profilePatch = {
        firstName: firstName || 'John',
        lastName: lastNameParts.join(' ') || 'Doe',
        email,
        phone: mobile,
        aadhar,
        pancard: '',
        address: '',
        landmark: '',
        district: '',
        state: '',
        zip: ''
      };
      const existing = JSON.parse(localStorage.getItem('userProfileData') || '{}');
      const merged = { ...existing, ...profilePatch };
      localStorage.setItem('userProfileData', JSON.stringify(merged));

      // Seed a lightweight loggedInUser for later hydration
      const tempUser = { id: String(Date.now()), name, email, mobile };
      localStorage.setItem('loggedInUser', JSON.stringify(tempUser));
    } catch {}

    try {
      const response = await fetch('http://localhost:4001/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, mobile, aadhar, username, password }),
      });

      if (response.ok) {
        // Update loggedInUser with server-assigned id if available
        try {
          const created = await response.json();
          if (created && created.id) {
            const updated = { id: String(created.id), name, email, mobile };
            localStorage.setItem('loggedInUser', JSON.stringify(updated));
          }
        } catch {}
        setSubmitted(true);
      } else {
        setErrors({ form: "Registration failed. Try again." });
      }
    } catch (error) {
      // Still allow proceeding with locally cached data
      setErrors({ form: "Server connection error. Using local data only." });
      setSubmitted(true);
    }
  };

  return (
    <div style={{ background: theme.bgGradient, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }} className="py-5 d-flex align-items-center">
      <div className="container">
        <div className="row align-items-center g-5">
          
          {/* Left Side: Registration Form */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-lg rounded-5 p-4 p-md-5 bg-white">
              {!submitted ? (
                <>
                  <div className="mb-4">
                    <h2 className="fw-black mb-1" style={{ color: theme.darkBlue, fontWeight: 900 }}>Create Account</h2>
                    <p className="text-secondary small">Join Sky Bank Digital Core today.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="row g-3">
                    {/* Name */}
                    <div className="col-md-6">
                      <div className="input-group bg-light rounded-pill px-3 py-1 border-0">
                        <span className="input-group-text bg-transparent border-0 text-muted"><i className="bi bi-person"></i></span>
                        <input type="text" className="form-control bg-transparent border-0 ps-0 shadow-none" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
                      </div>
                      {errors.name && <small className="text-danger ms-3" style={{fontSize: '0.7rem'}}>{errors.name}</small>}
                    </div>

                    {/* Email */}
                    <div className="col-md-6">
                      <div className="input-group bg-light rounded-pill px-3 py-1 border-0">
                        <span className="input-group-text bg-transparent border-0 text-muted"><i className="bi bi-envelope"></i></span>
                        <input type="email" className="form-control bg-transparent border-0 ps-0 shadow-none" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
                      </div>
                      {errors.email && <small className="text-danger ms-3" style={{fontSize: '0.7rem'}}>{errors.email}</small>}
                    </div>

                    {/* Mobile */}
                    <div className="col-md-6">
                      <div className="input-group bg-light rounded-pill px-3 py-1 border-0">
                        <span className="input-group-text bg-transparent border-0 text-muted"><i className="bi bi-phone"></i></span>
                        <input type="text" className="form-control bg-transparent border-0 ps-0 shadow-none" placeholder="Mobile Number" value={mobile} onChange={handleMobileChange} />
                      </div>
                      {errors.mobile && <small className="text-danger ms-3" style={{fontSize: '0.7rem'}}>{errors.mobile}</small>}
                    </div>

                    {/* Aadhar */}
                    <div className="col-md-6">
                      <div className="input-group bg-light rounded-pill px-3 py-1 border-0">
                        <span className="input-group-text bg-transparent border-0 text-muted"><i className="bi bi-card-text"></i></span>
                        <input type="text" className="form-control bg-transparent border-0 ps-0 shadow-none" placeholder="12-Digit Aadhar" value={aadhar} onChange={handleAadharChange} />
                      </div>
                      {errors.aadhar && <small className="text-danger ms-3" style={{fontSize: '0.7rem'}}>{errors.aadhar}</small>}
                    </div>

                    {/* Username */}
                    <div className="col-12">
                      <div className="input-group bg-light rounded-pill px-3 py-1 border-0">
                        <span className="input-group-text bg-transparent border-0 text-muted"><i className="bi bi-at"></i></span>
                        <input type="text" className="form-control bg-transparent border-0 ps-0 shadow-none" placeholder="Choose Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                      </div>
                      {errors.username && <small className="text-danger ms-3" style={{fontSize: '0.7rem'}}>{errors.username}</small>}
                    </div>

                    {/* Password */}
                    <div className="col-md-6">
                      <div className="input-group bg-light rounded-pill px-3 py-1 border-0">
                        <span className="input-group-text bg-transparent border-0 text-muted"><i className="bi bi-lock"></i></span>
                        <input type="password" className="form-control bg-transparent border-0 ps-0 shadow-none" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="col-md-6">
                      <div className="input-group bg-light rounded-pill px-3 py-1 border-0">
                        <span className="input-group-text bg-transparent border-0 text-muted"><i className="bi bi-shield-lock"></i></span>
                        <input type="password" className="form-control bg-transparent border-0 ps-0 shadow-none" placeholder="Confirm" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                      </div>
                    </div>

                    {/* Strength Meter */}
                    <div className="col-12 px-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <small className="text-secondary" style={{fontSize: '0.7rem'}}>Password Strength</small>
                        <small className="fw-bold" style={{fontSize: '0.7rem', color: getStrengthUI().color}}>{getStrengthUI().label}</small>
                      </div>
                      <div className="progress" style={{ height: '4px' }}>
                        <div className="progress-bar" role="progressbar" style={{ width: getStrengthUI().width, backgroundColor: getStrengthUI().color, transition: '0.3s' }}></div>
                      </div>
                      {(errors.password || errors.confirmPassword) && <small className="text-danger d-block mt-1" style={{fontSize: '0.7rem'}}>{errors.password || errors.confirmPassword}</small>}
                    </div>

                    <div className="col-12 mt-4">
                      <button type="submit" className="btn btn-primary w-100 rounded-pill py-3 fw-black shadow-sm mb-3" style={{ backgroundColor: theme.primary, border: 'none' }}>
                        CREATE SECURE ACCOUNT
                      </button>
                      <p className="text-center text-secondary small">
                        Already have an account? <Link to="/login" className="text-primary fw-bold text-decoration-none">Login</Link>
                      </p>
                    </div>
                  </form>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="bg-success-subtle text-success rounded-circle d-inline-flex p-4 mb-4">
                    <i className="bi bi-shield-check fs-1"></i>
                  </div>
                  <h2 className="fw-black" style={{ color: theme.darkBlue, fontWeight: 900 }}>Registration Success</h2>
                  <p className="text-secondary mb-4">Your profile has been created. Please proceed to verify your identity via OTP.</p>
                  <button onClick={() => navigate('/otp')} className="btn btn-primary w-100 rounded-pill py-3 fw-black shadow-sm" style={{ backgroundColor: theme.primary, border: 'none' }}>
                    PROCEED TO OTP VERIFICATION
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Animation */}
          <div className="col-lg-6 d-none d-lg-block">
            <div className="text-center">
              <Lottie animationData={registrationAnimation} loop autoplay style={{ height: '500px' }} />
              <h3 className="fw-black mt-2" style={{ color: theme.darkBlue, fontWeight: 900 }}>Seamless Onboarding</h3>
              <p className="text-secondary opacity-75">Your journey to secure digital banking starts here.</p>
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
}

export default Register;