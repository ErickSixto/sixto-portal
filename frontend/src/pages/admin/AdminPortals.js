import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { Settings, CheckCircle2, XCircle, Search } from 'lucide-react';
import AdminSummaryCard from '../../components/admin/AdminSummaryCard';
import AdminSearchInput from '../../components/admin/AdminSearchInput';
import AdminFilterChips from '../../components/admin/AdminFilterChips';

function Toggle({ on }) {
  return on ? <CheckCircle2 size={14} className="text-green-400" /> : <XCircle size={14} className="text-warm-600" />;
}

const SECTION_KEYS = ['show_tasks', 'show_meetings', 'show_invoices', 'show_deliverables', 'show_roadmap', 'show_documents', 'show_feedback'];

function enabledSectionCount(portal) {
  return SECTION_KEYS.filter((key) => portal[key]).length;
}

export default function AdminPortals() {
  const [portals, setPortals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    api('/api/admin/portals').then(setPortals).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const statusOptions = ['all', ...new Set(portals.map((portal) => portal.status).filter(Boolean))].map((status) => ({
    key: status,
    label: status === 'all' ? 'All statuses' : status,
  }));
  const filteredPortals = portals.filter((portal) => {
    const matchesStatus = statusFilter === 'all' || portal.status === statusFilter;
    if (!matchesStatus) return false;
    if (!normalizedQuery) return true;

    const haystack = [
      portal.name,
      portal.portal_title,
      portal.portal_intro,
      portal.contact_email,
      portal.support_contact,
      portal.status,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
  const activePortals = portals.filter((portal) => portal.status === 'Active').length;
  const draftPortals = portals.filter((portal) => !portal.status || portal.status === 'Draft').length;
  const averageSections = portals.length > 0
    ? (portals.reduce((sum, portal) => sum + enabledSectionCount(portal), 0) / portals.length).toFixed(1)
    : '0.0';
  const statusCounts = {
    all: portals.length,
    ...Object.fromEntries(
      statusOptions
        .filter((option) => option.key !== 'all')
        .map((option) => [option.key, portals.filter((portal) => portal.status === option.key).length])
    ),
  };

  return (
    <div data-testid="admin-portals-page" className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-warm-50">Portal Configurations</h1>
        <p className="text-warm-400 text-xs mt-1">Review which sections are visible before a client ever opens the portal.</p>
      </div>

      {portals.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <AdminSummaryCard label="Configurations" value={portals.length} />
          <AdminSummaryCard label="Active" value={activePortals} accent="text-green-400" />
          <AdminSummaryCard label="Avg Sections Enabled" value={averageSections} accent="text-accent" helper={`of ${SECTION_KEYS.length}`} />
        </div>
      )}

      {portals.length > 0 && (
        <div className="bg-dark-700 rounded-xl border border-dark-500/50 p-4 space-y-3">
          <AdminSearchInput
            testId="admin-portal-search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search portal title, support contact, or status"
            clearLabel="Clear portal search"
          />
          <AdminFilterChips
            testId="admin-portal-status-filters"
            options={statusOptions}
            activeValue={statusFilter}
            onChange={setStatusFilter}
            counts={statusCounts}
            showClear={Boolean(searchQuery || statusFilter !== 'all')}
            onClear={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
          />
        </div>
      )}

      {portals.length === 0 ? (
        <div className="bg-dark-700 rounded-xl p-12 border border-dark-500/50 text-center">
          <Settings size={32} className="mx-auto text-warm-600 mb-2" />
          <p className="text-warm-500 text-sm">No portal configurations found.</p>
        </div>
      ) : filteredPortals.length === 0 ? (
        <div className="bg-dark-700 rounded-xl p-12 border border-dark-500/50 text-center">
          <Search size={32} className="mx-auto text-warm-600 mb-2" />
          <p className="text-warm-500 text-sm">No portal configurations match the current filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPortals.map(p => (
            <div key={p.id} className="bg-dark-700 rounded-xl border border-dark-500/40 overflow-hidden" data-testid={`portal-config-${p.id}`}>
              <button onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                className="w-full flex items-center justify-between p-5 hover:bg-dark-600/30 transition-colors text-left"
              >
                <div>
                  <h3 className="text-sm font-semibold text-warm-100">{p.name}</h3>
                  <div className="flex items-center gap-2 flex-wrap mt-0.5">
                    {p.portal_title && <p className="text-xs text-warm-400">{p.portal_title}</p>}
                    <span className="text-[10px] text-warm-600">{enabledSectionCount(p)}/{SECTION_KEYS.length} sections enabled</span>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  p.status === 'Active' ? 'bg-green-500/15 text-green-400' : 'bg-warm-500/15 text-warm-400'
                }`}>{p.status || 'Draft'}</span>
              </button>
              {expanded === p.id && (
                <div className="px-5 pb-5 border-t border-dark-500/30 pt-4">
                  {p.portal_intro && <p className="text-xs text-warm-400 mb-3">{p.portal_intro}</p>}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                    {SECTION_KEYS.map(key => (
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

      {draftPortals > 0 && (
        <div className="rounded-xl border border-dark-500/40 bg-dark-800 p-4 text-[11px] text-warm-500">
          {draftPortals} portal configuration{draftPortals !== 1 ? 's are' : ' is'} still in draft status and may need a final review before client launch.
        </div>
      )}
    </div>
  );
}
