import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useNavigate } from 'react-router-dom';
import { Layers, ArrowUpRight } from 'lucide-react';
import AdminSummaryCard from '../../components/admin/AdminSummaryCard';
import AdminSearchInput from '../../components/admin/AdminSearchInput';
import AdminFilterChips from '../../components/admin/AdminFilterChips';

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
  const statusOptions = ['all', ...new Set(projects.map((project) => project.status).filter(Boolean))].map((status) => ({
    key: status,
    label: status === 'all' ? 'All statuses' : status,
  }));
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
  const statusCounts = {
    all: projects.length,
    ...Object.fromEntries(
      statusOptions
        .filter((option) => option.key !== 'all')
        .map((option) => [option.key, projects.filter((project) => project.status === option.key).length])
    ),
  };

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
        <AdminSummaryCard label="Projects" value={projects.length} />
        <AdminSummaryCard label="Active" value={activeProjects} accent="text-accent" />
        <AdminSummaryCard label="Pipeline Value" value={`$${pipelineValue.toLocaleString()}`} accent="text-green-400" />
      </div>

      <div className="bg-dark-700 rounded-xl border border-dark-500/50 p-4 space-y-3">
        <AdminSearchInput
          testId="admin-project-search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search project, client, type, or status"
          clearLabel="Clear project search"
        />

        <AdminFilterChips
          testId="admin-project-status-filters"
          options={statusOptions}
          activeValue={statusFilter}
          onChange={setStatusFilter}
          counts={statusCounts}
          showClear={Boolean(searchQuery || statusFilter !== 'all')}
          onClear={() => {
            setSearchQuery('');
            setStatusFilter('all');
          }}
        />
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
