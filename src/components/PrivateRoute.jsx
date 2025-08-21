import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children }) => {
  const isAuth = useSelector((state) => state.auth.isAuth);
  
  return isAuth ? <>{children}</> : <Navigate to="/login" replace />;
};

export default PrivateRoute;