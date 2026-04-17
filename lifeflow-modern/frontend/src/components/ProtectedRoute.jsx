import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../context/authStore';

const ProtectedRoute = ({ children, requireAdmin = false, requireOrg = false }) => {
  const { isAuthenticated, user, isInitialized } = useAuthStore();
  const location = useLocation();

  // Wait for auth initialization
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Not logged in → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin-only route but user is not ADMIN
  if (requireAdmin && user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  // Org-only route but user is not ORGANIZATION
  if (requireOrg && user?.role !== 'ORGANIZATION') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
