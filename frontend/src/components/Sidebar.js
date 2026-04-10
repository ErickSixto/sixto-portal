import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  BarChart3, Layers, Users, CreditCard, Settings, Shield,
  LogOut, Menu, X, Folder
} from 'lucide-react';

const adminLinks = [
  { to: '/admin', icon: BarChart3, label: 'Overview' },
  { to: '/admin/projects', icon: Layers, label: 'Projects' },
  { to: '/admin/clients', icon: Users, label: 'Clients' },
  { to: '/admin/billing', icon: CreditCard, label: 'Billing' },
  { to: '/admin/portals', icon: Settings, label: 'Portals' },
  { to: '/admin/access', icon: Shield, label: 'Access' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
      isActive
        ? 'bg-accent/12 text-accent'
        : 'text-warm-400 hover:text-warm-50 hover:bg-dark-600'
    }`;

  return (
    <>
      <button
        data-testid="mobile-menu-toggle"
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-dark-700 text-warm-50 rounded-lg border border-dark-400"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      <div className={`fixed inset-y-0 left-0 z-40 w-60 bg-dark-950 border-r border-dark-500/50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-dark-500/50">
          <div className="flex items-center gap-2.5">
            <img src="/logo-dark.png" alt="ES" className="w-8 h-8 rounded-md" />
            <div>
              <div className="text-warm-50 text-[13px] font-semibold tracking-wide">Erick Sixto</div>
              <div className="text-warm-500 text-[10px] uppercase tracking-widest">Admin</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto" data-testid="sidebar-nav">
          <div className="px-3 mb-1.5 text-[10px] font-semibold text-warm-500 uppercase tracking-widest">Management</div>
          {adminLinks.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === '/admin'} className={linkClass} onClick={() => setOpen(false)}>
              <l.icon size={16} />
              {l.label}
            </NavLink>
          ))}

          <div className="px-3 mt-4 mb-1.5 text-[10px] font-semibold text-warm-500 uppercase tracking-widest">Portal</div>
          <NavLink to="/projects" className={linkClass} onClick={() => setOpen(false)}>
            <Folder size={16} />
            Client View
          </NavLink>
        </nav>

        <div className="p-3 border-t border-dark-500/50">
          <div className="flex items-center gap-2.5 mb-2 px-1">
            <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center text-accent text-xs font-bold">
              {(user?.name || user?.email || '?')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-warm-100 text-xs font-medium truncate">{user?.name || 'User'}</div>
              <div className="text-warm-500 text-[10px] truncate">{user?.email}</div>
            </div>
          </div>
          <button
            data-testid="logout-button"
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-warm-500 hover:text-warm-100 hover:bg-dark-600 rounded-lg transition-colors"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </div>

      {open && <div className="lg:hidden fixed inset-0 bg-black/60 z-30" onClick={() => setOpen(false)} />}
    </>
  );
}
