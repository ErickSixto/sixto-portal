import React, { useState, useEffect } from 'react';
import { api } from '../../api';

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/api/admin/clients').then(setClients).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div data-testid="admin-clients-page" className="space-y-6">
      <h1 className="text-xl font-bold text-warm-50">All Clients</h1>
      <div className="bg-dark-700 rounded-xl border border-dark-500/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="all-clients-table">
            <thead>
              <tr className="border-b border-dark-500/50">
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Company</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Contact</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Source</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Industry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-500/30">
              {clients.map((c, i) => (
                <tr key={c.id} className={i % 2 === 1 ? 'bg-dark-800/40' : ''} data-testid={`client-row-${c.id}`}>
                  <td className="px-5 py-3.5 text-sm font-medium text-warm-100">{c.name}</td>
                  <td className="px-5 py-3.5 text-xs text-warm-400">{c.contact_person || '—'}</td>
                  <td className="px-5 py-3.5 text-xs text-warm-300">{c.email || '—'}</td>
                  <td className="px-5 py-3.5 text-xs text-warm-400">{c.source || '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      c.status === 'Active' ? 'bg-green-500/15 text-green-400' : 'bg-warm-500/15 text-warm-400'
                    }`}>{c.status || '—'}</span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-warm-400">{c.industry || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
