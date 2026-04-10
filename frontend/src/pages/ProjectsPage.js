import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';
import { useNavigate } from 'react-router-dom';
import { Folder, ArrowRight, Calendar, LogOut } from 'lucide-react';

const statusStyles = {
  'Not started': 'bg-warm-500/15 text-warm-400 border-warm-500/20',
  'Onboarding': 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  'Research': 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  'In progress': 'bg-accent/15 text-accent border-accent/20',
  'Off boarding': 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  'Done': 'bg-green-500/15 text-green-400 border-green-500/20',
  'Lost': 'bg-red-500/15 text-red-400 border-red-500/20',
};

function ProjectCard({ project, onClick }) {
  const style = statusStyles[project.status] || 'bg-warm-500/15 text-warm-400 border-warm-500/20';
  const isActive = project.status && !['Done', 'Lost', 'Off boarding'].includes(project.status);

  return (
    <button
      data-testid={`project-card-${project.id}`}
      onClick={onClick}
      className="w-full text-left bg-dark-800 rounded-2xl border border-dark-500/40 p-6 hover:border-accent/30 hover:bg-dark-700 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <Folder size={18} className={isActive ? 'text-accent' : 'text-warm-500'} />
        </div>
        <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium border ${style}`}>
          {project.status || 'Unknown'}
        </span>
      </div>
      <h3 className="text-base font-semibold text-warm-50 mb-1 group-hover:text-accent transition-colors">{project.name}</h3>
      <div className="flex items-center gap-3 text-xs text-warm-500 mb-4">
        {project.project_type && <span>{project.project_type}</span>}
        {project.project_date?.start && (
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {project.project_date.start}
          </span>
        )}
      </div>
      <div className="flex items-center text-xs text-accent font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        View Project <ArrowRight size={13} className="ml-1" />
      </div>
    </button>
  );
}

export default function ProjectsPage() {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api('/api/portal/projects')
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const active = projects.filter(p => p.status && !['Done', 'Lost'].includes(p.status));
  const past = projects.filter(p => ['Done', 'Lost'].includes(p.status));

  return (
    <div className="min-h-screen bg-dark-900" data-testid="projects-page">
      <header className="border-b border-dark-500/50 bg-dark-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-dark.png" alt="ES" className="w-8 h-8 rounded-md" />
            <div>
              <div className="text-warm-50 text-sm font-semibold">Erick Sixto</div>
              <div className="text-warm-500 text-[10px] uppercase tracking-widest">Project Portal</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-warm-200 text-xs font-medium">{user?.name || 'User'}</div>
              <div className="text-warm-500 text-[10px]">{user?.email}</div>
            </div>
            <button
              data-testid="logout-button"
              onClick={handleLogout}
              className="p-2 text-warm-500 hover:text-warm-100 hover:bg-dark-600 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-warm-50">Your Projects</h1>
          <p className="text-warm-500 text-sm mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-dark-800 rounded-2xl p-16 border border-dark-500/50 text-center">
            <Folder size={40} className="mx-auto text-warm-600 mb-3" />
            <h2 className="text-warm-300 text-base font-medium mb-1">No projects yet</h2>
            <p className="text-warm-500 text-sm">Projects will appear here once they're set up.</p>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xs font-semibold text-warm-500 uppercase tracking-widest mb-4">Active Projects</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {active.map(p => (
                    <ProjectCard key={p.id} project={p} onClick={() => navigate(`/project/${p.id}`)} />
                  ))}
                </div>
              </section>
            )}
            {past.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-warm-500 uppercase tracking-widest mb-4">Completed</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {past.map(p => (
                    <ProjectCard key={p.id} project={p} onClick={() => navigate(`/project/${p.id}`)} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
