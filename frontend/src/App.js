// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import { ToastContainer } from 'react-toastify';
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
           <Route path="/login" element={<Login />} />
           <Route path="/register" element={<Register />} />

           {/* Protected Routes */}
           <Route
             path="/dashboard"
             element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
           />
           <Route path="/profile" element={<Profile />} />
           <Route path="/transactions-management" element={<TransactionsManagement />}
                   />
            <Route path="/modify-budgets" element={<BudgetModification />}/>
            <Route path="/goals/:goalId" element={<GoalDetails />} />
         </Routes>
       </Router>
     );
   }
export default App;
