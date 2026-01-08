import React from 'react';
import PropTypes from 'prop-types';
import { AlertCircle, Check } from 'lucide-react';
import { theme } from './theme';

const ActionModal = ({ show, onConfirm, onCancel, data }) => {
  if (!show || !data) return null;
  const isNegative = ['reject', 'deactivate', 'decline', 'freeze', 'stop', 'block'].includes(data.action.toLowerCase());
  const themeColor = isNegative ? '#ef4444' : theme.primary;
  const Icon = isNegative ? AlertCircle : Check;

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(12, 74, 110, 0.4)', backdropFilter: 'blur(4px)', zIndex: 3000 }}>
      <div className="bg-white rounded-5 p-5 shadow-lg border-0 text-center" style={{ width: '420px' }}>
        <div className={`rounded-circle d-inline-flex p-4 mb-4`} style={{ backgroundColor: `${themeColor}15`, color: themeColor }}>
          <Icon size={48} />
        </div>
        <h3 className="fw-black mb-2" style={{ color: theme.darkBlue }}>Final Auth</h3>
        <p className="text-secondary mb-4">Are you sure you want to <strong>{data.action.toUpperCase()}</strong> request for <br/><strong>{data.name}</strong>?</p>
        <div className="d-flex gap-2">
          <button className="btn btn-light flex-grow-1 rounded-pill py-3 fw-bold text-muted border-0" onClick={onCancel}>BACK</button>
          <button className="btn flex-grow-1 rounded-pill py-3 fw-black text-white shadow-sm border-0" style={{ backgroundColor: themeColor }} onClick={onConfirm}>
            CONFIRM
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionModal;

ActionModal.propTypes = {
  show: PropTypes.bool,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  data: PropTypes.object,
};
