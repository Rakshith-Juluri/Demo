import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import ActionModal from './ActionModal';
import Overview from './components/Overview';
import Requests from './components/Requests';
import Users from './components/Users';
import Loans from './components/Loans';
import Fraud from './components/Fraud';
import { Check } from 'lucide-react';
import { theme } from './theme';
const API = 'http://localhost:4001';

const AdminDashboard = () => {
  const [activeView, setActiveView] = useState('overview');
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [confirmData, setConfirmData] = useState(null);
  const [notification, setNotification] = useState(null);
  const [openReqs, setOpenReqs] = useState([]);
  const [approvedReqs, setApprovedReqs] = useState([]);
  const [rejectedReqs, setRejectedReqs] = useState([]);
  const [requestTab, setRequestTab] = useState('pending');
  const [users, setUsers] = useState([]);
  const [fraudAlerts] = useState([
    { id: 'FRD-101', name: 'Vijay Mallya', activity: 'High Value Int. Transfer', risk: 'High', location: 'London, UK', date: '10:15 AM' }
  ]);
  const [loanReqs] = useState([
    { id: 'L-701', name: 'Priya Sharma', amount: 500000, tenure: 24, interest: 10.5, income: 1200000, creditScore: 780, purpose: 'Retail Expansion', date: '19 Dec 2025' }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reqRes, usersRes] = await Promise.all([
          fetch(`${API}/accountRequests`),
          fetch(`${API}/users`)
        ]);

        const reqs = reqRes.ok ? await reqRes.json() : [];
        const usersList = usersRes.ok ? await usersRes.json() : [];
        const userById = new Map((usersList || []).map(u => [String(u.id), u]));

        const pending = [];
        const approved = [];
        const rejected = [];

        (reqs || []).forEach(req => {
          const u = userById.get(String(req.userId)) || {};
          const item = {
            id: req.id || req.requestId,
            requestId: req.requestId || req.id,
            userId: req.userId,
            name: u.name || u.username || 'Unknown',
            type: (req.accountype || req.accountType || '').toLowerCase() === 'current' ? 'Current' : 'Savings',
            reason: u.occupation || '',
            date: req.createdAt ? new Date(req.createdAt).toLocaleDateString() : '',
            raw: req,
          };
          if (req.status === 'pending') pending.push(item);
          else if (req.status === 'approved' || req.status === 'accepted') approved.push(item);
          else if (req.status === 'rejected') rejected.push(item);
        });

        setOpenReqs(pending);
        setApprovedReqs(approved);
        setRejectedReqs(rejected);

        const approvedUserIds = new Set(approved.map(a => String(a.userId)));
        setUsers((usersList || []).map(u => ({
          id: u.id,
          name: u.name || u.username || 'Unknown',
          balance: u.balance || 0,
          status: approvedUserIds.has(String(u.id)) ? 'Active' : 'Pending'
        })));
      } catch (e) {
        console.error('Failed to load admin data', e);
      }
    };

    fetchData();
  }, [notification]);

  const triggerAction = (item, action, category) => setConfirmData({ ...item, action, category });

  const generateAccountNumber = (type) => {
    const prefix = (type || '').toLowerCase() === 'current' ? 'CUR' : 'SAV';
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}${Date.now().toString().slice(-6)}${rand}`;
  };

  const resolveRequestRecordId = async (reqLike) => {
    // Prefer json-server id if present
    if (reqLike?.id) return reqLike.id;
    // Fallback: look up by requestId
    if (reqLike?.requestId) {
      try {
        const res = await fetch(`${API}/accountRequests?requestId=${encodeURIComponent(reqLike.requestId)}`);
        if (res.ok) {
          const arr = await res.json();
          if (Array.isArray(arr) && arr[0]?.id) return arr[0].id;
        }
      } catch {}
    }
    return null;
  };

  const handleFinalConfirm = async () => {
    const data = confirmData;
    if (!data) return;

    try {
      if ((data.category === 'open' || data.category === 'requests') && data.raw) {
        const req = data.raw;
        const recordId = await resolveRequestRecordId(req);

        if (data.action === 'approve') {
          // 1) Create a new bank account for the user
          const accountPayload = {
            userId: data.userId,
            accountType: (req.accountype || req.accountType || (data.type === 'Current' ? 'current' : 'savings')).toLowerCase(),
            accountNumber: generateAccountNumber(req.accountype || req.accountType),
            balance: 0,
            status: 'Active',
            createdAt: new Date().toISOString(),
          };
          await fetch(`${API}/accounts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(accountPayload)
          });

          // 2) Mark request approved
          if (recordId) {
            await fetch(`${API}/accountRequests/${recordId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'approved', approvedAt: new Date().toISOString() })
            });
          }
        } else if (data.action === 'reject') {
          if (recordId) {
            await fetch(`${API}/accountRequests/${recordId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'rejected', rejectedAt: new Date().toISOString() })
            });
          }
        }
      }

      setNotification({ msg: `Action ${confirmData.action.toUpperCase()} processed successfully`, type: 'success' });
    } catch (err) {
      console.error('Action failed', err);
      setNotification({ msg: `Action failed: ${err.message || 'Unknown error'}`, type: 'error' });
    } finally {
      setConfirmData(null);
    }
  };

  return (
    <div className="container-fluid g-0 d-flex vh-100 overflow-hidden" style={{ background: theme.bgGradient }}>
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        counts={{ requests: openReqs.length, loans: loanReqs.length, fraud: fraudAlerts.length }} 
      />

      <div className="flex-grow-1 d-flex flex-column overflow-auto">
        <Navbar />
        <main className="p-4 p-lg-5">
          <div className="mb-5">
            <h1 className="fw-black display-6 mb-1" style={{ color: theme.darkBlue }}>
              {activeView.charAt(0).toUpperCase() + activeView.slice(1)} Control
            </h1>
            <p className="text-secondary fw-medium">Monitor and manage DiGiBANK core operations.</p>
          </div>

          {activeView === 'overview' && (
            <Overview users={users} />
          )}

          {activeView === 'requests' && (
            <Requests
              openReqs={openReqs}
              approvedReqs={approvedReqs}
              rejectedReqs={rejectedReqs}
              requestTab={requestTab}
              setRequestTab={setRequestTab}
              triggerAction={triggerAction}
            />
          )}

          {activeView === 'users' && (
            <Users users={users} triggerAction={triggerAction} />
          )}

          {activeView === 'loans' && (
            <Loans loanReqs={loanReqs} />
          )}

          {activeView === 'fraud' && (
            <Fraud fraudAlerts={fraudAlerts} />
          )}

        </main>
      </div>

      <ActionModal show={!!confirmData} data={confirmData} onConfirm={handleFinalConfirm} onCancel={() => setConfirmData(null)} />
      {notification && (
        <div className="toast show position-fixed bottom-0 end-0 m-4 shadow-lg text-white border-0 rounded-4 overflow-hidden" style={{ zIndex: 4000, backgroundColor: theme.primary }}>
          <div className="p-3 d-flex align-items-center gap-2 fw-bold"><Check size={20}/> {notification.msg}</div>
        </div>
      )}

      <style>{`
        .fw-black { font-weight: 900 !important; }
        .rounded-4 { border-radius: 1.25rem !important; }
        .rounded-5 { border-radius: 2.5rem !important; }
        .transition-all { transition: all 0.2s ease; }
        .list-group-item.active { border: none !important; }
        .table-light { background-color: #f8fafc !important; }
        .border-bottom-subtle { border-bottom: 1px solid #f1f5f9; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;

// PropTypes to document expected shapes
AdminDashboard.propTypes = {};
