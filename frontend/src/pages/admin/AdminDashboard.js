import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Users, CreditCard, Layers } from 'lucide-react';

function StatCard({ icon: Icon, label, value, onClick }) {
  return (
    <div onClick={onClick} className={`bg-dark-700 rounded-xl p-5 border border-dark-500/50 ${onClick ? 'cursor-pointer hover:border-accent/20' : ''} transition-colors`} data-testid={`admin-stat-${label.toLowerCase()}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className="text-warm-400" />
        <span className="text-[10px] text-warm-400 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-bold text-warm-50">{value}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api('/api/admin/projects').catch(() => []),
      api('/api/admin/clients').catch(() => []),
      api('/api/admin/billing').catch(() => null),
    ]).then(([p, c, b]) => { setProjects(p); setClients(c); setBilling(b); }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const active = projects.filter(p => !['Done', 'Lost'].includes(p.status));

  return (
    <div data-testid="admin-dashboard" className="space-y-6">
      <h1 className="text-xl font-bold text-warm-50">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Layers} label="Projects" value={projects.length} onClick={() => navigate('/admin/projects')} />
        <StatCard icon={Users} label="Clients" value={clients.length} onClick={() => navigate('/admin/clients')} />
        <StatCard icon={CreditCard} label="Revenue" value={`$${(billing?.summary?.total_paid || 0).toLocaleString()}`} onClick={() => navigate('/admin/billing')} />
        <StatCard icon={BarChart3} label="Outstanding" value={`$${(billing?.summary?.outstanding || 0).toLocaleString()}`} onClick={() => navigate('/admin/billing')} />
      </div>

      <div className="bg-dark-700 rounded-xl border border-dark-500/50">
        <div className="p-5 border-b border-dark-500/50">
          <h2 className="text-sm font-semibold text-warm-100">Active Projects ({active.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="active-projects-table">
            <thead>
              <tr className="border-b border-dark-500/50">
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Project</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Client</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-500/30">
              {active.map((p, i) => (
                <tr key={p.id} className={i % 2 === 1 ? 'bg-dark-800/40' : ''}>
                  <td className="px-5 py-3.5 text-sm font-medium text-warm-100">{p.name}</td>
                  <td className="px-5 py-3.5 text-xs text-warm-400">{p.client_name || '—'}</td>
                  <td className="px-5 py-3.5"><span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/15 text-accent font-medium">{p.status}</span></td>
                  <td className="px-5 py-3.5 text-sm text-warm-100 text-right">{p.estimated_amount ? `$${p.estimated_amount.toLocaleString()}` : '—'}</td>
                </tr>
              ))}
              {active.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-warm-500 text-xs">No active projects</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
