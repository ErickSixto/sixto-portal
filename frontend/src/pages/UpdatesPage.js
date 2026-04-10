import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';
import { Bell } from 'lucide-react';

const typeColors = {
  'Status Update': 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  'Milestone': 'bg-accent/15 text-accent border-accent/20',
  'Announcement': 'bg-purple-500/15 text-purple-400 border-purple-500/20',
};

export default function UpdatesPage() {
  const { selectedProject } = useAuth();
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedProject) return;
    setLoading(true);
    api(`/api/portal/project/${selectedProject.id}/updates`)
      .then(setUpdates).catch(console.error).finally(() => setLoading(false));
  }, [selectedProject]);

  if (!selectedProject) return <div className="text-warm-500 text-center py-20 text-sm">No project selected.</div>;
  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div data-testid="updates-page" className="space-y-6">
      <h1 className="text-xl font-bold text-warm-50">Updates</h1>
      {updates.length === 0 ? (
        <div className="bg-dark-700 rounded-xl p-12 border border-dark-500/50 text-center">
          <Bell size={32} className="mx-auto text-warm-600 mb-2" />
          <p className="text-warm-500 text-sm">No updates available.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {updates.map(u => (
            <div key={u.id} data-testid={`update-${u.id}`} className="bg-dark-700 rounded-xl border border-dark-500/40 p-5">
              <div className="flex items-center gap-2 mb-2">
                {u.type && (
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${typeColors[u.type] || 'bg-warm-500/15 text-warm-400 border-warm-500/20'}`}>
                    {u.type}
                  </span>
                )}
                <span className="text-[10px] text-warm-500">{u.date?.start || ''}</span>
              </div>
              <h3 className="text-sm font-semibold text-warm-100 mb-1">{u.name}</h3>
              {u.content && <p className="text-xs text-warm-400 whitespace-pre-line leading-relaxed">{u.content}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
