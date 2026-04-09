import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';
import { FileText, Download, ExternalLink } from 'lucide-react';

function DocSection({ title, items, emptyMsg }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <h2 className="text-lg font-semibold text-charcoal mb-3">{title}</h2>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={item.id || i} className="bg-white rounded-xl border border-border p-5 flex items-center justify-between" data-testid={`doc-${item.id || i}`}>
            <div className="flex items-center gap-3 min-w-0">
              <FileText size={20} className="text-secondary flex-shrink-0" />
              <div className="min-w-0">
                <div className="font-medium text-charcoal text-sm truncate">{item.name}</div>
                {item.status && <span className="text-xs text-secondary">{item.status}</span>}
                {item.type && <span className="text-xs text-secondary ml-2 bg-oat px-2 py-0.5 rounded">{item.type}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {item.files && item.files.map((f, fi) => (
                <a key={fi} href={f.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-accent hover:text-accent-hover"
                  data-testid={`doc-download-${i}-${fi}`}
                >
                  <Download size={14} /> {f.name || 'Download'}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  const { selectedProject } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedProject) return;
    setLoading(true);
    api(`/api/portal/project/${selectedProject.id}/documents`)
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

  const hasData = data && (
    (data.deliverable_files?.length > 0) ||
    (data.proposals?.length > 0) ||
    (data.contracts?.length > 0)
  );

  return (
    <div data-testid="documents-page" className="space-y-8">
      <h1 className="text-2xl font-bold text-charcoal">Documents</h1>

      {!hasData ? (
        <div className="bg-white rounded-xl p-12 border border-border text-center">
          <FileText size={40} className="mx-auto text-secondary/40 mb-3" />
          <p className="text-secondary">No documents available for this project.</p>
        </div>
      ) : (
        <>
          <DocSection title="Proposals" items={data.proposals} />
          <DocSection title="Contracts" items={data.contracts} />
          <DocSection title="Deliverable Files" items={data.deliverable_files} />
        </>
      )}
    </div>
  );
}
