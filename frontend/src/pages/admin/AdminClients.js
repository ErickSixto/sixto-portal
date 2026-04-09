import React, { useState, useEffect } from 'react';
import { api } from '../../api';

const statusColors = {
  'Active': 'bg-green-50 text-green-700',
  'Inactive': 'bg-gray-100 text-gray-600',
};

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/api/admin/clients').then(setClients).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div data-testid="admin-clients-page" className="space-y-6">
      <h1 className="text-2xl font-bold text-charcoal">All Clients</h1>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="all-clients-table">
            <thead>
              <tr className="border-b border-border bg-oat/50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-secondary uppercase">Company Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-secondary uppercase">Contact Person</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-secondary uppercase">Email</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-secondary uppercase">Source</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-secondary uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-secondary uppercase">Industry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {clients.map((c, i) => (
                <tr key={c.id} className={i % 2 === 1 ? 'bg-oat/30' : ''} data-testid={`client-row-${c.id}`}>
                  <td className="px-6 py-4 text-sm font-medium text-charcoal">{c.name}</td>
                  <td className="px-6 py-4 text-sm text-body">{c.contact_person || '—'}</td>
                  <td className="px-6 py-4 text-sm text-body">{c.email || '—'}</td>
                  <td className="px-6 py-4 text-sm text-secondary">{c.source || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColors[c.status] || 'bg-gray-100 text-gray-600'}`}>
                      {c.status || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-secondary">{c.industry || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
