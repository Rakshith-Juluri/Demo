import React, { useState, useEffect } from 'react';
import '../css/OtpRequest.css';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import otpAnimation from '../assets/OtpRequest.json'; 

function Otp() {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(300);
  const navigate = useNavigate();

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  const handleVerify = () => {
    if (otp === '123456') {
      alert('OTP Verified. Registration Complete.');
      setOtp('');   // ✅ clear input after success
      navigate('/');
    } else {
      alert('Invalid OTP. Please try again.');
      setOtp('');   // ✅ clear input after failure too
    }
  };

  const handleResend = () => {
    setTimer(300);
    setOtp('');     // ✅ clear input after resend
    alert('OTP resent. Timer restarted.');
  };

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  return (
    <div className="otpv-page">
      <div className="otpv-wrapper">
        {/* Left side: Form */}
        <div className="otpv-card">
          <h2>Verify OTP</h2>
          <form className="otpv-form" onSubmit={(e) => e.preventDefault()}>
            <label>Enter OTP</label>
            <input
              type="text"
              value={otp}
              onChange={handleChange}
              placeholder="Enter 6-digit OTP"
            />

            <div className="otpv-timer">OTP expires in: {timer} seconds</div>

            <button type="button" className="otpv-btn" onClick={handleVerify}>
              Verify
            </button>
            <button type="button" className="otpv-btn" onClick={handleResend}>
              Resend OTP
            </button>
          </form>
        </div>

        {/* Right side: Animation */}
        <div className="otpv-animation">
          <Lottie animationData={otpAnimation} loop={true} />
        </div>
      </div>
    </div>
  );
}

export default Otp;