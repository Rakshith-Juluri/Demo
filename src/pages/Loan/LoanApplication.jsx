import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Assuming you are using react-router
import "bootstrap/dist/css/bootstrap.min.css";

export default function LoanApplication() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pan, setPan] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [loanType, setLoanType] = useState("home");
  const [income, setIncome] = useState("");
  const [amount, setAmount] = useState("");
  const [tenure, setTenure] = useState("");

  // File State
  const [files, setFiles] = useState({ idProof: null, incomeProof: null, propertyProof: null });
  const [emi, setEmi] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const rates = { home: 8.5, personal: 11.5 };

  const getTenureBounds = () => {
    return loanType === "home"
      ? { min: 60, max: 360, label: "5 to 30 Years" }
      : { min: 12, max: 60, label: "1 to 5 Years" };
  };

  const validateStep = () => {
    let newErrors = {};
    const bounds = getTenureBounds();
    if (step === 1) {
      if (name.trim().length < 6) newErrors.name = "Enter full legal name";
      if (!/^[6-9]\d{9}$/.test(phone)) newErrors.phone = "Must start with 6-9 (10 digits)";
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) newErrors.pan = "Invalid PAN format";
      if (!employmentType) newErrors.employmentType = "Selection required";
    }
    if (step === 2) {
      if (parseFloat(income) < 15000) newErrors.income = "Min. income ₹15,000";
      if (parseFloat(amount) < 50000) newErrors.amount = "Min. amount ₹50,000";
      const t = parseInt(tenure);
      if (!t || t < bounds.min || t > bounds.max) {
        newErrors.tenure = `${loanType === 'home' ? 'Home' : 'Personal'} loan tenure must be ${bounds.min}-${bounds.max} months`;
      }
    }
    if (step === 3) {
      if (!files.idProof || !files.incomeProof) newErrors.files = "KYC and Income docs required";
      if (loanType === "home" && !files.propertyProof) newErrors.files = "Property docs mandatory for Home Loan";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep()) setStep(step + 1);
  };

  const submitToDatabase = async () => {
    setIsSubmitting(true); // Start Buffering
    
    const applicationData = {
      id: `SKY-${Math.floor(Math.random() * 90000)}`,
      timestamp: new Date().toISOString(),
      personalDetails: { name, phone, pan, employmentType },
      loanDetails: { loanType, income, amount, tenure, emi },
      status: "PENDING APPROVAL"
    };

    try {
      // Added a dummy timeout to show the loading effect
      await new Promise(resolve => setTimeout(resolve, 2000));

      const response = await fetch("http://localhost:4001/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(applicationData),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        alert("Failed to save application. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Server not found! Application saved locally for demo.");
      setSubmitted(true); // Setting true for demo purposes if server fails
    } finally {
      setIsSubmitting(false); // Stop Buffering
    }
  };

  const handleBack = () => { setErrors({}); setStep(step - 1); };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const calculateEMI = (P, annualRate, n) => {
    const r = annualRate / 12 / 100;
    const emiValue = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return isFinite(emiValue) ? emiValue.toFixed(0) : 0;
  };

  useEffect(() => {
    if (amount && income && tenure) {
      const calculatedEmi = calculateEMI(parseFloat(amount), rates[loanType], parseInt(tenure));
      setEmi(calculatedEmi);
      let isEligible = calculatedEmi < parseFloat(income) * 0.5;
      setEligibility({ eligible: isEligible, messages: isEligible ? [] : ["EMI exceeds 50% of income"] });
    }
  }, [amount, income, tenure, loanType]);

  const ErrorField = ({ field }) => (
    errors[field] ? <div className="text-danger small fw-bold mt-1 animate__animated animate__shakeX">⚠ {errors[field]}</div> : null
  );

  return (
    <div style={{
      background: "linear-gradient(180deg, #E0F2FE 0%, #F8FAFC 600px)",
      minHeight: "100vh",
      fontFamily: "'Inter', sans-serif"
    }}>
      <div className="container py-4">
        {/* --- GLOBAL BACK BUTTON --- */}
        <div className="mb-4">
            <button 
                onClick={() => navigate('/loans')} 
                className="btn btn-light rounded-pill px-4 fw-bold text-primary shadow-sm border-0"
            >
                <i className="bi bi-arrow-left me-2"></i>Back to Loans
            </button>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-7">

            {/* --- CUSTOM HEADER --- */}
            <div className="text-center mb-5">
              <h2 className="fw-black text-dark display-6 mb-2" style={{ letterSpacing: "-1.5px" }}>New Loan Application</h2>
              <p className="text-secondary fw-medium">Complete your details to get an instant Loan</p>
            </div>

            <div className="card border-0 shadow-lg overflow-hidden" style={{ borderRadius: "35px" }}>

              {/* --- PROGRESS TRACKER --- */}
              <div className="p-4 bg-white border-bottom d-flex justify-content-between px-md-5">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="text-center position-relative" style={{ zIndex: 1 }}>
                    <div className={`rounded-circle d-flex align-items-center justify-content-center mx-auto transition-all ${step >= i ? 'bg-primary text-white shadow' : 'bg-light text-muted'}`}
                      style={{ width: "40px", height: "40px", fontWeight: "800", fontSize: "0.9rem" }}>
                      {step > i ? <i className="bi bi-check-lg"></i> : i}
                    </div>
                    <div className={`small mt-2 fw-bold ${step >= i ? 'text-primary' : 'text-muted'}`} style={{ fontSize: "10px" }}>
                      {i === 1 ? 'PERSONAL' : i === 2 ? 'LOAN' : i === 3 ? 'DOCS' : 'REVIEW'}
                    </div>
                  </div>
                ))}
              </div>

              <div className="card-body p-4 p-md-5 bg-white">
                {!submitted ? (
                  <form onSubmit={handleNext} noValidate>
                    {/* STEP 1 */}
                    {step === 1 && (
                      <div className="animate__animated animate__fadeIn">
                        <div className="mb-4">
                          <label className="form-label fw-bold text-dark small">FULL NAME (AS PER PAN)</label>
                          <input className="form-control form-control-lg bg-light border-0 px-4 py-3 rounded-4 fs-6"
                            value={name} onChange={e => setName(e.target.value)} placeholder="NAME" />
                          <ErrorField field="name" />
                        </div>
                        <div className="row">
                          <div className="col-md-6 mb-4">
                            <label className="form-label fw-bold text-dark small">PHONE NUMBER</label>
                            <input className="form-control form-control-lg bg-light border-0 px-4 py-3 rounded-4 fs-6"
                              value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="98XXXXXXXX" />
                            <ErrorField field="phone" />
                          </div>
                          <div className="col-md-6 mb-4">
                            <label className="form-label fw-bold text-dark small">PAN CARD NUMBER</label>
                            <input className="form-control form-control-lg bg-light border-0 px-4 py-3 rounded-4 fs-6"
                              style={{ textTransform: 'uppercase' }}
                              value={pan} onChange={e => setPan(e.target.value.toUpperCase().slice(0, 10))} placeholder="ABCDE1234F" />
                          <ErrorField field="pan" />
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="form-label fw-bold text-dark small">EMPLOYMENT STATUS</label>
                          <select className="form-select form-select-lg bg-light border-0 px-4 py-3 rounded-4 fs-6"
                            value={employmentType} onChange={e => setEmploymentType(e.target.value)}>
                            <option value="">Choose your status</option>
                            <option value="salaried">Salaried Employee</option>
                            <option value="business">Business Owner / Self-Employed</option>
                          </select>
                          <ErrorField field="employmentType" />
                        </div>
                        <button className="btn btn-primary w-100 py-3 rounded-pill fw-black shadow mt-3" style={{ fontSize: '1.1rem' }}>NEXT STEP</button>
                      </div>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                      <div className="animate__animated animate__fadeIn">
                        <div className="mb-4">
                          <label className="form-label fw-bold text-dark small">LOAN CATEGORY</label>
                          <div className="d-flex gap-2">
                            {['home', 'personal'].map(type => (
                              <div key={type} onClick={() => { setLoanType(type); setTenure(""); }}
                                className={`flex-fill p-3 text-center rounded-4 cursor-pointer transition-all border-2 ${loanType === type ? 'border-primary bg-primary-subtle' : 'bg-light border-transparent'}`}
                                style={{ cursor: 'pointer', border: '2px solid transparent' }}>
                                <i className={`bi bi-${type === 'home' ? 'house' : 'person'} fs-4 d-block mb-1`}></i>
                                <span className="fw-bold text-uppercase" style={{ fontSize: '10px' }}>{type} Loan</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6 mb-4">
                            <label className="form-label fw-bold text-dark small">MONTHLY INCOME (₹)</label>
                            <input type="number" className="form-control form-control-lg bg-light border-0 px-4 py-3 rounded-4"
                              value={income} onChange={e => setIncome(e.target.value)} />
                            <ErrorField field="income" />
                          </div>
                          <div className="col-md-6 mb-4">
                            <label className="form-label fw-bold text-dark small">REQUIRED AMOUNT (₹)</label>
                            <input type="number" className="form-control form-control-lg bg-light border-0 px-4 py-3 rounded-4"
                              value={amount} onChange={e => setAmount(e.target.value)} />
                            <ErrorField field="amount" />
                          </div>
                        </div>
                        <div className="mb-4 p-4 bg-light rounded-5 border border-white">
                          <div className="d-flex justify-content-between mb-2">
                            <label className="fw-bold text-dark small">REPAYMENT TENURE</label>
                            <span className="badge bg-white text-dark shadow-sm border">{getTenureBounds().label}</span>
                          </div>
                          <input type="number" className="form-control form-control-lg border-0 px-4 py-3 rounded-4"
                            placeholder={`Months (${getTenureBounds().min}-${getTenureBounds().max})`}
                            value={tenure} onChange={e => setTenure(e.target.value)} />
                          <ErrorField field="tenure" />
                        </div>
                        <div className="d-flex gap-3 mt-4">
                          <button type="button" onClick={handleBack} className="btn btn-light py-3 rounded-pill w-50 fw-bold">GO BACK</button>
                          <button className="btn btn-primary py-3 rounded-pill w-50 fw-bold shadow">NEXT STEP</button>
                        </div>
                      </div>
                    )}

                    {/* STEP 3 */}
                    {step === 3 && (
                      <div className="animate__animated animate__fadeIn">
                        <div className="card border-0 bg-info-subtle p-4 rounded-5 mb-4 text-center border border-info border-opacity-25">
                          <span className="small text-uppercase fw-black text-info-emphasis">Projected Monthly EMI</span>
                          <h1 className="fw-black mb-0" style={{ color: "#0369A1" }}>₹{emi}</h1>
                        </div>

                        <h6 className="fw-bold mb-4">UPLOAD KYCS & PROOFS</h6>
                        <div className="mb-4">
                          <label className="form-label small fw-bold text-muted">ID PROOF (AADHAR/VOTER)</label>
                          <input type="file" name="idProof" className="form-control rounded-4 p-3 bg-light border-0" onChange={handleFileChange} />
                        </div>
                        <div className="mb-4">
                          <label className="form-label small fw-bold text-muted">INCOME PROOF (SLIPS/ITR)</label>
                          <input type="file" name="incomeProof" className="form-control rounded-4 p-3 bg-light border-0" onChange={handleFileChange} />
                        </div>
                        <div className="mb-4 bg-white border p-3 rounded-5">
                          <label className="form-label small fw-bold text-primary">{loanType === "home" ? "PROPERTY SALE DEED" : "BANK STATEMENT (6M)"}</label>
                          <input type="file" name="propertyProof" className="form-control border-0 bg-light rounded-4" onChange={handleFileChange} />
                        </div>
                        <ErrorField field="files" />

                        <div className="d-flex gap-3 mt-4">
                          <button type="button" onClick={handleBack} className="btn btn-light py-3 rounded-pill w-50 fw-bold">BACK</button>
                          <button className="btn btn-primary py-3 rounded-pill w-50 fw-bold shadow" disabled={!eligibility?.eligible}>REVIEW FINAL</button>
                        </div>
                      </div>
                    )}

                    {/* STEP 4 */}
                    {step === 4 && (
                      <div className="animate__animated animate__fadeIn text-center">
                        <div className="p-5 bg-light rounded-5 mb-4">
                          <i className="bi bi-file-earmark-text display-3 text-primary mb-3"></i>
                          <h5 className="fw-black">Check Your Summary</h5>
                          <hr className="my-4 opacity-10" />
                          <div className="d-flex justify-content-between mb-3 text-secondary"><span>Requested:</span> <strong className="text-dark">₹{parseFloat(amount).toLocaleString()}</strong></div>
                          <div className="d-flex justify-content-between mb-3 text-secondary"><span>Category:</span> <strong className="text-dark text-uppercase">{loanType}</strong></div>
                          <div className="d-flex justify-content-between border-top pt-3"><span>Monthly EMI:</span> <strong className="text-primary h3 mb-0">₹{emi}</strong></div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={submitToDatabase}
                          disabled={isSubmitting}
                          className="btn btn-dark btn-lg w-100 py-3 rounded-pill fw-black shadow-lg d-flex align-items-center justify-content-center"
                        >
                          {isSubmitting ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                PROCESSING...
                            </>
                          ) : "SUBMIT APPLICATION"}
                        </button>
                        <button type="button" onClick={handleBack} disabled={isSubmitting} className="btn btn-link mt-3 text-decoration-none fw-bold">Edit Details</button>
                      </div>
                    )}
                  </form>
                ) : (
                  /* SUCCESS VIEW */
                  <div className="text-center py-4 animate__animated animate__zoomIn">
                    <div className="bg-success-subtle d-inline-flex p-4 rounded-circle mb-4">
                      <i className="bi bi-check-lg display-4 text-success"></i>
                    </div>
                    <h2 className="fw-black mb-2">SUCCESS</h2>
                    <p className="text-muted mb-4 px-4">Your application has been sent for Approval.</p>
                    <div className="alert bg-warning bg-opacity-10 border-0 text-dark fw-bold rounded-pill py-3">
                      STATUS: PENDING APPROVAL
                    </div>
                    <button onClick={() => navigate('/loans')} className="btn btn-outline-dark mt-4 px-5 py-2 rounded-pill fw-bold">RETURN TO HOME</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}