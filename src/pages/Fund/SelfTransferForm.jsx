import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ACCOUNT_OPTIONS = [
  { value: 'savings', label: 'Savings Account • ****1234' },
  { value: 'current', label: 'Current Account • ****5678' },
];

export default function SelfTransferAutoOTP({
  userMobile = '9876543210',
  onSubmit,
  onBack
}) {
  const navigate = useNavigate();

  // Theme Constants
  const theme = {
    primary: "#0284C7",
    darkBlue: "#0C4A6E",
    bgGradient: "linear-gradient(180deg, #E0F2FE 0%, #F8FAFC 600px)",
  };

  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState('form');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otp, setOtp] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);
  const [transferStatus, setTransferStatus] = useState(null);
  const [referenceId, setReferenceId] = useState('');
  const [errors, setErrors] = useState({});

  const toAccountOptions = useMemo(
    () => ACCOUNT_OPTIONS.filter(opt => opt.value !== fromAccount),
    [fromAccount]
  );

  useEffect(() => {
    if (toAccount === fromAccount) setToAccount('');
  }, [fromAccount, toAccount]);

  useEffect(() => {
    if (isOtpSent && otpCountdown > 0) {
      const t = setTimeout(() => setOtpCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [isOtpSent, otpCountdown]);

  const maskMobile = (m) => {
    if (!m) return '';
    const last4 = m.slice(-4);
    return `+91 ••••${last4}`;
  };

  const validateForm = () => {
    const e = {};
    if (!fromAccount) e.fromAccount = 'Please select the From account.';
    if (!toAccount) e.toAccount = 'Please select the To account.';
    const amt = parseFloat(amount);
    if (!amount) e.amount = 'Please enter an amount.';
    else if (isNaN(amt) || amt <= 0) e.amount = 'Amount must be a positive number.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleProceed = async () => {
    if (!validateForm()) return;
    setIsSendingOtp(true);
    try {
      await fakeSendOtp(userMobile);
      setIsOtpSent(true);
      setOtp('');
      setOtpCountdown(45);
      setStep('otp');
    } catch {
      setErrors(prev => ({ ...prev, otp: 'Failed to send OTP.' }));
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpCountdown > 0) return;
    setIsSendingOtp(true);
    try {
      await fakeSendOtp(userMobile);
      setOtpCountdown(45);
    } catch {
      setErrors(prev => ({ ...prev, otp: 'Failed to resend OTP.' }));
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyAndTransfer = async () => {
    const e = {};
    if (!otp || !/^\d{6}$/.test(otp)) e.otp = 'Enter 6-digit OTP.';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setIsVerifyingOtp(true);
    try {
      const ok = await fakeVerifyOtp(userMobile, otp);
      if (!ok) {
        setErrors(prev => ({ ...prev, otp: 'Incorrect OTP.' }));
        return;
      }
      setIsSubmittingTransfer(true);
      const result = await fakeExecuteTransfer({ fromAccount, toAccount, amount: parseFloat(amount) });
      setTransferStatus(result.status);
      setReferenceId(result.referenceId);
      setStep('result');
      onSubmit?.({ fromAccount, toAccount, amount: parseFloat(amount), status: result.status, referenceId: result.referenceId });
    } catch {
      setTransferStatus('failed');
      setStep('result');
    } finally {
      setIsVerifyingOtp(false);
      setIsSubmittingTransfer(false);
    }
  };

  const handleBack = () => {
    if (onBack) onBack();
    else if (navigate) navigate('/funds');
    else window.history.back();
  };

  const handleShareReceipt = async () => {
    const text = buildReceiptText({ from: labelFor(fromAccount), to: labelFor(toAccount), amount, mobileMasked: maskMobile(userMobile), status: statusText(transferStatus), referenceId, timestamp: new Date().toLocaleString() });
    try {
      if (navigator.share) await navigator.share({ title: 'Receipt', text });
      else {
        await navigator.clipboard.writeText(text);
        alert('Copied to clipboard');
      }
    } catch (e) { console.error(e); }
  };

  const handlePrintReceipt = () => {
    const html = buildReceiptHTML({ from: labelFor(fromAccount), to: labelFor(toAccount), amount, mobileMasked: maskMobile(userMobile), status: statusText(transferStatus), referenceId, timestamp: new Date().toLocaleString() });
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    w.onload = () => w.print();
  };

  return (
    <div style={{ background: theme.bgGradient, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <div className="container py-5">
        
        {/* Navigation Bar */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <button className="btn btn-light rounded-pill px-4 fw-bold text-primary shadow-sm" onClick={handleBack}>
            <i className="bi bi-arrow-left me-2"></i>Back
          </button>
          <div className="bg-white px-3 py-1 rounded-pill shadow-sm small fw-bold text-muted">
            <i className="bi bi-shield-lock-fill text-success me-2"></i>SECURE TRANSFER
          </div>
        </div>

        {/* Header Section */}
        <div className="mb-4">
          <h1 className="fw-black display-6" style={{ color: theme.darkBlue, fontWeight: 900 }}>Self Transfer</h1>
          <p className="text-secondary fs-5 fw-medium">Move money between your linked accounts instantly.</p>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-8">
            
            {/* Main Action Card */}
            <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
              
              {/* Info Alert */}
              {step !== 'result' && (
                <div className="alert border-0 rounded-4 d-flex align-items-center gap-3 mb-4" style={{ backgroundColor: '#E0F2FE', color: theme.darkBlue }}>
                  <i className="bi bi-info-circle-fill fs-4"></i>
                  <span className="small fw-bold">Verification required. We will send an OTP to your registered mobile number.</span>
                </div>
              )}

              {/* Step 1: Form */}
              {step === 'form' && (
                <form>
                  <div className="row g-4">
                    <div className="col-md-6">
                      <label className="text-muted small fw-bold mb-2 d-block text-uppercase">From Account</label>
                      <select className={`form-select border-0 bg-light rounded-3 py-3 ${errors.fromAccount ? 'is-invalid' : ''}`}
                        value={fromAccount} onChange={(e) => setFromAccount(e.target.value)}>
                        <option value="">Select source account</option>
                        {ACCOUNT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="text-muted small fw-bold mb-2 d-block text-uppercase">To Account</label>
                      <select className={`form-select border-0 bg-light rounded-3 py-3 ${errors.toAccount ? 'is-invalid' : ''}`}
                        value={toAccount} onChange={(e) => setToAccount(e.target.value)} disabled={!fromAccount}>
                        <option value="">Select destination</option>
                        {toAccountOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="text-muted small fw-bold mb-2 d-block text-uppercase">Amount (₹)</label>
                      <div className="input-group">
                        <span className="input-group-text border-0 bg-light rounded-start-3">₹</span>
                        <input type="number" className={`form-control border-0 bg-light py-3 rounded-end-3 ${errors.amount ? 'is-invalid' : ''}`}
                          placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
                      </div>
                      <p className="small text-muted mt-2 mb-0">No processing fees apply for internal transfers.</p>
                    </div>
                  </div>

                  <div className="d-flex gap-3 mt-5">
                    <button type="button" className="btn btn-primary rounded-pill px-5 py-3 fw-bold flex-grow-1" onClick={handleProceed} disabled={isSendingOtp}>
                      {isSendingOtp ? 'Sending OTP...' : 'Proceed to Verify'}
                    </button>
                    <button type="button" className="btn btn-outline-light text-muted rounded-pill px-4 fw-bold" onClick={() => {setFromAccount(''); setToAccount(''); setAmount('');}}>Clear</button>
                  </div>
                </form>
              )}

              {/* Step 2: OTP */}
              {step === 'otp' && (
                <div className="text-center py-4">
                  <div className="bg-light p-3 rounded-4 mb-4 d-inline-block">
                    <i className="bi bi-phone-vibrate text-primary fs-1"></i>
                  </div>
                  <h4 className="fw-bold mb-2">Verify your identity</h4>
                  <p className="text-muted mb-4">Code sent to <strong>{maskMobile(userMobile)}</strong></p>
                  
                  <div className="mx-auto" style={{maxWidth: '300px'}}>
                    <input type="text" className="form-control text-center fs-2 fw-black border-0 bg-light rounded-4 mb-3" 
                      maxLength={6} placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} />
                    
                    <button className="btn btn-link text-decoration-none fw-bold small mb-4" onClick={handleResendOtp} disabled={otpCountdown > 0}>
                      {otpCountdown > 0 ? `Resend code in ${otpCountdown}s` : 'Resend OTP'}
                    </button>

                    <button className="btn btn-primary rounded-pill w-100 py-3 fw-bold" onClick={handleVerifyAndTransfer} disabled={isVerifyingOtp || isSubmittingTransfer}>
                      {isVerifyingOtp ? 'Verifying...' : 'Complete Transfer'}
                    </button>
                    <button className="btn btn-link text-muted text-decoration-none small mt-3" onClick={() => setStep('form')}>Edit details</button>
                  </div>
                </div>
              )}

              {/* Step 3: Result */}
              {step === 'result' && (
                <div className="text-center py-3">
                  <div className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-4 shadow-sm`}
                       style={{ width: 80, height: 80, backgroundColor: transferStatus === 'successful' ? '#DCFCE7' : '#FEE2E2' }}>
                    <i className={`bi ${transferStatus === 'successful' ? 'bi-check-lg text-success' : 'bi-x-lg text-danger'} fs-1`}></i>
                  </div>
                  <h3 className="fw-black mb-1">Transfer {statusText(transferStatus)}</h3>
                  <p className="text-muted mb-4">Transaction Reference: <span className="fw-bold">{referenceId}</span></p>

                  <div className="bg-light rounded-4 p-4 text-start mb-4">
                    <div className="row g-3">
                      <div className="col-6"><span className="small text-muted d-block">FROM</span><span className="fw-bold">{labelFor(fromAccount)}</span></div>
                      <div className="col-6"><span className="small text-muted d-block">TO</span><span className="fw-bold">{labelFor(toAccount)}</span></div>
                      <div className="col-6"><span className="small text-muted d-block">AMOUNT</span><span className="fw-black text-primary fs-5">₹{amount}</span></div>
                      <div className="col-6"><span className="small text-muted d-block">DATE</span><span className="fw-bold">{new Date().toLocaleDateString()}</span></div>
                    </div>
                  </div>

                  <div className="d-grid gap-2">
                    <button className="btn btn-primary rounded-pill py-3 fw-bold" onClick={handleBack}>Return to Dashboard</button>
                    <div className="d-flex gap-2">
                      <button className="btn btn-outline-primary rounded-pill py-2 flex-grow-1 fw-bold" onClick={handleShareReceipt}><i className="bi bi-share me-2"></i>Share</button>
                      <button className="btn btn-outline-primary rounded-pill py-2 flex-grow-1 fw-bold" onClick={handlePrintReceipt}><i className="bi bi-printer me-2"></i>Print</button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Helpers */
function labelFor(value) {
  return ACCOUNT_OPTIONS.find(a => a.value === value)?.label || '';
}
function statusText(status) {
  if (status === 'successful') return 'Successful';
  if (status === 'pending') return 'Pending';
  return 'Failed';
}

function buildReceiptText({ from, to, amount, mobileMasked, status, referenceId, timestamp }) {
  return `==== Bank Receipt ====\nStatus: ${status}\nRef: ${referenceId}\nAmount: ₹${amount}\nFrom: ${from}\nTo: ${to}\nDate: ${timestamp}`;
}

function buildReceiptHTML(data) {
  return `<html><body style="font-family:sans-serif; padding:40px;"><h2>Transfer Receipt</h2><hr/><p>Status: ${data.status}</p><p>Ref: ${data.referenceId}</p><p>Amount: ₹${data.amount}</p></body></html>`;
}

/* Stubs */
async function fakeSendOtp() { await new Promise(r => setTimeout(r, 800)); return true; }
async function fakeVerifyOtp(m, c) { await new Promise(r => setTimeout(r, 600)); return c === '123456'; }
async function fakeExecuteTransfer({ amount }) {
  await new Promise(r => setTimeout(r, 1200));
  let status = 'successful';
  if (amount > 150000) status = 'failed';
  const referenceId = `TXN-${Math.random().toString(36).toUpperCase().slice(2, 10)}`;
  return { status, referenceId };
}