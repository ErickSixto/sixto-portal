import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';
import { Download, Package, Clock, CheckCircle2, Loader2 } from 'lucide-react';

const statusConfig = {
  'Pending': { color: 'bg-gray-100 text-gray-600', icon: Clock },
  'In Progress': { color: 'bg-yellow-50 text-yellow-700', icon: Loader2 },
  'Delivered': { color: 'bg-blue-50 text-blue-600', icon: Package },
  'Accepted': { color: 'bg-green-50 text-green-700', icon: CheckCircle2 },
};

export default function DeliverablesPage() {
  const { selectedProject } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedProject) return;
    setLoading(true);
    api(`/api/portal/project/${selectedProject.id}/deliverables`)
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedProject]);

  if (!selectedProject) return <div className="text-secondary text-center py-20">No project selected.</div>;
  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div data-testid="deliverables-page" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">Deliverables</h1>
        <p className="text-secondary text-sm mt-1">{items.filter(i => i.status === 'Delivered' || i.status === 'Accepted').length} of {items.length} delivered</p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-border text-center">
          <Package size={40} className="mx-auto text-secondary/40 mb-3" />
          <p className="text-secondary">No deliverables available for this project.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(item => {
            const cfg = statusConfig[item.status] || statusConfig['Pending'];
            const Icon = cfg.icon;
            return (
              <div key={item.id} data-testid={`deliverable-${item.id}`} className="bg-white rounded-xl border border-border p-6 hover:border-accent/40 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-charcoal text-sm">{item.name}</h3>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                    <Icon size={12} />
                    {item.status || 'Pending'}
                  </span>
                </div>
                {item.description && <p className="text-sm text-body mb-3 line-clamp-3">{item.description}</p>}
                <div className="flex items-center gap-4 text-xs text-secondary">
                  {item.due_date && <span>Due: {item.due_date?.start || item.due_date}</span>}
                  {item.delivered_date && <span>Delivered: {item.delivered_date?.start || item.delivered_date}</span>}
                </div>
                {item.files && item.files.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-border">
                    {item.files.map((f, i) => (
                      <a key={i} href={f.url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent-hover font-medium mr-3"
                        data-testid={`download-${item.id}-${i}`}
                      >
                        <Download size={14} />
                        {f.name || 'Download'}
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
