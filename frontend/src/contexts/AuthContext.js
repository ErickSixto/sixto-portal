import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setToken, clearToken } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [portalConfig, setPortalConfig] = useState(null);
  const [projects, setProjects] = useState([]);

  const checkAuth = useCallback(async () => {
    try {
      const u = await api('/api/auth/me');
      setUser(u);
    } catch {
      setUser(null);
      clearToken();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const fetchProjects = useCallback(async () => {
    if (!user) return;
    try {
      const p = await api('/api/portal/projects');
      setProjects(p);
      const saved = localStorage.getItem('sixto_project');
      const match = saved ? p.find(x => x.id === saved) : null;
      if (match) {
        setSelectedProject(match);
      } else if (p.length > 0) {
        setSelectedProject(p[0]);
        localStorage.setItem('sixto_project', p[0].id);
      }
    } catch (e) {
      console.error('Failed to fetch projects:', e);
    }
  }, [user]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const fetchConfig = useCallback(async () => {
    if (!selectedProject) return;
    try {
      const cfg = await api(`/api/portal/project/${selectedProject.id}/config`);
      setPortalConfig(cfg);
    } catch {
      setPortalConfig(null);
    }
  }, [selectedProject]);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  const selectProject = (proj) => {
    setSelectedProject(proj);
    localStorage.setItem('sixto_project', proj.id);
  };

  const login = async (email) => {
    return api('/api/auth/request-magic-link', { method: 'POST', body: JSON.stringify({ email }) });
  };

  const verify = async (email, code) => {
    const res = await api('/api/auth/verify-magic-link', { method: 'POST', body: JSON.stringify({ email, code }) });
    if (res.token) setToken(res.token);
    setUser(res.user);
    return res;
  };

  const logout = async () => {
    try { await api('/api/auth/logout', { method: 'POST' }); } catch {}
    clearToken();
    setUser(null);
    setSelectedProject(null);
    setProjects([]);
    setPortalConfig(null);
    localStorage.removeItem('sixto_project');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, verify, logout, projects, selectedProject, selectProject, portalConfig }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
