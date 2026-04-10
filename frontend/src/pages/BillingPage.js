import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';
import { ExternalLink, CreditCard } from 'lucide-react';

const statusColors = {
  'Draft': 'bg-warm-500/15 text-warm-400',
  'Sent': 'bg-blue-500/15 text-blue-400',
  'Paid': 'bg-green-500/15 text-green-400',
  'Overdue': 'bg-red-500/15 text-red-400',
  'Cancelled': 'bg-warm-600/15 text-warm-500',
};

export default function BillingPage() {
  const { selectedProject } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedProject) return;
    setLoading(true);
    api(`/api/portal/project/${selectedProject.id}/billing`)
      .then(setData).catch(console.error).finally(() => setLoading(false));
  }, [selectedProject]);

  if (!selectedProject) return <div className="text-warm-500 text-center py-20 text-sm">No project selected.</div>;
  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!data) return <div className="text-warm-500 text-center py-20 text-sm">Failed to load billing data.</div>;

  const { invoices, summary } = data;

  return (
    <div data-testid="billing-page" className="space-y-6">
      <h1 className="text-xl font-bold text-warm-50">Billing</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-dark-700 rounded-xl p-5 border border-dark-500/50">
          <div className="text-xs text-warm-400 mb-1">Total Billed</div>
          <div className="text-xl font-bold text-warm-50" data-testid="total-billed">${(summary.total_billed || 0).toLocaleString()}</div>
        </div>
        <div className="bg-dark-700 rounded-xl p-5 border border-dark-500/50">
          <div className="text-xs text-warm-400 mb-1">Total Paid</div>
          <div className="text-xl font-bold text-green-400" data-testid="total-paid">${(summary.total_paid || 0).toLocaleString()}</div>
        </div>
        <div className="bg-dark-700 rounded-xl p-5 border border-dark-500/50">
          <div className="text-xs text-warm-400 mb-1">Outstanding</div>
          <div className="text-xl font-bold text-accent" data-testid="outstanding">${(summary.outstanding || 0).toLocaleString()}</div>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="bg-dark-700 rounded-xl p-12 border border-dark-500/50 text-center">
          <CreditCard size={32} className="mx-auto text-warm-600 mb-2" />
          <p className="text-warm-500 text-sm">No invoices for this project.</p>
        </div>
      ) : (
        <div className="bg-dark-700 rounded-xl border border-dark-500/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="invoices-table">
              <thead>
                <tr className="border-b border-dark-500/50">
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Invoice #</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Amount</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Due Date</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Issued</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Type</th>
                  <th className="text-right px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-500/30">
                {invoices.map((inv, idx) => {
                  const displayStatus = inv.payment_status || (inv.paid ? 'Paid' : 'Draft');
                  return (
                    <tr key={inv.id} className={idx % 2 === 1 ? 'bg-dark-800/40' : ''} data-testid={`invoice-${inv.id}`}>
                      <td className="px-5 py-3.5 text-sm font-medium text-warm-100">{inv.no}</td>
                      <td className="px-5 py-3.5 text-sm text-warm-100 font-semibold">${(inv.amount || 0).toLocaleString()}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColors[displayStatus] || 'bg-warm-500/15 text-warm-400'}`}>
                          {displayStatus}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-warm-400">{inv.due_date?.start || inv.due_date || '—'}</td>
                      <td className="px-5 py-3.5 text-xs text-warm-400">{inv.issued_on?.start || inv.issued_on || '—'}</td>
                      <td className="px-5 py-3.5 text-xs text-warm-400">{inv.type || '—'}</td>
                      <td className="px-5 py-3.5 text-right">
                        {inv.stripe_invoice_url && displayStatus !== 'Paid' && (
                          <a href={inv.stripe_invoice_url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 bg-accent hover:bg-accent-light text-dark-950 text-[10px] font-semibold rounded-lg transition-colors"
                            data-testid={`pay-now-${inv.id}`}
                          >
                            Pay Now <ExternalLink size={10} />
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
