import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { Settings, CheckCircle2, XCircle } from 'lucide-react';

function Toggle({ on }) {
  return on ? <CheckCircle2 size={14} className="text-green-400" /> : <XCircle size={14} className="text-warm-600" />;
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
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div data-testid="admin-portals-page" className="space-y-6">
      <h1 className="text-xl font-bold text-warm-50">Portal Configurations</h1>
      {portals.length === 0 ? (
        <div className="bg-dark-700 rounded-xl p-12 border border-dark-500/50 text-center">
          <Settings size={32} className="mx-auto text-warm-600 mb-2" />
          <p className="text-warm-500 text-sm">No portal configurations found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {portals.map(p => (
            <div key={p.id} className="bg-dark-700 rounded-xl border border-dark-500/40 overflow-hidden" data-testid={`portal-config-${p.id}`}>
              <button onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                className="w-full flex items-center justify-between p-5 hover:bg-dark-600/30 transition-colors text-left"
              >
                <div>
                  <h3 className="text-sm font-semibold text-warm-100">{p.name}</h3>
                  {p.portal_title && <p className="text-xs text-warm-400 mt-0.5">{p.portal_title}</p>}
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  p.status === 'Active' ? 'bg-green-500/15 text-green-400' : 'bg-warm-500/15 text-warm-400'
                }`}>{p.status || 'Draft'}</span>
              </button>
              {expanded === p.id && (
                <div className="px-5 pb-5 border-t border-dark-500/30 pt-4">
                  {p.portal_intro && <p className="text-xs text-warm-400 mb-3">{p.portal_intro}</p>}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                    {['show_tasks', 'show_meetings', 'show_invoices', 'show_deliverables', 'show_roadmap', 'show_documents', 'show_feedback'].map(key => (
                      <div key={key} className="flex items-center gap-1.5">
                        <Toggle on={p[key]} />
                        <span className="text-xs text-warm-300 capitalize">{key.replace('show_', '')}</span>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {p.contact_email && <div><span className="text-warm-500">Contact:</span> <span className="text-warm-200">{p.contact_email}</span></div>}
                    {p.support_contact && <div><span className="text-warm-500">Support:</span> <span className="text-warm-200">{p.support_contact}</span></div>}
                    {p.cta_label && <div><span className="text-warm-500">CTA:</span> <span className="text-warm-200">{p.cta_label}</span></div>}
                    {p.cta_url && <div><span className="text-warm-500">CTA URL:</span> <a href={p.cta_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-light">{p.cta_url}</a></div>}
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
