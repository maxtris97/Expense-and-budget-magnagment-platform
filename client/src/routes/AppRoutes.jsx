import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import AppLayout from '../components/layout/AppLayout.jsx';

import DashboardPage from '../pages/DashboardPage.jsx';
import TransactionsPage from '../pages/TransactionsPage.jsx';
import AnalyticsPage from '../pages/AnalyticsPage.jsx';
import BudgetsPage from '../pages/BudgetsPage.jsx';
import GoalsPage from '../pages/GoalsPage.jsx';
import SettingsPage from '../pages/SettingsPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import ForgotPasswordPage from '../pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from '../pages/ResetPasswordPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/budgets" element={<BudgetsPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
