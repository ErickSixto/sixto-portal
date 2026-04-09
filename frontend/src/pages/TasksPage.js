import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';
import { CheckCircle2, Circle, AlertCircle, XCircle, MinusCircle } from 'lucide-react';

const phaseOrder = ['Getting Started', 'Planning', 'Implementation', 'Offboarding'];

const statusConfig = {
  'Not Started': { icon: Circle, color: 'text-gray-400', bg: 'bg-gray-50' },
  'In progress': { icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-50' },
  'Done': { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
  'Blocked': { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
  "Won't Do": { icon: MinusCircle, color: 'text-gray-400', bg: 'bg-gray-50' },
};

const priorityColors = {
  'High': 'bg-red-50 text-red-600 border-red-200',
  'Medium': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Low': 'bg-blue-50 text-blue-600 border-blue-200',
};

function TaskRow({ task }) {
  const cfg = statusConfig[task.status] || statusConfig['Not Started'];
  const Icon = cfg.icon;
  const isWontDo = task.status === "Won't Do";

  return (
    <div data-testid={`task-${task.id}`} className={`flex items-center gap-4 p-4 ${cfg.bg} rounded-xl border border-border/50 ${isWontDo ? 'opacity-60' : ''}`}>
      <Icon size={20} className={cfg.color} />
      <div className="flex-1 min-w-0">
        <div className={`font-medium text-charcoal text-sm ${isWontDo ? 'line-through' : ''}`}>{task.name}</div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {task.tag && <span className="text-xs bg-white px-2 py-0.5 rounded border border-border text-secondary">{task.tag}</span>}
          {task.due_date && <span className="text-xs text-secondary">{task.due_date?.start || task.due_date}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {task.priority && (
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${priorityColors[task.priority] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
            {task.priority}
          </span>
        )}
      </div>
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
      .then(setTasks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedProject]);

  if (!selectedProject) return <div className="text-secondary text-center py-20">No project selected.</div>;
  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
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

  return (
    <div data-testid="tasks-page" className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">Tasks</h1>
        <p className="text-secondary text-sm mt-1">{totalDone} of {tasks.length} tasks completed</p>
      </div>

      {phaseOrder.map(phase => {
        const phaseTasks = grouped[phase];
        if (phaseTasks.length === 0) return null;
        const done = phaseTasks.filter(t => t.status === 'Done').length;
        const pct = Math.round((done / phaseTasks.length) * 100);

        return (
          <div key={phase} data-testid={`phase-${phase.toLowerCase().replace(/\s/g, '-')}`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-charcoal">{phase}</h2>
              <span className="text-sm text-secondary">{done}/{phaseTasks.length} done ({pct}%)</span>
            </div>
            <div className="w-full bg-oat rounded-full h-1.5 mb-4">
              <div className="bg-accent h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <div className="space-y-2">
              {phaseTasks.map(t => <TaskRow key={t.id} task={t} />)}
            </div>
          </div>
        );
      })}

      {ungrouped.length > 0 && (
        <div data-testid="phase-other">
          <h2 className="text-lg font-semibold text-charcoal mb-3">Other</h2>
          <div className="space-y-2">
            {ungrouped.map(t => <TaskRow key={t.id} task={t} />)}
          </div>
        </div>
      )}

      {tasks.length === 0 && (
        <div className="bg-white rounded-xl p-12 border border-border text-center">
          <p className="text-secondary">No tasks available for this project.</p>
        </div>
      )}
    </div>
  );
}
