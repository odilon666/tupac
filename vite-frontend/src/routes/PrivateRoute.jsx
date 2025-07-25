import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();

  // Si l'utilisateur n'est pas connecté, rediriger vers la page de login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Sinon, rendre la page protégée
  return children;
};

export default PrivateRoute;
