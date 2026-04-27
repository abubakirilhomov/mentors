import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './store';
import { loadFromStorage } from './store/authSlice';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './pages/LoginPage';
import MarsIdReturn from './pages/MarsIdReturn';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import LessonsPage from './pages/LessonsPage';
import InternsPage from './pages/InternsPage';
import MapPage from './pages/MapPage';
import BottomNav from './components/BottomNav';
import { ToastContainer } from 'react-toastify';

const AppContent = () => {
  const dispatch = useDispatch();
  const { isAuth } = useSelector((state) => state.auth);

  useEffect(() => {
    // Загружаем данные из localStorage при инициализации
    dispatch(loadFromStorage());
  }, [dispatch]);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/marsid/return" element={<MarsIdReturn />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/lessons"
            element={
              <PrivateRoute>
                <LessonsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/interns"
            element={
              <PrivateRoute>
                <InternsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/map"
            element={
              <PrivateRoute>
                <MapPage />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        {isAuth && <BottomNav />}
        <ToastContainer />
      </div>
    </Router>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;