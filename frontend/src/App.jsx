import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkCurrentUser } from './features/authSlice';

// Import layouts
import DashboardLayout from './layouts/DashboardLayout';

// Import  pages
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientDetail from './pages/PatientDetail';
import AddEditPatient from './pages/AddEditPatient';
import CancerRegistry from './pages/CancerRegistry';
import Receipts from './pages/Receipts';
import Staff from './pages/Staff';
import Settings from './pages/Settings';

// Private Route Wrapper for authentication & role checking
const PrivateRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useSelector(state => state.auth);

  // If loading user state on start, show loading screen
  if (loading && !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 font-medium text-sm text-muted-foreground">Verifying secure credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route Wrapper to prevent authenticated users from viewing login pages
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(state => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Attempt session restoration on reload
    dispatch(checkCurrentUser());
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        {/* Public auth pages */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password/:token"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />

        {/* Protected hospital registry pages */}
        <Route
          path="/"
          element={
            <PrivateRoute allowedRoles={['Super Admin', 'Admin']}>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="patients" element={<Patients />} />
          <Route path="patients/add" element={<AddEditPatient />} />
          <Route path="patients/edit/:id" element={<AddEditPatient />} />
          <Route path="patients/:id" element={<PatientDetail />} />
          <Route path="registry" element={<CancerRegistry />} />
          <Route path="receipts" element={<Receipts />} />
          
          {/* Super Admin exclusive */}
          <Route
            path="staff"
            element={
              <PrivateRoute allowedRoles={['Super Admin']}>
                <Staff />
              </PrivateRoute>
            }
          />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Wildcard fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
