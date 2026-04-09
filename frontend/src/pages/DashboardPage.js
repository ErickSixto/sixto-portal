import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';
import { CheckCircle2, Package, CreditCard, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function MetricCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-border" data-testid={`metric-${label.toLowerCase().replace(/\s/g, '-')}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
        <span className="text-sm text-secondary font-medium">{label}</span>
      </div>
      <div className="text-2xl font-bold text-charcoal">{value}</div>
      {sub && <div className="text-xs text-secondary mt-1">{sub}</div>}
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    'Not started': 'bg-gray-100 text-gray-600',
    'Onboarding': 'bg-blue-50 text-blue-600',
    'Research': 'bg-purple-50 text-purple-600',
    'In progress': 'bg-yellow-50 text-yellow-700',
    'Off boarding': 'bg-orange-50 text-orange-600',
    'Done': 'bg-green-50 text-green-700',
    'Lost': 'bg-red-50 text-red-600',
  };
  return (
    <span data-testid="project-status" className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
      {status || 'Unknown'}
    </span>
  );
}

function UpdateTypeBadge({ type }) {
  const colors = {
    'Status Update': 'bg-blue-50 text-blue-600',
    'Milestone': 'bg-accent/20 text-yellow-700',
    'Announcement': 'bg-purple-50 text-purple-600',
    'Request': 'bg-orange-50 text-orange-600',
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${colors[type] || 'bg-gray-100 text-gray-600'}`}>
      {type}
    </span>
  );
}

export default function DashboardPage() {
  const { selectedProject, portalConfig } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedProject) return;
    setLoading(true);
    api(`/api/portal/project/${selectedProject.id}/dashboard`)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedProject]);

  if (!selectedProject) return (
    <div className="text-center py-20">
      <p className="text-secondary">No project selected. Please select a project from the sidebar.</p>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!data) return <div className="text-secondary text-center py-20">Failed to load dashboard data.</div>;

  const { project, metrics, recent_updates } = data;
  const progress = metrics.tasks_total > 0 ? Math.round((metrics.tasks_completed / metrics.tasks_total) * 100) : 0;

  return (
    <div data-testid="dashboard-page" className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">{portalConfig?.portal_title || project.name}</h1>
        {portalConfig?.portal_intro && <p className="text-body mt-1">{portalConfig.portal_intro}</p>}
        <div className="flex items-center gap-3 mt-3">
          <StatusBadge status={project.status} />
          {project.project_date && (
            <span className="text-sm text-secondary">
              {project.project_date.start} {project.project_date.end ? ` — ${project.project_date.end}` : ''}
            </span>
          )}
          {project.branch && <span className="text-sm text-secondary font-mono bg-oat px-2 py-0.5 rounded">{project.branch}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={CheckCircle2} label="Tasks" value={`${metrics.tasks_completed}/${metrics.tasks_total}`} sub={`${progress}% complete`} color="bg-green-50 text-green-600" />
        <MetricCard icon={Package} label="Deliverables" value={`${metrics.deliverables_delivered}/${metrics.deliverables_total}`} sub="delivered" color="bg-blue-50 text-blue-600" />
        <MetricCard icon={CreditCard} label="Billed" value={`$${(metrics.total_billed || 0).toLocaleString()}`} sub={`$${(metrics.total_paid || 0).toLocaleString()} paid`} color="bg-accent/20 text-yellow-700" />
        <MetricCard icon={Clock} label="Outstanding" value={`$${(metrics.outstanding || 0).toLocaleString()}`} sub="remaining" color="bg-orange-50 text-orange-600" />
      </div>

      <div className="bg-white rounded-xl p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-charcoal">Project Progress</h2>
          <span className="text-sm font-semibold text-charcoal">{progress}%</span>
        </div>
        <div className="w-full bg-oat rounded-full h-3">
          <div className="bg-accent h-3 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} data-testid="progress-bar" />
        </div>
      </div>

      {project.estimated_amount && (
        <div className="bg-white rounded-xl p-6 border border-border">
          <h3 className="text-sm text-secondary mb-1">Estimated Project Value</h3>
          <div className="text-3xl font-bold text-charcoal">${project.estimated_amount.toLocaleString()}</div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-border">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-charcoal">Recent Updates</h2>
          <button onClick={() => navigate('/updates')} className="text-sm text-accent hover:text-accent-hover font-medium flex items-center gap-1" data-testid="view-all-updates">
            View All <ArrowRight size={14} />
          </button>
        </div>
        {recent_updates.length === 0 ? (
          <div className="p-6 text-center text-secondary text-sm">No updates yet</div>
        ) : (
          <div className="divide-y divide-border">
            {recent_updates.map(u => (
              <div key={u.id} className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <UpdateTypeBadge type={u.type} />
                  <span className="text-xs text-secondary">{u.date?.start || ''}</span>
                </div>
                <h3 className="font-medium text-charcoal">{u.name}</h3>
                {u.content && <p className="text-sm text-body mt-1 line-clamp-2">{u.content}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
