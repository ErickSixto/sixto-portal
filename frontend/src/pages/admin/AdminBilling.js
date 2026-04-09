import React, { useState, useEffect } from 'react';
import { api } from '../../api';

const statusColors = {
  'Draft': 'bg-gray-100 text-gray-600',
  'Sent': 'bg-blue-50 text-blue-600',
  'Paid': 'bg-green-50 text-green-700',
  'Overdue': 'bg-red-50 text-red-600',
  'Cancelled': 'bg-yellow-900/10 text-yellow-800',
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
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!data) return <div className="text-secondary text-center py-20">Failed to load billing data.</div>;

  const tabs = [
    { key: 'all', label: `All (${data.invoices.length})` },
    { key: 'outstanding', label: `Outstanding (${data.outstanding.length})` },
    { key: 'paid', label: `Paid (${data.recent_paid.length})` },
  ];

  const shown = tab === 'outstanding' ? data.outstanding : tab === 'paid' ? data.recent_paid : data.invoices;

  return (
    <div data-testid="admin-billing-page" className="space-y-6">
      <h1 className="text-2xl font-bold text-charcoal">Billing Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 border border-border">
          <div className="text-sm text-secondary mb-1">Total Revenue</div>
          <div className="text-2xl font-bold text-charcoal">${(data.summary.total_revenue || 0).toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-border">
          <div className="text-sm text-secondary mb-1">Total Paid</div>
          <div className="text-2xl font-bold text-green-600">${(data.summary.total_paid || 0).toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-border">
          <div className="text-sm text-secondary mb-1">Outstanding</div>
          <div className="text-2xl font-bold text-red-600">${(data.summary.outstanding || 0).toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="flex gap-1 p-3 border-b border-border bg-oat/30">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? 'bg-charcoal text-white' : 'text-secondary hover:text-charcoal'}`}
              data-testid={`billing-tab-${t.key}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="admin-invoices-table">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-xs font-semibold text-secondary uppercase">Invoice #</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-secondary uppercase">Amount</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-secondary uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-secondary uppercase">Due Date</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-secondary uppercase">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {shown.map((inv, i) => (
                <tr key={inv.id} className={i % 2 === 1 ? 'bg-oat/30' : ''}>
                  <td className="px-6 py-4 text-sm font-medium text-charcoal">{inv.no}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-charcoal">${(inv.amount || 0).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${statusColors[inv.payment_status] || 'bg-gray-100 text-gray-600'}`}>
                      {inv.payment_status || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-secondary">{inv.due_date?.start || '—'}</td>
                  <td className="px-6 py-4 text-sm text-secondary">{inv.type || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
