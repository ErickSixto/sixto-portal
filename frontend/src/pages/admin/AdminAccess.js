import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { Shield, Plus, Trash2, X } from 'lucide-react';

export default function AdminAccess() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ email: '', name: '', role: 'admin' });
  const [error, setError] = useState('');

  const fetchAccess = () => {
    setLoading(true);
    api('/api/admin/access').then(setEntries).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAccess(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api('/api/admin/access', { method: 'POST', body: JSON.stringify(form) });
      setShowAdd(false);
      setForm({ email: '', name: '', role: 'admin' });
      fetchAccess();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemove = async (email) => {
    if (!window.confirm(`Remove ${email} from access list?`)) return;
    try {
      await api(`/api/admin/access/${encodeURIComponent(email)}`, { method: 'DELETE' });
      fetchAccess();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div data-testid="admin-access-page" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-warm-50">Portal Access</h1>
          <p className="text-warm-400 text-xs mt-1">Manage who can access the admin portal</p>
        </div>
        <button
          data-testid="add-access-button"
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-accent hover:bg-accent-light text-dark-950 text-xs font-semibold rounded-lg transition-colors"
        >
          <Plus size={14} /> Add Member
        </button>
      </div>

      {showAdd && (
        <div className="bg-dark-700 rounded-xl border border-dark-500/50 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-warm-100">Add Access</h3>
            <button onClick={() => { setShowAdd(false); setError(''); }} className="text-warm-500 hover:text-warm-200"><X size={16} /></button>
          </div>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                data-testid="access-email-input"
                type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="email@example.com" required
                className="px-3 py-2 bg-dark-800 border border-dark-400 rounded-lg text-sm text-warm-50 placeholder-warm-500 focus:outline-none focus:border-accent/50"
              />
              <input
                data-testid="access-name-input"
                type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Name (optional)"
                className="px-3 py-2 bg-dark-800 border border-dark-400 rounded-lg text-sm text-warm-50 placeholder-warm-500 focus:outline-none focus:border-accent/50"
              />
              <select
                data-testid="access-role-select"
                value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                className="px-3 py-2 bg-dark-800 border border-dark-400 rounded-lg text-sm text-warm-50 focus:outline-none focus:border-accent/50"
              >
                <option value="admin">Admin</option>
              </select>
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button data-testid="save-access-button" type="submit"
              className="px-4 py-2 bg-accent hover:bg-accent-light text-dark-950 text-xs font-semibold rounded-lg transition-colors"
            >
              Add
            </button>
          </form>
        </div>
      )}

      <div className="bg-dark-700 rounded-xl border border-dark-500/50 overflow-hidden">
        <table className="w-full" data-testid="access-table">
          <thead>
            <tr className="border-b border-dark-500/50">
              <th className="text-left px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Email</th>
              <th className="text-left px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Name</th>
              <th className="text-left px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Role</th>
              <th className="text-right px-5 py-3 text-[10px] font-semibold text-warm-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-500/30">
            {entries.map((e, i) => (
              <tr key={e.email} className={i % 2 === 1 ? 'bg-dark-800/40' : ''} data-testid={`access-row-${e.email}`}>
                <td className="px-5 py-3.5 text-sm text-warm-100">{e.email}</td>
                <td className="px-5 py-3.5 text-xs text-warm-400">{e.name || '—'}</td>
                <td className="px-5 py-3.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-accent/15 text-accent flex items-center gap-1 w-fit">
                    <Shield size={10} /> {e.role}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  {!e.protected && (
                    <button onClick={() => handleRemove(e.email)} className="text-warm-500 hover:text-red-400 transition-colors" data-testid={`remove-${e.email}`}>
                      <Trash2 size={14} />
                    </button>
                  )}
                  {e.protected && <span className="text-[10px] text-warm-600">Primary</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-dark-800 rounded-xl border border-dark-500/30 p-4">
        <p className="text-xs text-warm-500 leading-relaxed">
          <strong className="text-warm-300">Note:</strong> Admin members added here can log in with their email using the magic link flow. 
          Client access is managed through your Notion Client database — any email in the Client DB with "Active" status can log in as a client.
        </p>
      </div>
    </div>
  );
}
