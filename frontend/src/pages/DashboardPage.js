import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';
import { CheckCircle2, Package, CreditCard, Clock, ArrowRight, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function MetricCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="bg-dark-700 rounded-xl p-5 border border-dark-500/50" data-testid={`metric-${label.toLowerCase().replace(/\s/g, '-')}`}>
      <div className="flex items-center gap-2.5 mb-3">
        <Icon size={16} className="text-warm-400" />
        <span className="text-xs text-warm-400">{label}</span>
      </div>
      <div className="text-2xl font-bold text-warm-50">{value}</div>
      {sub && <div className="text-[11px] text-warm-500 mt-1">{sub}</div>}
    </div>
  );
}

function StatusPill({ status }) {
  const colors = {
    'Not started': 'bg-warm-500/15 text-warm-400',
    'Onboarding': 'bg-blue-500/15 text-blue-400',
    'Research': 'bg-purple-500/15 text-purple-400',
    'In progress': 'bg-accent/15 text-accent',
    'Off boarding': 'bg-orange-500/15 text-orange-400',
    'Done': 'bg-green-500/15 text-green-400',
    'Lost': 'bg-red-500/15 text-red-400',
  };
  return (
    <span data-testid="project-status" className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium ${colors[status] || 'bg-warm-500/15 text-warm-400'}`}>
      {status || 'Unknown'}
    </span>
  );
}

function UpdateTypePill({ type }) {
  const colors = {
    'Status Update': 'bg-blue-500/15 text-blue-400',
    'Milestone': 'bg-accent/15 text-accent',
    'Announcement': 'bg-purple-500/15 text-purple-400',
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium ${colors[type] || 'bg-warm-500/15 text-warm-400'}`}>
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
      .then(setData).catch(console.error).finally(() => setLoading(false));
  }, [selectedProject]);

  if (!selectedProject) return (
    <div className="text-center py-20">
      <p className="text-warm-500 text-sm">Select a project from the sidebar to get started.</p>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!data) return <div className="text-warm-500 text-center py-20 text-sm">Failed to load dashboard.</div>;

  const { project, metrics, recent_updates } = data;
  const progress = metrics.tasks_total > 0 ? Math.round((metrics.tasks_completed / metrics.tasks_total) * 100) : 0;

  return (
    <div data-testid="dashboard-page" className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-warm-50">{portalConfig?.portal_title || project.name}</h1>
        {portalConfig?.portal_intro && <p className="text-warm-400 text-sm mt-1">{portalConfig.portal_intro}</p>}
        <div className="flex items-center gap-2.5 mt-3 flex-wrap">
          <StatusPill status={project.status} />
          {project.project_date && (
            <span className="text-xs text-warm-500">
              {project.project_date.start}{project.project_date.end ? ` — ${project.project_date.end}` : ''}
            </span>
          )}
          {project.branch && <span className="text-xs text-warm-500 font-mono bg-dark-600 px-2 py-0.5 rounded">{project.branch}</span>}
          {project.project_type && <span className="text-xs text-warm-500 bg-dark-600 px-2 py-0.5 rounded">{project.project_type}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard icon={CheckCircle2} label="Tasks" value={`${metrics.tasks_completed}/${metrics.tasks_total}`} sub={`${progress}% complete`} />
        <MetricCard icon={Package} label="Deliverables" value={`${metrics.deliverables_delivered}/${metrics.deliverables_total}`} sub="delivered" />
        <MetricCard icon={CreditCard} label="Billed" value={`$${(metrics.total_billed || 0).toLocaleString()}`} sub={`$${(metrics.total_paid || 0).toLocaleString()} paid`} />
        <MetricCard icon={TrendingUp} label="Outstanding" value={`$${(metrics.outstanding || 0).toLocaleString()}`} sub="remaining" />
      </div>

      <div className="bg-dark-700 rounded-xl p-5 border border-dark-500/50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-warm-100">Progress</h2>
          <span className="text-xs font-semibold text-accent">{progress}%</span>
        </div>
        <div className="w-full bg-dark-500 rounded-full h-2">
          <div className="bg-accent h-2 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} data-testid="progress-bar" />
        </div>
      </div>

      {project.estimated_amount && (
        <div className="bg-dark-700 rounded-xl p-5 border border-dark-500/50">
          <h3 className="text-xs text-warm-400 mb-1">Estimated Project Value</h3>
          <div className="text-2xl font-bold text-warm-50">${project.estimated_amount.toLocaleString()}</div>
        </div>
      )}

      <div className="bg-dark-700 rounded-xl border border-dark-500/50">
        <div className="flex items-center justify-between p-5 border-b border-dark-500/50">
          <h2 className="text-sm font-semibold text-warm-100">Recent Updates</h2>
          <button onClick={() => navigate('/updates')} className="text-xs text-accent hover:text-accent-light font-medium flex items-center gap-1" data-testid="view-all-updates">
            View All <ArrowRight size={12} />
          </button>
        </div>
        {recent_updates.length === 0 ? (
          <div className="p-5 text-center text-warm-500 text-xs">No updates yet</div>
        ) : (
          <div className="divide-y divide-dark-500/50">
            {recent_updates.map(u => (
              <div key={u.id} className="p-5">
                <div className="flex items-center gap-2 mb-1.5">
                  {u.type && <UpdateTypePill type={u.type} />}
                  <span className="text-[10px] text-warm-500">{u.date?.start || ''}</span>
                </div>
                <h3 className="text-sm font-medium text-warm-100">{u.name}</h3>
                {u.content && <p className="text-xs text-warm-400 mt-1 line-clamp-2">{u.content}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
