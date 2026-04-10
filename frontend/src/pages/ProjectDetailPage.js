import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';
import {
  ArrowLeft, LogOut, LayoutDashboard, Package, FileText, Calendar,
  Bell, MessageSquare, CheckCircle2, Clock, Loader2, XCircle,
  AlertCircle, Download, ExternalLink, Users, Send, ChevronDown,
  ChevronRight, Circle, MinusCircle, Folder, ListChecks, CreditCard,
  Search, X,
} from 'lucide-react';

const TABS = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'tasks', label: 'Tasks', icon: ListChecks },
  { key: 'deliverables', label: 'Deliverables', icon: Package },
  { key: 'billing', label: 'Billing', icon: CreditCard },
  { key: 'documents', label: 'Documents', icon: FileText },
  { key: 'meetings', label: 'Meetings', icon: Calendar },
  { key: 'updates', label: 'Updates', icon: Bell },
  { key: 'request', label: 'Request', icon: MessageSquare },
];

/* ─── Status helpers ─── */
const projectStatusStyles = {
  'Not started': 'bg-warm-500/15 text-warm-400',
  'Onboarding': 'bg-blue-500/15 text-blue-400',
  'Research': 'bg-purple-500/15 text-purple-400',
  'In progress': 'bg-accent/15 text-accent',
  'Off boarding': 'bg-orange-500/15 text-orange-400',
  'Done': 'bg-green-500/15 text-green-400',
  'Lost': 'bg-red-500/15 text-red-400',
};

function formatProjectType(projectType) {
  if (Array.isArray(projectType)) return projectType.join(', ');
  return projectType || '';
}

function isTabVisible(tabKey, config) {
  if (!config) return true;

  const toggleMap = {
    tasks: config.show_tasks,
    deliverables: config.show_deliverables,
    billing: config.show_invoices,
    documents: config.show_documents,
    meetings: config.show_meetings,
    request: config.show_feedback,
  };

  return toggleMap[tabKey] !== false;
}

/* ─── OVERVIEW TAB ─── */
function OverviewTab({ data, config }) {
  if (!data) return <EmptyState text="No overview data available." />;
  const { project, metrics, recent_updates, upcoming_meetings } = data;
  const progress = metrics.tasks_total > 0 ? Math.round((metrics.tasks_completed / metrics.tasks_total) * 100) : 0;
  const projectType = formatProjectType(project?.project_type);

  return (
    <div className="space-y-5">
      {(config?.portal_intro || config?.cta_url || config?.support_contact || config?.contact_email) && (
        <div className="rounded-xl border border-accent/20 bg-accent/10 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              {config?.portal_title && (
                <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-accent/80">
                  {config.portal_title}
                </div>
              )}
              {config?.portal_intro && (
                <p className="max-w-2xl text-sm leading-relaxed text-warm-200">{config.portal_intro}</p>
              )}
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-warm-400">
                {projectType && <span>{projectType}</span>}
                {config?.support_contact && <span>{config.support_contact}</span>}
                {!config?.support_contact && config?.contact_email && <span>{config.contact_email}</span>}
              </div>
            </div>
            {config?.cta_url && config?.cta_label && (
              <a
                href={config.cta_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-dark-950 transition-colors hover:bg-accent-light"
              >
                {config.cta_label}
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <MetricCard label="Tasks" value={`${metrics.tasks_completed}/${metrics.tasks_total}`} sub={`${progress}% complete`} />
        <MetricCard label="Deliverables" value={`${metrics.deliverables_delivered}/${metrics.deliverables_total}`} sub="delivered" />
      </div>
      <div className="bg-dark-700 rounded-xl p-5 border border-dark-500/50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-warm-100">Progress</h2>
          <span className="text-xs font-semibold text-accent">{progress}%</span>
        </div>
        <div className="w-full bg-dark-500 rounded-full h-2">
          <div className="bg-accent h-2 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} data-testid="progress-bar" />
        </div>
      </div>
      {upcoming_meetings && upcoming_meetings.length > 0 && (
        <div className="bg-dark-700 rounded-xl border border-dark-500/50 p-5">
          <h2 className="text-sm font-semibold text-warm-100 mb-3">Upcoming Meetings</h2>
          <div className="space-y-2">
            {upcoming_meetings.map(m => (
              <div key={m.id} className="flex items-center justify-between p-3 bg-dark-800 rounded-lg">
                <div>
                  <div className="text-sm text-warm-100">{m.name}</div>
                  {m.date_time && <div className="text-[11px] text-warm-500">{new Date(m.date_time.start).toLocaleString()}</div>}
                </div>
                {m.meeting_link && (
                  <a href={m.meeting_link} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:text-accent-light font-medium flex items-center gap-1">
                    <ExternalLink size={12} /> Join
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {recent_updates && recent_updates.length > 0 && (
        <div className="bg-dark-700 rounded-xl border border-dark-500/50">
          <div className="p-5 border-b border-dark-500/50">
            <h2 className="text-sm font-semibold text-warm-100">Recent Updates</h2>
          </div>
          <div className="divide-y divide-dark-500/50">
            {recent_updates.map(u => (
              <div key={u.id} className="p-5">
                <div className="flex items-center gap-2 mb-1">
                  {u.type && <span className="text-[10px] bg-accent/12 text-accent px-2 py-0.5 rounded font-medium">{u.type}</span>}
                  <span className="text-[10px] text-warm-500">{u.date?.start || ''}</span>
                </div>
                <h3 className="text-sm font-medium text-warm-100">{u.name}</h3>
                {u.content && <p className="text-xs text-warm-400 mt-1 line-clamp-2">{u.content}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, sub }) {
  return (
    <div className="bg-dark-700 rounded-xl p-5 border border-dark-500/50" data-testid={`metric-${label.toLowerCase()}`}>
      <div className="text-xs text-warm-400 mb-2">{label}</div>
      <div className="text-2xl font-bold text-warm-50">{value}</div>
      {sub && <div className="text-[11px] text-warm-500 mt-1">{sub}</div>}
    </div>
  );
}

/* ─── DELIVERABLES TAB ─── */
const delStatusConfig = {
  'Pending': { color: 'bg-warm-500/15 text-warm-400', icon: Clock },
  'In Progress': { color: 'bg-accent/15 text-accent', icon: Loader2 },
  'Delivered': { color: 'bg-blue-500/15 text-blue-400', icon: Package },
  'Accepted': { color: 'bg-green-500/15 text-green-400', icon: CheckCircle2 },
};

function DeliverablesTab({ projectId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api(`/api/portal/project/${projectId}/deliverables`).then(setItems).catch(console.error).finally(() => setLoading(false));
  }, [projectId]);
  if (loading) return <Spinner />;
  if (items.length === 0) return <EmptyState text="No deliverables yet." icon={Package} />;
  const delivered = items.filter(i => i.status === 'Delivered' || i.status === 'Accepted').length;
  return (
    <div className="space-y-4">
      <p className="text-warm-500 text-xs">{delivered} of {items.length} delivered</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map(item => {
          const cfg = delStatusConfig[item.status] || delStatusConfig['Pending'];
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
                    <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent-light font-medium mr-3">
                      <Download size={12} /> {f.name || 'Download'}
                    </a>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── DOCUMENTS TAB ─── */
function DocumentsTab({ projectId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api(`/api/portal/project/${projectId}/documents`).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [projectId]);
  if (loading) return <Spinner />;
  const hasData = data && ((data.deliverable_files?.length > 0) || (data.proposals?.length > 0) || (data.contracts?.length > 0));
  if (!hasData) return <EmptyState text="No documents available." icon={FileText} />;
  return (
    <div className="space-y-5">
      <DocSection title="Proposals" items={data.proposals} />
      <DocSection title="Contracts" items={data.contracts} />
      <DocSection title="Deliverable Files" items={data.deliverable_files} />
    </div>
  );
}

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
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {item.files && item.files.map((f, fi) => (
                <a key={fi} href={f.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-accent hover:text-accent-light">
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

/* ─── BILLING TAB ─── */
function BillingTab({ projectId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api(`/api/portal/project/${projectId}/billing`)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) return <Spinner />;

  const summary = data?.summary || { total_billed: 0, total_paid: 0, outstanding: 0 };
  const invoices = data?.invoices || [];

  if (invoices.length === 0) {
    return <EmptyState text="No invoices linked to this project." icon={CreditCard} />;
  }

  return (
    <div className="space-y-5" data-testid="billing-tab">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <MetricCard label="Total Billed" value={`$${(summary.total_billed || 0).toLocaleString()}`} />
        <MetricCard label="Total Paid" value={`$${(summary.total_paid || 0).toLocaleString()}`} sub="received" />
        <MetricCard label="Outstanding" value={`$${(summary.outstanding || 0).toLocaleString()}`} sub="remaining" />
      </div>

      <div className="bg-dark-700 rounded-xl border border-dark-500/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-500/50">
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Invoice</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Due Date</th>
                <th className="text-right px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Amount</th>
                <th className="text-right px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-500/30">
              {invoices.map((invoice, index) => {
                const status = invoice.payment_status || (invoice.paid ? 'Paid' : 'Draft');
                const statusClass = {
                  Draft: 'bg-warm-500/15 text-warm-400',
                  Sent: 'bg-blue-500/15 text-blue-400',
                  Paid: 'bg-green-500/15 text-green-400',
                  Overdue: 'bg-red-500/15 text-red-400',
                  Cancelled: 'bg-warm-600/15 text-warm-500',
                }[status] || 'bg-warm-500/15 text-warm-400';

                return (
                  <tr key={invoice.id} className={index % 2 === 1 ? 'bg-dark-800/40' : ''}>
                    <td className="px-5 py-3.5 text-sm font-medium text-warm-100">{invoice.no || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusClass}`}>{status}</span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-warm-400">{invoice.due_date?.start || '—'}</td>
                    <td className="px-5 py-3.5 text-right text-sm text-warm-100">${(invoice.amount || 0).toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-right">
                      {invoice.stripe_invoice_url ? (
                        <a
                          href={invoice.stripe_invoice_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:text-accent-light"
                        >
                          Open
                          <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="text-[11px] text-warm-600">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── MEETINGS TAB ─── */
const mtgStatusConfig = {
  'Scheduled': { color: 'bg-blue-500/15 text-blue-400', icon: Clock },
  'Invite Sent': { color: 'bg-indigo-500/15 text-indigo-400', icon: Clock },
  'Tentative': { color: 'bg-accent/15 text-accent', icon: AlertCircle },
  'Rescheduled': { color: 'bg-orange-500/15 text-orange-400', icon: AlertCircle },
  'Cancelled': { color: 'bg-red-500/15 text-red-400', icon: XCircle },
  'Completed': { color: 'bg-green-500/15 text-green-400', icon: CheckCircle2 },
};

function MeetingsTab({ projectId }) {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api(`/api/portal/project/${projectId}/meetings`).then(setMeetings).catch(console.error).finally(() => setLoading(false));
  }, [projectId]);
  if (loading) return <Spinner />;
  if (meetings.length === 0) return <EmptyState text="No meetings scheduled." icon={Calendar} />;
  const now = new Date().toISOString();
  const upcoming = meetings.filter(m => { const dt = m.date_time?.start; return dt && dt >= now && m.status !== 'Cancelled' && m.status !== 'Completed'; });
  const past = meetings.filter(m => !upcoming.includes(m));
  return (
    <div className="space-y-5">
      {upcoming.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-warm-100 mb-2">Upcoming</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{upcoming.map(m => <MeetingCard key={m.id} meeting={m} />)}</div>
        </div>
      )}
      {past.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-warm-100 mb-2">Past</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{past.map(m => <MeetingCard key={m.id} meeting={m} />)}</div>
        </div>
      )}
    </div>
  );
}

function MeetingCard({ meeting }) {
  const cfg = mtgStatusConfig[meeting.status] || mtgStatusConfig['Scheduled'];
  const Icon = cfg.icon;
  return (
    <div data-testid={`meeting-${meeting.id}`} className="bg-dark-700 rounded-xl border border-dark-500/40 p-5">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-semibold text-warm-100">{meeting.name}</h3>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${cfg.color}`}>
          <Icon size={10} /> {meeting.status || 'Scheduled'}
        </span>
      </div>
      <div className="space-y-1.5 mb-3">
        {meeting.date_time && (
          <div className="flex items-center gap-1.5 text-xs text-warm-400">
            <Calendar size={12} /> {new Date(meeting.date_time.start).toLocaleString()}
          </div>
        )}
        {meeting.participant && (
          <div className="flex items-center gap-1.5 text-xs text-warm-400"><Users size={12} /> {meeting.participant}</div>
        )}
      </div>
      {meeting.meeting_link && (
        <a href={meeting.meeting_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent-light font-medium mb-3" data-testid={`meeting-link-${meeting.id}`}>
          <ExternalLink size={12} /> Join Meeting
        </a>
      )}
      {meeting.meeting_summary && (
        <div className="mt-3 pt-3 border-t border-dark-500/30">
          <div className="text-[10px] font-semibold text-warm-500 uppercase tracking-wider mb-1">Summary</div>
          <p className="text-xs text-warm-300 leading-relaxed">{meeting.meeting_summary}</p>
        </div>
      )}
    </div>
  );
}

/* ─── TASKS TAB ─── */
const phaseOrder = ['Getting Started', 'Planning', 'Implementation', 'Offboarding'];
const taskStatusConfig = {
  'Not Started': { icon: Circle, color: 'text-warm-500', bg: 'bg-warm-500/15' },
  'In progress': { icon: AlertCircle, color: 'text-accent', bg: 'bg-accent/15' },
  'Done': { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/15' },
  'Blocked': { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/15' },
  "Won't Do": { icon: MinusCircle, color: 'text-warm-600', bg: 'bg-warm-600/15' },
};
const priorityColors = {
  'High': 'bg-red-500/15 text-red-400 border-red-500/20',
  'Medium': 'bg-accent/15 text-accent border-accent/20',
  'Low': 'bg-blue-500/15 text-blue-400 border-blue-500/20',
};
const priorityWeight = { 'High': 0, 'Medium': 1, 'Low': 2 };
const statusWeight = { 'Blocked': 0, 'In progress': 1, 'Not Started': 2, 'Done': 3, "Won't Do": 4 };

function TaskRow({ task, isExpanded, onToggle }) {
  const cfg = taskStatusConfig[task.status] || taskStatusConfig['Not Started'];
  const Icon = cfg.icon;
  const isWontDo = task.status === "Won't Do";

  return (
    <div data-testid={`task-${task.id}`} className={isWontDo ? 'opacity-50' : ''}>
      <div
        className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-150 cursor-pointer ${
          isExpanded
            ? 'bg-dark-600 border-accent/30 shadow-lg shadow-accent/5'
            : 'bg-dark-700 border-dark-500/40 hover:border-dark-400'
        }`}
        onClick={onToggle}
      >
        <Icon size={16} className={cfg.color} />
        <div className="flex-1 min-w-0">
          <div className={`text-sm text-warm-100 ${isWontDo ? 'line-through' : ''}`}>{task.name}</div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {task.tag && <span className="text-[10px] bg-dark-500 px-1.5 py-0.5 rounded text-warm-400">{task.tag}</span>}
            {task.due_date && <span className="text-[10px] text-warm-500">{task.due_date?.start || task.due_date}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {task.priority && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${priorityColors[task.priority] || 'bg-dark-600 text-warm-400 border-dark-400'}`}>{task.priority}</span>
          )}
          {isExpanded ? <ChevronDown size={14} className="text-warm-400" /> : <ChevronRight size={14} className="text-warm-500" />}
        </div>
      </div>
      {isExpanded && (
        <div className="mt-1 ml-4 mr-1 p-4 bg-dark-800 rounded-xl border border-dark-500/30 space-y-3 animate-fadeIn">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.bg} ${cfg.color}`}>
              <Icon size={10} /> {task.status}
            </span>
            {task.priority && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${priorityColors[task.priority]}`}>{task.priority} Priority</span>
            )}
            {task.tag && <span className="text-[10px] bg-dark-600 px-2 py-0.5 rounded text-warm-400">{task.tag}</span>}
          </div>
          {task.notes ? (
            <div>
              <div className="text-[10px] font-semibold text-warm-500 uppercase tracking-wider mb-1">Description</div>
              <p className="text-xs text-warm-300 whitespace-pre-line leading-relaxed">{task.notes}</p>
            </div>
          ) : (
            <p className="text-xs text-warm-600 italic">No description provided.</p>
          )}
          <div className="flex items-center gap-4 text-[10px] text-warm-500 pt-1 border-t border-dark-500/30">
            {task.due_date && <span>Due: {task.due_date?.start || task.due_date}</span>}
            {task.assignee && task.assignee.length > 0 && (
              <span className="flex items-center gap-1"><Users size={10} /> {task.assignee.map(a => a.name).join(', ')}</span>
            )}
          </div>
          {task.files && task.files.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {task.files.map((f, i) => (
                <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent-light font-medium">
                  <Download size={12} /> {f.name || 'File'}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'In progress', label: 'In Progress' },
  { key: 'Done', label: 'Completed' },
  { key: 'Not Started', label: 'Not Started' },
  { key: 'Blocked', label: 'Blocked' },
];
const SORT_OPTIONS = [
  { key: 'default', label: 'Default' },
  { key: 'priority', label: 'Priority' },
  { key: 'due_date', label: 'Due Date' },
  { key: 'status', label: 'Status' },
];

function normalizeTaskPhase(phase) {
  return phase || 'Unassigned';
}

function getOrderedPhases(tasks) {
  const seen = new Set(tasks.map((task) => normalizeTaskPhase(task.phase)));
  const ordered = phaseOrder.filter((phase) => seen.has(phase));
  const remaining = [...seen]
    .filter((phase) => !phaseOrder.includes(phase) && phase !== 'Unassigned')
    .sort((a, b) => a.localeCompare(b));

  if (seen.has('Unassigned')) remaining.push('Unassigned');

  return [...ordered, ...remaining];
}

function TasksTab({ projectId }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [phaseFilter, setPhaseFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    api(`/api/portal/project/${projectId}/tasks`).then(setTasks).catch(console.error).finally(() => setLoading(false));
  }, [projectId]);

  if (loading) return <Spinner />;
  if (tasks.length === 0) return <EmptyState text="No tasks available." icon={ListChecks} />;

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const orderedTaskPhases = getOrderedPhases(tasks);
  const phaseOptions = [
    { key: 'all', label: 'All phases' },
    ...orderedTaskPhases.map((phase) => ({ key: phase, label: phase })),
  ];
  const filtered = tasks.filter((task) => {
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const taskPhase = normalizeTaskPhase(task.phase);
    const matchesPhase = phaseFilter === 'all' || taskPhase === phaseFilter;

    if (!matchesStatus || !matchesPhase) return false;
    if (!normalizedQuery) return true;

    const haystack = [
      task.name,
      task.notes,
      task.tag,
      task.status,
      task.priority,
      task.phase,
      ...(task.assignee || []).map((person) => person.name),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'default') {
      const phaseRankA = orderedTaskPhases.indexOf(normalizeTaskPhase(a.phase));
      const phaseRankB = orderedTaskPhases.indexOf(normalizeTaskPhase(b.phase));
      if (phaseRankA !== phaseRankB) return phaseRankA - phaseRankB;
      const statusRank = (statusWeight[a.status] ?? 5) - (statusWeight[b.status] ?? 5);
      if (statusRank !== 0) return statusRank;
      const dueDateA = a.due_date?.start || '9999-12-31';
      const dueDateB = b.due_date?.start || '9999-12-31';
      if (dueDateA !== dueDateB) return dueDateA.localeCompare(dueDateB);
      return (a.name || '').localeCompare(b.name || '');
    }
    if (sortBy === 'priority') return (priorityWeight[a.priority] ?? 3) - (priorityWeight[b.priority] ?? 3);
    if (sortBy === 'due_date') {
      const da = a.due_date?.start || 'z';
      const db = b.due_date?.start || 'z';
      return da.localeCompare(db);
    }
    if (sortBy === 'status') return (statusWeight[a.status] ?? 5) - (statusWeight[b.status] ?? 5);
    return 0;
  });

  const totalDone = tasks.filter(t => t.status === 'Done').length;
  const progress = tasks.length > 0 ? Math.round((totalDone / tasks.length) * 100) : 0;
  const hasActiveFilters = statusFilter !== 'all' || phaseFilter !== 'all' || normalizedQuery.length > 0;

  // Count per status for filter badges
  const statusCounts = {};
  tasks.forEach(t => { statusCounts[t.status] = (statusCounts[t.status] || 0) + 1; });
  const phaseCounts = {};
  tasks.forEach((task) => {
    const phase = normalizeTaskPhase(task.phase);
    phaseCounts[phase] = (phaseCounts[phase] || 0) + 1;
  });
  const groupedTasks = sorted.reduce((groups, task) => {
    const phase = normalizeTaskPhase(task.phase);
    if (!groups[phase]) groups[phase] = [];
    groups[phase].push(task);
    return groups;
  }, {});
  const orderedVisiblePhases = getOrderedPhases(sorted);

  return (
    <div data-testid="tasks-tab" className="space-y-5">
      {/* Summary bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <span className="text-warm-200 text-sm font-medium">{totalDone}/{tasks.length} completed</span>
          <span className="text-warm-500 text-xs ml-2">({progress}%)</span>
        </div>
        <div className="w-48 bg-dark-600 rounded-full h-1.5">
          <div className="bg-accent h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Filters + Sort */}
      <div className="space-y-3 rounded-xl border border-dark-500/40 bg-dark-700 p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="relative w-full md:max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-500" />
            <input
              data-testid="task-search"
              type="search"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setExpandedId(null);
              }}
              placeholder="Search by task, notes, assignee, or tag"
              className="w-full rounded-xl border border-dark-500/40 bg-dark-800 py-2.5 pl-9 pr-10 text-sm text-warm-100 placeholder-warm-500 focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-500 hover:text-warm-200"
                aria-label="Clear task search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2" data-testid="task-sort">
            <span className="text-[10px] text-warm-500 uppercase tracking-wider">Sort</span>
            <select
              data-testid="sort-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-2.5 py-1.5 bg-dark-800 border border-dark-500/40 rounded-lg text-[11px] text-warm-200 focus:outline-none focus:border-accent/40"
            >
              {SORT_OPTIONS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap" data-testid="task-status-filters">
          {STATUS_FILTERS.map(f => {
            const count = f.key === 'all' ? tasks.length : (statusCounts[f.key] || 0);
            if (f.key !== 'all' && count === 0) return null;
            const active = statusFilter === f.key;
            return (
              <button
                key={f.key}
                data-testid={`filter-${f.key}`}
                onClick={() => { setStatusFilter(f.key); setExpandedId(null); }}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                  active
                    ? 'bg-accent/15 text-accent border border-accent/30'
                    : 'bg-dark-700 text-warm-400 border border-dark-500/40 hover:text-warm-200 hover:border-dark-400'
                }`}
              >
                {f.label}
                <span className={`ml-1.5 ${active ? 'text-accent/70' : 'text-warm-600'}`}>{count}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap" data-testid="task-phase-filters">
          {phaseOptions.map((option) => {
            const count = option.key === 'all' ? tasks.length : (phaseCounts[option.key] || 0);
            if (option.key !== 'all' && count === 0) return null;
            const active = phaseFilter === option.key;

            return (
              <button
                key={option.key}
                type="button"
                onClick={() => {
                  setPhaseFilter(option.key);
                  setExpandedId(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                  active
                    ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                    : 'bg-dark-800 text-warm-400 border border-dark-500/40 hover:text-warm-200 hover:border-dark-400'
                }`}
              >
                {option.label}
                <span className={`ml-1.5 ${active ? 'text-blue-300/80' : 'text-warm-600'}`}>{count}</span>
              </button>
            );
          })}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setPhaseFilter('all');
                setSearchQuery('');
                setExpandedId(null);
              }}
              className="rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-warm-500 hover:text-warm-200"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 text-[11px] text-warm-500 flex-wrap">
          <span>
            Showing {sorted.length} of {tasks.length} task{tasks.length !== 1 ? 's' : ''}
          </span>
          {hasActiveFilters && (
            <span>
              Filters: {statusFilter !== 'all' ? statusFilter : 'Any status'} • {phaseFilter !== 'all' ? phaseFilter : 'Any phase'}
            </span>
          )}
        </div>
      </div>

      {/* Task list */}
      {sorted.length === 0 ? (
        <div className="bg-dark-700 rounded-xl p-10 border border-dark-500/50 text-center">
          <p className="text-warm-500 text-sm">No tasks match this filter.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {orderedVisiblePhases.map((phase) => (
            <section key={phase} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-warm-100">{phase}</h3>
                  <p className="text-[11px] text-warm-500">
                    {groupedTasks[phase].length} task{groupedTasks[phase].length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="h-px flex-1 bg-dark-500/40" />
              </div>

              <div className="space-y-1.5">
                {groupedTasks[phase].map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    isExpanded={expandedId === task.id}
                    onToggle={() => setExpandedId(expandedId === task.id ? null : task.id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── UPDATES TAB ─── */
const typeColors = {
  'Status Update': 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  'Milestone': 'bg-accent/15 text-accent border-accent/20',
  'Announcement': 'bg-purple-500/15 text-purple-400 border-purple-500/20',
};

function UpdatesTab({ projectId }) {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api(`/api/portal/project/${projectId}/updates`).then(setUpdates).catch(console.error).finally(() => setLoading(false));
  }, [projectId]);
  if (loading) return <Spinner />;
  if (updates.length === 0) return <EmptyState text="No updates available." icon={Bell} />;
  return (
    <div className="space-y-3">
      {updates.map(u => (
        <div key={u.id} data-testid={`update-${u.id}`} className="bg-dark-700 rounded-xl border border-dark-500/40 p-5">
          <div className="flex items-center gap-2 mb-2">
            {u.type && <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${typeColors[u.type] || 'bg-warm-500/15 text-warm-400 border-warm-500/20'}`}>{u.type}</span>}
            <span className="text-[10px] text-warm-500">{u.date?.start || ''}</span>
          </div>
          <h3 className="text-sm font-semibold text-warm-100 mb-1">{u.name}</h3>
          {u.content && <p className="text-xs text-warm-400 whitespace-pre-line leading-relaxed">{u.content}</p>}
        </div>
      ))}
    </div>
  );
}

/* ─── REQUEST TAB ─── */
const reqTypes = ['Change Request', 'Question', 'Feedback', 'Support'];
const reqPriorities = ['Low', 'Medium', 'High'];

function RequestTab({ projectId }) {
  const [form, setForm] = useState({ name: '', type: 'Question', priority: 'Medium', description: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api(`/api/portal/project/${projectId}/requests`, { method: 'POST', body: JSON.stringify(form) });
      setSuccess(true);
      setForm({ name: '', type: 'Question', priority: 'Medium', description: '' });
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  if (success) return (
    <div data-testid="request-success" className="text-center py-12">
      <CheckCircle2 size={40} className="mx-auto text-green-400 mb-3" />
      <h2 className="text-lg font-bold text-warm-50 mb-2">Request Submitted</h2>
      <p className="text-warm-400 text-sm mb-5">We'll get back to you soon.</p>
      <button onClick={() => setSuccess(false)} className="px-5 py-2 bg-accent hover:bg-accent-light text-dark-950 font-semibold rounded-xl text-sm transition-colors" data-testid="submit-another-button">Submit Another</button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl bg-dark-700 rounded-xl border border-dark-500/50 p-6 space-y-4" data-testid="request-form">
      <div>
        <label className="block text-xs font-medium text-warm-200 mb-1">Subject</label>
        <input data-testid="request-name" type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Brief summary"
          className="w-full px-3.5 py-2.5 bg-dark-800 border border-dark-400 rounded-xl text-sm text-warm-50 placeholder-warm-500 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-warm-200 mb-1">Type</label>
          <select data-testid="request-type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-dark-800 border border-dark-400 rounded-xl text-sm text-warm-50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30">
            {reqTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-warm-200 mb-1">Priority</label>
          <select data-testid="request-priority" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-dark-800 border border-dark-400 rounded-xl text-sm text-warm-50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30">
            {reqPriorities.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-warm-200 mb-1">Description</label>
        <textarea data-testid="request-description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required rows={5} placeholder="Describe in detail..."
          className="w-full px-3.5 py-2.5 bg-dark-800 border border-dark-400 rounded-xl text-sm text-warm-50 placeholder-warm-500 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 resize-none" />
      </div>
      {error && <p data-testid="request-error" className="text-red-400 text-xs">{error}</p>}
      <button data-testid="submit-request-button" type="submit" disabled={loading}
        className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-light text-dark-950 font-semibold rounded-xl text-sm transition-colors disabled:opacity-50">
        <Send size={14} /> {loading ? 'Submitting...' : 'Submit Request'}
      </button>
    </form>
  );
}

/* ─── SHARED COMPONENTS ─── */
function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function EmptyState({ text, icon: Icon = Folder }) {
  return (
    <div className="bg-dark-700 rounded-xl p-12 border border-dark-500/50 text-center">
      <Icon size={32} className="mx-auto text-warm-600 mb-2" />
      <p className="text-warm-500 text-sm">{text}</p>
    </div>
  );
}

/* ─── MAIN PAGE ─── */
export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [dashData, setDashData] = useState(null);
  const [project, setProject] = useState(null);
  const [portalConfig, setPortalConfig] = useState(null);
  const [projectOptions, setProjectOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api(`/api/portal/project/${projectId}/dashboard`),
      api(`/api/portal/project/${projectId}/config`).catch(() => null),
      api('/api/portal/projects').catch(() => []),
    ])
      .then(([dashboard, config, projects]) => {
        setDashData(dashboard);
        setProject(dashboard.project);
        setPortalConfig(config);
        setProjectOptions(projects);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const visibleTabs = TABS.filter((tab) => tab.key === 'overview' || isTabVisible(tab.key, portalConfig));
  const roleAwareTabs = visibleTabs.filter((tab) => tab.key !== 'billing' || user?.role === 'admin');
  const requestedTab = searchParams.get('tab') || 'overview';
  const activeTab = roleAwareTabs.some((tab) => tab.key === requestedTab)
    ? requestedTab
    : (roleAwareTabs[0]?.key || 'overview');
  const projectType = formatProjectType(project?.project_type);

  useEffect(() => {
    if (requestedTab !== activeTab) {
      if (activeTab === 'overview') {
        setSearchParams({}, { replace: true });
      } else {
        setSearchParams({ tab: activeTab }, { replace: true });
      }
    }
  }, [activeTab, requestedTab, setSearchParams]);

  if (loading) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const tabContent = {
    overview: <OverviewTab data={dashData} config={portalConfig} />,
    tasks: <TasksTab projectId={projectId} />,
    deliverables: <DeliverablesTab projectId={projectId} />,
    billing: <BillingTab projectId={projectId} />,
    documents: <DocumentsTab projectId={projectId} />,
    meetings: <MeetingsTab projectId={projectId} />,
    updates: <UpdatesTab projectId={projectId} />,
    request: <RequestTab projectId={projectId} />,
  };

  return (
    <div className="min-h-screen bg-dark-900" data-testid="project-detail-page">
      {/* Header */}
      <header className="border-b border-dark-500/50 bg-dark-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button data-testid="back-to-projects" onClick={() => navigate('/projects')} className="p-2 text-warm-400 hover:text-warm-50 hover:bg-dark-600 rounded-lg transition-colors">
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="text-warm-50 text-sm font-semibold">
                {portalConfig?.portal_title || project?.name || 'Project'}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {project?.status && (
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${projectStatusStyles[project.status] || 'bg-warm-500/15 text-warm-400'}`}>
                    {project.status}
                  </span>
                )}
                {projectType && <span className="text-[10px] text-warm-500">{projectType}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {projectOptions.length > 1 && (
              <select
                data-testid="project-switcher"
                value={projectId}
                onChange={(event) => navigate(`/project/${event.target.value}${activeTab === 'overview' ? '' : `?tab=${activeTab}`}`)}
                className="hidden rounded-lg border border-dark-500/40 bg-dark-800 px-3 py-2 text-xs text-warm-200 focus:border-accent/40 focus:outline-none lg:block"
              >
                {projectOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            )}
            <div className="text-right hidden sm:block">
              <div className="text-warm-200 text-xs font-medium">{user?.name || 'User'}</div>
              <div className="text-warm-500 text-[10px]">{user?.email}</div>
            </div>
            <button data-testid="logout-button" onClick={handleLogout} className="p-2 text-warm-500 hover:text-warm-100 hover:bg-dark-600 rounded-lg transition-colors" title="Sign Out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Tab Bar */}
      <div className="border-b border-dark-500/50 bg-dark-950/50 backdrop-blur-sm sticky top-[57px] z-20 overflow-x-auto">
        <div className="max-w-5xl mx-auto px-5 flex gap-1">
          {roleAwareTabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                data-testid={`tab-${tab.key}`}
                onClick={() => {
                  if (tab.key === 'overview') {
                    setSearchParams({}, { replace: true });
                  } else {
                    setSearchParams({ tab: tab.key }, { replace: true });
                  }
                }}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                  active ? 'border-accent text-accent' : 'border-transparent text-warm-500 hover:text-warm-200'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-5 py-6">
        <div key={activeTab} className="animate-fadeIn">
          {tabContent[activeTab]}
        </div>
      </main>
    </div>
  );
}
