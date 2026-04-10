import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';
import {
  ArrowLeft, LogOut, LayoutDashboard, Package, FileText, Calendar,
  Bell, MessageSquare, CheckCircle2, Clock, Loader2, XCircle,
  AlertCircle, Download, ExternalLink, Users, Send, ChevronDown,
  ChevronRight, Circle, MinusCircle, Folder, ListChecks
} from 'lucide-react';

const TABS = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'tasks', label: 'Tasks', icon: ListChecks },
  { key: 'deliverables', label: 'Deliverables', icon: Package },
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

/* ─── OVERVIEW TAB ─── */
function OverviewTab({ data }) {
  if (!data) return <EmptyState text="No overview data available." />;
  const { project, metrics, recent_updates, upcoming_meetings } = data;
  const progress = metrics.tasks_total > 0 ? Math.round((metrics.tasks_completed / metrics.tasks_total) * 100) : 0;

  return (
    <div className="space-y-5">
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
  'Not Started': { icon: Circle, color: 'text-warm-500' },
  'In progress': { icon: AlertCircle, color: 'text-accent' },
  'Done': { icon: CheckCircle2, color: 'text-green-400' },
  'Blocked': { icon: XCircle, color: 'text-red-400' },
  "Won't Do": { icon: MinusCircle, color: 'text-warm-600' },
};
const priorityColors = {
  'High': 'bg-red-500/15 text-red-400 border-red-500/20',
  'Medium': 'bg-accent/15 text-accent border-accent/20',
  'Low': 'bg-blue-500/15 text-blue-400 border-blue-500/20',
};

function TaskRow({ task }) {
  const cfg = taskStatusConfig[task.status] || taskStatusConfig['Not Started'];
  const Icon = cfg.icon;
  const isWontDo = task.status === "Won't Do";
  const [expanded, setExpanded] = useState(false);
  return (
    <div data-testid={`task-${task.id}`} className={isWontDo ? 'opacity-50' : ''}>
      <div className="flex items-center gap-3 p-3.5 bg-dark-700 rounded-xl border border-dark-500/40 hover:border-dark-400 transition-colors cursor-pointer" onClick={() => task.notes && setExpanded(!expanded)}>
        <Icon size={16} className={cfg.color} />
        <div className="flex-1 min-w-0">
          <div className={`text-sm text-warm-100 ${isWontDo ? 'line-through' : ''}`}>{task.name}</div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {task.tag && <span className="text-[10px] bg-dark-600 px-1.5 py-0.5 rounded text-warm-400">{task.tag}</span>}
            {task.due_date && <span className="text-[10px] text-warm-500">{task.due_date?.start || task.due_date}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {task.priority && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${priorityColors[task.priority] || 'bg-dark-600 text-warm-400 border-dark-400'}`}>{task.priority}</span>
          )}
          {task.notes && (expanded ? <ChevronDown size={12} className="text-warm-500" /> : <ChevronRight size={12} className="text-warm-500" />)}
        </div>
      </div>
      {expanded && task.notes && (
        <div className="ml-8 mt-1 p-3 bg-dark-800 rounded-lg border border-dark-500/30">
          <p className="text-xs text-warm-400 whitespace-pre-line">{task.notes}</p>
        </div>
      )}
    </div>
  );
}

function TasksTab({ projectId }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api(`/api/portal/project/${projectId}/tasks`).then(setTasks).catch(console.error).finally(() => setLoading(false));
  }, [projectId]);
  if (loading) return <Spinner />;
  if (tasks.length === 0) return <EmptyState text="No tasks available." icon={ListChecks} />;

  const grouped = {};
  phaseOrder.forEach(p => { grouped[p] = []; });
  const ungrouped = [];
  tasks.forEach(t => {
    const phase = t.phase;
    if (phase && grouped[phase]) grouped[phase].push(t);
    else ungrouped.push(t);
  });
  const totalDone = tasks.filter(t => t.status === 'Done').length;
  const hasPhases = phaseOrder.some(p => grouped[p].length > 0);

  const renderGroup = (label, items) => {
    if (items.length === 0) return null;
    const done = items.filter(t => t.status === 'Done').length;
    const pct = Math.round((done / items.length) * 100);
    return (
      <div key={label} data-testid={`phase-${label.toLowerCase().replace(/\s/g, '-')}`}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-warm-100">{label}</h2>
          <span className="text-[10px] text-warm-500">{done}/{items.length} ({pct}%)</span>
        </div>
        <div className="w-full bg-dark-600 rounded-full h-1 mb-3">
          <div className="bg-accent h-1 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="space-y-1.5">{items.map(t => <TaskRow key={t.id} task={t} />)}</div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <p className="text-warm-500 text-xs">{totalDone} of {tasks.length} tasks completed</p>
      {hasPhases && phaseOrder.map(phase => renderGroup(phase, grouped[phase]))}
      {ungrouped.length > 0 && renderGroup(hasPhases ? 'Other' : 'All Tasks', ungrouped)}
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
  const [activeTab, setActiveTab] = useState('overview');
  const [dashData, setDashData] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api(`/api/portal/project/${projectId}/dashboard`)
      .then(d => { setDashData(d); setProject(d.project); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const tabContent = {
    overview: <OverviewTab data={dashData} />,
    tasks: <TasksTab projectId={projectId} />,
    deliverables: <DeliverablesTab projectId={projectId} />,
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
              <div className="text-warm-50 text-sm font-semibold">{project?.name || 'Project'}</div>
              <div className="flex items-center gap-2">
                {project?.status && (
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${projectStatusStyles[project.status] || 'bg-warm-500/15 text-warm-400'}`}>
                    {project.status}
                  </span>
                )}
                {project?.project_type && <span className="text-[10px] text-warm-500">{project.project_type}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
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
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                data-testid={`tab-${tab.key}`}
                onClick={() => setActiveTab(tab.key)}
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
