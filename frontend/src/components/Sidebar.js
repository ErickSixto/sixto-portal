import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, CheckSquare, Package, CreditCard, Bell, FileText,
  Calendar, MessageSquare, Settings, Users, BarChart3, Layers,
  LogOut, Menu, X, ChevronDown
} from 'lucide-react';

const clientLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', key: null },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks', key: 'show_tasks' },
  { to: '/deliverables', icon: Package, label: 'Deliverables', key: 'show_deliverables' },
  { to: '/billing', icon: CreditCard, label: 'Billing', key: 'show_invoices' },
  { to: '/updates', icon: Bell, label: 'Updates', key: null },
  { to: '/documents', icon: FileText, label: 'Documents', key: 'show_documents' },
  { to: '/meetings', icon: Calendar, label: 'Meetings', key: 'show_meetings' },
  { to: '/request', icon: MessageSquare, label: 'Request', key: 'show_feedback' },
];

const adminLinks = [
  { to: '/admin', icon: BarChart3, label: 'Overview' },
  { to: '/admin/projects', icon: Layers, label: 'Projects' },
  { to: '/admin/clients', icon: Users, label: 'Clients' },
  { to: '/admin/billing', icon: CreditCard, label: 'Billing' },
  { to: '/admin/portals', icon: Settings, label: 'Portals' },
];

export default function Sidebar() {
  const { user, logout, portalConfig, projects, selectedProject, selectProject } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const isAdmin = user?.role === 'admin';

  const visibleLinks = clientLinks.filter(l => {
    if (!l.key) return true;
    if (!portalConfig) return true;
    return portalConfig[l.key] !== false;
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
      isActive ? 'bg-accent text-charcoal' : 'text-white/70 hover:text-white hover:bg-white/10'
    }`;

  return (
    <>
      <button
        data-testid="mobile-menu-toggle"
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-charcoal text-white rounded-lg"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-charcoal flex flex-col transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img src="/logo-dark.png" alt="ES" className="w-9 h-9 rounded" />
            <div>
              <div className="text-white text-sm font-semibold tracking-wide">Erick Sixto</div>
              <div className="text-white/50 text-xs">Customer Portal</div>
            </div>
          </div>
        </div>

        {projects.length > 1 && (
          <div className="px-4 pt-4 relative">
            <button
              data-testid="project-selector"
              onClick={() => setShowProjectMenu(!showProjectMenu)}
              className="w-full flex items-center justify-between px-3 py-2 bg-white/10 rounded-lg text-white text-sm"
            >
              <span className="truncate">{selectedProject?.name || 'Select Project'}</span>
              <ChevronDown size={14} />
            </button>
            {showProjectMenu && (
              <div className="absolute left-4 right-4 mt-1 bg-white rounded-lg shadow-lg py-1 z-50">
                {projects.map(p => (
                  <button
                    key={p.id}
                    data-testid={`project-option-${p.id}`}
                    onClick={() => { selectProject(p); setShowProjectMenu(false); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-oat transition-colors ${
                      selectedProject?.id === p.id ? 'text-charcoal font-semibold bg-oat' : 'text-body'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" data-testid="sidebar-nav">
          {isAdmin && (
            <div className="mb-4">
              <div className="px-4 mb-2 text-xs font-semibold text-white/40 uppercase tracking-wider">Admin</div>
              {adminLinks.map(l => (
                <NavLink key={l.to} to={l.to} end={l.to === '/admin'} className={linkClass} onClick={() => setOpen(false)}>
                  <l.icon size={18} />
                  {l.label}
                </NavLink>
              ))}
            </div>
          )}

          <div className="px-4 mb-2 text-xs font-semibold text-white/40 uppercase tracking-wider">
            {isAdmin ? 'Portal' : 'Navigation'}
          </div>
          {visibleLinks.map(l => (
            <NavLink key={l.to} to={l.to} className={linkClass} onClick={() => setOpen(false)}>
              <l.icon size={18} />
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-charcoal text-sm font-bold">
              {(user?.name || user?.email || '?')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">{user?.name || 'User'}</div>
              <div className="text-white/50 text-xs truncate">{user?.email}</div>
            </div>
          </div>
          <button
            data-testid="logout-button"
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>

      {open && <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setOpen(false)} />}
    </>
  );
}
