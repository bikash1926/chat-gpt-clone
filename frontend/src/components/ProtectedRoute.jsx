import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, status } = useSelector((state) => state.user);

  if (status === 'loading') {
    return <div>Loading...</div>; // Or a spinner component
  }

  if (!isAuthenticated) {
    // If user is not authenticated, redirect to the login page
    return <Navigate to="/login" />;
  }

  // If authenticated, render the child component
  return children;
};

export default ProtectedRoute;
