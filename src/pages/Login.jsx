import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import SecureLoginAnimation from '../assets/Secure_Login.json';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [adminUsername, setAdminEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const theme = {
    darkBlue: "#0C4A6E",
    primary: "#0284C7",
    bgGradient: "linear-gradient(180deg, #E0F2FE 0%, #F8FAFC 600px)",
  };

  const Buttontag = async () => {
    if (isLogin) {
      if (!username.trim()) { setError("Username is required"); return; }
      if (!password.trim()) { setError("Password is required"); return; }
      if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    } else {
      if (!adminUsername.trim()) { setError("Username is required"); return; }
      if (!adminPassword.trim()) { setError("Password is required"); return; }
      if (adminPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
    }

    try {
      const endpoint = isLogin ? "http://localhost:4001/users" : "http://localhost:4001/admins";
      const res = await fetch(endpoint);
      const data = await res.json();

      const found = isLogin
        ? data.find((u) => u.username === username && u.password === password)
        : data.find((a) => a.username === adminUsername && a.password === adminPassword);

      if (found) {
        setError("");
        if (isLogin) {
          localStorage.setItem('loggedInUser', JSON.stringify({
            id: found.id,
            name: found.name,
            username: found.username,
            role: 'user'
          }));
          navigate('/app'); 
        } else {
          localStorage.setItem('adminSession', JSON.stringify({
            id: found.id,
            username: found.username,
            role: 'admin'
          }));
          navigate('/admindashboard');
        }
      } else {
        setError("The Username or password you entered is wrong. Try again");
      }
    } catch (err) {
      console.error(err);
      setError("Server error");
    }
  };

  return (
    <div style={{ background: theme.bgGradient, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }} className="d-flex align-items-center">
      <div className="container">
        <div className="row align-items-center g-5">
          
          {/* Left Side: Login Card */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-lg rounded-5 p-4 p-md-5 bg-white">
              
              <div className="d-flex bg-light rounded-pill p-1 mb-4">
                <button
                  className={`btn w-50 rounded-pill fw-bold py-2 transition-all ${isLogin ? 'btn-primary shadow' : 'btn-light text-secondary'}`}
                  onClick={() => { setIsLogin(true); setError(''); }}
                  style={{ backgroundColor: isLogin ? theme.primary : 'transparent', border: 'none' }}
                >
                  User Login
                </button>
                <button
                  className={`btn w-50 rounded-pill fw-bold py-2 transition-all ${!isLogin ? 'btn-primary shadow' : 'btn-light text-secondary'}`}
                  onClick={() => { setIsLogin(false); setError(''); }}
                  style={{ backgroundColor: !isLogin ? theme.primary : 'transparent', border: 'none' }}
                >
                  Admin Login
                </button>
              </div>

              <div className="text-center mb-4">
                <h2 className="fw-black" style={{ color: theme.darkBlue, fontWeight: 900 }}>
                  {isLogin ? 'Welcome Back' : 'Admin Portal'}
                </h2>
                <p className="text-secondary small">Please enter your credentials to continue</p>
              </div>

              <div className="mb-3">
                <div className="input-group bg-light rounded-pill px-3 py-1 border-0">
                  <span className="input-group-text bg-transparent border-0 text-muted"><i className="bi bi-person-fill"></i></span>
                  <input
                    type="text"
                    className="form-control bg-transparent border-0 ps-0 shadow-none"
                    placeholder="Username"
                    value={isLogin ? username : adminUsername}
                    onChange={(e) => { isLogin ? setUsername(e.target.value) : setAdminEmail(e.target.value); setError(''); }}
                  />
                </div>
              </div>

              <div className="mb-2">
                <div className="input-group bg-light rounded-pill px-3 py-1 border-0">
                  <span className="input-group-text bg-transparent border-0 text-muted"><i className="bi bi-lock-fill"></i></span>
                  <input
                    type="password"
                    className="form-control bg-transparent border-0 ps-0 shadow-none"
                    placeholder="Password"
                    value={isLogin ? password : adminPassword}
                    onChange={(e) => { isLogin ? setPassword(e.target.value) : setAdminPassword(e.target.value); setError(''); }}
                  />
                </div>
              </div>

              {error && <p className="text-danger x-small fw-bold ms-3 mb-3" style={{ fontSize: '0.75rem' }}><i className="bi bi-exclamation-circle-fill me-1"></i>{error}</p>}

              <div className="d-flex justify-content-between mb-4 px-2">
                <Link to="/forget-username" className="text-decoration-none small fw-bold text-primary">Forgot Username?</Link>
                <Link to="/forget-password" className="text-decoration-none small fw-bold text-primary">Forgot Password?</Link>
              </div>

              <button 
                className="btn btn-primary w-100 rounded-pill py-3 fw-black shadow-sm mb-4" 
                style={{ backgroundColor: theme.primary, border: 'none' }}
                onClick={Buttontag}
              >
                LOGIN TO SECURE BANK
              </button>

              {isLogin && (
                <p className="text-center text-secondary small">
                  Not a Member? <Link to="/register" className="text-primary fw-bold text-decoration-none">Register Now</Link>
                </p>
              )}
            </div>
          </div>

          {/* Right Side: Fully Transparent Animation */}
          <div className="col-lg-7 d-none d-lg-block">
            <div className="d-flex justify-content-center align-items-center bg-transparent">
              <Lottie
                animationData={SecureLoginAnimation}
                loop
                autoplay
                style={{ 
                  width: '90%', 
                  maxWidth: '600px', 
                  background: 'transparent' // Force transparency
                }} 
              />
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

export default Login;