import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { Users } from 'lucide-react';
import AdminSummaryCard from '../../components/admin/AdminSummaryCard';
import AdminSearchInput from '../../components/admin/AdminSearchInput';
import AdminFilterChips from '../../components/admin/AdminFilterChips';

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    api('/api/admin/clients').then(setClients).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const statusOptions = ['all', ...new Set(clients.map((client) => client.status).filter(Boolean))].map((status) => ({
    key: status,
    label: status === 'all' ? 'All statuses' : status,
  }));
  const filteredClients = clients.filter((client) => {
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    if (!matchesStatus) return false;
    if (!normalizedQuery) return true;

    const haystack = [
      client.name,
      client.contact_person,
      client.email,
      client.source,
      client.status,
      client.industry,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });

  const activeClients = clients.filter((client) => client.status === 'Active').length;
  const inactiveClients = clients.filter((client) => client.status && client.status !== 'Active').length;
  const uniqueSources = new Set(clients.map((client) => client.source).filter(Boolean)).size;
  const statusCounts = {
    all: clients.length,
    ...Object.fromEntries(
      statusOptions
        .filter((option) => option.key !== 'all')
        .map((option) => [option.key, clients.filter((client) => client.status === option.key).length])
    ),
  };

  return (
    <div data-testid="admin-clients-page" className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-warm-50">All Clients</h1>
          <p className="text-warm-400 text-xs mt-1">Find contacts quickly and keep an eye on account health.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-dark-500/40 bg-dark-800 px-3 py-1.5 text-[11px] text-warm-400">
          <Users size={13} className="text-accent" />
          {filteredClients.length} shown
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <AdminSummaryCard label="Clients" value={clients.length} />
        <AdminSummaryCard label="Active" value={activeClients} accent="text-green-400" />
        <AdminSummaryCard label="Sources" value={uniqueSources} accent="text-accent" />
      </div>

      <div className="bg-dark-700 rounded-xl border border-dark-500/50 p-4 space-y-3">
        <AdminSearchInput
          testId="admin-client-search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search company, contact, email, source, or industry"
          clearLabel="Clear client search"
        />

        <AdminFilterChips
          testId="admin-client-status-filters"
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
              {filteredClients.map((c, i) => (
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
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-warm-500">
                    No clients match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {clients.length > 0 && (
          <div className="border-t border-dark-500/50 px-5 py-3 text-[11px] text-warm-500">
            {inactiveClients} client account{inactiveClients !== 1 ? 's' : ''} are currently outside the Active state.
          </div>
        )}
      </div>
    </div>
  );
}
