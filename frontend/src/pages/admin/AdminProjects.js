import React, { useState, useEffect } from 'react';
import { api } from '../../api';

const statusColors = {
  'Not started': 'bg-gray-100 text-gray-600',
  'Onboarding': 'bg-blue-50 text-blue-600',
  'Research': 'bg-purple-50 text-purple-600',
  'In progress': 'bg-yellow-50 text-yellow-700',
  'Off boarding': 'bg-orange-50 text-orange-600',
  'Done': 'bg-green-50 text-green-700',
  'Lost': 'bg-red-50 text-red-600',
};

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/api/admin/projects').then(setProjects).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div data-testid="admin-projects-page" className="space-y-6">
      <h1 className="text-2xl font-bold text-charcoal">All Projects</h1>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="all-projects-table">
            <thead>
              <tr className="border-b border-border bg-oat/50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-secondary uppercase">Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-secondary uppercase">Client</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-secondary uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-secondary uppercase">Date</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-secondary uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projects.map((p, i) => (
                <tr key={p.id} className={i % 2 === 1 ? 'bg-oat/30' : ''} data-testid={`project-row-${p.id}`}>
                  <td className="px-6 py-4 text-sm font-medium text-charcoal">{p.name}</td>
                  <td className="px-6 py-4 text-sm text-body">{p.client_name || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColors[p.status] || 'bg-gray-100 text-gray-600'}`}>
                      {p.status || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-secondary">
                    {p.project_date ? `${p.project_date.start || ''}${p.project_date.end ? ` — ${p.project_date.end}` : ''}` : '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-charcoal text-right font-medium">
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
