import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';
import { FileText, Download } from 'lucide-react';

function DocSection({ title, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <h2 className="text-sm font-semibold text-warm-100 mb-2">{title}</h2>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={item.id || i} className="bg-dark-700 rounded-xl border border-dark-500/40 p-4 flex items-center justify-between" data-testid={`doc-${item.id || i}`}>
            <div className="flex items-center gap-3 min-w-0">
              <FileText size={16} className="text-warm-500 shrink-0" />
              <div className="min-w-0">
                <div className="text-sm text-warm-100 truncate">{item.name}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  {item.status && <span className="text-[10px] text-warm-500">{item.status}</span>}
                  {item.type && <span className="text-[10px] text-warm-500 bg-dark-600 px-1.5 py-0.5 rounded">{item.type}</span>}
                  {item.date?.start && <span className="text-[10px] text-warm-500">{item.date.start}</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {item.files && item.files.map((f, fi) => (
                <a key={fi} href={f.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-accent hover:text-accent-light"
                  data-testid={`doc-download-${i}-${fi}`}
                >
                  <Download size={12} /> {f.name || 'Download'}
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
      .then(setData).catch(console.error).finally(() => setLoading(false));
  }, [selectedProject]);

  if (!selectedProject) return <div className="text-warm-500 text-center py-20 text-sm">No project selected.</div>;
  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const hasData = data && ((data.deliverable_files?.length > 0) || (data.proposals?.length > 0) || (data.contracts?.length > 0));

  return (
    <div data-testid="documents-page" className="space-y-6">
      <h1 className="text-xl font-bold text-warm-50">Documents</h1>
      {!hasData ? (
        <div className="bg-dark-700 rounded-xl p-12 border border-dark-500/50 text-center">
          <FileText size={32} className="mx-auto text-warm-600 mb-2" />
          <p className="text-warm-500 text-sm">No documents available.</p>
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
