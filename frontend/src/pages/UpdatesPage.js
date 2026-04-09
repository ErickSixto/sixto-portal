import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';
import { Bell } from 'lucide-react';

const typeColors = {
  'Status Update': 'bg-blue-50 text-blue-600 border-blue-200',
  'Milestone': 'bg-accent/20 text-yellow-700 border-accent/30',
  'Announcement': 'bg-purple-50 text-purple-600 border-purple-200',
  'Request': 'bg-orange-50 text-orange-600 border-orange-200',
};

export default function UpdatesPage() {
  const { selectedProject } = useAuth();
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedProject) return;
    setLoading(true);
    api(`/api/portal/project/${selectedProject.id}/updates`)
      .then(setUpdates)
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
    <div data-testid="updates-page" className="space-y-6">
      <h1 className="text-2xl font-bold text-charcoal">Updates</h1>

      {updates.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-border text-center">
          <Bell size={40} className="mx-auto text-secondary/40 mb-3" />
          <p className="text-secondary">No updates available for this project.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {updates.map(u => (
            <div key={u.id} data-testid={`update-${u.id}`} className="bg-white rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-3">
                {u.type && (
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${typeColors[u.type] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                    {u.type}
                  </span>
                )}
                <span className="text-xs text-secondary">{u.date?.start || ''}</span>
              </div>
              <h3 className="text-base font-semibold text-charcoal mb-2">{u.name}</h3>
              {u.content && <p className="text-sm text-body whitespace-pre-line">{u.content}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
