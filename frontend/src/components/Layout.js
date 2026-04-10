import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';

function Spinner() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function AdminRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/projects" replace />;
  return (
    <div className="min-h-screen bg-dark-900">
      <Sidebar />
      <div className="lg:ml-60">
        <main className="p-5 lg:p-8 max-w-content mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
