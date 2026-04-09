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
        method: 'POST',
        body: JSON.stringify(form),
      });
      setSuccess(true);
      setForm({ name: '', type: 'Question', priority: 'Medium', description: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedProject) return <div className="text-secondary text-center py-20">No project selected.</div>;

  if (success) return (
    <div data-testid="request-success" className="max-w-lg mx-auto text-center py-20">
      <CheckCircle2 size={48} className="mx-auto text-green-500 mb-4" />
      <h2 className="text-xl font-bold text-charcoal mb-2">Request Submitted</h2>
      <p className="text-body mb-6">Your request has been submitted successfully. We'll get back to you soon.</p>
      <button
        onClick={() => setSuccess(false)}
        className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-charcoal font-semibold rounded-xl text-sm transition-colors"
        data-testid="submit-another-button"
      >
        Submit Another Request
      </button>
    </div>
  );

  return (
    <div data-testid="request-page" className="max-w-2xl">
      <h1 className="text-2xl font-bold text-charcoal mb-1">Submit a Request</h1>
      <p className="text-secondary text-sm mb-6">Have a question, feedback, or need a change? Let us know.</p>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1.5">Subject</label>
          <input
            data-testid="request-name"
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
            placeholder="Brief summary of your request"
            className="w-full px-4 py-2.5 border border-border rounded-xl text-sm text-charcoal placeholder-secondary/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Type</label>
            <select
              data-testid="request-type"
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm text-charcoal focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white"
            >
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1.5">Priority</label>
            <select
              data-testid="request-priority"
              value={form.priority}
              onChange={e => setForm({ ...form, priority: e.target.value })}
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm text-charcoal focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-white"
            >
              {priorities.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal mb-1.5">Description</label>
          <textarea
            data-testid="request-description"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            required
            rows={5}
            placeholder="Describe your request in detail..."
            className="w-full px-4 py-2.5 border border-border rounded-xl text-sm text-charcoal placeholder-secondary/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none"
          />
        </div>

        {error && <p data-testid="request-error" className="text-red-500 text-sm">{error}</p>}

        <button
          data-testid="submit-request-button"
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-hover text-charcoal font-semibold rounded-xl text-sm transition-colors disabled:opacity-50"
        >
          <Send size={16} />
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
}
