import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';
import { ExternalLink, CreditCard } from 'lucide-react';

const statusColors = {
  'Draft': 'bg-gray-100 text-gray-600',
  'Sent': 'bg-blue-50 text-blue-600',
  'Paid': 'bg-green-50 text-green-700',
  'Overdue': 'bg-red-50 text-red-600',
  'Cancelled': 'bg-yellow-900/10 text-yellow-800',
};

export default function BillingPage() {
  const { selectedProject } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedProject) return;
    setLoading(true);
    api(`/api/portal/project/${selectedProject.id}/billing`)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedProject]);

  if (!selectedProject) return <div className="text-secondary text-center py-20">No project selected.</div>;
  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!data) return <div className="text-secondary text-center py-20">Failed to load billing data.</div>;

  const { invoices, summary } = data;

  return (
    <div data-testid="billing-page" className="space-y-6">
      <h1 className="text-2xl font-bold text-charcoal">Billing</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 border border-border">
          <div className="text-sm text-secondary mb-1">Total Billed</div>
          <div className="text-2xl font-bold text-charcoal" data-testid="total-billed">${(summary.total_billed || 0).toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-border">
          <div className="text-sm text-secondary mb-1">Total Paid</div>
          <div className="text-2xl font-bold text-green-600" data-testid="total-paid">${(summary.total_paid || 0).toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-border">
          <div className="text-sm text-secondary mb-1">Outstanding</div>
          <div className="text-2xl font-bold text-red-600" data-testid="outstanding">${(summary.outstanding || 0).toLocaleString()}</div>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-border text-center">
          <CreditCard size={40} className="mx-auto text-secondary/40 mb-3" />
          <p className="text-secondary">No invoices for this project.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="invoices-table">
              <thead>
                <tr className="border-b border-border bg-oat/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Invoice #</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Amount</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Due Date</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Type</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-secondary uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoices.map((inv, idx) => (
                  <tr key={inv.id} className={idx % 2 === 1 ? 'bg-oat/30' : ''} data-testid={`invoice-${inv.id}`}>
                    <td className="px-6 py-4 text-sm font-medium text-charcoal">{inv.no}</td>
                    <td className="px-6 py-4 text-sm text-charcoal font-semibold">${(inv.amount || 0).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[inv.payment_status] || 'bg-gray-100 text-gray-600'}`}>
                        {inv.payment_status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-secondary">{inv.due_date?.start || inv.due_date || '—'}</td>
                    <td className="px-6 py-4 text-sm text-secondary">{inv.type || '—'}</td>
                    <td className="px-6 py-4 text-right">
                      {inv.stripe_invoice_url && inv.payment_status !== 'Paid' && (
                        <a href={inv.stripe_invoice_url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-accent hover:bg-accent-hover text-charcoal text-xs font-semibold rounded-lg transition-colors"
                          data-testid={`pay-now-${inv.id}`}
                        >
                          Pay Now <ExternalLink size={12} />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
