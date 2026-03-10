const KEY_TOKEN = 'token';
const KEY_ROLE = 'role';
const KEY_USER = 'username';
const KEY_SCOPE = 'auth_scope';

export function readSession() {
  return {
    token: localStorage.getItem(KEY_TOKEN) || '',
    role: localStorage.getItem(KEY_ROLE) || '',
    user: localStorage.getItem(KEY_USER) || '',
    scope: localStorage.getItem(KEY_SCOPE) || '',
  };
}

export function saveSession({ token = '', role = '', user = '', scope = '' }) {
  if (token) localStorage.setItem(KEY_TOKEN, token);
  if (role) localStorage.setItem(KEY_ROLE, role);
  if (user) localStorage.setItem(KEY_USER, user);
  if (scope) localStorage.setItem(KEY_SCOPE, scope);
}

export function clearSession() {
  localStorage.removeItem(KEY_TOKEN);
  localStorage.removeItem(KEY_ROLE);
  localStorage.removeItem(KEY_USER);
  localStorage.removeItem(KEY_SCOPE);
}
