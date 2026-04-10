import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, BarChart3, CreditCard, Layers, Settings, Shield, Users } from 'lucide-react';
import AdminSummaryCard from '../../components/admin/AdminSummaryCard';

const statusColors = {
  'Not started': 'bg-warm-500/15 text-warm-400',
  'Onboarding': 'bg-blue-500/15 text-blue-400',
  'Research': 'bg-purple-500/15 text-purple-400',
  'In progress': 'bg-accent/15 text-accent',
  'Off boarding': 'bg-orange-500/15 text-orange-400',
  'Done': 'bg-green-500/15 text-green-400',
  'Lost': 'bg-red-500/15 text-red-400',
};

function formatProjectType(projectType) {
  if (Array.isArray(projectType)) return projectType.join(', ');
  return projectType || '';
}

export default function AdminDashboard() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [billing, setBilling] = useState(null);
  const [portals, setPortals] = useState([]);
  const [accessEntries, setAccessEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api('/api/admin/projects').catch(() => []),
      api('/api/admin/clients').catch(() => []),
      api('/api/admin/billing').catch(() => null),
      api('/api/admin/portals').catch(() => []),
      api('/api/admin/access').catch(() => []),
    ]).then(([p, c, b, portalConfigs, access]) => {
      setProjects(p);
      setClients(c);
      setBilling(b);
      setPortals(portalConfigs);
      setAccessEntries(access);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const active = projects.filter(p => !['Done', 'Lost'].includes(p.status));
  const topActive = [...active].sort((a, b) => (b.estimated_amount || 0) - (a.estimated_amount || 0)).slice(0, 5);
  const inactiveClients = clients.filter((client) => client.status && client.status !== 'Active').length;
  const outstandingInvoices = billing?.outstanding || [];
  const draftPortals = portals.filter((portal) => !portal.status || portal.status === 'Draft').length;
  const quickActions = [
    { label: 'Review Projects', description: 'Open the filtered projects workspace.', icon: Layers, to: '/admin/projects' },
    { label: 'Check Billing', description: 'Focus on outstanding invoices and revenue.', icon: CreditCard, to: '/admin/billing' },
    { label: 'Audit Portals', description: 'Verify client-facing section visibility.', icon: Settings, to: '/admin/portals' },
    { label: 'Manage Access', description: 'Confirm who can enter the admin portal.', icon: Shield, to: '/admin/access' },
  ];
  const attentionItems = [
    { label: 'Outstanding invoices', value: outstandingInvoices.length, helper: outstandingInvoices.length > 0 ? 'needs follow-up' : 'all clear', to: '/admin/billing' },
    { label: 'Inactive clients', value: inactiveClients, helper: inactiveClients > 0 ? 'check account health' : 'all active', to: '/admin/clients' },
    { label: 'Draft portals', value: draftPortals, helper: draftPortals > 0 ? 'review before launch' : 'launch-ready', to: '/admin/portals' },
    { label: 'Admin members', value: accessEntries.length, helper: 'verify access periodically', to: '/admin/access' },
  ];

  return (
    <div data-testid="admin-dashboard" className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-warm-50">Admin Dashboard</h1>
        <p className="text-warm-400 text-xs mt-1">Stay on top of delivery, billing, portal readiness, and access from one view.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <AdminSummaryCard
          icon={Layers}
          label="Projects"
          value={projects.length}
          helper={`${active.length} active`}
          onClick={() => navigate('/admin/projects')}
          testId="admin-stat-projects"
        />
        <AdminSummaryCard
          icon={Users}
          label="Clients"
          value={clients.length}
          helper={`${inactiveClients} outside active`}
          onClick={() => navigate('/admin/clients')}
          testId="admin-stat-clients"
        />
        <AdminSummaryCard
          icon={CreditCard}
          label="Revenue"
          value={`$${(billing?.summary?.total_paid || 0).toLocaleString()}`}
          helper="paid to date"
          onClick={() => navigate('/admin/billing')}
          testId="admin-stat-revenue"
        />
        <AdminSummaryCard
          icon={BarChart3}
          label="Outstanding"
          value={`$${(billing?.summary?.outstanding || 0).toLocaleString()}`}
          helper={`${outstandingInvoices.length} invoice${outstandingInvoices.length !== 1 ? 's' : ''}`}
          accent="text-accent"
          onClick={() => navigate('/admin/billing')}
          testId="admin-stat-outstanding"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-6">
        <div className="bg-dark-700 rounded-xl border border-dark-500/50">
          <div className="p-5 border-b border-dark-500/50 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-warm-100">Priority Projects</h2>
              <p className="text-[11px] text-warm-500 mt-1">Highest-value active work streams.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/projects')}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-accent hover:bg-dark-600"
            >
              Open all
              <ArrowUpRight size={12} />
            </button>
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
                {topActive.map((p, i) => (
                  <tr key={p.id} className={i % 2 === 1 ? 'bg-dark-800/40' : ''}>
                    <td className="px-5 py-3.5">
                      <div className="text-sm font-medium text-warm-100">{p.name}</div>
                      {formatProjectType(p.project_type) && (
                        <div className="mt-1 text-[11px] text-warm-500">{formatProjectType(p.project_type)}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-warm-400">{p.client_name || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[p.status] || 'bg-warm-500/15 text-warm-400'}`}>{p.status || '—'}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-warm-100 text-right">
                      {p.estimated_amount ? `$${p.estimated_amount.toLocaleString()}` : '—'}
                    </td>
                  </tr>
                ))}
                {topActive.length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-8 text-center text-warm-500 text-xs">No active projects</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-dark-700 rounded-xl border border-dark-500/50 p-5">
            <h2 className="text-sm font-semibold text-warm-100 mb-4">Needs Attention</h2>
            <div className="space-y-3">
              {attentionItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => navigate(item.to)}
                  className="flex w-full items-center justify-between rounded-xl border border-dark-500/40 bg-dark-800 px-4 py-3 text-left transition-colors hover:border-accent/20 hover:bg-dark-600/40"
                >
                  <div>
                    <div className="text-sm font-medium text-warm-100">{item.label}</div>
                    <div className="mt-1 text-[11px] text-warm-500">{item.helper}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-accent">{item.value}</div>
                    <div className="mt-1 flex items-center justify-end text-[11px] text-warm-500">
                      Review
                      <ArrowUpRight size={12} className="ml-1" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-dark-700 rounded-xl border border-dark-500/50 p-5">
            <h2 className="text-sm font-semibold text-warm-100 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => navigate(action.to)}
                  className="flex w-full items-start gap-3 rounded-xl border border-dark-500/40 bg-dark-800 px-4 py-3 text-left transition-colors hover:border-accent/20 hover:bg-dark-600/40"
                >
                  <div className="mt-0.5 rounded-lg bg-accent/12 p-2 text-accent">
                    <action.icon size={14} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-warm-100">{action.label}</div>
                    <div className="mt-1 text-[11px] leading-relaxed text-warm-500">{action.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
