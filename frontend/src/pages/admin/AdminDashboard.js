import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Users, CreditCard, Layers } from 'lucide-react';

function StatCard({ icon: Icon, label, value, color, onClick }) {
  return (
    <div onClick={onClick} className={`bg-white rounded-xl p-6 border border-border ${onClick ? 'cursor-pointer hover:border-accent/40' : ''} transition-colors`} data-testid={`admin-stat-${label.toLowerCase()}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}><Icon size={20} /></div>
        <span className="text-sm text-secondary font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold text-charcoal">{value}</div>
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
    ]).then(([p, c, b]) => {
      setProjects(p);
      setClients(c);
      setBilling(b);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const activeProjects = projects.filter(p => !['Done', 'Lost'].includes(p.status));

  return (
    <div data-testid="admin-dashboard" className="space-y-8">
      <h1 className="text-2xl font-bold text-charcoal">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Layers} label="Projects" value={projects.length} color="bg-blue-50 text-blue-600" onClick={() => navigate('/admin/projects')} />
        <StatCard icon={Users} label="Clients" value={clients.length} color="bg-green-50 text-green-600" onClick={() => navigate('/admin/clients')} />
        <StatCard icon={CreditCard} label="Revenue" value={`$${(billing?.summary?.total_paid || 0).toLocaleString()}`} color="bg-accent/20 text-yellow-700" onClick={() => navigate('/admin/billing')} />
        <StatCard icon={BarChart3} label="Outstanding" value={`$${(billing?.summary?.outstanding || 0).toLocaleString()}`} color="bg-red-50 text-red-600" onClick={() => navigate('/admin/billing')} />
      </div>

      <div className="bg-white rounded-xl border border-border">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-charcoal">Active Projects ({activeProjects.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="active-projects-table">
            <thead>
              <tr className="border-b border-border bg-oat/50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-secondary uppercase">Project</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-secondary uppercase">Client</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-secondary uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-secondary uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {activeProjects.map((p, i) => (
                <tr key={p.id} className={i % 2 === 1 ? 'bg-oat/30' : ''}>
                  <td className="px-6 py-4 text-sm font-medium text-charcoal">{p.name}</td>
                  <td className="px-6 py-4 text-sm text-body">{p.client_name || '—'}</td>
                  <td className="px-6 py-4"><span className="text-xs px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 font-medium">{p.status}</span></td>
                  <td className="px-6 py-4 text-sm text-charcoal">{p.estimated_amount ? `$${p.estimated_amount.toLocaleString()}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
