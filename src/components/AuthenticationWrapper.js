import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AuthenticationWrapper = ({ children }) => {
  const { isAuthenticated, isAdmin, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // Si el usuario está autenticado pero no ha completado el registro y no es admin
  if (!isAdmin && user && !user.registroCompleto && window.location.pathname !== '/register') {
    return <Navigate to="/register" replace />;
  }

  return children;
};

export default AuthenticationWrapper; 