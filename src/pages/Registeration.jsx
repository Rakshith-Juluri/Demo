import React, { useState } from 'react';
import '../css/Regisration.css';
import { Link } from 'react-router-dom';
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

  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setMobile(value);
    }
  };

  // NEW HANDLER FOR AADHAR (12 digits only)
  const handleAadharChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 12) {
      setAadhar(value);
    }
  };

  const validatePassword = (pwd) => {
    const errors = [];
    if (!/[a-z]/.test(pwd)) errors.push("Must include at least one lowercase letter.");
    if (!/[A-Z]/.test(pwd)) errors.push("Must include at least one uppercase letter.");
    if (!/[0-9]/.test(pwd)) errors.push("Must include at least one number.");
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(pwd)) errors.push("Must include at least one special character.");
    if (pwd.length < 8) errors.push("Must be at least 8 characters long.");
    return errors;
  };

  const getStrength = () => {
    const errors = validatePassword(password);
    if (errors.length === 0) return 'Strong';
    if (password.length >= 6) return 'Medium';
    return 'Weak';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!name) newErrors.name = "Name is required.";
    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!mobile) newErrors.mobile = "Mobile number is required.";
    else if (mobile.length !== 10 || !/^\d{10}$/.test(mobile)) {
      newErrors.mobile = "Mobile number must be exactly 10 digits.";
    }

    // AADHAR VALIDATION
    if (!aadhar) newErrors.aadhar = "Aadhar number is required.";
    else if (aadhar.length !== 12) {
      newErrors.aadhar = "Aadhar number must be exactly 12 digits.";
    }

    if (!username) newErrors.username = "Username is required.";
    if (!password) {
      newErrors.password = "Password is required.";
    } else {
      const passwordErrors = validatePassword(password);
      if (passwordErrors.length > 0) newErrors.password = passwordErrors.join(" ");
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // Aadhar is now included in the object sent to your DB
    const newCustomer = { name, email, mobile, aadhar, username, password };

    try {
      const response = await fetch('http://localhost:4001/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer),
      });

      if (response.ok) {
        setSubmitted(true);
        setErrors({});
      } else {
        setErrors({ form: "Error saving customer details." });
      }
    } catch (error) {
      console.error('Error:', error);
      setErrors({ form: "Server error. Please try again later." });
    }
  };

  return (
    <div className="cust-reg-page">
      <div className="cust-reg-wrapper">
        <div className="cust-reg-card">
          <h2>Customer Registration</h2>
          <form className="cust-reg-form" onSubmit={handleSubmit} noValidate>
            
            <label>Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your Name" />
            {errors.name && <p className="error">{errors.name}</p>}

            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />
            {errors.email && <p className="error">{errors.email}</p>}

            <label>Mobile Number</label>
            <input type="tel" value={mobile} onChange={handleMobileChange} placeholder="Enter 10-digit mobile number" />
            {errors.mobile && <p className="error">{errors.mobile}</p>}

            {/* --- NEW AADHAR FIELD --- */}
            <label>Aadhar Number</label>
            <input 
              type="text" 
              value={aadhar} 
              onChange={handleAadharChange} 
              placeholder="Enter 12-digit Aadhar number" 
            />
            {errors.aadhar && <p className="error">{errors.aadhar}</p>}

            <label>Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Choose a username" />
            {errors.username && <p className="error">{errors.username}</p>}

            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" />
            {errors.password && <p className="error">{errors.password}</p>}

            <label>Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter your password" />
            {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}

            <div className="cust-reg-strength">
              Password Strength: {getStrength()}
            </div>

            {errors.form && <p className="error">{errors.form}</p>}

            <button type="submit" className="cust-reg-btn">Submit</button>
          </form>

          {submitted && (
            <>
              <p className="cust-reg-confirmation">Details saved. OTP sent to your mobile/email.</p>
              <Link to="/otp" className="cust-reg-link">Go to OTP Verification</Link>
            </>
          )}
        </div>

        <div className="cust-reg-animation">
          <Lottie animationData={registrationAnimation} loop={true} />
        </div>
      </div>
    </div>
  );
}

export default Register;