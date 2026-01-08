import React, { useEffect, useState } from 'react';

const NotificationDrawer = ({ isOpen, onClose, setUnreadCount }) => {
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Suspicious Activity', desc: 'Login attempt blocked from London, UK.', time: 'Just now', unread: true, type: 'security' },
    { id: 2, title: 'EMI Due Reminder', desc: 'Loan EMI of ₹12,450 is due in 2 days.', time: '2h ago', unread: true, type: 'payment' },
    { id: 3, title: 'New Payee Added', desc: 'Rahul Sharma added to your beneficiaries.', time: '5h ago', unread: false, type: 'user' },
    { id: 4, title: 'Loan Approved! 🎉', desc: 'Business Loan for ₹5L approved. Sign now.', time: '1d ago', unread: true, type: 'loan' },
  ]);

  // Configuration for dynamic colors and icons based on type
  const typeConfig = {
    security: { color: '#EF4444', icon: '🛡️', bg: '#FEF2F2' }, // Red
    payment: { color: '#F59E0B', icon: '💰', bg: '#FFFBEB' },  // Amber
    user: { color: '#3B82F6', icon: '👤', bg: '#EFF6FF' },     // Blue
    loan: { color: '#10B981', icon: '📈', bg: '#ECFDF5' },     // Emerald
    default: { color: '#6B7280', icon: '🔔', bg: '#F9FAFB' }
  };

  useEffect(() => {
    const count = notifications.filter(n => n.unread).length;
    setUnreadCount(count);
  }, [notifications, setUnreadCount]);

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
      style={{ width: '420px', zIndex: 2000, borderLeft: '1px solid #eee', transition: '0.3s' }}
    >
      {/* Header with Gradient Background */}
      <div className="p-4 border-bottom d-flex justify-content-between align-items-center text-white" 
           style={{ background: 'linear-gradient(135deg, #0C4A6E 0%, #0284C7 100%)' }}>
        <div>
          <h5 className="fw-bold mb-0">Activity Center</h5>
          <p className="small mb-0 opacity-75">You have {notifications.filter(n => n.unread).length} new alerts</p>
        </div>
        <button className="btn-close btn-close-white" onClick={onClose}></button>
      </div>

      {/* Quick Action Bar */}
      <div className="px-4 py-2 border-bottom bg-light d-flex justify-content-between align-items-center">
        <span className="badge rounded-pill bg-danger shadow-sm">Live Updates</span>
        <button className="btn btn-link btn-sm text-primary fw-bold text-decoration-none" onClick={markAllAsRead}>
          Clear All Badges
        </button>
      </div>

      {/* Notification List */}
      <div className="overflow-auto" style={{ height: 'calc(100vh - 150px)', background: '#F8FAFC' }}>
        {notifications.map((n) => {
          const config = typeConfig[n.type] || typeConfig.default;
          return (
            <div 
              key={n.id} 
              onClick={() => handleNotificationClick(n.id)}
              className="p-3 m-2 rounded-3 border transition-all hover-shadow"
              style={{ 
                cursor: 'pointer',
                backgroundColor: n.unread ? '#ffffff' : '#f8fafc',
                borderLeft: `5px solid ${n.unread ? config.color : '#cbd5e1'}`,
                boxShadow: n.unread ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
                opacity: n.unread ? 1 : 0.8
              }}
            >
              <div className="d-flex gap-3">
                {/* Dynamic Icon Circle */}
                <div 
                  className="d-flex align-items-center justify-content-center rounded-circle shadow-sm"
                  style={{ 
                    minWidth: '45px', 
                    height: '45px', 
                    backgroundColor: config.bg,
                    fontSize: '1.2rem'
                  }}
                >
                  {config.icon}
                </div>

                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start">
                    <h6 className={`mb-1 ${n.unread ? 'fw-bold text-dark' : 'text-secondary'}`} style={{ fontSize: '0.95rem' }}>
                      {n.title}
                    </h6>
                    <span className="badge bg-light text-muted fw-normal" style={{ fontSize: '0.65rem' }}>{n.time}</span>
                  </div>
                  <p className="small mb-0 text-muted" style={{ lineHeight: '1.4' }}>
                    {n.desc}
                  </p>
                  
                  {n.unread && (
                    <span className="badge rounded-pill mt-2" style={{ backgroundColor: config.color, fontSize: '0.6rem' }}>
                      New Task
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationDrawer;