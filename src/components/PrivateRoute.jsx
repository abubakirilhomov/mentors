import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children }) => {
  const { isAuth, authInitialized } = useSelector((state) => state.auth);

  // During the cold-boot silent refresh the access token isn't in state yet
  // but a session may exist. Don't bounce to /login until the refresh resolves.
  if (!authInitialized) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#666" }}>
        Загрузка...
      </div>
    );
  }

  return isAuth ? <>{children}</> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
