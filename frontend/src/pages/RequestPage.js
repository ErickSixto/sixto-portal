import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';
import { Send, CheckCircle2 } from 'lucide-react';

const types = ['Change Request', 'Question', 'Feedback', 'Support'];
const priorities = ['Low', 'Medium', 'High'];

export default function RequestPage() {
  const { selectedProject } = useAuth();
  const [form, setForm] = useState({ name: '', type: 'Question', priority: 'Medium', description: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    setLoading(true);
    setError('');
    try {
      await api(`/api/portal/project/${selectedProject.id}/requests`, {
        method: 'POST', body: JSON.stringify(form),
      });
      setSuccess(true);
      setForm({ name: '', type: 'Question', priority: 'Medium', description: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedProject) return <div className="text-warm-500 text-center py-20 text-sm">No project selected.</div>;

  if (success) return (
    <div data-testid="request-success" className="max-w-lg mx-auto text-center py-20">
      <CheckCircle2 size={40} className="mx-auto text-green-400 mb-3" />
      <h2 className="text-lg font-bold text-warm-50 mb-2">Request Submitted</h2>
      <p className="text-warm-400 text-sm mb-5">We'll get back to you soon.</p>
      <button onClick={() => setSuccess(false)}
        className="px-5 py-2 bg-accent hover:bg-accent-light text-dark-950 font-semibold rounded-xl text-sm transition-colors"
        data-testid="submit-another-button"
      >
        Submit Another
      </button>
    </div>
  );

  return (
    <div data-testid="request-page" className="max-w-2xl">
      <h1 className="text-xl font-bold text-warm-50 mb-1">Submit a Request</h1>
      <p className="text-warm-400 text-xs mb-5">Have a question, feedback, or need a change?</p>

      <form onSubmit={handleSubmit} className="bg-dark-700 rounded-xl border border-dark-500/50 p-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-warm-200 mb-1">Subject</label>
          <input
            data-testid="request-name" type="text" value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })} required
            placeholder="Brief summary"
            className="w-full px-3.5 py-2.5 bg-dark-800 border border-dark-400 rounded-xl text-sm text-warm-50 placeholder-warm-500 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-warm-200 mb-1">Type</label>
            <select data-testid="request-type" value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-dark-800 border border-dark-400 rounded-xl text-sm text-warm-50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
            >
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-warm-200 mb-1">Priority</label>
            <select data-testid="request-priority" value={form.priority}
              onChange={e => setForm({ ...form, priority: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-dark-800 border border-dark-400 rounded-xl text-sm text-warm-50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
            >
              {priorities.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-warm-200 mb-1">Description</label>
          <textarea
            data-testid="request-description" value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })} required rows={5}
            placeholder="Describe in detail..."
            className="w-full px-3.5 py-2.5 bg-dark-800 border border-dark-400 rounded-xl text-sm text-warm-50 placeholder-warm-500 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 resize-none"
          />
        </div>

        {error && <p data-testid="request-error" className="text-red-400 text-xs">{error}</p>}

        <button data-testid="submit-request-button" type="submit" disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-light text-dark-950 font-semibold rounded-xl text-sm transition-colors disabled:opacity-50"
        >
          <Send size={14} /> {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
}
