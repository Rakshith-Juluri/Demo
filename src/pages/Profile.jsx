import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge } from 'react-bootstrap';
import "bootstrap-icons/font/bootstrap-icons.css";

const EDITABLE_FIELDS = ['email', 'phone', 'address', 'landmark', 'district', 'state', 'zip'];
const API_BASE = 'http://localhost:4001';

const Profile = ({ userData }) => {
  const [formData, setFormData] = useState({
    customerId: 'CUST-882910',
    pancard: 'ABCDE1234F',
    firstName: 'John',
    lastName: 'Doe',
    aadhar: '',
    email: '',
    phone: '',
    address: '',
    landmark: '',
    district: '',
    state: '',
    zip: '',
  });

  const [editState, setEditState] = useState(
    () => Object.fromEntries(EDITABLE_FIELDS.map((f) => [f, false]))
  );
  const [isEditingAll, setIsEditingAll] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // 1) Prefer locally cached profile data
    try {
      const saved = localStorage.getItem('userProfileData');
      if (saved) {
        setFormData((prev) => ({ ...prev, ...JSON.parse(saved) }));
        return;
      }
    } catch {}

    // 2) Merge from in-memory userData (e.g., from login context)
    if (userData && typeof userData === 'object') {
      setFormData((prev) => ({
        ...prev,
        firstName: userData.firstName || (userData.name ? String(userData.name).split(' ')[0] : prev.firstName),
        lastName: userData.lastName || (userData.name ? String(userData.name).split(' ').slice(1).join(' ') : prev.lastName),
        pancard: userData.pancard || prev.pancard,
        aadhar: userData.aadhar ?? prev.aadhar,
        email: userData.email ?? prev.email,
        phone: userData.mobile ?? userData.phone ?? prev.phone,
        address: userData.address ?? prev.address,
        district: userData.district ?? prev.district,
        state: userData.state ?? prev.state,
        zip: userData.zip ?? prev.zip,
      }));
      return;
    }

    // 3) Otherwise, try to hydrate from loggedInUser and API (best-effort)
    (async () => {
      let base = {};
      try {
        const raw = localStorage.getItem('loggedInUser');
        if (raw) base = JSON.parse(raw) || {};
      } catch {}

      try {
        const id = base.id || localStorage.getItem('userId');
        if (id) {
          // If json-server isn't running, this will fail silently
          let res = await fetch(`${API_BASE}/users/${id}`);
          if (!res.ok) res = await fetch(`${API_BASE}/users?id=${id}`);
          if (res.ok) {
            const data = await res.json();
            const u = Array.isArray(data) ? data[0] : data;
            if (u && typeof u === 'object') base = { ...base, ...u };
          }
        }
      } catch {}

      const fullName = base.name || '';
      const [fn, ...lnRest] = String(fullName).trim().split(/\s+/);
      setFormData((prev) => ({
        ...prev,
        firstName: fn || prev.firstName,
        lastName: lnRest.join(' ') || prev.lastName,
        aadhar: base.aadhar || prev.aadhar,
        email: base.email || prev.email,
        phone: base.mobile || base.phone || prev.phone,
        address: base.address || prev.address,
        district: base.district || prev.district,
        state: base.state || prev.state,
        zip: base.zip || prev.zip,
      }));
    })();
  }, [userData]);

  const handleSaveAllClick = async () => {
    if (!validate()) return;
    setIsSaving(true);
    localStorage.setItem('userProfileData', JSON.stringify(formData));

    setTimeout(() => {
      setIsEditingAll(false);
      setEditState(Object.fromEntries(EDITABLE_FIELDS.map((f) => [f, false])));
      setIsSaving(false);
      window.location.href = '/app/home';
    }, 800);
  };

  const handleEditAllClick = () => {
    setIsEditingAll(true);
    setEditState(Object.fromEntries(EDITABLE_FIELDS.map((f) => [f, false])));
  };

  const toggleFieldEdit = (fieldName) => {
    if (!isEditingAll) return;
    setEditState((prev) => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) nextErrors.email = 'Invalid email';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const isFieldEnabled = (field) => isEditingAll && editState[field];

  return (
    <div style={{ 
      background: "linear-gradient(180deg, #E0F2FE 0%, #F8FAFC 600px)", 
      minHeight: "100vh", 
      fontFamily: "'Inter', sans-serif",
      paddingBottom: "80px" 
    }}>
      <style>
        {`
          .custom-blue-btn {
            background-color: #007BFF !important;
            color: white !important;
            border: none !important;
            transition: all 0.2s ease-in-out;
          }
          .custom-blue-btn:hover {
            background-color: #0056b3 !important;
            box-shadow: 0 4px 12px rgba(0,123,255,0.3);
            transform: translateY(-1px);
          }
          .back-btn-white {
            background-color: white !important;
            color: #0C4A6E !important;
            border: 1px solid #E2E8F0 !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            transition: all 0.2s ease;
          }
          .back-btn-white:hover {
            background-color: #f8fafc !important;
            transform: translateX(-3px);
          }
          .static-field {
            background-color: #F1F5F9 !important;
            border: 1px solid #E2E8F0 !important;
            color: #64748B !important;
            cursor: not-allowed;
          }
          .edit-link {
            cursor: pointer;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
        `}
      </style>

      {/* Header Section */}
      <div className="container pt-5 mb-4">
        <Button 
          className="back-btn-white px-3 mb-4 rounded-pill fw-bold d-flex align-items-center" 
          onClick={() => window.location.href = '/app/home'}
          style={{ width: 'fit-content' }}
        >
          <i className="bi bi-arrow-left me-2"></i> Back
        </Button>

        <h1 className="fw-black display-6 mb-1" style={{ color: "#0C4A6E", letterSpacing: "-2px", fontWeight: 900 }}>
          Profile Settings.
        </h1>
        <p className="fs-5 text-secondary fw-medium">
          Manage your personal details and <span className="text-primary fw-bold">banking identity</span>.
        </p>
      </div>

      <Container>
        <Row className="g-4">
          <Col lg={4}>
            <Card className="border-0 shadow-lg p-4 mb-4 text-center" style={{ borderRadius: "35px", background: "white" }}>
              <div className="d-flex justify-content-center mb-3">
                <div className="rounded-circle d-flex align-items-center justify-content-center fw-black shadow-sm text-white" 
                     style={{ 
                       width: '100px', 
                       height: '100px', 
                       fontSize: '32px', 
                       fontWeight: 900,
                       background: "linear-gradient(135deg, #0284C7 0%, #0EA5E9 100%)" 
                     }}>
                  {formData.firstName?.[0]}{formData.lastName?.[0]}
                </div>
              </div>
              <h4 className="fw-bold mb-1" style={{ color: "#0C4A6E" }}>
                {formData.firstName} {formData.lastName}
              </h4>
              <p className="text-muted small mb-4">{formData.email}</p>
              <div className="d-flex justify-content-between align-items-center p-3 rounded-4 mb-2" style={{ background: "#F0F9FF" }}>
                <span className="text-muted fw-bold small text-uppercase">KYC Status</span>
                <Badge className="rounded-pill px-3 py-2 text-white border-0 shadow-sm" style={{ backgroundColor: "#0284C7" }}>
                   <i className="bi bi-patch-check-fill me-1"></i> Verified
                </Badge>
              </div>
            </Card>
          </Col>

          <Col lg={8}>
            <Card className="border-0 shadow-lg overflow-hidden" style={{ borderRadius: "35px", background: "white" }}>
              <Card.Header className="bg-white py-4 px-4 d-flex justify-content-between align-items-center border-bottom">
                <h5 className="fw-black mb-0" style={{ color: "#0C4A6E" }}>Personal Information</h5>
                {!isEditingAll ? (
                  <Button className="custom-blue-btn px-4 rounded-pill fw-bold" onClick={handleEditAllClick}>
                    Edit Details
                  </Button>
                ) : (
                  <Button variant="success" className="px-4 rounded-pill fw-bold text-white shadow-sm" onClick={handleSaveAllClick} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save & Exit'}
                  </Button>
                )}
              </Card.Header>

              <Card.Body className="p-4 p-md-5">
                <Form>
                  <h6 className="fw-black mb-4 small text-uppercase" style={{ letterSpacing: '1px', color: '#0284C7' }}>Identity (Read Only)</h6>
                  <Row className="mb-4 g-3">
                    <Form.Group as={Col} md={4}>
                      <Form.Label className="text-muted small fw-bold mb-1">First Name</Form.Label>
                      <Form.Control type="text" value={formData.firstName} disabled className="static-field" style={{ borderRadius: '12px', height: '48px' }} />
                    </Form.Group>
                    <Form.Group as={Col} md={4}>
                      <Form.Label className="text-muted small fw-bold mb-1">Last Name</Form.Label>
                      <Form.Control type="text" value={formData.lastName} disabled className="static-field" style={{ borderRadius: '12px', height: '48px' }} />
                    </Form.Group>
                    <Form.Group as={Col} md={4}>
                      <Form.Label className="text-muted small fw-bold mb-1">Aadhaar</Form.Label>
                      <Form.Control type="text" value={formData.aadhar} disabled className="static-field" style={{ borderRadius: '12px', height: '48px' }} />
                    </Form.Group>
                  </Row>

                  <h6 className="fw-black mb-4 small text-uppercase" style={{ letterSpacing: '1px', color: '#0284C7' }}>Contact Details</h6>
                  <Row className="g-3">
                    {[
                      { label: 'Email Address', key: 'email', size: 6 },
                      { label: 'Phone Number', key: 'phone', size: 6 },
                      { label: 'District', key: 'district', size: 6 },
                      { label: 'State', key: 'state', size: 6 },
                      { label: 'Zip Code', key: 'zip', size: 6 },
                      { label: 'Permanent Address', key: 'address', size: 12 },
                    ].map((field) => (
                      <Form.Group as={Col} md={field.size} key={field.key}>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <Form.Label className="text-muted small fw-bold mb-0" style={{fontSize: '11px'}}>{field.label}</Form.Label>
                          {isEditingAll && (
                            <span 
                              className={`edit-link ${editState[field.key] ? 'text-success' : 'text-primary'}`} 
                              onClick={() => toggleFieldEdit(field.key)}
                            >
                              {editState[field.key] ? 'DONE' : 'EDIT'}
                            </span>
                          )}
                        </div>
                        <Form.Control
                          type="text"
                          value={formData[field.key] || ''}
                          onChange={(e) => handleInputChange(field.key, e.target.value)}
                          disabled={!isFieldEnabled(field.key)}
                          style={{ 
                            borderRadius: '12px', 
                            padding: '12px',
                            height: '48px',
                            backgroundColor: !isFieldEnabled(field.key) ? '#F8FAFC' : '#FFFFFF',
                            border: isFieldEnabled(field.key) ? '2px solid #0284C7' : '1px solid #E2E8F0',
                            color: '#0C4A6E',
                            fontWeight: isFieldEnabled(field.key) ? '600' : '500'
                          }}
                        />
                      </Form.Group>
                    ))}
                  </Row>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Profile;