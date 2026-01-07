import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, UserPlus, ShieldAlert, Users, Search, Check, AlertCircle,
  UserMinus, Banknote, LogOut, ChevronDown, Info, Bell,
  Calendar, PieChart, MessageSquare, ShieldCheck, Activity, Globe, Slash, Eye, Lock, MapPin, Briefcase, BarChart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
 
// --- SUB-COMPONENT: SIDEBAR ---
const Sidebar = ({ activeView, setActiveView, counts }) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'requests', label: 'Account Requests', icon: <UserPlus size={20} />, badge: counts.requests },
    { id: 'loans', label: 'Loan Management', icon: <Banknote size={20} />, badge: counts.loans },
    { id: 'users', label: 'User Management', icon: <Users size={20} /> },
    { id: 'fraud', label: 'Fraud Monitoring', icon: <ShieldAlert size={20} />, badge: counts.fraud },
  ];
 
  return (
    <nav className="bg-white border-end d-none d-md-flex flex-column shadow-sm" style={{ width: '280px', height: '100vh', position: 'sticky', top: 0 }}>
      <div className="p-4"><h3 className="fw-bold text-primary mb-0">DiGi<span className="text-dark fw-light">bank</span></h3></div>
      <div className="list-group list-group-flush px-3 flex-grow-1">
        {menuItems.map((item) => (
          <button key={item.id} onClick={() => setActiveView(item.id)} className={`list-group-item list-group-item-action border-0 rounded-3 py-3 mb-1 d-flex align-items-center justify-content-between ${activeView === item.id ? 'active bg-primary text-white shadow-sm' : 'text-muted'}`}>
            <div className="d-flex align-items-center gap-3">{item.icon} {item.label}</div>
            {item.badge > 0 && <span className={`badge rounded-pill ${activeView === item.id ? 'bg-white text-primary' : 'bg-danger'}`}>{item.badge}</span>}
          </button>
        ))}
      </div>
    </nav>
  );
};
 

// --- SUB-COMPONENT: NAVBAR ---
const Navbar = () => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate=useNavigate();
  return (
    <header className="navbar navbar-expand bg-white border-bottom px-4 py-3 sticky-top shadow-sm w-100">
      <div className="container-fluid justify-content-between">
        <div className="input-group-text w-25 border rounded-pill bg-light px-2">
          <span className="input-group-text bg-transparent border-0 text-muted"><Search size={18} /></span>
          <input type="text" className="form-control border-0 bg-transparent shadow-none" placeholder="Search..." />
        </div>
        <div className="d-flex align-items-center gap-4">
          <div className="position-relative cursor-pointer text-secondary"><Bell size={22} /></div>
          <div className="position-relative border-start ps-4" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <div className="d-flex align-items-center gap-3 cursor-pointer">
              <span className="fw-bold text-dark mb-0">Admin</span>
              <div className="bg-primary text-white d-flex align-items-center justify-content-center rounded-3 fw-bold shadow-sm" style={{ width: '40px', height: '40px' }}>AK</div>
              <ChevronDown size={16} />
            </div>
            {isHovered && (
              <div className="position-absolute end-0 pt-2" style={{ width: '160px', zIndex: 1000 }}>
                <div className="bg-white border shadow-sm rounded-3 py-2">
                  <button className="dropdown-item py-2 d-flex align-items-center gap-2 text-danger small fw-bold" onClick={()=>navigate("/")}><LogOut size={14} /> Logout</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
 
// --- SUB-COMPONENT: DYNAMIC CONFIRMATION MODAL ---
const ActionModal = ({ show, onConfirm, onCancel, data }) => {
  if (!show || !data) return null;
  const isNegative = ['reject', 'deactivate', 'decline', 'freeze', 'stop', 'block'].includes(data.action.toLowerCase());
  const themeColor = isNegative ? 'danger' : 'success';
  const Icon = isNegative ? AlertCircle : Check;
 
  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 3000 }}>
      <div className="bg-white rounded-4 p-4 shadow-lg border" style={{ width: '400px' }}>
        <div className="text-center mb-3">
          <div className={`rounded-circle d-inline-flex p-3 mb-3 bg-${themeColor}-subtle text-${themeColor}`}>
            <Icon size={32} />
          </div>
          <h5 className={`fw-bold text-uppercase text-${themeColor}`}>Final Authorization</h5>
          <p className="text-muted small">Are you sure you want to <strong>{data.action}</strong> the request for <strong>{data.name}</strong>?</p>
        </div>
        <div className="d-flex gap-2 mt-4">
          <button className="btn btn-light flex-grow-1 rounded-3 py-2 fw-bold text-muted" onClick={onCancel}>CANCEL</button>
          <button className={`btn btn-${themeColor} flex-grow-1 rounded-3 py-2 fw-bold text-white shadow-sm`} onClick={onConfirm}>
            YES, {data.action.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
};
 
// --- MAIN DASHBOARD ---
const DashBoard = () => {
  const [activeView, setActiveView] = useState('overview');
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [confirmData, setConfirmData] = useState(null);
  const [notification, setNotification] = useState(null);
 
  // --- STATE DATA ---
  const [openReqs, setOpenReqs] = useState([]);
  const [approvedReqs, setApprovedReqs] = useState([]);
  const [rejectedReqs, setRejectedReqs] = useState([]);
  const [requestTab, setRequestTab] = useState('pending'); // 'pending' | 'approved' | 'rejected'
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [detailsData, setDetailsData] = useState(null);
 
  const [closeReqs, setCloseReqs] = useState([
    { id: 'CLS-501', name: 'Suresh Raina', type: 'Closure', reason: 'Relocation to USA', date: '19 Dec 2025' }
  ]);
 
  const [loanReqs, setLoanReqs] = useState([
    { id: 'L-701', name: 'Priya Sharma', amount: 500000, tenure: 24, interest: 10.5, income: 1200000, creditScore: 780, purpose: 'Retail Expansion', date: '19 Dec 2025' }
  ]);
 
  const [users, setUsers] = useState([
    { id: 'U-001', name: 'Aakash Mehta', balance: 450000, status: 'Active', reason: 'Identity Verified' }
  ]);
 
  const [fraudAlerts, setFraudAlerts] = useState([
    { id: 'FRD-101', name: 'Vijay Mallya', activity: 'High Value Int. Transfer', risk: 'High', location: 'London, UK', date: '10:15 AM' }
  ]);
 
  // --- HANDLERS ---
  const removeData = (id, category) => {
    if (category === 'open') setOpenReqs(prev => prev.filter(i => i.id !== id));
    if (category === 'close') setCloseReqs(prev => prev.filter(i => i.id !== id));
    if (category === 'loan') setLoanReqs(prev => prev.filter(i => i.id !== id));
    if (category === 'fraud') setFraudAlerts(prev => prev.filter(i => i.id !== id));
  };
 
  const triggerAction = (item, action, category) => {
    if (action.toLowerCase() === 'ignore') {
      removeData(item.id, category);
      setNotification({ msg: `Action IGNORE processed`, type: 'success' });
    } else {
      setConfirmData({ ...item, action, category });
    }
  };


  const openDetails = (item) => {
    setDetailsData(item);
    setDetailsModalVisible(true);
  };

  const closeDetails = () => {
    setDetailsModalVisible(false);
    setDetailsData(null);
  };
 
  const handleFinalConfirm = () => {
    const { id, action, category, userId, requestId } = confirmData || {};

    // For account requests: update the user's accountRequests array on the backend
    if (category === 'open' && userId && requestId) {
      // optimistic UI: remove from openReqs after success
      const newStatus = action.toLowerCase() === 'approve' ? 'approved' : 'rejected';

      // fetch the user, update the matching request, then PATCH
      fetch(`http://localhost:4001/users/${userId}`)
        .then(res => {
          if (!res.ok) throw new Error(`User fetch failed: ${res.status}`);
          return res.json();
        })
        .then(user => {
          const arr = Array.isArray(user.accountRequests) ? user.accountRequests : [];
          const updated = arr.map(r => {
            if ((r.requestId && r.requestId === requestId) || (r.requestId == null && `${user.id}-${r.createdAt}` === id)) {
              return { ...r, status: newStatus, processedAt: new Date().toISOString() };
            }
            return r;
          });

          return fetch(`http://localhost:4001/users/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accountRequests: updated }),
          });
        })
        .then(patchRes => {
          if (!patchRes.ok) throw new Error(`Patch failed: ${patchRes.status}`);
          return patchRes.json();
        })
        .then(() => {
          // remove from openReqs in UI
          setOpenReqs(prev => prev.filter(r => !(r.requestId === requestId && r.userId === userId)));
          // add to approved or rejected lists in UI
          if (newStatus === 'approved') {
            setApprovedReqs(prev => [...prev, { requestId, userId, id: requestId, name: confirmData.name, type: confirmData.type, reason: confirmData.reason, date: new Date().toLocaleString() }] );
          } else {
            setRejectedReqs(prev => [...prev, { requestId, userId, id: requestId, name: confirmData.name, type: confirmData.type, reason: confirmData.reason, date: new Date().toLocaleString() }] );
          }
          setNotification({ msg: `Request ${action.toUpperCase()}ED`, type: 'success' });
        })
        .catch(err => {
          console.error('Approve/Reject error:', err);
          setNotification({ msg: `Failed to ${action} request`, type: 'danger' });
        })
        .finally(() => setConfirmData(null));

      return;
    }

    // fallback behavior for other categories
    if (confirmData) {
      const { id: cid, action: caction, category: ccat } = confirmData;
      removeData(cid, ccat);
      if (ccat === 'user') {
        setUsers(users.map(u => u.id === cid ? { ...u, status: caction === 'activate' ? 'Active' : 'Frozen', reason: 'Admin Action' } : u));
      }
      setNotification({ msg: `Action ${caction.toUpperCase()} Successful`, type: 'success' });
      setConfirmData(null);
    }
  };
 
  useEffect(() => {
    // Fetch users from json-server and extract pending accountRequests
    fetch('http://localhost:4001/users')
      .then(res => {
        if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
        return res.json();
      })
      .then(usersData => {
        const pending = [];
        const approved = [];
        const rejected = [];

        usersData.forEach(user => {
          if (Array.isArray(user.accountRequests)) {
            user.accountRequests.forEach(req => {
              if (!req) return;
              const obj = {
                id: req.requestId || `${user.id}-${req.createdAt}`,
                requestId: req.requestId,
                userId: user.id,
                name: user.name || user.customerName || req.accountData?.customerName || 'Unknown',
                type: (req.accountType === 'current' || req.accountData?.accountype === 'current') ? 'Current' : 'Savings',
                reason: user.occupation || req.accountData?.occupation || '',
                date: req.createdAt ? new Date(req.createdAt).toLocaleString() : new Date().toLocaleDateString(),
                raw: req,
              };

              if (req.status === 'pending') pending.push(obj);
              else if (req.status === 'approved') approved.push(obj);
              else if (req.status === 'rejected') rejected.push(obj);
            });
          }
        });

        setOpenReqs(pending);
        setApprovedReqs(approved);
        setRejectedReqs(rejected);

        // Also populate customer directory from usersData
        const custs = usersData.map(u => {
          // determine status
          const hasApproved = Array.isArray(u.accountRequests) && u.accountRequests.some(r => r && r.status === 'approved');
          const hasPending = Array.isArray(u.accountRequests) && u.accountRequests.some(r => r && r.status === 'pending');
          return {
            id: u.id,
            name: u.name || u.customerName || u.username || 'Unknown',
            balance: u.balance || 0,
            status: hasApproved ? 'Active' : hasPending ? 'Pending' : 'Inactive',
            reason: hasApproved ? 'Identity Verified' : hasPending ? 'Awaiting Approval' : (u.reason || ''),
            raw: u,
          };
        });
        setUsers(custs);
      })
      .catch(err => console.error('Failed to fetch requests:', err));

    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);
 
  return (
    <div className="container-fluid g-0 d-flex vh-100 overflow-hidden bg-light text-dark">
  <Sidebar activeView={activeView} setActiveView={setActiveView} counts={{ requests: openReqs.length + approvedReqs.length + rejectedReqs.length + closeReqs.length, loans: loanReqs.length, fraud: fraudAlerts.length }} />
 
      <div className="flex-grow-1 d-flex flex-column overflow-auto">
        <Navbar />
        <main className="p-4">
         
          {/* 1. OVERVIEW */}
          {activeView === 'overview' && (
            <div className="row g-4 text-center">
              <div className="col-md-3"><div className="card border-0 shadow-sm p-4 rounded-4 bg-primary text-white"><h6>REVENUE</h6><h2 className="fw-bold">₹4.2 Cr</h2></div></div>
              <div className="col-md-3"><div className="card border-0 shadow-sm p-4 rounded-4 bg-white border-bottom border-primary border-4"><h6>LOANS</h6><h2 className="fw-bold">₹1.8 Cr</h2></div></div>
              <div className="col-md-3"><div className="card border-0 shadow-sm p-4 rounded-4 bg-white border-bottom border-primary border-4"><h6>CLIENTS</h6><h2 className="fw-bold">{users.length}</h2></div></div>
              <div className="col-md-3"><div className="card border-0 shadow-sm p-4 rounded-4 bg-white border-bottom border-danger border-4"><h6>NPA</h6><h2 className="fw-bold text-danger">0.82%</h2></div></div>
            </div>
          )}
 
          {/* 2. ACCOUNT REQUESTS (OPENING & DEACTIVATION) */}
          {activeView === 'requests' && (
            <>
              <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white overflow-hidden">
                <div className="card-header bg-white p-3 border-0 fw-bold small d-flex align-items-center justify-content-between">
                  <div>ACCOUNT OPENING REQUESTS</div>
                  <div className="btn-group btn-group-sm" role="group" aria-label="request-tabs">
                    <button type="button" className={`btn ${requestTab === 'pending' ? 'btn-primary text-white' : 'btn-outline-secondary'}`} onClick={() => setRequestTab('pending')}>Pending <span className="badge bg-light text-dark ms-2">{openReqs.length}</span></button>
                    <button type="button" className={`btn ${requestTab === 'approved' ? 'btn-primary text-white' : 'btn-outline-secondary'}`} onClick={() => setRequestTab('approved')}>Approved <span className="badge bg-light text-dark ms-2">{approvedReqs.length}</span></button>
                    <button type="button" className={`btn ${requestTab === 'rejected' ? 'btn-primary text-white' : 'btn-outline-secondary'}`} onClick={() => setRequestTab('rejected')}>Rejected <span className="badge bg-light text-dark ms-2">{rejectedReqs.length}</span></button>
                  </div>
                </div>

                <div className="table-responsive"><table className="table align-middle">
                    <thead className="bg-light small text-muted"><tr><th className="px-4">NAME</th><th>TYPE</th><th>REASON</th><th>DATE</th><th className="text-end px-4">ACTION</th></tr></thead>
                    <tbody>{(requestTab === 'pending' ? openReqs : requestTab === 'approved' ? approvedReqs : rejectedReqs).map(i => (
                        <tr key={i.id}>
                          <td className="px-4"><strong>{i.name}</strong></td>
                          <td>{i.type}</td>
                          <td className="small text-muted">{i.reason}</td>
                          <td>{i.date}</td>
                          <td className="text-end px-4">
                            {requestTab === 'pending' ? (
                              <>
                                <button onClick={() => openDetails(i)} className="btn btn-light btn-sm rounded-pill px-3 me-2">View Details</button>
                                <button onClick={() => triggerAction(i, 'approve', 'open')} className="btn btn-success btn-sm rounded-pill px-3 me-2">Approve</button>
                                <button onClick={() => triggerAction(i, 'reject', 'open')} className="btn btn-outline-danger btn-sm rounded-pill px-3">Reject</button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => openDetails(i)} className="btn btn-light btn-sm rounded-pill px-3 me-2">View Details</button>
                                <span className="small text-muted">{requestTab === 'approved' ? 'Approved' : 'Rejected'}</span>
                              </>
                            )}
                          </td>
                        </tr>
                    ))}
                    {((requestTab === 'pending' ? openReqs : requestTab === 'approved' ? approvedReqs : rejectedReqs).length === 0) && (
                      <tr><td colSpan={5} className="text-center text-muted py-4">No {requestTab} requests</td></tr>
                    )}
                    </tbody>
                </table></div>
              </div>
              <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
                <div className="card-header bg-white p-4 border-0 fw-bold small">ACCOUNT DEACTIVATION REQUESTS</div>
                <div className="table-responsive"><table className="table align-middle">
                    <thead className="bg-light small text-muted"><tr><th className="px-4">NAME</th><th>REASON</th><th>DATE</th><th className="text-end px-4">ACTION</th></tr></thead>
                    <tbody>{closeReqs.map(i => (
                        <tr key={i.id}><td className="px-4"><strong>{i.name}</strong></td><td className="small text-danger fw-bold">{i.reason}</td><td>{i.date}</td><td className="text-end px-4">
                            <button onClick={() => triggerAction(i, 'deactivate', 'close')} className="btn btn-danger btn-sm rounded-pill px-3 me-2">Deactivate</button>
                            <button onClick={() => triggerAction(i, 'ignore', 'close')} className="btn btn-outline-secondary btn-sm rounded-pill px-3">Ignore</button>
                        </td></tr>
                    ))}</tbody>
                </table></div>
              </div>
            </>
          )}
 
          {/* 3. LOAN MANAGEMENT */}
          {activeView === 'loans' && (
            <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
                <div className="card-header bg-white p-4 border-0 fw-bold small">LOAN APPLICATIONS</div>
                <div className="table-responsive"><table className="table align-middle">
                    <thead className="bg-light small"><tr><th className="px-4">BORROWER</th><th>AMOUNT</th><th>DATE</th><th className="text-end px-4">ACTION</th></tr></thead>
                    <tbody>{loanReqs.map(i => (
                        <tr key={i.id}><td className="px-4"><strong>{i.name}</strong></td><td>₹{i.amount.toLocaleString()}</td><td>{i.date}</td><td className="text-end px-4">
                            <button onClick={() => setSelectedLoan(i)} className="btn btn-light btn-sm rounded-pill px-3 me-2 border shadow-none"><Info size={14} className="me-1"/>DETAILS</button>
                            <button onClick={() => triggerAction(i, 'sanction', 'loan')} className="btn btn-success btn-sm rounded-pill px-3 me-2">Sanction</button>
                            <button onClick={() => triggerAction(i, 'decline', 'loan')} className="btn btn-outline-danger btn-sm rounded-pill px-3">Decline</button>
                        </td></tr>
                    ))}</tbody>
                </table></div>
            </div>
          )}
 
          {/* 4. CUSTOMER DIRECTORY */}
          {activeView === 'users' && (
            <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
                <div className="card-header bg-white p-4 border-0 fw-bold small">CUSTOMER DIRECTORY</div>
                <div className="table-responsive"><table className="table align-middle">
                    <thead className="bg-light small"><tr><th className="px-4">CLIENT</th><th>BALANCE</th><th>STATUS</th><th>STATUS REASON</th><th className="text-end px-4">ACTION</th></tr></thead>
                    <tbody>{users.map(u => (
                        <tr key={u.id}>
                            <td className="px-4"><strong>{u.name}</strong></td>
                            <td>₹{u.balance.toLocaleString()}</td>
                            <td><span className={`badge ${u.status === 'Active' ? 'bg-success' : 'bg-danger'}`}>{u.status}</span></td>
                            <td className="small text-muted">{u.reason}</td>
                            <td className="text-end px-4">
                                <button onClick={() => triggerAction(u, u.status === 'Active' ? 'stop' : 'activate', 'user')} className={`btn btn-sm rounded-pill px-3 ${u.status === 'Active' ? 'btn-outline-danger' : 'btn-success'}`}>
                                    {u.status === 'Active' ? 'STOP' : 'ACTIVATE'}
                                </button>
                            </td>
                        </tr>
                    ))}</tbody>
                </table></div>
            </div>
          )}
 
          {/* 5. FRAUD MONITORING */}
          {activeView === 'fraud' && (
            <div>
              <div className="row g-4 mb-4">
                <div className="col-md-4"><div className="card border-0 shadow-sm p-4 rounded-4 bg-white border-start border-4 border-success d-flex align-items-center gap-3"><ShieldCheck className="text-success" /> <div><strong>Encryption</strong><br/><small>Active</small></div></div></div>
                <div className="col-md-4"><div className="card border-0 shadow-sm p-4 rounded-4 bg-white border-start border-4 border-primary d-flex align-items-center gap-3"><Activity className="text-primary" /> <div><strong>Server Load</strong><br/><small>Optimal</small></div></div></div>
                <div className="col-md-4"><div className="card border-0 shadow-sm p-4 rounded-4 bg-white border-start border-4 border-warning d-flex align-items-center gap-3"><Globe className="text-warning" /> <div><strong>Traffic</strong><br/><small>Domestic</small></div></div></div>
              </div>
              <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
                <div className="card-header bg-white p-4 border-0 d-flex justify-content-between"><h6 className="fw-bold mb-0 text-danger"><Lock size={18}/> SUSPICIOUS ACTIVITY LOGS</h6><span className="badge bg-danger">LIVE</span></div>
                <div className="table-responsive"><table className="table align-middle">
                    <thead className="bg-light small"><tr><th className="px-4">NAME</th><th>ACTIVITY</th><th>RISK</th><th>LOCATION</th><th className="text-end px-4">ACTION</th></tr></thead>
                    <tbody>{fraudAlerts.map(i => (
                        <tr key={i.id}><td className="px-4"><strong>{i.name}</strong></td><td>{i.activity}</td><td><span className="badge bg-danger">{i.risk}</span></td><td><small className="text-muted"><MapPin size={12}/> {i.location}</small></td><td className="text-end px-4">
                            <button onClick={() => triggerAction(i, 'block', 'fraud')} className="btn btn-dark btn-sm rounded-pill px-3 me-2 fw-bold">BLOCK</button>
                            <button onClick={() => triggerAction(i, 'ignore', 'fraud')} className="btn btn-outline-secondary btn-sm rounded-pill px-3">IGNORE</button>
                        </td></tr>
                    ))}</tbody>
                </table></div>
              </div>
            </div>
          )}
        </main>
      </div>
 
      {/* LOAN DETAIL MODAL */}
      {selectedLoan && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }}>
          <div className="bg-white rounded-4 p-4 shadow-lg border" style={{ width: '450px' }}>
            <h5 className="fw-bold mb-3 border-bottom pb-2">Loan Assessment</h5>
            <div className="row g-3 small">
               <div className="col-6">Income: <strong>₹{selectedLoan.income.toLocaleString()}</strong></div>
               <div className="col-6">Credit Score: <strong>{selectedLoan.creditScore}</strong></div>
               <div className="col-12 border-top pt-2">Purpose: <p className="mb-0 text-muted">{selectedLoan.purpose}</p></div>
            </div>
            <button className="btn btn-primary w-100 rounded-3 mt-4 py-2" onClick={() => setSelectedLoan(null)}>CLOSE</button>
          </div>
        </div>
      )}
 
      {/* CONFIRM MODAL */}
      <ActionModal show={!!confirmData} data={confirmData} onConfirm={handleFinalConfirm} onCancel={() => setConfirmData(null)} />

      

      {/* DETAILS MODAL (VIEW REQUEST DATA) */}
      {detailsModalVisible && detailsData && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 3500 }}>
          <div className="bg-white rounded-4 p-4 shadow-lg border" style={{ width: '720px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Request Details</h5>
              <div>
                {detailsData.raw?.status === 'pending' && (
                  <>
                    <button className="btn btn-success btn-sm me-2" onClick={() => { triggerAction(detailsData, 'approve', 'open'); closeDetails(); }}>Approve</button>
                    <button className="btn btn-outline-danger btn-sm me-3" onClick={() => { triggerAction(detailsData, 'reject', 'open'); closeDetails(); }}>Reject</button>
                  </>
                )}
                <button className="btn btn-secondary btn-sm" onClick={closeDetails}>Close</button>
              </div>
            </div>

            <div className="mb-3 small text-muted">Submitted by: <strong>{detailsData.name}</strong> — Type: <strong>{detailsData.type}</strong> — Status: <strong>{(detailsData.raw && detailsData.raw.status) || 'N/A'}</strong></div>

            <div>
              {/* Render accountData key/values in two-column grid */}
              {detailsData.raw && detailsData.raw.accountData ? (
                <div className="row g-2">
                  {Object.entries(detailsData.raw.accountData).map(([k, v]) => (
                    <div key={k} className="col-6 mb-2">
                      <div className="small text-muted">{k}</div>
                      <div className="fw-bold">{String(v)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted">No detailed data available.</div>
              )}
            </div>
          </div>
        </div>
      )}
 
      {/* NOTIFICATION (ALWAYS GREEN) */}
      {notification && (
        <div className="toast show position-fixed top-0 end-0 m-4 shadow-lg text-white bg-success border-0" style={{ zIndex: 4000 }}>
          <div className="p-3 d-flex align-items-center gap-2 small fw-bold"><Check size={18}/> {notification.msg}</div>
        </div>
      )}
    </div>
  );
};
 
export default DashBoard;