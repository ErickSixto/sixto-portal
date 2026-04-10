import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';
import { Download, Package, Clock, CheckCircle2, Loader2 } from 'lucide-react';

const statusConfig = {
  'Pending': { color: 'bg-warm-500/15 text-warm-400', icon: Clock },
  'In Progress': { color: 'bg-accent/15 text-accent', icon: Loader2 },
  'Delivered': { color: 'bg-blue-500/15 text-blue-400', icon: Package },
  'Accepted': { color: 'bg-green-500/15 text-green-400', icon: CheckCircle2 },
};

export default function DeliverablesPage() {
  const { selectedProject } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedProject) return;
    setLoading(true);
    api(`/api/portal/project/${selectedProject.id}/deliverables`)
      .then(setItems).catch(console.error).finally(() => setLoading(false));
  }, [selectedProject]);

  if (!selectedProject) return <div className="text-warm-500 text-center py-20 text-sm">No project selected.</div>;
  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const delivered = items.filter(i => i.status === 'Delivered' || i.status === 'Accepted').length;

  return (
    <div data-testid="deliverables-page" className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-warm-50">Deliverables</h1>
        <p className="text-warm-500 text-xs mt-1">{delivered} of {items.length} delivered</p>
      </div>

      {items.length === 0 ? (
        <div className="bg-dark-700 rounded-xl p-12 border border-dark-500/50 text-center">
          <Package size={32} className="mx-auto text-warm-600 mb-2" />
          <p className="text-warm-500 text-sm">No deliverables available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map(item => {
            const cfg = statusConfig[item.status] || statusConfig['Pending'];
            const Icon = cfg.icon;
            return (
              <div key={item.id} data-testid={`deliverable-${item.id}`} className="bg-dark-700 rounded-xl border border-dark-500/40 p-5 hover:border-accent/20 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-warm-100">{item.name}</h3>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${cfg.color}`}>
                    <Icon size={10} /> {item.status || 'Pending'}
                  </span>
                </div>
                {item.description && <p className="text-xs text-warm-400 mb-3 line-clamp-3">{item.description}</p>}
                <div className="flex items-center gap-3 text-[10px] text-warm-500">
                  {item.due_date && <span>Due: {item.due_date?.start || item.due_date}</span>}
                  {item.delivered_date && <span>Delivered: {item.delivered_date?.start || item.delivered_date}</span>}
                </div>
                {item.files && item.files.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-dark-500/40">
                    {item.files.map((f, i) => (
                      <a key={i} href={f.url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent-light font-medium mr-3"
                        data-testid={`download-${item.id}-${i}`}
                      >
                        <Download size={12} /> {f.name || 'Download'}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
