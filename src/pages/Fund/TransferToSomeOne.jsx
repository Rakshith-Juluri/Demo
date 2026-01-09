import React, { useEffect, useMemo, useState, useCallback } from "react";
import FundHeader from '../Fund/FundHeader';
import TransferForm from '../Fund/TransferForm';
import OTPConfirm from '../Fund/OTPConfirm';
import Receipt from '../Fund/Receipt';
import AddBeneficiaryModal from '../Fund/AddBeneficiary';
 
const API = "http://localhost:4001";
 
const LIMITS = {
  NEFT: { min: 1, max: 200000 },
  RTGS: { min: 200000, max: 2000000 },
  IMPS: { min: 1, max: 200000 }
};
const FEES = { NEFT: "₹10.00", RTGS: "₹45.00", IMPS: "₹5.00" };
const HINTS = {
  NEFT: "Batch settlement; processes in half-hourly batches.",
  RTGS: "Real-time 24×7; ₹2 lakh minimum required.",
  IMPS: "Instant 24×7 transfer up to ₹2 lakh."
};
 
export default function Fund() {
  // prefer the app's stored loggedInUser object, fallback to userId scalar
  const [customerId, setCustomerId] = useState(() => {
    try {
      const s = localStorage.getItem('loggedInUser');
      if (s) return JSON.parse(s).id;
    } catch (e) {
      // ignore parse errors and fallback
    }
    return localStorage.getItem('userId');
  });
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
 
  // selectedAccount: match by accountNumber (we drive selection by account number)
  const selectedAccount = useMemo(() => {
    const norm = s => String(s || '').replace(/\s+/g, '').toLowerCase();
    return accounts.find(a => norm(a.accountNumber) === norm(fromAccountId));
  }, [accounts, fromAccountId]);
  const selectedBeneficiary = useMemo(() => beneficiaries.find(b => String(b.id) === String(beneficiaryId)), [beneficiaries, beneficiaryId]);
 
  // --- Helper Functions ---
  const toISTISOString = (input) => {
    const d = new Date(input);
    const offset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(d.getTime() + offset);
    return istDate.toISOString().replace('Z', '+05:30');
  };
 
  const formatIST = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    return new Intl.DateTimeFormat('en-IN', { dateStyle: 'short', timeStyle: 'medium', timeZone: 'Asia/Kolkata' }).format(dt) + ' IST';
  };
 
  const parseDateMs = (s) => {
    if (!s) return null;
    const normalized = String(s).replace(/\s+IST$/, '+05:30');
    const t = Date.parse(normalized);
    return isNaN(t) ? null : t;
  };
 
  const validateOtp = () => (/^\d{6}$/.test(otp) ? null : "Enter the 6-digit OTP.");
// Removed duplicate initial fetch; a single main fetch is handled later in the file.
  // --- Transaction Finalization (The "Core" Logic) ---
  const finalizeTransaction = useCallback(async (txId) => {
    try {
      const txRes = await fetch(`${API}/transactions/${txId}`);
      if (!txRes.ok) return null;
      const tx = await txRes.json();
      if (!tx || tx.status !== 'PENDING') return null;
 
      const amt = Number(tx.amount);
      const accRes = await fetch(`${API}/accounts/${tx.accountId}`);
      const benRes = await fetch(`${API}/beneficiaries/${tx.beneficiaryId}`);
      const acc = accRes.ok ? await accRes.json() : null;
      const ben = benRes.ok ? await benRes.json() : null;
 
      let finalStatus = 'SUCCESS';
      let failureReason = null;
 
      if (!acc) {
        finalStatus = 'FAILED';
        failureReason = 'Source account not found';
      } else if (Number(acc.balance) < amt) {
        finalStatus = 'FAILED';
        failureReason = 'Insufficient balance';
      }
 
      const utr = finalStatus === 'SUCCESS' ? 'UTR' + Math.floor(100000000000 + Math.random() * 900000000000) : null;
 
      let targetAcc = null;
      let creditCreated = false;
 
      if (finalStatus === 'SUCCESS') {
        // 1. Update Sender balance (ensure PATCH succeeded)
        const newSenderBal = Number((acc.balance - amt).toFixed(2));
        const senderPatchRes = await fetch(`${API}/accounts/${acc.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ balance: newSenderBal })
        });
 
        if (!senderPatchRes.ok) {
          finalStatus = 'FAILED';
          failureReason = 'Failed to debit sender account';
        } else {
          setAccounts(prev => prev.map(a => a.id === acc.id ? { ...a, balance: newSenderBal } : a));
 
          // 2. Find receiver account by beneficiary accountNumber and update
          const allAccs = await fetch(`${API}/accounts`).then(r => r.ok ? r.json() : []);
          const norm = s => String(s || '').replace(/\s+/g,'').toLowerCase();
          if (ben && ben.accountNumber) {
            targetAcc = allAccs.find(a => norm(a.accountNumber) === norm(ben.accountNumber));
          }
 
          if (!targetAcc) {
            // If receiver not found, mark as failed (no automatic credit)
            finalStatus = 'FAILED';
            failureReason = 'Beneficiary account not found';
          } else {
            // Idempotency: check if a matching CREDIT already exists
            const checkUrl = `${API}/transactions?type=CREDIT&accountNumber=${encodeURIComponent(targetAcc.accountNumber)}&counterpartyAccountNumber=${encodeURIComponent(acc.accountNumber)}&amount=${amt}`;
            const existingCredits = await fetch(checkUrl).then(r => r.ok ? r.json() : []);
 
            if (existingCredits && existingCredits.length > 0) {
              // credit already applied by another worker; avoid duplicate
              creditCreated = true; // treat as applied
            } else {
              // Patch receiver balance
              const newRecBal = Number((targetAcc.balance + amt).toFixed(2));
              const recPatchRes = await fetch(`${API}/accounts/${targetAcc.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ balance: newRecBal })
              });
 
              if (!recPatchRes.ok) {
                // couldn't credit receiver; mark failure (note: no rollback for sender under json-server)
                finalStatus = 'FAILED';
                failureReason = 'Failed to credit beneficiary account';
              } else {
                // create CREDIT transaction
                const creditRes = await fetch(`${API}/transactions`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    userId: ben.userId,
                    accountId: targetAcc.id,
                    accountNumber: targetAcc.accountNumber,
                    counterpartyAccountNumber: acc.accountNumber,
                    type: 'CREDIT',
                    amount: amt,
                    fromAccount: acc.accountNumber,
                    fromName: `User ${customerId}`,
                    toName: ben.name || ben.nickname || '',
                    status: 'SUCCESS',
                    timestamp: toISTISOString(new Date()),
                    utr
                  })
                });
 
                if (!creditRes.ok) {
                  finalStatus = 'FAILED';
                  failureReason = 'Failed to create credit transaction';
                } else {
                  creditCreated = true;
                }
              }
            }
          }
        }
      }
 
      // update the original sender transaction record with final status and metadata
      const patchedBody = {
        status: finalStatus,
        type: tx.type || 'DEBIT',
        utr,
        timestamp: toISTISOString(new Date()),
        failureReason,
        accountNumber: acc ? acc.accountNumber : tx.accountNumber || null,
        counterpartyAccountNumber: targetAcc ? targetAcc.accountNumber : (ben ? ben.accountNumber : tx.counterpartyAccountNumber || null),
        fromName: tx.fromName || (acc ? (acc.displayName || '') : ''),
        toName: ben ? (ben.name || ben.nickname || '') : (tx.toName || '')
      };
 
      const patchRes = await fetch(`${API}/transactions/${txId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patchedBody)
      });
 
      if (!patchRes.ok) {
        console.error('Failed to patch sender transaction', await patchRes.text());
        return null;
      }
 
      const updated = await patchRes.json();
 
      return updated;
    } catch (err) {
      console.error('Finalize error', err);
      return null;
    }
  }, [customerId]);
 
  // --- Background Watcher (Refresh Protection) ---
  useEffect(() => {
    const checkPending = async () => {
      try {
        const pending = await fetch(`${API}/transactions?userId=${customerId}&status=PENDING`).then(r => r.json());
        pending.forEach(tx => {
          const runAt = tx.scheduledFor ? parseDateMs(tx.scheduledFor) : Date.now();
          const delay = Math.max(0, runAt - Date.now());
         
          if (delay < 3600000) { // Auto-resume if within 1 hour
            setTimeout(async () => {
              const result = await finalizeTransaction(tx.id);
              if (result?.status === 'SUCCESS') {
                setToast({ type: "success", message: `Scheduled transfer of ₹${tx.amount} successful!` });
              }
            }, delay);
          }
        });
      } catch (e) { console.error("Watcher error", e); }
    };
    if (!loading) checkPending();
  }, [customerId, loading, finalizeTransaction]);
 
  // --- Main Fetch ---
  useEffect(() => {
    (async () => {
      try {
        // fetch accounts and beneficiaries with proper response checks
        const [accResRaw, benResRaw] = await Promise.all([
          fetch(`${API}/accounts?userId=${customerId}`),
          fetch(`${API}/beneficiaries?userId=${customerId}`)
        ]);
 
        if (!accResRaw.ok) throw new Error(`Accounts fetch failed: ${accResRaw.status}`);
        if (!benResRaw.ok) throw new Error(`Beneficiaries fetch failed: ${benResRaw.status}`);
 
        const accRes = await accResRaw.json();
        const benRes = await benResRaw.json();
 
        // add displayName for TransferForm and normalize ids to string for select consistency
        const mapped = (accRes || []).map(a => ({
          ...a,
          displayName: a.displayName || `${(a.accountType || a.type || '').toString().toUpperCase()} • ${a.accountNumber || a.accNo || ''}`
        }));
 
        // add displayName for beneficiaries so TransferForm can render labels
        const mappedBen = (benRes || []).map(b => ({
          ...b,
          displayName: b.displayName || b.name || b.nickname || `${b.bank || ''} • ${b.accountNumber || ''}`
        }));
 
  setAccounts(mapped);
  setBeneficiaries(mappedBen);
  // default selection: use accountNumber as the selected value (we drive transfers by account number)
  if (mapped?.length > 0) setFromAccountId(String(mapped[0].accountNumber));
        if (mappedBen?.length > 0 && !beneficiaryId) setBeneficiaryId(String(mappedBen[0].id));
      } catch (e) {
        console.error(e);
        setToast({ type: "danger", message: "Failed to load account data." });
      } finally { setLoading(false); }
    })();
  }, [customerId]);
 
  const handleConfirmTransfer = async () => {
    const v = validateOtp();
    if (v) { setError(v); setToast({ type: "danger", message: v }); return; }
 
    setSubmitting(true);
    setError("");
    const amt = Number(amount);
    // --- ENFORCE PAYMENT RULES (IMPS immediate only, RTGS min, NEFT batched) ---
    const limits = LIMITS[transferType] || { min: 1, max: Infinity };
    if (isNaN(amt) || amt <= 0) {
      setError("Enter a valid amount");
      setToast({ type: "danger", message: "Enter a valid amount" });
      setSubmitting(false);
      return;
    }
    if (amt < limits.min || amt > limits.max) {
      setError(`Amount must be between ${limits.min} and ${limits.max}`);
      setToast({ type: "danger", message: `Amount must be between ${limits.min} and ${limits.max}` });
      setSubmitting(false);
      return;
    }
    // IMPS: immediate only and cannot be scheduled; amount must be <= IMPS.max
    if (transferType === "IMPS") {
      if (scheduleType !== "NOW") {
        setError("IMPS payments cannot be scheduled for later");
        setToast({ type: "danger", message: "IMPS payments cannot be scheduled for later" });
        setSubmitting(false);
        return;
      }
      if (amt > LIMITS.IMPS.max) {
        setError(`IMPS limit is ₹${LIMITS.IMPS.max}`);
        setToast({ type: "danger", message: `IMPS limit is ₹${LIMITS.IMPS.max}` });
        setSubmitting(false);
        return;
      }
    }
    // RTGS: require minimum amount
    if (transferType === "RTGS" && amt < LIMITS.RTGS.min) {
      setError(`RTGS requires minimum ₹${LIMITS.RTGS.min}`);
      setToast({ type: "danger", message: `RTGS requires minimum ₹${LIMITS.RTGS.min}` });
      setSubmitting(false);
      return;
    }
    // NEFT: allowed to be scheduled; scheduling handled later (nextHalfHour)
    // --- end enforcement ---
    const timestamp = toISTISOString(new Date());
    const charges = transferType === "RTGS" ? "₹45.00" : transferType === "NEFT" ? "₹10.00" : "₹5.00";
 
    const nextHalfHour = (d) => {
      const dt = new Date(d);
      const mins = dt.getMinutes();
      const nextBatch = mins < 30 ? 30 : 60;
      return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), nextBatch, 0, 0);
    };
 
    let scheduledFor = null;
    if (transferType === 'NEFT') {
      const base = scheduleType === 'NOW' ? new Date() : new Date(`${scheduleDate}T${scheduleTime}:00`);
      scheduledFor = toISTISOString(nextHalfHour(base));
    } else if (scheduleType === 'LATER') {
      scheduledFor = toISTISOString(new Date(`${scheduleDate}T${scheduleTime}:00`));
    }
 
    // find the source account by accountNumber so we can record its id and proceed
    const norm = s => String(s || '').replace(/\s+/g, '').toLowerCase();
    const sourceAcc = accounts.find(a => norm(a.accountNumber) === norm(fromAccountId));
    // derive a readable sender name from loggedInUser if available
    let senderName = `User ${customerId}`;
    try {
      const lu = localStorage.getItem('loggedInUser');
      if (lu) senderName = JSON.parse(lu).name || senderName;
    } catch (e) {}
 
    // create a DEBIT draft (sender) including sender metadata and counterparty info
    const draft = {
      userId: customerId,
      accountId: sourceAcc ? sourceAcc.id : null,
      accountNumber: sourceAcc ? sourceAcc.accountNumber : fromAccountId,
      counterpartyAccountNumber: selectedBeneficiary?.accountNumber || '',
      beneficiaryId,
      type: "DEBIT",
      fromAccount: sourceAcc ? sourceAcc.accountNumber : fromAccountId,
      fromName: senderName,
      toName: selectedBeneficiary?.name || selectedBeneficiary?.nickname || '',
      amount: amt,
      transferType,
      status: "PENDING",
      timestamp,
      charges,
      remarks,
      scheduledFor
    };
 
    try {
      const resp = await fetch(`${API}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft)
      });
      if (!resp.ok) throw new Error(`Create transaction failed: ${resp.status}`);
      const created = await resp.json();
 
      const shouldProcessNow = (scheduleType === 'NOW' && transferType !== 'NEFT');
 
      if (shouldProcessNow) {
        // Try finalize immediately, with a couple retries for transient failures
        let result = null;
        try {
          result = await finalizeTransaction(created.id);
        } catch (e) { console.error('First finalize attempt failed', e); }
 
        if (!result) {
          // retry once after short delay
          await new Promise(r => setTimeout(r, 300));
          try { result = await finalizeTransaction(created.id); } catch (e) { console.error('Second finalize attempt failed', e); }
        }
 
  // fallback: if finalize didn't return a result, still show the created draft but mark processing
  // provide a provisional reference so the Receipt UI doesn't show `undefined`
  if (result) setReceipt(result);
  else setReceipt({ ...created, status: 'PROCESSING', utr: created.utr || `PEND-${created.id}` });
      } else {
        const runAt = parseDateMs(created.scheduledFor);
        setToast({ type: "info", message: `Scheduled for ${formatIST(runAt)}` });
        setReceipt({ ...created, status: 'SCHEDULED' });
 
        const delay = Math.max(0, runAt - Date.now());
        if (delay < 60000) setTimeout(async () => {
           const res = await finalizeTransaction(created.id);
           if (step === 'RECEIPT') setReceipt(res || created);
        }, delay);
      }
      setStep("RECEIPT");
    } catch (err) {
      console.error('Confirm transfer error', err);
      setToast({ type: "danger", message: "Error processing transfer." });
    } finally { setSubmitting(false); }
  };
 
  const addBeneficiary = async (e) => {
    e.preventDefault();
    try {
      const created = await fetch(`${API}/beneficiaries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newBen, userId: customerId, verified: true })
      }).then(r => r.json());
      // ensure created beneficiary has a displayName for the UI
      const withLabel = { ...created, displayName: created.displayName || created.name || created.nickname || `${created.bank || ''} • ${created.accountNumber || ''}` };
      setBeneficiaries(prev => [...prev, withLabel]);
      setBeneficiaryId(String(withLabel.id));
      setShowAddBeneficiary(false);
      setNewBen({ name: "", bank: "", accountNumber: "", ifsc: "", nickname: "" });
    } catch { setToast({ type: "danger", message: "Failed to add beneficiary." }); }
  };
 
  const resetAll = () => {
    setStep("FORM"); setOtp(""); setReceipt(null); setAmount(""); setRemarks("");
    setScheduleType("NOW"); setAgree(false); setError("");
  };
 
  if (loading) return <div className="vh-100 d-flex justify-content-center align-items-center"><div className="spinner-border text-primary"></div></div>;
 
  return (
    <div className="fund-page bg-light min-vh-100 py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <FundHeader selectedAccount={selectedAccount} />
            <div className="row mt-4">
              <div className="col-md-4 order-md-2 mb-4">
                <div className="card border-0 shadow-sm rounded-4 h-100">
                  <div className="card-body">
                    <h5 className="fw-bold mb-4">Transfer Guidelines</h5>
                    {Object.keys(HINTS).map(key => (
                      <div key={key} className={`p-3 rounded-3 mb-3 ${transferType === key ? 'bg-primary text-white' : 'bg-light'}`}>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-bold">{key}</span>
                          <span className="small">{FEES[key]}</span>
                        </div>
                        <p className="small mb-0 opacity-75">{HINTS[key]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-md-8 order-md-1">
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                  <div className="bg-white p-3 border-bottom d-flex justify-content-around small fw-bold text-uppercase text-center">
                      <span className={step === 'FORM' ? 'text-primary' : 'text-muted'}>1. Details</span>
                      <span className={step === 'OTP' ? 'text-primary' : 'text-muted'}>2. Verify</span>
                      <span className={step === 'RECEIPT' ? 'text-primary' : 'text-muted'}>3. Confirm</span>
                  </div>
                  <div className="card-body p-4">
                    {toast && (
                      <div className={`alert alert-${toast.type} alert-dismissible fade show`} role="alert">
                        {toast.message}<button type="button" className="btn-close" onClick={() => setToast(null)}></button>
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
                        handleFormSubmit={(e) => { e.preventDefault(); if(amount > 0) setStep("OTP"); else setError("Invalid amount"); }}
                        resetAll={resetAll} min={LIMITS[transferType].min} max={LIMITS[transferType].max}
                        setShowAddBeneficiary={setShowAddBeneficiary}
                      />
                    )}
                    {step === 'OTP' && (
                      <OTPConfirm
                        selectedAccount={selectedAccount} selectedBeneficiary={selectedBeneficiary}
                        transferType={transferType} amount={amount} scheduleType={scheduleType}
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
            <AddBeneficiaryModal showAddBeneficiary={showAddBeneficiary} setShowAddBeneficiary={setShowAddBeneficiary} newBen={newBen} setNewBen={setNewBen} addBeneficiary={addBeneficiary} />
          </div>
        </div>
      </div>
    </div>
  );
}