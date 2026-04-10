import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';
import { CheckCircle2, Circle, AlertCircle, XCircle, MinusCircle, ChevronDown, ChevronRight } from 'lucide-react';

const phaseOrder = ['Getting Started', 'Planning', 'Implementation', 'Offboarding'];

const statusConfig = {
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
  const cfg = statusConfig[task.status] || statusConfig['Not Started'];
  const Icon = cfg.icon;
  const isWontDo = task.status === "Won't Do";
  const [expanded, setExpanded] = useState(false);

  return (
    <div data-testid={`task-${task.id}`} className={`${isWontDo ? 'opacity-50' : ''}`}>
      <div className={`flex items-center gap-3 p-3.5 bg-dark-700 rounded-xl border border-dark-500/40 hover:border-dark-400 transition-colors cursor-pointer`} onClick={() => task.notes && setExpanded(!expanded)}>
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
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${priorityColors[task.priority] || 'bg-dark-600 text-warm-400 border-dark-400'}`}>
              {task.priority}
            </span>
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

export default function TasksPage() {
  const { selectedProject } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedProject) return;
    setLoading(true);
    api(`/api/portal/project/${selectedProject.id}/tasks`)
      .then(setTasks).catch(console.error).finally(() => setLoading(false));
  }, [selectedProject]);

  if (!selectedProject) return <div className="text-warm-500 text-center py-20 text-sm">No project selected.</div>;
  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

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
    <div data-testid="tasks-page" className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-warm-50">Tasks</h1>
        <p className="text-warm-500 text-xs mt-1">{totalDone} of {tasks.length} tasks completed</p>
      </div>

      {hasPhases && phaseOrder.map(phase => renderGroup(phase, grouped[phase]))}
      {ungrouped.length > 0 && renderGroup(hasPhases ? 'Other' : 'All Tasks', ungrouped)}

      {tasks.length === 0 && (
        <div className="bg-dark-700 rounded-xl p-12 border border-dark-500/50 text-center">
          <p className="text-warm-500 text-sm">No tasks available.</p>
        </div>
      )}
    </div>
  );
}
