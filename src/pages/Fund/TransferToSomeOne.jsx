import React, { useEffect, useMemo, useState } from "react";


import FundHeader from '../Fund/FundHeader';
import TransferForm from '../Fund/TransferForm';
import OTPConfirm from '../Fund/OTPConfirm';
import Receipt from '../Fund/Receipt';
import AddBeneficiaryModal from '../Fund/AddBeneficiary';

const API = "http://localhost:4001";
const CUSTOMER_ID = "CUS001";

export default function Fund() {
  // Logic remains exactly as provided
  const [accounts, setAccounts] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [transferType, setTransferType] = useState("IMPS");
  const [fromAccountId, setFromAccountId] = useState("");
  const [beneficiaryId, setBeneficiaryId] = useState("");
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [scheduleType, setScheduleType] = useState("NOW");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [agree, setAgree] = useState(false);
  const [step, setStep] = useState("FORM");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showAddBeneficiary, setShowAddBeneficiary] = useState(false);
  const [newBen, setNewBen] = useState({ name: "", bank: "", accountNumber: "", ifsc: "", nickname: "" });
  const [receipt, setReceipt] = useState(null);

  const selectedAccount = useMemo(() => accounts.find(a => a.id === fromAccountId), [accounts, fromAccountId]);
  const selectedBeneficiary = useMemo(() => beneficiaries.find(b => b.id === beneficiaryId), [beneficiaries, beneficiaryId]);

  const LIMITS = { NEFT: { min: 1, max: 200000 }, RTGS: { min: 200000, max: 2000000 }, IMPS: { min: 1, max: 200000 } };
  const FEES = { NEFT: "₹2.5–25", RTGS: "₹25–55", IMPS: "₹0–25" };
  const HINTS = {
    NEFT: "Batch settlement; processes in half-hourly batches.",
    RTGS: "Real-time 24×7; ₹2 lakh minimum required.",
    IMPS: "Instant 24×7 transfer up to ₹2 lakh."
  };

  // ... (All helper functions: toISTISOString, formatIST, parseDateMs remain untouched)
  const toISTISOString = (input) => {
    const d = new Date(input);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${y}-${m}-${dd}T${hh}:${mm}:${ss}+05:30`;
  };

  const formatIST = (d) => {
    if (!d) return '';
    const dt = (typeof d === 'number' || typeof d === 'string') ? new Date(d) : d;
    try {
      return new Intl.DateTimeFormat('en-IN', { dateStyle: 'short', timeStyle: 'medium', timeZone: 'Asia/Kolkata' }).format(dt) + ' IST';
    } catch (e) {
      return dt.toLocaleString() + ' IST';
    }
  };

  const parseDateMs = (s) => {
    if (!s) return null;
    if (typeof s === 'number') return s;
    let t = Date.parse(s);
    if (!isNaN(t)) return t;
    try {
      const str = String(s).trim();
      let normalized = str.replace(/\s+IST$/, '+05:30');
      if (normalized !== str) {
        t = Date.parse(normalized);
        if (!isNaN(t)) return t;
      }
      const cleaned = normalized.replace(/[+-]\d{2}:?\d{2}$/, '');
      const dt = new Date(cleaned);
      if (!isNaN(dt.getTime())) return dt.getTime();
    } catch (e) {}
    return null;
  };

  useEffect(() => {
    (async () => {
      try {
        const [accRes, benRes] = await Promise.all([
          fetch(`${API}/accounts`).then(r => r.json()),
          fetch(`${API}/beneficiaries?customerId=${CUSTOMER_ID}`).then(r => r.json())
        ]);
        setAccounts(accRes || []);
        setBeneficiaries(benRes || []);
        setFromAccountId(accRes?.[0]?.id || "");
      } catch (e) {
        setToast({ type: "danger", message: "Failed to load server data." });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const validateForm = () => {
    const amt = Number(amount);
    const { min, max } = LIMITS[transferType];
    if (!transferType) return "Please select a transfer method.";
    if (!fromAccountId) return "Please select a source account.";
    if (!beneficiaryId) return "Please choose a beneficiary.";
    if (!amount || isNaN(amt) || amt <= 0) return "Enter a valid amount.";
    if (amt < min) return `Amount should be at least ₹${min.toLocaleString()} for ${transferType}.`;
    if (amt > max) return `Amount exceeds ${transferType} limit of ₹${max.toLocaleString()}.`;
    if (selectedAccount && amt > selectedAccount.balance) return "Insufficient balance.";
    if (remarks.length > 140) return "Remarks must be within 140 characters.";
    if (scheduleType === "LATER" && (!scheduleDate || !scheduleTime)) return "Please set schedule date and time.";
    if (!agree) return "Please accept Terms & Conditions.";
    return null;
  };

  const validateOtp = () => (/^\d{6}$/.test(otp) ? null : "Enter the 6-digit OTP.");

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const v = validateForm();
    if (v) { setError(v); setToast({ type: "danger", message: v }); return; }
    setError("");
    setStep("OTP");
    setToast({ type: "info", message: "OTP sent to your registered mobile/email." });
  };

  const handleConfirmTransfer = async () => {
    const v = validateOtp();
    if (v) { setError(v); setToast({ type: "danger", message: v }); return; }
    setSubmitting(true);
    setError("");
    const amt = Number(amount);
    const timestamp = toISTISOString(new Date());
    const charges = transferType === "RTGS" ? "₹45.00" : transferType === "NEFT" ? "₹10.00" : "₹5.00";

    const nextHalfHour = (d) => {
      const dt = new Date(d);
      const mins = dt.getMinutes();
      if (mins === 0 || mins < 30) return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), 30, 0, 0);
      return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours() + 1, 0, 0, 0);
    };

    let scheduledFor = null;
    if (transferType === 'NEFT') {
      const base = scheduleType === 'NOW' ? new Date() : new Date(`${scheduleDate}T${scheduleTime}:00`);
      const batch = nextHalfHour(base);
      scheduledFor = toISTISOString(batch);
    } else if (scheduleType === 'LATER') {
      const local = new Date(`${scheduleDate}T${scheduleTime}:00`);
      scheduledFor = toISTISOString(local);
    }

    const draft = { accountId: fromAccountId, beneficiaryId, amount: amt, transferType, status: "PENDING", timestamp, charges, utr: null, remarks: remarks || "", scheduledFor };

    try {
      const created = await fetch(`${API}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft)
      }).then(r => r.json());

      const shouldProcessNow = (scheduleType === 'NOW' && (transferType === 'IMPS' || transferType === 'RTGS'));

      if (shouldProcessNow) {
        await finalizeTransaction(created.id);
      } else {
        const when = created.scheduledFor ? parseDateMs(created.scheduledFor) : null;
        setToast({ type: "info", message: `Transaction scheduled${when ? ` at ${formatIST(when)}` : ''}.` });
        setReceipt({ transactionId: created.id, timestamp: created.timestamp || timestamp, transferType: created.transferType, status: created.status || 'PENDING', amount: created.amount || amt, charges: created.charges || charges, utr: created.utr || null, scheduledFor: created.scheduledFor || scheduledFor });
        setStep("RECEIPT");
        const delay = when ? Math.max(0, when - Date.now()) : 0;
        setTimeout(() => finalizeTransaction(created.id), delay);
      }
    } catch (err) {
      setError(err?.message || "Server error.");
      setToast({ type: "danger", message: err?.message || "Network/Server error." });
    } finally {
      setSubmitting(false);
    }
  };

  const finalizeTransaction = async (txId) => {
    try {
      const tx = await fetch(`${API}/transactions/${txId}`).then(r => r.json());
      if (!tx || (tx.status && tx.status !== 'PENDING')) return;
      const amt = Number(tx.amount);
      const acctId = tx.accountId;
      // Deterministic validation for failures (no random failures)
      let finalStatus = 'SUCCESS';
      let utr = null;
      let failureReason = null;

      // Fetch account and beneficiary to run deterministic checks
      let acc = null;
      try { acc = await fetch(`${API}/accounts/${acctId}`).then(r => r.json()); } catch (e) { acc = null; }
      let ben = null;
      try { ben = await fetch(`${API}/beneficiaries/${tx.beneficiaryId}`).then(r => r.json()); } catch (e) { ben = null; }

      // 1) Source account must exist
      if (!acc) {
        finalStatus = 'FAILED';
        failureReason = 'Source account not found';
      }

      // 2) Check sufficient balance
      if (finalStatus === 'SUCCESS' && Number(acc.balance) < amt) {
        finalStatus = 'FAILED';
        failureReason = 'Insufficient balance in source account';
      }

      // 3) Check transfer limits for the chosen channel
      if (finalStatus === 'SUCCESS' && typeof LIMITS !== 'undefined' && LIMITS[transferType]) {
        const { min, max } = LIMITS[transferType];
        if (amt < min) {
          finalStatus = 'FAILED';
          failureReason = `${transferType} requires minimum amount of ₹${min.toLocaleString()}`;
        } else if (amt > max) {
          finalStatus = 'FAILED';
          failureReason = `${transferType} has a maximum limit of ₹${max.toLocaleString()}`;
        }
      }

      // 4) Beneficiary must exist and be verified (if verification required)
      if (finalStatus === 'SUCCESS' && ben && ben.verified === false) {
        finalStatus = 'FAILED';
        failureReason = 'Beneficiary verification failed';
      }

      // If all deterministic checks passed, mark success and assign a UTR
      if (finalStatus === 'SUCCESS') {
        utr = 'UTR' + Math.floor(100000000000 + Math.random() * 900000000000);
      }

      if (finalStatus === "SUCCESS") {
        // acc was fetched earlier; update its balance
        const newBalance = Number((acc.balance - amt).toFixed(2));
        await fetch(`${API}/accounts/${acctId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ balance: newBalance })
        });
        setAccounts(prev => prev.map(a => a.id === acctId ? { ...a, balance: newBalance } : a));
      }

      const updated = await fetch(`${API}/transactions/${txId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: finalStatus, utr, timestamp: toISTISOString(new Date()), failureReason })
      }).then(r => r.json());

      setReceipt(updated);
      if (updated.status === 'FAILED' && updated.failureReason) {
        setToast({ type: 'danger', message: `Payment failed: ${updated.failureReason}` });
      }
      setStep("RECEIPT");
    } catch (err) { console.error('Finalize error', err); }
  };

  const addBeneficiary = async (e) => {
    e.preventDefault();
    if (!newBen.name || !newBen.bank || !newBen.accountNumber || !newBen.ifsc) return;
    try {
      const created = await fetch(`${API}/beneficiaries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newBen, customerId: CUSTOMER_ID, verified: true })
      }).then(r => r.json());
      setBeneficiaries(prev => [...prev, created]);
      setBeneficiaryId(created.id);
      setShowAddBeneficiary(false);
      setNewBen({ name: "", bank: "", accountNumber: "", ifsc: "", nickname: "" });
    } catch { setToast({ type: "danger", message: "Failed to add beneficiary." }); }
  };

  const resetAll = () => {
    setStep("FORM"); setOtp(""); setReceipt(null); setAmount(""); setRemarks("");
    setScheduleType("NOW"); setScheduleDate(""); setScheduleTime(""); setAgree(false);
  };

  // UI RENDER
  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="spinner-border text-primary" role="status"></div>
    </div>
  );

  return (
    <div className="fund-page bg-light min-vh-100 py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            {/* FundHeader handles the account card display */}
            <FundHeader selectedAccount={selectedAccount} />

            <div className="row mt-4">
              {/* Sidebar Info - Aligned with Theme */}
              <div className="col-md-4 order-md-2 mb-4">
                <div className="card border-0 shadow-sm rounded-4 h-100">
                  <div className="card-body">
                    <h5 className="fw-bold mb-4">Transfer Guidelines</h5>
                    {Object.keys(HINTS).map(key => (
                      <div key={key} className={`p-3 rounded-3 mb-3 ${transferType === key ? 'bg-primary text-white' : 'bg-light'}`}>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-bold">{key}</span>
                          <span className="small">{FEES[key]}</span>
                        </div>
                        <p className="small mb-0 opacity-75">{HINTS[key]}</p>
                      </div>
                    ))}
                    <div className="alert alert-warning border-0 small rounded-3 mt-4">
                      <i className="bi bi-shield-lock-fill me-2"></i>
                      All transfers are encrypted and monitored for your security.
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Transaction Area */}
              <div className="col-md-8 order-md-1">
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                  <div className="bg-white p-3 border-bottom">
                    {/* Stepper UI */}
                    <div className="d-flex justify-content-around small fw-bold text-uppercase">
                      <div className={step === 'FORM' ? 'text-primary' : 'text-muted'}>1. Details</div>
                      <div className={step === 'OTP' ? 'text-primary' : 'text-muted'}>2. Verify</div>
                      <div className={step === 'RECEIPT' ? 'text-primary' : 'text-muted'}>3. Confirm</div>
                    </div>
                  </div>

                  <div className="card-body p-4">
                    {toast && (
                      <div className={`alert alert-${toast.type} alert-dismissible fade show rounded-3`} role="alert">
                        {toast.message}
                        <button type="button" className="btn-close" onClick={() => setToast(null)}></button>
                      </div>
                    )}

                    {step === 'FORM' && (
                      <TransferForm
                        accounts={accounts} transferType={transferType} setTransferType={setTransferType}
                        fromAccountId={fromAccountId} setFromAccountId={setFromAccountId}
                        beneficiaries={beneficiaries} beneficiaryId={beneficiaryId} setBeneficiaryId={setBeneficiaryId}
                        amount={amount} setAmount={setAmount} remarks={remarks} setRemarks={setRemarks}
                        scheduleType={scheduleType} setScheduleType={setScheduleType}
                        scheduleDate={scheduleDate} setScheduleDate={setScheduleDate}
                        scheduleTime={scheduleTime} setScheduleTime={setScheduleTime}
                        agree={agree} setAgree={setAgree} error={error}
                        handleFormSubmit={handleFormSubmit} resetAll={resetAll}
                        min={LIMITS[transferType].min} max={LIMITS[transferType].max}
                        setShowAddBeneficiary={setShowAddBeneficiary}
                      />
                    )}

                    {step === 'OTP' && (
                      <OTPConfirm
                        selectedAccount={selectedAccount} selectedBeneficiary={selectedBeneficiary}
                        transferType={transferType} amount={amount} scheduleType={scheduleType}
                        scheduleDate={scheduleDate} scheduleTime={scheduleTime}
                        otp={otp} setOtp={setOtp} error={error}
                        handleConfirmTransfer={handleConfirmTransfer} setStep={setStep} submitting={submitting}
                      />
                    )}

                    {step === 'RECEIPT' && receipt && (
                      <Receipt receipt={receipt} selectedAccount={selectedAccount} selectedBeneficiary={selectedBeneficiary} resetAll={resetAll} />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <AddBeneficiaryModal
              showAddBeneficiary={showAddBeneficiary} setShowAddBeneficiary={setShowAddBeneficiary}
              newBen={newBen} setNewBen={setNewBen} addBeneficiary={addBeneficiary}
            />
          </div>
        </div>
      </div>
    </div>
  );
}