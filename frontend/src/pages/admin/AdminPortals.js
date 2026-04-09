import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { Settings, CheckCircle2, XCircle } from 'lucide-react';

const statusColors = {
  'Draft': 'bg-gray-100 text-gray-600',
  'Active': 'bg-green-50 text-green-700',
  'Archived': 'bg-red-50 text-red-600',
};

function Toggle({ on }) {
  return on ? <CheckCircle2 size={16} className="text-green-500" /> : <XCircle size={16} className="text-gray-300" />;
}

export default function AdminPortals() {
  const [portals, setPortals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api('/api/admin/portals').then(setPortals).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div data-testid="admin-portals-page" className="space-y-6">
      <h1 className="text-2xl font-bold text-charcoal">Portal Configurations</h1>

      {portals.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-border text-center">
          <Settings size={40} className="mx-auto text-secondary/40 mb-3" />
          <p className="text-secondary">No portal configurations found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {portals.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-border overflow-hidden" data-testid={`portal-config-${p.id}`}>
              <button
                onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                className="w-full flex items-center justify-between p-6 hover:bg-oat/30 transition-colors"
              >
                <div className="text-left">
                  <h3 className="font-semibold text-charcoal">{p.name}</h3>
                  {p.portal_title && <p className="text-sm text-secondary mt-0.5">{p.portal_title}</p>}
                </div>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColors[p.status] || 'bg-gray-100 text-gray-600'}`}>
                  {p.status || 'Draft'}
                </span>
              </button>

              {expanded === p.id && (
                <div className="px-6 pb-6 border-t border-border pt-4">
                  {p.portal_intro && <p className="text-sm text-body mb-4">{p.portal_intro}</p>}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {['show_tasks', 'show_meetings', 'show_invoices', 'show_deliverables', 'show_roadmap', 'show_documents', 'show_feedback'].map(key => (
                      <div key={key} className="flex items-center gap-2">
                        <Toggle on={p[key]} />
                        <span className="text-sm text-body capitalize">{key.replace('show_', '')}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {p.contact_email && <div><span className="text-secondary">Contact:</span> <span className="text-charcoal">{p.contact_email}</span></div>}
                    {p.support_contact && <div><span className="text-secondary">Support:</span> <span className="text-charcoal">{p.support_contact}</span></div>}
                    {p.cta_label && <div><span className="text-secondary">CTA:</span> <span className="text-charcoal">{p.cta_label}</span></div>}
                    {p.cta_url && <div><span className="text-secondary">CTA URL:</span> <a href={p.cta_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{p.cta_url}</a></div>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
