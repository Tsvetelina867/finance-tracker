// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import PrivateRoute from './components/PrivateRoute';
import TransactionsManagement from './pages/TransactionsManagement';
import BudgetModification from './pages/BudgetModification';
import GoalDetails from './pages/GoalDetails';
import "./App.css";

const App = () => {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        {/* Root route: immediately redirect based on auth */}
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
          }
        />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
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
          path="/transactions-management"
          element={
            <PrivateRoute>
              <TransactionsManagement />
            </PrivateRoute>
          }
        />
        <Route
          path="/modify-budgets"
          element={
            <PrivateRoute>
              <BudgetModification />
            </PrivateRoute>
          }
        />
        <Route
          path="/goals/:goalId"
          element={
            <PrivateRoute>
              <GoalDetails />
            </PrivateRoute>
          }
        />

        {/* Catch-all: Redirect to root which will then redirect appropriately */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
