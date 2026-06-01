// src/App.jsx
// Main app component - routing setup yahan hota hai
// React Router v6 use kar rahe hain - modern way of routing

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages import karo
import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard    from './pages/Dashboard';
import ProjectsPage from './pages/ProjectsPage';
import TasksPage    from './pages/TasksPage';

// Components
import Sidebar from './components/Sidebar';

// ─────────────────────────────────────────
//  Protected Route Component
// ─────────────────────────────────────────
// Login nahi hai toh login page pe redirect karo
function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();
  
  if (loading) {
    // Auth check ho raha hai - loading dikhao
    return (
      <div className="loading" style={{ height: '100vh' }}>
        <div className="spinner" />
        Loading...
      </div>
    );
  }
  
  // Login nahi hai toh /login pe bhejo
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  
  return children;
}

// ─────────────────────────────────────────
//  App Layout (with Sidebar)
// ─────────────────────────────────────────
function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────
//  Main App
// ─────────────────────────────────────────
function AppRoutes() {
  const { isLoggedIn } = useAuth();
  
  return (
    <Routes>
      {/* Public routes - login nahi hai tab bhi access ho */}
      <Route
        path="/login"
        element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
      />
      
      {/* Protected routes - sirf logged-in users */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout><Dashboard /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <AppLayout><ProjectsPage /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <AppLayout><TasksPage /></AppLayout>
          </ProtectedRoute>
        }
      />
      
      {/* Default: dashboard pe redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

// Root component - AuthProvider se poori app wrap karo
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
