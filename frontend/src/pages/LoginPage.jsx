import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { clearSession, saveSession } from '../utils/session';

function LoginPage({ theme, onToggleTheme, langue }) {
  const navigate = useNavigate();
  const location = useLocation();
  const role = new URLSearchParams(location.search).get('role') || localStorage.getItem('role_selectionne') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const isDark = theme === 'dark';
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  const pushDebug = (line) => {
    setDebugInfo((prev) => (prev ? `${prev}\n${line}` : line));
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError(langue === 'fr' ? 'Veuillez renseigner tous les champs.' : 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');
    setDebugInfo('');
    try {
      const isSuperuserLogin = role === 'superuser';
      const url = isSuperuserLogin
        ? `${apiBase}/api/accounts/superuser/login/`
        : `${apiBase}/api/accounts/login/`;
      pushDebug(`Appel: ${url}`);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email.trim(), password }),
      });

      pushDebug(`Status: ${res.status}`);
      const data = await res.json().catch(() => null);
      pushDebug(
        `Reçu: token=${data?.token ? `${String(data.token).slice(0, 10)}...` : 'NULL'} role=${data?.role ?? 'NULL'} superuser=${
          data?.is_superuser ? 'yes' : 'no'
        }`
      );
      if (typeof data?.detail === 'string' && data.detail) pushDebug(`Detail: ${data.detail}`);

      if (!res.ok) {
        const detail = typeof data?.detail === 'string' ? data.detail : '';
        if (detail.includes('Restricted superuser')) {
          setError(
            langue === 'fr'
              ? 'Ce compte superuser doit se connecter via le profil Superuser.'
              : 'This superuser account must sign in via the Superuser profile.'
          );
        } else {
          setError(detail || (langue === 'fr' ? 'Identifiants incorrects.' : 'Invalid credentials.'));
        }
        return;
      }

      if (!data?.token) {
        setError(langue === 'fr' ? 'Réponse invalide du serveur (token manquant).' : 'Invalid server response (missing token).');
        return;
      }

      if (role) localStorage.setItem('role_selectionne', role);

      const isSuperuser = Boolean(data?.is_superuser);
      if (role === 'superuser' && !isSuperuser) {
        clearSession();
        setError(langue === 'fr' ? "Accès refusé : ce compte n'est pas superuser." : 'Access denied: this account is not a superuser.');
        return;
      }
      if (role && role !== 'superuser' && !isSuperuser && data?.role !== role) {
        clearSession();
        setError(langue === 'fr' ? `Accès refusé : ce compte n'est pas ${role}.` : `Access denied: this account is not ${role}.`);
        return;
      }

      saveSession({
        token: data.token,
        role: data.role || role,
        user: data.username || data.email || email.trim(),
        scope: isSuperuser ? 'superuser' : (role || data.role || ''),
      });
      if (data?.full_name) localStorage.setItem('full_name', data.full_name);

      const saved = localStorage.getItem('token');
      pushDebug(`Sauvegardé: token=${saved ? saved.slice(0, 10) + '...' : 'NULL'} role=${localStorage.getItem('role') || 'NULL'}`);

      const redirectMap = {
        coordonnateur: '/coordonnateur',
        admin: '/admin',
        superuser: '/superuser',
        enseignant: '/enseignant',
        etudiant: '/etudiant',
        parent: '/parent',
        'cellule-info': '/cellule-info',
      };

      const targetRole = isSuperuser ? 'superuser' : (role || data?.role);
      navigate(redirectMap[targetRole] || '/');

    } catch (err) {
      setError(`Erreur: ${err.message}`);
      pushDebug(`Exception: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 
      ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>

      <button
        className="fixed right-5 top-5 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-rose-800 text-white shadow-lg"
        onClick={onToggleTheme}
        type="button"
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className={`w-full max-w-md rounded-3xl border p-8 shadow-xl
        ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>

        <h1 className="text-2xl font-extrabold text-rose-800">
          {langue === 'fr' ? 'Connexion' : 'Sign in'}
        </h1>

        {role && (
          <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {langue === 'fr' ? `Profil sélectionné : ${role}` : `Selected profile: ${role}`}
          </p>
        )}

        {/* Zone de debug visible dans la page */}
        {debugInfo && (
          <div className="mt-3 whitespace-pre-wrap rounded-xl bg-blue-50 border border-blue-200 px-4 py-2 text-xs text-blue-800 font-mono">
            {debugInfo}
          </div>
        )}

        {error && (
          <p className="mt-3 rounded-xl bg-rose-100 px-4 py-2 text-sm text-rose-700">{error}</p>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alice@gmail.com"
              className={`w-full rounded-xl border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-400
                ${isDark ? 'border-slate-600 bg-slate-800 text-white' : 'border-slate-300 bg-white'}`}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">
              {langue === 'fr' ? 'Mot de passe' : 'Password'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              className={`w-full rounded-xl border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-400
                ${isDark ? 'border-slate-600 bg-slate-800 text-white' : 'border-slate-300 bg-white'}`}
            />
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-rose-800 py-3 font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
          type="button"
        >
          {loading
            ? (langue === 'fr' ? 'Connexion...' : 'Signing in...')
            : (langue === 'fr' ? 'Se connecter' : 'Sign in')}
        </button>

        <button
          onClick={() => navigate('/choix-profil')}
          className="mt-3 w-full rounded-xl border border-slate-300 py-2 text-sm font-semibold text-slate-600 hover:border-rose-400"
          type="button"
        >
          ← {langue === 'fr' ? 'Retour au choix du profil' : 'Back to profile selection'}
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
