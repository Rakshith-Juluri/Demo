import React, { useEffect, useState } from 'react';

const NotificationDrawer = ({ isOpen, onClose, setUnreadCount }) => {
  // Initial Notification Data
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Suspicious Activity', desc: 'Login attempt blocked from London, UK.', time: 'Just now', unread: true, type: 'security' },
    { id: 2, title: 'EMI Due Reminder', desc: 'Loan EMI of ₹12,450 is due in 2 days.', time: '2h ago', unread: true, type: 'payment' },
    { id: 3, title: 'New Payee Added', desc: 'Rahul Sharma added to your beneficiaries.', time: '5h ago', unread: false, type: 'user' },
    { id: 4, title: 'Loan Approved! 🎉', desc: 'Business Loan for ₹5L approved. Sign now.', time: '1d ago', unread: true, type: 'loan' },
  ]);

  // Sync the unread count with the Header whenever notifications change
  useEffect(() => {
    const count = notifications.filter(n => n.unread).length;
    setUnreadCount(count);
  }, [notifications, setUnreadCount]);

  // Scroll Lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const handleNotificationClick = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, unread: false } : n
    ));
  };

  if (!isOpen) return null;

  return (
    <div 
      className="position-fixed top-0 end-0 h-100 shadow-lg bg-white animate__animated animate__slideInRight" 
      style={{ width: '400px', zIndex: 2000, borderLeft: '1px solid #eee' }}
    >
      {/* Header */}
      <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-white sticky-top">
        <div>
          <h5 className="fw-black mb-0" style={{ color: '#0C4A6E' }}>Activity Center</h5>
          <p className="text-muted small mb-0">Stay updated with your account</p>
        </div>
        <button className="btn-close" onClick={onClose}></button>
      </div>

      {/* Action Bar */}
      <div className="px-4 py-2 border-bottom bg-light d-flex justify-content-between align-items-center">
        <span className="small fw-bold text-secondary">
          {notifications.filter(n => n.unread).length} Unread Alerts
        </span>
        <button 
          className="btn btn-link btn-sm text-decoration-none fw-bold p-0" 
          onClick={markAllAsRead}
        >
          Mark all as read
        </button>
      </div>

      {/* List */}
      <div className="overflow-auto" style={{ height: 'calc(100vh - 145px)' }}>
        {notifications.map((n) => (
          <div 
            key={n.id} 
            onClick={() => handleNotificationClick(n.id)}
            className={`p-4 border-bottom transition-all`}
            style={{ 
              cursor: 'pointer',
              backgroundColor: n.unread ? '#f1f3f5' : '#ffffff', // Light black/gray for unread, White for read
              borderLeft: n.unread ? '4px solid #0284C7' : '4px solid transparent'
            }}
          >
            <div className="d-flex justify-content-between align-items-start mb-1">
              <h6 className={`mb-0 ${n.unread ? 'fw-bold text-dark' : 'fw-medium text-secondary'}`}>
                {n.title}
              </h6>
              <span className="text-muted" style={{ fontSize: '0.7rem' }}>{n.time}</span>
            </div>
            <p className={`small mb-0 ${n.unread ? 'text-dark opacity-75' : 'text-muted opacity-50'}`}>
              {n.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationDrawer;