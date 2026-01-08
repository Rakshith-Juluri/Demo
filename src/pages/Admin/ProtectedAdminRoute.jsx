import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedAdminRoute = ({ children }) => {
  try {
    const admin = JSON.parse(localStorage.getItem('adminSession'));
    if (admin && admin.role === 'admin') return children;
  } catch (e) {
    // ignore parse errors
  }
  return <Navigate to="/" replace />;
};

export default ProtectedAdminRoute;
