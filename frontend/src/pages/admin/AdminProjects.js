import React, { useState, useEffect } from 'react';
import { api } from '../../api';

const statusColors = {
  'Not started': 'bg-warm-500/15 text-warm-400',
  'Onboarding': 'bg-blue-500/15 text-blue-400',
  'Research': 'bg-purple-500/15 text-purple-400',
  'In progress': 'bg-accent/15 text-accent',
  'Off boarding': 'bg-orange-500/15 text-orange-400',
  'Done': 'bg-green-500/15 text-green-400',
  'Lost': 'bg-red-500/15 text-red-400',
};

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/api/admin/projects').then(setProjects).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div data-testid="admin-projects-page" className="space-y-6">
      <h1 className="text-xl font-bold text-warm-50">All Projects</h1>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-500/30">
              {projects.map((p, i) => (
                <tr key={p.id} className={i % 2 === 1 ? 'bg-dark-800/40' : ''} data-testid={`project-row-${p.id}`}>
                  <td className="px-5 py-3.5 text-sm font-medium text-warm-100">{p.name}</td>
                  <td className="px-5 py-3.5 text-xs text-warm-400">{p.client_name || '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[p.status] || 'bg-warm-500/15 text-warm-400'}`}>{p.status || '—'}</span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-warm-400">
                    {p.project_date ? `${p.project_date.start || ''}${p.project_date.end ? ` — ${p.project_date.end}` : ''}` : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-warm-100 text-right font-medium">
                    {p.estimated_amount ? `$${p.estimated_amount.toLocaleString()}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
