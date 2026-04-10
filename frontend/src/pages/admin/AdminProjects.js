import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useNavigate } from 'react-router-dom';
import { Layers, Search, X, ArrowUpRight } from 'lucide-react';

const statusColors = {
  'Not started': 'bg-warm-500/15 text-warm-400',
  'Onboarding': 'bg-blue-500/15 text-blue-400',
  'Research': 'bg-purple-500/15 text-purple-400',
  'In progress': 'bg-accent/15 text-accent',
  'Off boarding': 'bg-orange-500/15 text-orange-400',
  'Done': 'bg-green-500/15 text-green-400',
  'Lost': 'bg-red-500/15 text-red-400',
};

function SummaryCard({ label, value, accent = 'text-warm-50' }) {
  return (
    <div className="bg-dark-700 rounded-xl p-5 border border-dark-500/50">
      <div className="text-[10px] font-semibold text-warm-500 uppercase tracking-wider mb-2">{label}</div>
      <div className={`text-2xl font-bold ${accent}`}>{value}</div>
    </div>
  );
}

function formatProjectType(projectType) {
  if (Array.isArray(projectType)) return projectType.join(', ');
  return projectType || '';
}

function formatProjectDate(projectDate) {
  if (!projectDate?.start) return '—';
  if (projectDate.end) return `${projectDate.start} — ${projectDate.end}`;
  return projectDate.start;
}

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    api('/api/admin/projects').then(setProjects).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const statusOptions = ['all', ...new Set(projects.map((project) => project.status).filter(Boolean))];
  const filteredProjects = projects.filter((project) => {
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    if (!matchesStatus) return false;
    if (!normalizedQuery) return true;

    const haystack = [
      project.name,
      project.client_name,
      project.status,
      formatProjectType(project.project_type),
      formatProjectDate(project.project_date),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });

  const activeProjects = projects.filter((project) => !['Done', 'Lost'].includes(project.status)).length;
  const completedProjects = projects.filter((project) => ['Done', 'Lost'].includes(project.status)).length;
  const pipelineValue = projects.reduce((sum, project) => sum + (project.estimated_amount || 0), 0);

  return (
    <div data-testid="admin-projects-page" className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-warm-50">All Projects</h1>
          <p className="text-warm-400 text-xs mt-1">Track delivery status, dates, and portal handoff from one place.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-dark-500/40 bg-dark-800 px-3 py-1.5 text-[11px] text-warm-400">
          <Layers size={13} className="text-accent" />
          {filteredProjects.length} shown
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SummaryCard label="Projects" value={projects.length} />
        <SummaryCard label="Active" value={activeProjects} accent="text-accent" />
        <SummaryCard label="Pipeline Value" value={`$${pipelineValue.toLocaleString()}`} accent="text-green-400" />
      </div>

      <div className="bg-dark-700 rounded-xl border border-dark-500/50 p-4 space-y-3">
        <div className="relative w-full lg:max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-500" />
          <input
            data-testid="admin-project-search"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search project, client, type, or status"
            className="w-full rounded-xl border border-dark-500/40 bg-dark-800 py-2.5 pl-9 pr-10 text-sm text-warm-100 placeholder-warm-500 focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/20"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-500 hover:text-warm-200"
              aria-label="Clear project search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap" data-testid="admin-project-status-filters">
          {statusOptions.map((status) => {
            const count = status === 'all'
              ? projects.length
              : projects.filter((project) => project.status === status).length;
            const active = statusFilter === status;

            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-lg border px-3 py-1.5 text-[11px] font-medium transition-colors ${
                  active
                    ? 'border-accent/30 bg-accent/15 text-accent'
                    : 'border-dark-500/40 bg-dark-800 text-warm-400 hover:border-dark-400 hover:text-warm-200'
                }`}
              >
                {status === 'all' ? 'All statuses' : status}
                <span className={`ml-1.5 ${active ? 'text-accent/70' : 'text-warm-600'}`}>{count}</span>
              </button>
            );
          })}
          {(searchQuery || statusFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-warm-500 hover:text-warm-200"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="bg-dark-700 rounded-xl border border-dark-500/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="all-projects-table">
            <thead>
              <tr className="border-b border-dark-500/50">
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Client</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Date</th>
                <th className="text-right px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Amount</th>
                <th className="text-right px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-500/30">
              {filteredProjects.map((p, i) => (
                <tr key={p.id} className={i % 2 === 1 ? 'bg-dark-800/40' : ''} data-testid={`project-row-${p.id}`}>
                  <td className="px-5 py-3.5">
                    <div className="text-sm font-medium text-warm-100">{p.name}</div>
                    {formatProjectType(p.project_type) && (
                      <div className="text-[11px] text-warm-500 mt-1">{formatProjectType(p.project_type)}</div>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-warm-400">{p.client_name || '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[p.status] || 'bg-warm-500/15 text-warm-400'}`}>{p.status || '—'}</span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-warm-400">{formatProjectDate(p.project_date)}</td>
                  <td className="px-5 py-3.5 text-sm text-warm-100 text-right font-medium">
                    {p.estimated_amount ? `$${p.estimated_amount.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => navigate(`/project/${p.id}`)}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-accent hover:bg-dark-600"
                    >
                      Open
                      <ArrowUpRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-warm-500">
                    No projects match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {projects.length > 0 && (
          <div className="border-t border-dark-500/50 px-5 py-3 text-[11px] text-warm-500">
            {completedProjects} completed or lost project{completedProjects !== 1 ? 's' : ''} archived in the history set.
          </div>
        )}
      </div>
    </div>
  );
}
