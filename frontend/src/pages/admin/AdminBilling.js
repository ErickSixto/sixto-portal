import React, { useState, useEffect } from 'react';
import { api } from '../../api';

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
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="admin-invoices-table">
            <thead>
              <tr className="border-b border-dark-500/50">
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Invoice #</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Amount</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Due Date</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-500/30">
              {shown.map((inv, i) => {
                const displayStatus = inv.payment_status || (inv.paid ? 'Paid' : 'Draft');
                return (
                  <tr key={inv.id} className={i % 2 === 1 ? 'bg-dark-800/40' : ''}>
                    <td className="px-5 py-3.5 text-sm font-medium text-warm-100">{inv.no || '—'}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-warm-100">${(inv.amount || 0).toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusColors[displayStatus] || 'bg-warm-500/15 text-warm-400'}`}>{displayStatus}</span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-warm-400">{inv.due_date?.start || '—'}</td>
                    <td className="px-5 py-3.5 text-xs text-warm-400">{inv.type || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
