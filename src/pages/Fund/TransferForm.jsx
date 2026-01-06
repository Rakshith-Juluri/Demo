import React, { useEffect, useMemo } from 'react';

export default function TransferForm(props) {
  const {
    accounts, transferType, setTransferType, fromAccountId, setFromAccountId,
    beneficiaries, beneficiaryId, setBeneficiaryId, amount, setAmount,
    remarks, setRemarks, scheduleType, setScheduleType, scheduleDate,
    setScheduleDate, scheduleTime, setScheduleTime, agree, setAgree,
    error, handleFormSubmit, resetAll, min, max, setShowAddBeneficiary
  } = props;

  const paymentTypes = [
    { key: 'NEFT', title: 'NEFT', sub: 'Batched, Eco' },
    { key: 'RTGS', title: 'RTGS', sub: 'High Value' },
    { key: 'IMPS', title: 'IMPS', sub: 'Instant 24/7' },
  ];

  const minDate = useMemo(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }, []);

  const minTimeNow = useMemo(() => {
    const t = new Date();
    return `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    if (transferType === 'IMPS' && scheduleType === 'LATER') {
      setScheduleType('NOW');
      setScheduleDate('');
      setScheduleTime('');
    }
    if ((transferType === 'NEFT' || transferType === 'RTGS') && scheduleType === 'LATER') {
      if (scheduleDate && scheduleDate < minDate) setScheduleDate(minDate);
      if (scheduleDate === minDate && scheduleTime && scheduleTime < minTimeNow) setScheduleTime(minTimeNow);
    }
  }, [transferType, scheduleType, scheduleDate, scheduleTime, minDate, minTimeNow, setScheduleDate, setScheduleTime, setScheduleType]);

  return (
    <form onSubmit={handleFormSubmit}>
      <h5 className="fw-bold mb-4" style={{ color: "#0C4A6E" }}>Transfer Details</h5>
      
      {/* Payment Method Selection */}
      <div className="mb-4">
        <label className="form-label small fw-bold text-uppercase text-muted">Select Method</label>
        <div className="row g-2">
          {paymentTypes.map(({ key, title, sub }) => (
            <div className="col-4" key={key}>
              <input
                type="radio" className="btn-check" name="transferType"
                id={`type-${key}`} checked={transferType === key}
                onChange={() => setTransferType(key)}
              />
              <label htmlFor={`type-${key}`} className={`btn w-100 py-3 rounded-4 border-2 d-flex flex-column align-items-center ${transferType === key ? 'btn-primary' : 'btn-outline-light text-dark border-light-subtle'}`}>
                <span className="fw-bold">{title}</span>
                <span className="x-small opacity-75 d-none d-md-block" style={{ fontSize: '10px' }}>{sub}</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="row g-3 mb-4">
        {/* From Account */}
        <div className="col-md-6">
          <label className="form-label small fw-bold text-muted">FROM ACCOUNT</label>
          <select className="form-select rounded-3 p-2" value={fromAccountId} onChange={e => setFromAccountId(e.target.value)} required>
            {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.displayName}</option>)}
          </select>
        </div>

        {/* Beneficiary */}
        <div className="col-md-6">
          <div className="d-flex justify-content-between">
            <label className="form-label small fw-bold text-muted">TO BENEFICIARY</label>
            <button type="button" className="btn btn-link btn-sm p-0 text-decoration-none fw-bold" onClick={() => setShowAddBeneficiary(true)}>+ Add New</button>
          </div>
          <select className="form-select rounded-3 p-2" value={beneficiaryId} onChange={e => setBeneficiaryId(e.target.value)} required>
            <option value="">Select beneficiary</option>
            {beneficiaries.map(b => <option key={b.id} value={b.id}>{b.nickname || b.name} ({b.bank})</option>)}
          </select>
        </div>

        {/* Amount */}
        <div className="col-md-6">
          <label className="form-label small fw-bold text-muted">AMOUNT (₹)</label>
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0">₹</span>
            <input type="number" className="form-control border-start-0 ps-0" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} min={min} max={max} required />
          </div>
        </div>

        {/* Remarks */}
        <div className="col-md-6">
          <label className="form-label small fw-bold text-muted">REMARKS</label>
          <input type="text" className="form-control" placeholder="What is this for?" value={remarks} onChange={e => setRemarks(e.target.value)} maxLength={140} />
        </div>
      </div>

      {/* Scheduling Section */}
      <div className="bg-light p-3 rounded-4 mb-4">
        <label className="form-label small fw-bold text-muted d-block">SCHEDULE PAYMENT</label>
        <div className="btn-group w-100 mb-3">
          <button type="button" className={`btn btn-sm py-2 ${scheduleType === 'NOW' ? 'btn-dark' : 'btn-outline-secondary'}`} onClick={() => setScheduleType('NOW')}>Pay Now</button>
          <button type="button" className={`btn btn-sm py-2 ${scheduleType === 'LATER' ? 'btn-dark' : 'btn-outline-secondary'}`} onClick={() => setScheduleType('LATER')} disabled={transferType === 'IMPS'}>Pay Later</button>
        </div>

        {scheduleType === 'LATER' && (
          <div className="row g-2">
            <div className="col-6"><input type="date" className="form-control form-control-sm" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} required min={minDate} /></div>
            <div className="col-6"><input type="time" className="form-control form-control-sm" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} required min={scheduleDate === minDate ? minTimeNow : undefined} /></div>
          </div>
        )}
      </div>

      <div className="form-check mb-4">
        <input className="form-check-input" type="checkbox" id="agree" checked={agree} onChange={e => setAgree(e.target.checked)} required />
        <label className="form-check-label small text-muted" htmlFor="agree">I confirm the details and agree to the secure transfer policy.</label>
      </div>

      {error && <div className="alert alert-danger py-2 small">{error}</div>}

      <div className="d-grid gap-2">
        <button type="submit" className="btn btn-primary btn-lg rounded-pill fw-bold shadow-sm">Proceed to Verification</button>
        <button type="button" className="btn btn-link text-muted btn-sm text-decoration-none" onClick={resetAll}>Cancel & Clear</button>
      </div>
    </form>
  );
}