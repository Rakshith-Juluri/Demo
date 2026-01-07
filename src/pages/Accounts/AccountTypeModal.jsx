import React, { useState } from 'react';

const AccountTypeModal = ({ isOpen, onClose, onConfirm, theme }) => {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const options = [
    {
      id: 'savings',
      title: 'Savings Account',
      icon: 'bi-piggy-bank-fill',
      color: '#10B981',
      desc: 'Ideal for personal growth with 4.5% interest.'
    },
    {
      id: 'current',
      title: 'Current Account',
      icon: 'bi-briefcase-fill',
      color: '#F59E0B',
      desc: 'Unlimited transactions for your business needs.'
    }
  ];

  const handleConfirm = () => {
    if (selected) {
      setLoading(true);
      // Small timeout to show the "Loading" state before navigating
      setTimeout(() => {
        onConfirm(selected);
        setLoading(false);
      }, 600);
    }
  };

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
         style={{ zIndex: 2000, background: 'rgba(12, 74, 110, 0.85)', backdropFilter: 'blur(10px)' }}>
      
      <div className="card border-0 rounded-5 p-4 shadow-lg animate__animated animate__zoomIn" 
           style={{ maxWidth: '650px', width: '90%', overflow: 'hidden' }}>
        
        {/* Progress bar for redirection */}
        {loading && (
          <div className="position-absolute top-0 start-0 w-100" style={{ height: '4px' }}>
            <div className="progress-bar progress-bar-striped progress-bar-animated w-100 h-100" 
                 style={{ backgroundColor: theme.primary }}></div>
          </div>
        )}

        <div className="text-center mb-4 pt-2">
          <h2 className="fw-black" style={{ color: theme.darkBlue, letterSpacing: '-1px' }}>Open New Account</h2>
          <p className="text-secondary small fw-medium">Choose your account type to start the digital onboarding.</p>
        </div>

        <div className="row g-3">
          {options.map((opt) => (
            <div className="col-md-6" key={opt.id}>
              <div 
                onClick={() => !loading && setSelected(opt.id)}
                className={`card h-100 border-2 transition-all rounded-4 p-4 text-center ${
                  selected === opt.id ? 'border-primary' : 'border-light'
                }`}
                style={{ 
                  cursor: loading ? 'not-allowed' : 'pointer', 
                  transition: '0.3s all ease',
                  backgroundColor: selected === opt.id ? `${theme.primary}08` : '#fff',
                  transform: selected === opt.id ? 'translateY(-5px)' : 'none',
                  boxShadow: selected === opt.id ? '0 10px 20px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                <div className="display-5 mb-3" style={{ 
                  color: opt.color,
                  filter: selected === opt.id ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' : 'none'
                }}>
                  <i className={`bi ${opt.icon}`}></i>
                </div>
                <h5 className="fw-bold mb-2" style={{ color: theme.darkBlue }}>{opt.title}</h5>
                <p className="text-muted small mb-0 px-2">{opt.desc}</p>
                
                {selected === opt.id && (
                  <div className="mt-3 text-primary fw-bold small animate__animated animate__fadeInUp">
                    <i className="bi bi-check-circle-fill me-1"></i> Selection Active
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="d-flex flex-column gap-2 mt-4">
          <button 
            className="btn btn-primary rounded-pill py-3 fw-bold shadow-sm d-flex align-items-center justify-content-center"
            disabled={!selected || loading}
            style={{ 
              backgroundColor: theme.primary, 
              border: 'none',
              transition: '0.3s opacity' 
            }}
            onClick={handleConfirm}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                PREPARING FORM...
              </>
            ) : (
              'CONFIRM & ACTIVATE'
            )}
          </button>
          
          <button 
            className="btn btn-link text-decoration-none text-secondary fw-bold py-2" 
            onClick={onClose}
            disabled={loading}
            style={{ opacity: loading ? 0.5 : 1 }}
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountTypeModal;