import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/Auth/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import PublicRoute from './components/Auth/PublicRoute';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Dashboard from './Dashboard'; // Your layout component with menu bar
// import Home from './pages/Home';
// import Table from './pages/Table';
import Settings from './pages/Settings';
import Discover from './pages/Discover';
import SignIn from './pages/SignIn';
import WriteLog from './pages/WriteLog';


export default function App() {
  return (
    <AuthProvider>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        {/* <DiscoverWalletProviders /> */}
        <BrowserRouter future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}>
          <Routes>
            <Route element={<PublicRoute />}>
              <Route path="signin" element={<SignIn />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              {/* Wrap all pages inside Dashboard layout */}
              {/* a parent route to show all nav bar / menu */}
              <Route path="/" element={<Dashboard />}>
                {/* Default redirect from / to /home */}
                <Route index element={<Navigate to="home" replace />} />
                <Route path="home" element={<Discover />} />
                <Route path="writeLog" element={<WriteLog />} />

                <Route path="settings" element={<Settings />} />
                {/* Catch-all for unmatched routes */}
                <Route path="*" element={<div>Page Not Found</div>} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </LocalizationProvider>
    </AuthProvider>
  );
}