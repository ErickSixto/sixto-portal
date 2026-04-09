import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import { RefreshCw } from 'lucide-react';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-oat flex items-center justify-center">
      <RefreshCw size={24} className="animate-spin text-accent" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="min-h-screen bg-oat">
      <Sidebar />
      <div className="lg:ml-64">
        <main className="p-6 lg:p-8 max-w-content mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function AdminRoute() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-oat flex items-center justify-center">
      <RefreshCw size={24} className="animate-spin text-accent" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return (
    <div className="min-h-screen bg-oat">
      <Sidebar />
      <div className="lg:ml-64">
        <main className="p-6 lg:p-8 max-w-content mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
