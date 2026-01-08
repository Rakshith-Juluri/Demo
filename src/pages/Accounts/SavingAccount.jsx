import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Card, Form, Row, Col, Button, InputGroup, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function SavingAccount() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSameAddress, setIsSameAddress] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [errors, setErrors] = useState({});

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

  // Sync key contact/address fields to Profile after a successful submission
  const updateProfileLocalStorage = () => {
    try {
      const [fn, ...lnRest] = String(formData.customerName || '').trim().split(/\s+/);
      const patch = {
        firstName: fn || undefined,
        lastName: lnRest.join(' ') || undefined,
        phone: formData.mobileNumber || undefined,
        address: formData.currentAddress || undefined,
        landmark: formData.currentLandmark || undefined,
        district: formData.currentDistrict || undefined,
        state: formData.currentState || undefined,
        zip: formData.currentPincode || undefined,
      };
      const existing = JSON.parse(localStorage.getItem('userProfileData') || '{}');
      const merged = { ...existing, ...Object.fromEntries(Object.entries(patch).filter(([, v]) => v)) };
      localStorage.setItem('userProfileData', JSON.stringify(merged));
    } catch {}
  };

  // --- ADDED DUMMY OTP LOGIC ---
  const handleGenerateOTP = () => {
    // Validate mobile number format first
    if (!/^\d{10}$/.test(formData.mobileNumber)) {
        setErrors(prev => ({ ...prev, mobileNumber: "Enter a valid 10-digit number first" }));
        return;
    }
    
    // Generate a random 6-digit number
    const dummyOtp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Alert the user (Simulation)
    alert(`[SIMULATION] Verification code sent to ${formData.mobileNumber}: ${dummyOtp}`);
    
    // Auto-fill the field for convenience or leave it for user to type
    setFormData(prev => ({ ...prev, otp: dummyOtp }));
    
    // Clear any existing errors for these fields
    setErrors(prev => ({ ...prev, mobileNumber: null, otp: null }));
  };

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

  const validateStep = () => {
    let newErrors = {};
    
    const getAge = (birthDate) => {
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      return age;
    };

    if (step === 1) {
      if (!formData.customerName || formData.customerName.length <= 5) 
        newErrors.customerName = "Name must be greater than 5 characters";
      
      if (!formData.dob) {
        newErrors.dob = "Date of birth is required";
      } else if (getAge(formData.dob) < 18) {
        newErrors.dob = "Age must be greater than 18 years";
      }

      if (!formData.fatherName || formData.fatherName.length <= 5) 
        newErrors.fatherName = "Father's name must be greater than 5 characters";
      
      if (!formData.motherName || formData.motherName.length <= 5) 
        newErrors.motherName = "Mother's name must be greater than 5 characters";
      
      if (!formData.nationality || formData.nationality.length <= 5) 
        newErrors.nationality = "Nationality must be greater than 5 characters";

      if (!formData.gender) newErrors.gender = "Gender is required";
      if (!formData.maritalStatus) newErrors.maritalStatus = "Marital status is required";
      if (!formData.occupation) newErrors.occupation = "Occupation is required";
      if (!formData.annualIncome) newErrors.annualIncome = "Annual income is required";

    } else if (step === 2) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!formData.panCard) {
        newErrors.panCard = "PAN number is required";
      } else if (!panRegex.test(formData.panCard.toUpperCase())) {
        newErrors.panCard = "Invalid PAN format (e.g., ABCDE1234F)";
      }

      if (!formData.adharCard) {
        newErrors.adharCard = "Aadhaar number is required";
      } else if (!/^\d{12}$/.test(formData.adharCard.replace(/\s/g, ""))) {
        newErrors.adharCard = "Aadhaar must be exactly 12 numbers";
      }

      if (!formData.panCardFile) newErrors.panCardFile = "PAN file is required";
      if (!formData.aadhaarCardFile) newErrors.aadhaarCardFile = "Aadhaar file is required";
      if (!formData.signatureFile) newErrors.signatureFile = "Signature file is required";

    } else if (step === 3) {
      if (!formData.currentAddress || formData.currentAddress.length <= 10) 
        newErrors.currentAddress = "Address must be more than 10 characters";
      if (!formData.currentDistrict || formData.currentDistrict.length <= 5) 
        newErrors.currentDistrict = "District must be greater than 5 characters";
      if (!formData.currentPincode || formData.currentPincode.length < 6) 
        newErrors.currentPincode = "Pincode must be greater than 6 numbers";
      if (!formData.currentState || formData.currentState.length <= 6) 
        newErrors.currentState = "State must be greater than 6 characters";

      if (!isSameAddress) {
        if (!formData.permanentAddress || formData.permanentAddress.length <= 10) 
          newErrors.permanentAddress = "Permanent address more than 10 characters";
        if (!formData.permanentDistrict || formData.permanentDistrict.length <= 5) 
          newErrors.permanentDistrict = "District greater than 5 characters";
        if (!formData.permanentPincode || formData.permanentPincode.length < 6) 
          newErrors.permanentPincode = "Pincode greater than 6 numbers";
        if (!formData.permanentState || formData.permanentState.length <= 6) 
          newErrors.permanentState = "State greater than 6 characters";
      }

      if (!formData.mobileNumber) {
        newErrors.mobileNumber = "Mobile number is required";
      } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
        newErrors.mobileNumber = "Mobile number must be 10 numbers";
      }

      if (!formData.otp) {
        newErrors.otp = "OTP is required";
      } else if (!/^\d{6}$/.test(formData.otp)) {
        newErrors.otp = "OTP must be 6 numbers";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, files, type } = e.target;
    
    // Numeric masking for mobile and otp
    if (name === "mobileNumber" || name === "otp") {
        const val = value.replace(/\D/g, "");
        setFormData(prev => ({ ...prev, [name]: val }));
    } else {
        setFormData((prev) => ({
          ...prev,
          [name]: type === "file" ? files[0] : value
        }));
    }
    
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
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

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!validateStep()) return;

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
      // Write address/phone back to profile cache so Profile auto-updates
      updateProfileLocalStorage();
      navigate('/app/accounts');
    } catch (err) {
      setSubmitError(err.message || 'Submission failed');
      alert('Submission failed: ' + (err.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const next = (e) => { 
    e.preventDefault(); 
    if (validateStep()) setStep((s) => Math.min(s + 1, 3)); 
  };
  const back = (e) => { e.preventDefault(); setStep((s) => Math.max(s - 1, 1)); };

  if (checkingAccount) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container fluid className="py-5" style={{ background: "linear-gradient(180deg, #E0F2FE 0%, #F8FAFC 100%)", minHeight: "100vh" }}>
      <Card className="mx-auto border-0 shadow-lg overflow-hidden" style={{ maxWidth: "1000px", borderRadius: "30px" }}>
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
            <Button variant="primary" className="rounded-pill px-5 mt-3 fw-bold shadow-sm" onClick={() => navigate('/app/accounts')}>
              GO TO MY ACCOUNTS
            </Button>
          </div>
        ) : (
            <Form onSubmit={(e) => e.preventDefault()}>
              {step === 1 && (
                <div className="animate__animated animate__fadeIn">
                  <div className="mb-4">
                    <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill mb-2">Step 1 of 3</span>
                    <h5 className="fw-bold mt-2">Personal Information</h5>
                  </div>
                  <Row className="g-4">
                    <Col md={6}>
                      <Form.Label className="small fw-bold">Customer Full Name</Form.Label>
                      <Form.Control isInvalid={!!errors.customerName} name="customerName" value={formData.customerName} onChange={handleChange} placeholder="As per PAN/Aadhaar Card Name" />
                      <Form.Control.Feedback type="invalid">{errors.customerName}</Form.Control.Feedback>
                    </Col>
                    <Col md={6}>
                      <Form.Label className="small fw-bold">Date of Birth</Form.Label>
                      <Form.Control isInvalid={!!errors.dob} type="date" name="dob" value={formData.dob} onChange={handleChange} />
                      <Form.Control.Feedback type="invalid">{errors.dob}</Form.Control.Feedback>
                    </Col>
                    <Col md={6}>
                      <Form.Label className="small fw-bold">Father's Name</Form.Label>
                      <Form.Control isInvalid={!!errors.fatherName} name="fatherName" value={formData.fatherName} onChange={handleChange} placeholder="Full Name" />
                      <Form.Control.Feedback type="invalid">{errors.fatherName}</Form.Control.Feedback>
                    </Col>
                    <Col md={6}>
                      <Form.Label className="small fw-bold">Mother's Name</Form.Label>
                      <Form.Control isInvalid={!!errors.motherName} name="motherName" value={formData.motherName} onChange={handleChange} placeholder="Full Name" />
                      <Form.Control.Feedback type="invalid">{errors.motherName}</Form.Control.Feedback>
                    </Col>
                    <Col md={4}>
                      <Form.Label className="small fw-bold">Gender</Form.Label>
                      <Form.Select isInvalid={!!errors.gender} name="gender" value={formData.gender} onChange={handleChange}>
                        <option value="">Select</option>
                        <option>Male</option><option>Female</option><option>Other</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">{errors.gender}</Form.Control.Feedback>
                    </Col>
                    <Col md={4}>
                      <Form.Label className="small fw-bold">Marital Status</Form.Label>
                      <Form.Select isInvalid={!!errors.maritalStatus} name="maritalStatus" value={formData.maritalStatus} onChange={handleChange}>
                        <option value="">Select</option>
                        <option>Single</option><option>Married</option><option>Divorced</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">{errors.maritalStatus}</Form.Control.Feedback>
                    </Col>
                    <Col md={4}>
                      <Form.Label className="small fw-bold">Nationality</Form.Label>
                      <Form.Control isInvalid={!!errors.nationality} name="nationality" value={formData.nationality} onChange={handleChange} placeholder="e.g. Indian" />
                      <Form.Control.Feedback type="invalid">{errors.nationality}</Form.Control.Feedback>
                    </Col>
                    <Col md={6}>
                      <Form.Label className="small fw-bold">Occupation</Form.Label>
                      <Form.Select isInvalid={!!errors.occupation} name="occupation" value={formData.occupation} onChange={handleChange}>
                        <option value="">Select</option>
                        <option>Salaried</option><option>Self-Employed</option><option>Student</option><option>Business</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">{errors.occupation}</Form.Control.Feedback>
                    </Col>
                    <Col md={6}>
                      <Form.Label className="small fw-bold">Annual Income</Form.Label>
                      <Form.Select isInvalid={!!errors.annualIncome} name="annualIncome" value={formData.annualIncome} onChange={handleChange}>
                        <option value="">Select Range</option>
                        <option>Below 2.5L</option><option>2.5L - 5L</option><option>5L - 10L</option><option>Above 10L</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">{errors.annualIncome}</Form.Control.Feedback>
                    </Col>
                  </Row>
                </div>
              )}

              {step === 2 && (
                <div className="animate__animated animate__fadeIn">
                  <div className="mb-4 text-center">
                    <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill mb-2">Step 2 of 3</span>
                    <h5 className="fw-bold">Security & Document Verification</h5>
                  </div>
                  <Row className="g-4">
                    <Col md={6}>
                      <div className="p-4 border rounded-4 bg-light bg-opacity-50 h-100">
                        <Form.Label className="fw-bold small">Pan Card Number</Form.Label>
                        <Form.Control isInvalid={!!errors.panCard} className="mb-3" name="panCard" placeholder="ABCDE1234F" onChange={handleChange} />
                        <Form.Control.Feedback type="invalid">{errors.panCard}</Form.Control.Feedback>
                        <Form.Label className="very-small text-muted">Upload PAN Card Copy</Form.Label>
                        <Form.Control isInvalid={!!errors.panCardFile} type="file" name="panCardFile" onChange={handleChange} size="sm" />
                        {errors.panCardFile && <div className="text-danger small mt-1">{errors.panCardFile}</div>}
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="p-4 border rounded-4 bg-light bg-opacity-50 h-100">
                        <Form.Label className="fw-bold small"> Aadhaar Card Number</Form.Label>
                        <Form.Control isInvalid={!!errors.adharCard} className="mb-3" name="adharCard" value={formData.adharCard} placeholder="1234 5678 9012" onChange={handleChange} />
                        <Form.Control.Feedback type="invalid">{errors.adharCard}</Form.Control.Feedback>
                        <Form.Label className="very-small text-muted">Upload Aadhaar Copy</Form.Label>
                        <Form.Control isInvalid={!!errors.aadhaarCardFile} type="file" name="aadhaarCardFile" onChange={handleChange} size="sm" />
                        {errors.aadhaarCardFile && <div className="text-danger small mt-1">{errors.aadhaarCardFile}</div>}
                      </div>
                    </Col>
                    <Col md={12}>
                      <div className="p-3 border border-dashed rounded-4 bg-white d-flex align-items-center justify-content-center">
                          <i className="bi bi-pen fs-3 text-primary me-3"></i>
                          <div className="flex-grow-1">
                              <div className="fw-bold small">Digital Signature Scan</div>
                              <Form.Control isInvalid={!!errors.signatureFile} type="file" name="signatureFile" onChange={handleChange} size="sm" />
                              {errors.signatureFile && <div className="text-danger small mt-1">{errors.signatureFile}</div>}
                          </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              )}

              {step === 3 && (
                <div className="animate__animated animate__fadeIn">
                  <Row className="g-4">
                    <Col md={7}>
                      <h6 className="fw-bold mb-3">Residential Address</h6>
                      <div className="p-3 border rounded-4 mb-4 bg-light bg-opacity-25">
                          <Form.Label className="very-small fw-bold text-primary text-uppercase">Current Address</Form.Label>
                          <Form.Control isInvalid={!!errors.currentAddress} as="textarea" rows={2} className="mb-2" name="currentAddress" value={formData.currentAddress} onChange={handleChange} placeholder="Flat, Street, Landmark" />
                          <Form.Control.Feedback type="invalid">{errors.currentAddress}</Form.Control.Feedback>
                          <Row className="g-2">
                              <Col md={6}>
                                <Form.Control isInvalid={!!errors.currentDistrict} name="currentDistrict" placeholder="District" value={formData.currentDistrict} onChange={handleChange} />
                                <Form.Control.Feedback type="invalid">{errors.currentDistrict}</Form.Control.Feedback>
                              </Col>
                              <Col md={6}>
                                <Form.Control isInvalid={!!errors.currentPincode} name="currentPincode" placeholder="Pincode" value={formData.currentPincode} onChange={handleChange} />
                                <Form.Control.Feedback type="invalid">{errors.currentPincode}</Form.Control.Feedback>
                              </Col>
                              <Col md={6}>
                                <Form.Control isInvalid={!!errors.currentState} name="currentState" placeholder="State" value={formData.currentState} onChange={handleChange} />
                                <Form.Control.Feedback type="invalid">{errors.currentState}</Form.Control.Feedback>
                              </Col>
                              <Col md={6}><Form.Control name="currentLandmark" placeholder="Landmark" value={formData.currentLandmark} onChange={handleChange} /></Col>
                          </Row>
                      </div>
                      <Form.Check type="checkbox" label="Permanent address same as current" className="mb-3 small fw-bold" checked={isSameAddress} onChange={handleSameAddress} />
                      {!isSameAddress && (
                          <div className="p-3 border rounded-4 bg-white animate__animated animate__fadeIn">
                              <Form.Label className="very-small fw-bold text-danger text-uppercase">Permanent Address</Form.Label>
                              <Form.Control isInvalid={!!errors.permanentAddress} as="textarea" rows={2} className="mb-2" name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} placeholder="Flat, Street, Landmark" />
                              <Form.Control.Feedback type="invalid">{errors.permanentAddress}</Form.Control.Feedback>
                              <Row className="g-2">
                                  <Col md={6}>
                                    <Form.Control isInvalid={!!errors.permanentDistrict} name="permanentDistrict" placeholder="District" value={formData.permanentDistrict} onChange={handleChange} />
                                    <Form.Control.Feedback type="invalid">{errors.permanentDistrict}</Form.Control.Feedback>
                                  </Col>
                                  <Col md={6}>
                                    <Form.Control isInvalid={!!errors.permanentPincode} name="permanentPincode" placeholder="Pincode" value={formData.permanentPincode} onChange={handleChange} />
                                    <Form.Control.Feedback type="invalid">{errors.permanentPincode}</Form.Control.Feedback>
                                  </Col>
                                  <Col md={6}>
                                    <Form.Control isInvalid={!!errors.permanentState} name="permanentState" placeholder="State" value={formData.permanentState} onChange={handleChange} />
                                    <Form.Control.Feedback type="invalid">{errors.permanentState}</Form.Control.Feedback>
                                  </Col>
                                  <Col md={6}><Form.Control name="permanentLandmark" placeholder="Landmark" value={formData.permanentLandmark} onChange={handleChange} /></Col>
                              </Row>
                          </div>
                      )}
                    </Col>
                    <Col md={5}>
                      <div className="card border p-4 rounded-4 h-100 shadow-sm d-flex flex-column justify-content-center" style={{ backgroundColor: "#F8FAFC", border: "1.5px solid #E2E8F0" }}>
                          <h6 className="fw-bold mb-4 text-primary text-center">Contact Verification</h6>
                          <Form.Label className="very-small fw-bold text-secondary text-uppercase">Primary Mobile Number</Form.Label>
                          <InputGroup className="mb-4">
                              <Form.Control isInvalid={!!errors.mobileNumber} name="mobileNumber" value={formData.mobileNumber} placeholder="Enter 10-digit Mobile" className="bg-white" onChange={handleChange} />
                              <Button variant="primary" type="button" className="fw-bold" onClick={handleGenerateOTP}>SEND OTP</Button>
                              <Form.Control.Feedback type="invalid">{errors.mobileNumber}</Form.Control.Feedback>
                          </InputGroup>
                          <Form.Label className="very-small fw-bold text-secondary text-uppercase">Verification OTP</Form.Label>
                          <Form.Control isInvalid={!!errors.otp} name="otp" value={formData.otp} className="bg-white mb-4" placeholder="Enter 6-digit OTP" onChange={handleChange} />
                          <Form.Control.Feedback type="invalid">{errors.otp}</Form.Control.Feedback>
                      </div>
                    </Col>
                  </Row>
                </div>
              )}

              {submitError && ( <Alert variant="danger" className="mb-3">{submitError}</Alert> )}
              <div className="d-flex justify-content-between align-items-center mt-5 pt-4 border-top">
                <Button type="button" variant="link" className={`text-decoration-none fw-bold ${step === 1 ? 'invisible' : 'text-secondary'}`} onClick={back}>
                  <i className="bi bi-arrow-left me-2"></i>PREVIOUS
                </Button>
                <div className="d-flex gap-3">
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