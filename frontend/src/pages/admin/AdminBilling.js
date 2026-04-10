import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { ExternalLink, Search, X } from 'lucide-react';

const statusColors = {
  'Draft': 'bg-warm-500/15 text-warm-400',
  'Sent': 'bg-blue-500/15 text-blue-400',
  'Paid': 'bg-green-500/15 text-green-400',
  'Overdue': 'bg-red-500/15 text-red-400',
  'Cancelled': 'bg-warm-600/15 text-warm-500',
};

export default function AdminBilling() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    api('/api/admin/billing').then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!data) return <div className="text-warm-500 text-center py-20 text-sm">Failed to load billing.</div>;

  const tabs = [
    { key: 'all', label: `All (${data.invoices.length})` },
    { key: 'outstanding', label: `Outstanding (${data.outstanding.length})` },
    { key: 'paid', label: `Paid (${data.recent_paid.length})` },
  ];
  const shown = tab === 'outstanding' ? data.outstanding : tab === 'paid' ? data.recent_paid : data.invoices;
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const statusOptions = ['all', ...new Set(data.invoices.map((invoice) => invoice.payment_status || (invoice.paid ? 'Paid' : 'Draft')).filter(Boolean))];
  const filteredInvoices = shown.filter((invoice) => {
    const displayStatus = invoice.payment_status || (invoice.paid ? 'Paid' : 'Draft');
    const matchesStatus = statusFilter === 'all' || displayStatus === statusFilter;
    if (!matchesStatus) return false;
    if (!normalizedQuery) return true;

    const haystack = [
      invoice.no,
      invoice.issued_to,
      displayStatus,
      invoice.type,
      invoice.due_date?.start,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });

  return (
    <div data-testid="admin-billing-page" className="space-y-6">
      <h1 className="text-xl font-bold text-warm-50">Billing Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-dark-700 rounded-xl p-5 border border-dark-500/50">
          <div className="text-xs text-warm-400 mb-1">Total Revenue</div>
          <div className="text-xl font-bold text-warm-50">${(data.summary.total_revenue || 0).toLocaleString()}</div>
        </div>
        <div className="bg-dark-700 rounded-xl p-5 border border-dark-500/50">
          <div className="text-xs text-warm-400 mb-1">Total Paid</div>
          <div className="text-xl font-bold text-green-400">${(data.summary.total_paid || 0).toLocaleString()}</div>
        </div>
        <div className="bg-dark-700 rounded-xl p-5 border border-dark-500/50">
          <div className="text-xs text-warm-400 mb-1">Outstanding</div>
          <div className="text-xl font-bold text-accent">${(data.summary.outstanding || 0).toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-dark-700 rounded-xl border border-dark-500/50 overflow-hidden">
        <div className="flex gap-1 p-3 border-b border-dark-500/50">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                tab === t.key ? 'bg-accent text-dark-950' : 'text-warm-400 hover:text-warm-100 hover:bg-dark-600'
              }`}
              data-testid={`billing-tab-${t.key}`}
            >{t.label}</button>
          ))}
        </div>
        <div className="border-b border-dark-500/50 p-4 space-y-3">
          <div className="relative w-full lg:max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-500" />
            <input
              data-testid="admin-billing-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search invoice, customer email, type, or date"
              className="w-full rounded-xl border border-dark-500/40 bg-dark-800 py-2.5 pl-9 pr-10 text-sm text-warm-100 placeholder-warm-500 focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-500 hover:text-warm-200"
                aria-label="Clear billing search"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap" data-testid="admin-billing-status-filters">
            {statusOptions.map((status) => {
              const count = status === 'all'
                ? shown.length
                : shown.filter((invoice) => (invoice.payment_status || (invoice.paid ? 'Paid' : 'Draft')) === status).length;
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
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="admin-invoices-table">
            <thead>
              <tr className="border-b border-dark-500/50">
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Invoice #</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Customer</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Amount</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Due Date</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Type</th>
                <th className="text-right px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-500/30">
              {filteredInvoices.map((inv, i) => {
                const displayStatus = inv.payment_status || (inv.paid ? 'Paid' : 'Draft');
                return (
                  <tr key={inv.id} className={i % 2 === 1 ? 'bg-dark-800/40' : ''}>
                    <td className="px-5 py-3.5 text-sm font-medium text-warm-100">{inv.no || '—'}</td>
                    <td className="px-5 py-3.5 text-xs text-warm-400">{inv.issued_to || '—'}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-warm-100">${(inv.amount || 0).toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusColors[displayStatus] || 'bg-warm-500/15 text-warm-400'}`}>{displayStatus}</span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-warm-400">{inv.due_date?.start || '—'}</td>
                    <td className="px-5 py-3.5 text-xs text-warm-400">{inv.type || '—'}</td>
                    <td className="px-5 py-3.5 text-right">
                      {inv.stripe_invoice_url ? (
                        <a
                          href={inv.stripe_invoice_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-accent hover:bg-dark-600"
                        >
                          Open
                          <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="text-[11px] text-warm-600">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-warm-500">
                    No invoices match the current tab and filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
