import React, { useState, useEffect } from "react"; // Added useEffect
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Card, Form, Row, Col, Button, InputGroup, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function SavingAccount() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSameAddress, setIsSameAddress] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  // New States for account validation
  const [checkingAccount, setCheckingAccount] = useState(true);
  const [hasExistingAccount, setHasExistingAccount] = useState(false);
  const [existingStatus, setExistingStatus] = useState("");

  const [formData, setFormData] = useState({
    customerName: "",
    fatherName: "",
    motherName: "",
    dob: "",
    gender: "",
    maritalStatus: "",
    occupation: "",
    annualIncome: "",
    accountype: "saving",
    nationality: "",
    panCard: "",
    adharCard: "",
    panCardFile: null,
    aadhaarCardFile: null,
    signatureFile: null,
    mobileNumber: "",
    otp: "",
    currentAddress: "",
    currentPincode: "",
    currentState: "",
    currentDistrict: "",
    currentLandmark: "",
    permanentAddress: "",
    permanentPincode: "",
    permanentState: "",
    permanentDistrict: "",
    permanentLandmark: "",
  });

  const theme = {
    primary: "#0284C7",
    darkBlue: "#0C4A6E",
    border: "#E2E8F0"
  };

  // --- NEW: ACCOUNT VALIDATION EFFECT ---
  useEffect(() => {
    const checkExistingRequest = async () => {
      let loggedUserId = null;
      try {
        const raw = localStorage.getItem('loggedInUser');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.id) loggedUserId = parsed.id;
        }
      } catch (e) { console.error(e); }

      if (!loggedUserId) {
        setCheckingAccount(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:4001/accountRequests?userId=${loggedUserId}&accountype=saving`);
        const data = await res.json();

        // Check if any request is pending or accepted
        const existing = data.find(req => req.status === 'pending' || req.status === 'accepted');
        
        if (existing) {
          setHasExistingAccount(true);
          setExistingStatus(existing.status);
        }
      } catch (err) {
        console.error("Validation error:", err);
      } finally {
        setCheckingAccount(false);
      }
    };

    checkExistingRequest();
  }, []);

  const handleChange = (e) => {
    const { name, value, files, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value
    }));
  };

  const handleSameAddress = (e) => {
    const checked = e.target.checked;
    setIsSameAddress(checked);
    if (checked) {
      setFormData(prev => ({
        ...prev,
        permanentAddress: prev.currentAddress,
        permanentPincode: prev.currentPincode,
        permanentState: prev.currentState,
        permanentDistrict: prev.currentDistrict,
        permanentLandmark: prev.currentLandmark
      }));
    }
  };

  const handleSaveDraft = (e) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (step !== 3) { setStep(3); return; }

    setSubmitting(true);
    setSubmitError(null);

    const getNextRequestId = () => {
      try {
        const key = 'accountRequestCounter';
        const stored = parseInt(localStorage.getItem(key), 10);
        const nextCounter = Number.isFinite(stored) ? stored + 1 : 1;
        localStorage.setItem(key, String(nextCounter));
        return `${Date.now()}-${nextCounter}`;
      } catch (err) {
        return `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      }
    };

    let loggedUserId = null;
    try {
      const raw = localStorage.getItem('loggedInUser');
      if (raw) loggedUserId = JSON.parse(raw).id;
    } catch (e) {}

    const payload = {
      requestId: getNextRequestId(),
      userId: loggedUserId,
      ...formData,
      panCardFile: formData.panCardFile ? formData.panCardFile.name : null,
      aadhaarCardFile: formData.aadhaarCardFile ? formData.aadhaarCardFile.name : null,
      signatureFile: formData.signatureFile ? formData.signatureFile.name : null,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('http://localhost:4001/accountRequests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      navigate('/app/accounts');
    } catch (err) {
      setSubmitError(err.message || 'Submission failed');
      alert('Submission failed: ' + (err.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const next = (e) => { e.preventDefault(); setStep((s) => Math.min(s + 1, 3)); };
  const back = (e) => { e.preventDefault(); setStep((s) => Math.max(s - 1, 1)); };

  // --- RENDER LOGIC ---

  if (checkingAccount) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container fluid className="py-5" style={{ background: "linear-gradient(180deg, #E0F2FE 0%, #F8FAFC 100%)", minHeight: "100vh" }}>
      
      {saveSuccess && (
        <div className="position-fixed top-0 start-50 translate-middle-x mt-4 animate__animated animate__fadeInDown" style={{ zIndex: 3000 }}>
          <Alert variant="success" className="shadow-lg rounded-pill px-4 py-2 border-0 fw-bold">
            <i className="bi bi-check-circle-fill me-2"></i> Progress saved successfully
          </Alert>
        </div>
      )}

      <Card className="mx-auto border-0 shadow-lg overflow-hidden" style={{ maxWidth: "1000px", borderRadius: "30px" }}>
        
        {/* Header Section */}
        <div className="bg-white p-4 border-bottom d-flex justify-content-between align-items-center">
          <div>
            <h4 className="fw-black mb-1" style={{ color: theme.darkBlue }}>Open Savings Account</h4>
            {!hasExistingAccount && (
                <p className="text-secondary small mb-0">Step {step}: {step === 1 ? "Personal Details" : step === 2 ? "KYC & Uploads" : "Contact & Address"}</p>
            )}
          </div>
          <div className="d-flex align-items-center gap-3">
             {!hasExistingAccount && (
                <div className="text-end d-none d-md-block">
                    <div className="small fw-bold text-muted">Progress: {Math.round((step/3)*100)}%</div>
                    <div className="progress mt-1" style={{ height: '6px', width: '100px' }}>
                        <div className="progress-bar" style={{ width: `${(step/3)*100}%`, backgroundColor: theme.primary }}></div>
                    </div>
                </div>
             )}
             <Button variant="light" onClick={() => navigate(-1)} className="rounded-circle shadow-sm border">
               <i className="bi bi-x-lg"></i>
             </Button>
          </div>
        </div>

        <Card.Body className="p-4 p-md-5">
         {hasExistingAccount ? (
  <div className="text-center py-5 animate__animated animate__fadeIn">
    {existingStatus === 'pending' ? (
      /* UI for PENDING Status */
      <>
        <div className="mb-4">
          <i className="bi bi-clock-history text-warning display-1"></i>
        </div>
        <h3 className="fw-bold">Application Under Review</h3>
        <p className="text-muted mx-auto" style={{ maxWidth: '500px' }}>
          Your request for a Savings Account is currently <strong>pending</strong>. 
          Please wait for our team to verify your documents before submitting a new request.
        </p>
      </>
    ) : (
      /* UI for ACCEPTED Status */
      <>
        <div className="mb-4">
          <i className="bi bi-check-circle-fill text-success display-1"></i>
        </div>
        <h3 className="fw-bold">Account Already Exists</h3>
        <p className="text-muted mx-auto" style={{ maxWidth: '500px' }}>
          Our records show that you <strong>already have an active Savings Account</strong> with us. 
          Per bank policy, customers are limited to one savings account.
        </p>
      </>
    )}

    <Button 
      variant="primary" 
      className="rounded-pill px-5 mt-3 fw-bold shadow-sm" 
      onClick={() => navigate('/app/accounts')}
    >
      GO TO MY ACCOUNTS
    </Button>
  </div>
): (
            <Form onSubmit={(e) => e.preventDefault()}>
              {/* STEP 1: PERSONAL IDENTITY */}
              {step === 1 && (
                <div className="animate__animated animate__fadeIn">
                  <div className="mb-4">
                    <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill mb-2">Step 1 of 3</span>
                    <h5 className="fw-bold mt-2">Personal Information</h5>
                  </div>
                  <Row className="g-4">
                    <Col md={6}>
                      <Form.Label className="small fw-bold">Customer Full Name</Form.Label>
                      <Form.Control name="customerName" value={formData.customerName} onChange={handleChange} placeholder="As per PAN/Aadhaar" />
                    </Col>
                    {/* ... (rest of your form fields stay exactly the same) ... */}
                    <Col md={6}>
                      <Form.Label className="small fw-bold">Date of Birth</Form.Label>
                      <Form.Control type="date" name="dob" value={formData.dob} onChange={handleChange} />
                    </Col>
                    <Col md={6}>
                      <Form.Label className="small fw-bold">Father's Name</Form.Label>
                      <Form.Control name="fatherName" value={formData.fatherName} onChange={handleChange} placeholder="Full Name" />
                    </Col>
                    <Col md={6}>
                      <Form.Label className="small fw-bold">Mother's Name</Form.Label>
                      <Form.Control name="motherName" value={formData.motherName} onChange={handleChange} placeholder="Full Name" />
                    </Col>
                    <Col md={4}>
                      <Form.Label className="small fw-bold">Gender</Form.Label>
                      <Form.Select name="gender" value={formData.gender} onChange={handleChange}>
                        <option value="">Select</option>
                        <option>Male</option><option>Female</option><option>Other</option>
                      </Form.Select>
                    </Col>
                    <Col md={4}>
                      <Form.Label className="small fw-bold">Marital Status</Form.Label>
                      <Form.Select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange}>
                        <option value="">Select</option>
                        <option>Single</option><option>Married</option><option>Divorced</option>
                      </Form.Select>
                    </Col>
                    <Col md={4}>
                      <Form.Label className="small fw-bold">Nationality</Form.Label>
                      <Form.Control name="nationality" value={formData.nationality} onChange={handleChange} placeholder="e.g. Indian" />
                    </Col>
                    <Col md={6}>
                      <Form.Label className="small fw-bold">Occupation</Form.Label>
                      <Form.Select name="occupation" value={formData.occupation} onChange={handleChange}>
                        <option value="">Select</option>
                        <option>Salaried</option><option>Self-Employed</option><option>Student</option><option>Business</option>
                      </Form.Select>
                    </Col>
                    <Col md={6}>
                      <Form.Label className="small fw-bold">Annual Income</Form.Label>
                      <Form.Select name="annualIncome" value={formData.annualIncome} onChange={handleChange}>
                        <option value="">Select Range</option>
                        <option>Below 2.5L</option><option>2.5L - 5L</option><option>5L - 10L</option><option>Above 10L</option>
                      </Form.Select>
                    </Col>
                  </Row>
                </div>
              )}

              {/* STEP 2: KYC & UPLOADS */}
              {step === 2 && (
                <div className="animate__animated animate__fadeIn">
                  <div className="mb-4 text-center">
                    <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill mb-2">Step 2 of 3</span>
                    <h5 className="fw-bold">Security & Document Verification</h5>
                  </div>
                  <Row className="g-4">
                    <Col md={6}>
                      <div className="p-4 border rounded-4 bg-light bg-opacity-50 h-100">
                        <Form.Label className="fw-bold small">PAN Details</Form.Label>
                        <Form.Control className="mb-3" name="panCard" placeholder="ABCDE1234F" onChange={handleChange} />
                        <Form.Label className="very-small text-muted">Upload PAN Card Copy</Form.Label>
                        <Form.Control type="file" name="panCardFile" onChange={handleChange} size="sm" />
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="p-4 border rounded-4 bg-light bg-opacity-50 h-100">
                        <Form.Label className="fw-bold small">Aadhaar Details</Form.Label>
                        <Form.Control className="mb-3" name="adharCard" placeholder="1234 5678 9012" onChange={handleChange} />
                        <Form.Label className="very-small text-muted">Upload Aadhaar Copy</Form.Label>
                        <Form.Control type="file" name="aadhaarCardFile" onChange={handleChange} size="sm" />
                      </div>
                    </Col>
                    <Col md={12}>
                      <div className="p-3 border border-dashed rounded-4 bg-white d-flex align-items-center justify-content-center">
                          <i className="bi bi-pen fs-3 text-primary me-3"></i>
                          <div className="flex-grow-1">
                              <div className="fw-bold small">Digital Signature Scan</div>
                              <Form.Control type="file" name="signatureFile" onChange={handleChange} size="sm" />
                          </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              )}

              {/* STEP 3: CONTACT & ADDRESS */}
              {step === 3 && (
                <div className="animate__animated animate__fadeIn">
                  <Row className="g-4">
                    <Col md={7}>
                      <h6 className="fw-bold mb-3">Residential Address</h6>
                      <div className="p-3 border rounded-4 mb-4 bg-light bg-opacity-25">
                          <Form.Label className="very-small fw-bold text-primary text-uppercase">Current Address</Form.Label>
                          <Form.Control as="textarea" rows={2} className="mb-2" name="currentAddress" value={formData.currentAddress} onChange={handleChange} placeholder="Flat, Street, Landmark" />
                          <Row className="g-2">
                              <Col md={6}><Form.Control name="currentDistrict" placeholder="District" value={formData.currentDistrict} onChange={handleChange} /></Col>
                              <Col md={6}><Form.Control name="currentPincode" placeholder="Pincode" value={formData.currentPincode} onChange={handleChange} /></Col>
                              <Col md={6}><Form.Control name="currentState" placeholder="State" value={formData.currentState} onChange={handleChange} /></Col>
                              <Col md={6}><Form.Control name="currentLandmark" placeholder="Landmark" value={formData.currentLandmark} onChange={handleChange} /></Col>
                          </Row>
                      </div>
                      <Form.Check type="checkbox" label="Permanent address same as current" className="mb-3 small fw-bold" checked={isSameAddress} onChange={handleSameAddress} />
                      {!isSameAddress && (
                          <div className="p-3 border rounded-4 bg-white animate__animated animate__fadeIn">
                              <Form.Label className="very-small fw-bold text-danger text-uppercase">Permanent Address</Form.Label>
                              <Form.Control as="textarea" rows={2} className="mb-2" name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} placeholder="Flat, Street, Landmark" />
                              <Row className="g-2">
                                  <Col md={6}><Form.Control name="permanentDistrict" placeholder="District" value={formData.permanentDistrict} onChange={handleChange} /></Col>
                                  <Col md={6}><Form.Control name="permanentPincode" placeholder="Pincode" value={formData.permanentPincode} onChange={handleChange} /></Col>
                                  <Col md={6}><Form.Control name="permanentState" placeholder="State" value={formData.permanentState} onChange={handleChange} /></Col>
                                  <Col md={6}><Form.Control name="permanentLandmark" placeholder="Landmark" value={formData.permanentLandmark} onChange={handleChange} /></Col>
                              </Row>
                          </div>
                      )}
                    </Col>
                    <Col md={5}>
                      <div className="card border-0 bg-dark text-white p-4 rounded-4 h-100 shadow-lg d-flex flex-column justify-content-center">
                          <h6 className="fw-bold mb-4 text-primary text-center">Contact Verification</h6>
                          <Form.Label className="very-small opacity-75">Primary Mobile Number</Form.Label>
                          <InputGroup className="mb-4">
                              <Form.Control name="mobileNumber" placeholder="Enter Mobile" className="bg-transparent text-white border-secondary" onChange={handleChange} />
                              <Button variant="primary" type="button">OTP</Button>
                          </InputGroup>
                          <Form.Label className="very-small opacity-75">Verification OTP</Form.Label>
                          <Form.Control name="otp" className="bg-transparent text-white border-secondary mb-4" placeholder="Enter 6-digit OTP" onChange={handleChange} />
                      </div>
                    </Col>
                  </Row>
                </div>
              )}

              {/* Navigation Footer */}
              {submitError && ( <Alert variant="danger" className="mb-3">{submitError}</Alert> )}
              <div className="d-flex justify-content-between align-items-center mt-5 pt-4 border-top">
                <Button type="button" variant="link" className={`text-decoration-none fw-bold ${step === 1 ? 'invisible' : 'text-secondary'}`} onClick={back}>
                  <i className="bi bi-arrow-left me-2"></i>PREVIOUS
                </Button>
                <div className="d-flex gap-3">
                  <Button type="button" variant="light" className="px-4 rounded-pill fw-bold border text-muted" onClick={handleSaveDraft}>
                      SAVE AS DRAFT
                  </Button>
                  {step < 3 ? (
                    <Button type="button" onClick={next} className="px-5 rounded-pill fw-bold shadow-sm text-white" style={{ backgroundColor: theme.primary, border: 'none' }}>
                      CONTINUE <i className="bi bi-chevron-right ms-2"></i>
                    </Button>
                  ) : (
                    <Button variant="primary" type="button" onClick={handleSubmit} disabled={submitting} className="px-5 rounded-pill fw-bold shadow border-0" style={{ background: 'linear-gradient(45deg, #0284C7, #0369A1)' }}>
                      {submitting ? 'Submitting...' : 'SUBMIT APPLICATION'}
                    </Button>
                  )}
                </div>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>
      {/* ... style tag ... */}
      <style>{`
        .fw-black { font-weight: 900; }
        .very-small { font-size: 0.65rem; letter-spacing: 0.5px; }
        .form-control, .form-select { border: 1.5px solid ${theme.border}; border-radius: 12px; font-size: 0.9rem; padding: 0.6rem 1rem; }
        .form-control:focus { border-color: ${theme.primary}; box-shadow: 0 0 0 0.25rem rgba(2, 132, 199, 0.1); }
        .border-dashed { border-style: dashed !important; border-width: 2px !important; }
      `}</style>
    </Container>
  );
}

export default SavingAccount;