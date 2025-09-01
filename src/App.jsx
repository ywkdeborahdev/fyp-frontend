import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/Auth/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import PublicRoute from './components/Auth/PublicRoute';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Dashboard from './Dashboard';
import Settings from './pages/Settings';
import Discover from './pages/Discover';
import SignIn from './pages/SignIn';
import WriteLog from './pages/WriteLog';
import BatchWriteLog from './pages/BatchWriteLog';

// We create a component for our routes to easily access the auth context
const AppRoutes = () => {
  const { userGroup } = useAuth();

  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="signin" element={<SignIn />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />}>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<Discover />} />
          <Route path="writeLog" element={<WriteLog />} />
          <Route path="batchWriteLog" element={<BatchWriteLog />} />

          {/* Only render the Settings route if userGroup is not 2 */}
          {userGroup !== 2 && <Route path="settings" element={<Settings />} />}

          <Route path="*" element={<div>Page Not Found</div>} />
        </Route>
      </Route>
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <BrowserRouter future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}>
          <AppRoutes />
        </BrowserRouter>
      </LocalizationProvider>
    </AuthProvider>
  );
}