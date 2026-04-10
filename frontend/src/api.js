import { isMockApiEnabled, mockApi } from './mockApi';

const API = process.env.REACT_APP_BACKEND_URL;

function getToken() {
  return localStorage.getItem('sixto_token');
}

function setToken(token) {
  localStorage.setItem('sixto_token', token);
}

function clearToken() {
  localStorage.removeItem('sixto_token');
}

async function api(path, options = {}) {
  if (isMockApiEnabled) {
    return mockApi(path, options);
  }

  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Something went wrong' }));
    const detail = err.detail;
    let msg = 'Something went wrong';
    if (typeof detail === 'string') msg = detail;
    else if (Array.isArray(detail)) msg = detail.map(e => e?.msg || JSON.stringify(e)).join(' ');
    else if (detail?.msg) msg = detail.msg;
    throw new Error(msg);
  }
  return res.json();
}

export { api, getToken, setToken, clearToken };
