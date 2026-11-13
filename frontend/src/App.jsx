import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Login } from './pages/Login';
import { Overview } from './pages/Overview';
import { Students } from './pages/Students';
import { Classes } from './pages/Classes';
import { Attendance } from './pages/Attendance';
import { Reports } from './pages/Reports';
import { SystemHealth } from './pages/SystemHealth';
import { Settings } from './pages/Settings';

export const App = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Login Route */}
            <Route path="/login" element={<Login />} />

            {/* Authenticated Dashboard Routes */}
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Overview />} />
              <Route path="students" element={<Students />} />
              <Route path="classes" element={<Classes />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="reports" element={<Reports />} />
              <Route path="health" element={<SystemHealth />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
