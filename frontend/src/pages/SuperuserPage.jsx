import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowLeft, Crown, KeyRound, Search, ShieldCheck, Trash2, UserPlus, Users } from 'lucide-react';
import { clearSession, readSession, saveSession } from '../utils/session';

const superuserLogin = import.meta.env.VITE_SUPERUSER_EMAIL || '';
const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const roleOptions = ['admin', 'enseignant', 'coordonnateur', 'cellule-info', 'parent', 'etudiant'];

function SuperuserPage({ langue, onLangueChange }) {
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authToken, setAuthToken] = useState(() => readSession().token);
  const [authUser, setAuthUser] = useState(() => readSession().user);
  const [authScope, setAuthScope] = useState(() => readSession().scope);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [users, setUsers] = useState([]);
  const [count, setCount] = useState(0);
  const [nextUrl, setNextUrl] = useState('');
  const [prevUrl, setPrevUrl] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [auditEvents, setAuditEvents] = useState([]);
  const [auditCount, setAuditCount] = useState(0);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);
  const [auditError, setAuditError] = useState('');

  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [approvedFilter, setApprovedFilter] = useState('');

  const [status, setStatus] = useState({ type: '', message: '' });
  const [updatingUserId, setUpdatingUserId] = useState(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [cycle, setCycle] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [emailDrafts, setEmailDrafts] = useState({});
  const [roleDrafts, setRoleDrafts] = useState({});
  const [cycleDrafts, setCycleDrafts] = useState({});
  const [passwordDrafts, setPasswordDrafts] = useState({});
  const [passwordConfirmDrafts, setPasswordConfirmDrafts] = useState({});

  const textes = {
    fr: {
      title: 'Superuser Control Room', subtitle: 'Pilotage complet des utilisateurs et des acces', loginTitle: 'Connexion superuser',
      email: 'Email superuser (identifiant)', password: 'Mot de passe', signIn: 'Se connecter', signOut: 'Se deconnecter',
      missingFields: 'Veuillez renseigner les champs.', invalidCredentials: 'Identifiants invalides.',
      accessDenied: 'Acces reserve au compte superuser unique.', tokenExpired: 'Session expiree, reconnectez-vous.',
      backToRoles: 'Retour aux roles', home: 'Accueil', users: 'Utilisateurs', active: 'Actifs', approved: 'Approuves', admins: 'Admins',
      createUser: 'Creer un compte', fullName: 'Nom complet', userEmail: 'Adresse email', role: 'Role', cycle: 'Cycle',
      confirmPassword: 'Confirmer mot de passe', create: 'Creer', userCreated: 'Utilisateur cree avec succes.', save: 'Enregistrer',
      updateOk: 'Utilisateur mis a jour.', updateError: 'Mise a jour impossible.', createError: "Impossible de creer l'utilisateur.",
      delete: 'Supprimer', deleteConfirm: 'Confirmer la suppression de ce compte ?', search: 'Rechercher nom/email/role',
      roleFilter: 'Filtre role', activeFilter: 'Filtre actif', approvedFilter: 'Filtre approuve', all: 'Tous', yes: 'Oui', no: 'Non',
      page: 'Page', prev: 'Precedent', next: 'Suivant', total: 'Total', noData: 'Aucun utilisateur trouve.', loading: 'Chargement...',
      activityTitle: 'Journal d activite', activityIntro: 'Dernieres actions de la plateforme (creation, mise a jour, suppression, connexions).', noActivity: 'Aucun evenement pour le moment.',
      pwdMismatch: 'Les mots de passe ne correspondent pas.', pwdMin: 'Le mot de passe doit contenir au moins 6 caracteres.',
      mustChooseRole: 'Merci de choisir un role.', invalidEmail: 'Merci de saisir un email valide.', missingName: 'Merci de saisir le nom complet.',
      missingPassword: 'Merci de saisir un mot de passe.', cycleRequired: 'Merci de renseigner le cycle du coordonnateur.',
    },
    en: {
      title: 'Superuser Control Room', subtitle: 'Full management of users and access', loginTitle: 'Superuser login',
      email: 'Superuser email (username)', password: 'Password', signIn: 'Sign in', signOut: 'Sign out',
      missingFields: 'Please fill in all fields.', invalidCredentials: 'Invalid credentials.',
      accessDenied: 'Access is restricted to the unique superuser account.', tokenExpired: 'Session expired, please sign in again.',
      backToRoles: 'Back to roles', home: 'Home', users: 'Users', active: 'Active', approved: 'Approved', admins: 'Admins',
      createUser: 'Create account', fullName: 'Full name', userEmail: 'Email address', role: 'Role', cycle: 'Cycle',
      confirmPassword: 'Confirm password', create: 'Create', userCreated: 'User created successfully.', save: 'Save',
      updateOk: 'User updated.', updateError: 'Unable to update user.', createError: 'Unable to create user.',
      delete: 'Delete', deleteConfirm: 'Confirm deletion of this account?', search: 'Search name/email/role',
      roleFilter: 'Role filter', activeFilter: 'Active filter', approvedFilter: 'Approved filter', all: 'All', yes: 'Yes', no: 'No',
      page: 'Page', prev: 'Prev', next: 'Next', total: 'Total', noData: 'No user found.', loading: 'Loading...',
      activityTitle: 'Activity feed', activityIntro: 'Latest platform actions (create, update, delete, logins).', noActivity: 'No event yet.',
      pwdMismatch: 'Passwords do not match.', pwdMin: 'Password must be at least 6 chars.', mustChooseRole: 'Please choose a role.',
      invalidEmail: 'Please enter a valid email.', missingName: 'Please enter full name.', missingPassword: 'Please enter a password.',
      cycleRequired: 'Please enter coordinator cycle.',
    },
  };

  const t = textes[langue] || textes.fr;
  const isAllowedSuperuser =
    !!authToken &&
    (
      authScope === 'superuser' ||
      String(authUser || '').toLowerCase() === String(superuserLogin || '').toLowerCase()
    );

  const roleLabel = (value) => {
    const fr = { admin: 'Admin', enseignant: 'Enseignant', coordonnateur: 'Coordonnateur', 'cellule-info': 'Cellule info', parent: 'Parent', etudiant: 'Etudiant' };
    const en = { admin: 'Admin', enseignant: 'Teacher', coordonnateur: 'Coordinator', 'cellule-info': 'IT Cell', parent: 'Parent', etudiant: 'Student' };
    return (langue === 'fr' ? fr : en)[value] || value || '-';
  };

  const toErrorMessage = async (res, fallback) => {
    const data = await res.json().catch(() => null);
    if (!data || typeof data !== 'object') return fallback;
    if (typeof data.detail === 'string' && data.detail) return data.detail;
    const details = Object.entries(data)
      .map(([k, v]) => (Array.isArray(v) ? `${k}: ${v.join(' ')}` : typeof v === 'string' ? `${k}: ${v}` : ''))
      .filter(Boolean)
      .join(' | ');
    return details || fallback;
  };

  const initDrafts = useCallback((list) => {
    setEmailDrafts(Object.fromEntries(list.map((u) => [u.id, u.email || ''])));
    setRoleDrafts(Object.fromEntries(list.map((u) => [u.id, u.role || ''])));
    setCycleDrafts(Object.fromEntries(list.map((u) => [u.id, u.cycle || ''])));
    setPasswordDrafts(Object.fromEntries(list.map((u) => [u.id, ''])));
    setPasswordConfirmDrafts(Object.fromEntries(list.map((u) => [u.id, ''])));
  }, []);

  const fetchUsers = useCallback(async (pageValue = 1) => {
    if (!authToken) return;
    setIsLoadingUsers(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(pageValue));
      params.set('page_size', String(pageSize));
      if (query.trim()) params.set('q', query.trim());
      if (roleFilter) params.set('role', roleFilter);
      if (activeFilter) params.set('is_active', activeFilter);
      if (approvedFilter) params.set('is_approved', approvedFilter);

      const res = await fetch(`${apiBase}/api/accounts/users/?${params.toString()}`, {
        headers: { Authorization: `Token ${authToken}` },
      });

      if (res.status === 401) {
        clearSession();
        setAuthToken('');
        setAuthUser('');
        setAuthScope('');
        setUsers([]);
        setAuthError(t.tokenExpired);
        return;
      }
      if (!res.ok) throw new Error(await toErrorMessage(res, t.updateError));

      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.results || [];
      setUsers(list);
      setCount(data?.count || list.length);
      setNextUrl(data?.next || '');
      setPrevUrl(data?.previous || '');
      setPage(pageValue);
      initDrafts(list);
    } catch (error) {
      setUsers([]);
      setStatus({ type: 'error', message: error?.message || t.updateError });
    } finally {
      setIsLoadingUsers(false);
    }
  }, [authToken, pageSize, query, roleFilter, activeFilter, approvedFilter, t.tokenExpired, t.updateError, initDrafts]);

  useEffect(() => {
    if (!isAllowedSuperuser) return;
    fetchUsers(1);
  }, [isAllowedSuperuser, fetchUsers]);

  const fetchAuditEvents = useCallback(async () => {
    if (!authToken) return;
    setIsLoadingAudit(true);
    setAuditError('');
    try {
      const res = await fetch(`${apiBase}/api/accounts/audit-events/?page=1&page_size=30`, {
        headers: { Authorization: `Token ${authToken}` },
      });
      if (res.status === 401) {
        clearSession();
        setAuthToken('');
        setAuthUser('');
        setAuthScope('');
        setAuditEvents([]);
        setAuthError(t.tokenExpired);
        return;
      }
      if (!res.ok) throw new Error(await toErrorMessage(res, t.updateError));
      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.results || [];
      setAuditEvents(list);
      setAuditCount(data?.count || list.length);
    } catch (error) {
      setAuditEvents([]);
      setAuditError(error?.message || t.updateError);
    } finally {
      setIsLoadingAudit(false);
    }
  }, [authToken, t.tokenExpired, t.updateError]);

  useEffect(() => {
    if (!isAllowedSuperuser) return;
    fetchAuditEvents();
  }, [isAllowedSuperuser, fetchAuditEvents]);

  const metrics = useMemo(() => ({
    total: count,
    active: users.filter((u) => u?.is_active).length,
    approved: users.filter((u) => u?.is_approved).length,
    admins: users.filter((u) => u?.role === 'admin').length,
  }), [count, users]);

  const handleLogin = async () => {
    if (!loginId.trim() || !loginPassword.trim()) return setAuthError(t.missingFields);
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch(`${apiBase}/api/accounts/superuser/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginId.trim(), password: loginPassword }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) return setAuthError(data?.detail || t.invalidCredentials);

      const normalized = superuserLogin.toLowerCase();
      const usernameVal = String(data?.username || '').toLowerCase();
      const emailVal = String(data?.email || '').toLowerCase();
      if (!data?.is_superuser || (usernameVal !== normalized && emailVal !== normalized)) return setAuthError(t.accessDenied);

      saveSession({
        token: data.token,
        role: data.role || 'admin',
        user: data.username || data.email || loginId.trim(),
        scope: 'superuser',
      });
      setAuthToken(data.token);
      setAuthUser(data.username || data.email || loginId.trim());
      setAuthScope('superuser');
      setLoginPassword('');
    } catch {
      setAuthError(t.invalidCredentials);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    setAuthToken('');
    setAuthUser('');
      setAuthScope('');
      setLoginId('');
      setLoginPassword('');
      setUsers([]);
      setAuditEvents([]);
    };

  const patchUser = async (userId, payload) => {
    if (!authToken) return;
    setUpdatingUserId(userId);
    try {
      const res = await fetch(`${apiBase}/api/accounts/users/${userId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Token ${authToken}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await toErrorMessage(res, t.updateError));
      setStatus({ type: 'success', message: t.updateOk });
      await fetchUsers(page);
      await fetchAuditEvents();
    } catch (error) {
      setStatus({ type: 'error', message: error?.message || t.updateError });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const deleteUser = async (userId) => {
    if (!authToken || !window.confirm(t.deleteConfirm)) return;
    setUpdatingUserId(userId);
    try {
      const res = await fetch(`${apiBase}/api/accounts/users/${userId}/`, {
        method: 'DELETE',
        headers: { Authorization: `Token ${authToken}` },
      });
      if (!res.ok) throw new Error(await toErrorMessage(res, t.updateError));
      setStatus({ type: 'success', message: t.updateOk });
      await fetchUsers(page);
      await fetchAuditEvents();
    } catch (error) {
      setStatus({ type: 'error', message: error?.message || t.updateError });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleCreateUser = async () => {
    if (!fullName.trim()) return setStatus({ type: 'error', message: t.missingName });
    if (!email.includes('@')) return setStatus({ type: 'error', message: t.invalidEmail });
    if (!role) return setStatus({ type: 'error', message: t.mustChooseRole });
    if (role === 'coordonnateur' && !cycle.trim()) return setStatus({ type: 'error', message: t.cycleRequired });
    if (!password.trim()) return setStatus({ type: 'error', message: t.missingPassword });
    if (password !== passwordConfirm) return setStatus({ type: 'error', message: t.pwdMismatch });
    if (!authToken) return setStatus({ type: 'error', message: t.accessDenied });

    const parts = fullName.trim().split(/\s+/);
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });
    try {
      const res = await fetch(`${apiBase}/api/accounts/users/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Token ${authToken}` },
        body: JSON.stringify({
          username: email.trim().toLowerCase(), first_name: parts[0] || '', last_name: parts.slice(1).join(' '),
          email: email.trim().toLowerCase(), role, cycle: role === 'coordonnateur' ? cycle.trim() : '', password,
        }),
      });
      if (!res.ok) throw new Error(await toErrorMessage(res, t.createError));
      setStatus({ type: 'success', message: t.userCreated });
      setFullName(''); setEmail(''); setRole(''); setCycle(''); setPassword(''); setPasswordConfirm('');
      await fetchUsers(1);
      await fetchAuditEvents();
    } catch (error) {
      setStatus({ type: 'error', message: error?.message || t.createError });
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyUserDraft = (user) => {
    const draftRole = roleDrafts[user.id] || '';
    const draftCycle = cycleDrafts[user.id] || '';
    const draftEmail = (emailDrafts[user.id] || '').trim().toLowerCase();
    if (!draftEmail.includes('@')) return setStatus({ type: 'error', message: t.invalidEmail });
    if (!draftRole) return setStatus({ type: 'error', message: t.mustChooseRole });
    if (draftRole === 'coordonnateur' && !draftCycle.trim()) return setStatus({ type: 'error', message: t.cycleRequired });
    patchUser(user.id, { email: draftEmail, role: draftRole, cycle: draftRole === 'coordonnateur' ? draftCycle.trim() : '' });
  };

  const applyPasswordDraft = (user) => {
    const pwd = passwordDrafts[user.id] || '';
    const confirm = passwordConfirmDrafts[user.id] || '';
    if (pwd.length < 6 || confirm.length < 6) return setStatus({ type: 'error', message: t.pwdMin });
    if (pwd !== confirm) return setStatus({ type: 'error', message: t.pwdMismatch });
    patchUser(user.id, { password: pwd });
  };

  if (!isAllowedSuperuser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-950 to-slate-900 text-slate-100">
        <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10">
          <div className="grid w-full gap-8 lg:grid-cols-2">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-1 text-xs uppercase tracking-[0.2em] text-amber-300"><Crown size={13} /> superuser</p>
              <h1 className="text-4xl font-black tracking-tight md:text-5xl">{t.title}</h1>
              <p className="mt-4 max-w-xl text-slate-300">{t.subtitle}</p>
            </div>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur">
              <h2 className="text-2xl font-semibold">{t.loginTitle}</h2>
              <div className="mt-5 space-y-3">
                <input className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-white outline-none focus:border-rose-500" placeholder={t.email} value={loginId} onChange={(e) => setLoginId(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
                <input className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-white outline-none focus:border-rose-500" placeholder={t.password} type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
              </div>
              <button className="mt-5 w-full rounded-xl bg-rose-700 px-5 py-3 font-semibold text-white hover:bg-rose-600 disabled:opacity-60" type="button" onClick={handleLogin} disabled={authLoading}>{authLoading ? '...' : t.signIn}</button>
              {authError ? <p className="mt-3 text-sm text-rose-400">{authError}</p> : null}

              <div className="mt-5 flex flex-wrap gap-2">
                <Link to="/choix-profil" className="rounded-full border border-slate-600 px-4 py-2 text-xs">&lt;- {t.backToRoles}</Link>
                {['fr', 'en'].map((l) => (
                  <button key={l} type="button" onClick={() => onLangueChange(l)} className={`rounded-full px-3 py-1 text-xs font-semibold ${langue === l ? 'bg-white text-slate-900' : 'border border-slate-600 text-slate-200'}`}>{l.toUpperCase()}</button>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-950 to-slate-900 text-slate-100">
      <div className="mx-auto w-full max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link to="/choix-profil" className="rounded-full border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800"><ArrowLeft size={16} className="inline" /> {t.backToRoles}</Link>
            <Link to="/" className="rounded-full border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800">{t.home}</Link>
          </div>
          <div className="flex items-center gap-2">
            {['fr', 'en'].map((l) => (
              <button key={l} type="button" onClick={() => onLangueChange(l)} className={`rounded-full px-3 py-1 text-xs font-semibold ${langue === l ? 'bg-white text-slate-900' : 'border border-slate-600 text-slate-200'}`}>{l.toUpperCase()}</button>
            ))}
            <button className="rounded-full border border-slate-600 px-3 py-1 text-xs font-semibold hover:bg-slate-800" type="button" onClick={handleLogout}>{t.signOut}</button>
          </div>
        </div>

        <header className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="inline-flex items-center gap-2 text-3xl font-black md:text-4xl"><Crown size={26} className="text-amber-300" />{t.title}</h1>
              <p className="mt-2 text-slate-300">{t.subtitle}</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300"><ShieldCheck size={14} /> AUTH OK</div>
          </div>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[{ label: `${t.total} ${t.users}`, val: metrics.total }, { label: t.active, val: metrics.active }, { label: t.approved, val: metrics.approved }, { label: t.admins, val: metrics.admins }].map((item) => (
            <article key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-wide text-slate-400">{item.label}</p>
              <p className="mt-1 text-3xl font-black">{item.val}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="inline-flex items-center gap-2 text-lg font-semibold"><Activity size={18} className="text-cyan-300" /> {t.activityTitle}</h2>
              <p className="mt-1 text-sm text-slate-300">{t.activityIntro}</p>
            </div>
            <button
              type="button"
              onClick={fetchAuditEvents}
              className="rounded-xl border border-slate-600 px-3 py-2 text-xs font-semibold hover:bg-slate-800"
              disabled={isLoadingAudit}
            >
              {isLoadingAudit ? '...' : t.search}
            </button>
          </div>
          <div className="grid gap-2">
            {isLoadingAudit ? <p className="px-2 py-2 text-sm text-slate-300">{t.loading}</p> : null}
            {!isLoadingAudit && auditError ? <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-3 text-sm text-rose-200">{auditError}</p> : null}
            {!isLoadingAudit && !auditError && auditEvents.length === 0 ? <p className="rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-slate-300">{t.noActivity}</p> : null}
            {auditEvents.map((item) => (
              <article key={item.id} className="rounded-2xl border border-white/10 bg-black/30 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs uppercase tracking-wide text-slate-400">{item.event_type || '-'}</p>
                  <p className="text-xs text-slate-400">{item.created_at ? new Date(item.created_at).toLocaleString() : '-'}</p>
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-100">{item.message || '-'}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-300">
                  <span className="rounded-full border border-slate-600 px-2 py-0.5">{item.method || '-'}</span>
                  <span className="rounded-full border border-slate-600 px-2 py-0.5">HTTP {item.status_code || 0}</span>
                  <span className="rounded-full border border-slate-600 px-2 py-0.5">{item.actor_username || 'anonymous'}</span>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-400">{t.total}: {auditCount}</p>
        </section>

        {status.message ? <div className={`mt-6 rounded-xl border px-4 py-3 text-sm ${status.type === 'success' ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200' : 'border-rose-400/40 bg-rose-500/10 text-rose-200'}`}>{status.message}</div> : null}

        <section className="mt-6 grid gap-6 lg:grid-cols-12">
          <article className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur lg:col-span-4">
            <h2 className="mb-4 inline-flex items-center gap-2 text-lg font-semibold"><UserPlus size={18} className="text-rose-300" /> {t.createUser}</h2>
            <div className="grid gap-3">
              <input type="text" className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 outline-none focus:border-rose-500" placeholder={t.fullName} value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <input type="email" className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 outline-none focus:border-rose-500" placeholder={t.userEmail} value={email} onChange={(e) => setEmail(e.target.value)} />
              <select className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 outline-none focus:border-rose-500" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="">{t.role}</option>
                {roleOptions.map((opt) => <option key={opt} value={opt}>{roleLabel(opt)}</option>)}
              </select>
              {role === 'coordonnateur' ? <input type="text" className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 outline-none focus:border-rose-500" placeholder={t.cycle} value={cycle} onChange={(e) => setCycle(e.target.value)} /> : null}
              <input type="password" className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 outline-none focus:border-rose-500" placeholder={t.password} value={password} onChange={(e) => setPassword(e.target.value)} />
              <input type="password" className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 outline-none focus:border-rose-500" placeholder={t.confirmPassword} value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} />
            </div>
            <button className="mt-4 w-full rounded-xl bg-rose-700 px-5 py-2 font-semibold hover:bg-rose-600 disabled:opacity-60" type="button" onClick={handleCreateUser} disabled={isSubmitting}>{isSubmitting ? '...' : t.create}</button>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur lg:col-span-8">
            <div className="mb-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <label className="relative block lg:col-span-2"><Search size={14} className="absolute left-3 top-3 text-slate-400" /><input className="w-full rounded-xl border border-slate-700 bg-slate-900/70 py-2 pl-9 pr-3 text-sm outline-none focus:border-rose-500" placeholder={t.search} value={query} onChange={(e) => setQuery(e.target.value)} /></label>
              <select className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-rose-500" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="">{t.roleFilter}: {t.all}</option>
                {roleOptions.map((opt) => <option key={opt} value={opt}>{roleLabel(opt)}</option>)}
              </select>
              <select className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-rose-500" value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}>
                <option value="">{t.activeFilter}: {t.all}</option><option value="true">{t.yes}</option><option value="false">{t.no}</option>
              </select>
              <select className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-rose-500" value={approvedFilter} onChange={(e) => setApprovedFilter(e.target.value)}>
                <option value="">{t.approvedFilter}: {t.all}</option><option value="true">{t.yes}</option><option value="false">{t.no}</option>
              </select>
              <select className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-rose-500" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option></select>
              <button type="button" onClick={() => fetchUsers(1)} className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white">{t.search}</button>
            </div>

            <div className="grid gap-3">
              {isLoadingUsers ? <p className="px-2 py-2 text-sm text-slate-300">{t.loading}</p> : null}
              {!isLoadingUsers && users.length === 0 ? <p className="rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-slate-300">{t.noData}</p> : null}

              {users.map((u) => {
                const isBusy = updatingUserId === u.id;
                const draftRole = roleDrafts[u.id] || '';
                return (
                  <article key={u.id} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div><p className="text-sm font-semibold">{[u.first_name, u.last_name].filter(Boolean).join(' ') || u.username}</p><p className="text-xs text-slate-400">{u.username}</p></div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button type="button" disabled={isBusy} onClick={() => patchUser(u.id, { is_active: !u.is_active })} className={`rounded-full px-3 py-1 text-xs font-semibold ${u.is_active ? 'bg-emerald-500/20 text-emerald-200' : 'bg-rose-500/20 text-rose-200'}`}>{t.active}: {u.is_active ? t.yes : t.no}</button>
                        <button type="button" disabled={isBusy} onClick={() => patchUser(u.id, { is_approved: !u.is_approved })} className={`rounded-full px-3 py-1 text-xs font-semibold ${u.is_approved ? 'bg-cyan-500/20 text-cyan-200' : 'bg-amber-500/20 text-amber-200'}`}>{t.approved}: {u.is_approved ? t.yes : t.no}</button>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <input type="email" className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-rose-500" value={emailDrafts[u.id] || ''} onChange={(e) => setEmailDrafts((prev) => ({ ...prev, [u.id]: e.target.value }))} placeholder={t.userEmail} />
                      <select className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-rose-500" value={roleDrafts[u.id] || ''} onChange={(e) => setRoleDrafts((prev) => ({ ...prev, [u.id]: e.target.value }))}><option value="">{t.role}</option>{roleOptions.map((opt) => <option key={opt} value={opt}>{roleLabel(opt)}</option>)}</select>
                      {draftRole === 'coordonnateur' ? <input type="text" className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-rose-500" value={cycleDrafts[u.id] || ''} onChange={(e) => setCycleDrafts((prev) => ({ ...prev, [u.id]: e.target.value }))} placeholder={t.cycle} /> : null}
                      <button type="button" onClick={() => applyUserDraft(u)} disabled={isBusy} className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white disabled:opacity-60">{t.save}</button>
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <div className="md:col-span-2 grid gap-3 sm:grid-cols-2">
                        <input type="password" className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-rose-500" placeholder={t.password} value={passwordDrafts[u.id] || ''} onChange={(e) => setPasswordDrafts((prev) => ({ ...prev, [u.id]: e.target.value }))} />
                        <input type="password" className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-rose-500" placeholder={t.confirmPassword} value={passwordConfirmDrafts[u.id] || ''} onChange={(e) => setPasswordConfirmDrafts((prev) => ({ ...prev, [u.id]: e.target.value }))} />
                      </div>
                      <button type="button" onClick={() => applyPasswordDraft(u)} disabled={isBusy} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800 disabled:opacity-60"><KeyRound size={14} /> {t.save}</button>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                      <span>{roleLabel(u.role)}</span>
                      <button type="button" onClick={() => deleteUser(u.id)} disabled={isBusy} className="inline-flex items-center gap-2 rounded-xl border border-rose-500/50 px-3 py-1 text-rose-300 hover:bg-rose-500/10 disabled:opacity-60"><Trash2 size={13} /> {t.delete}</button>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm text-slate-300"><Users size={14} className="mr-1 inline" />{t.total}: {count}</span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => prevUrl && fetchUsers(page - 1)} disabled={!prevUrl || isLoadingUsers} className="rounded-full bg-slate-800 px-4 py-2 text-sm disabled:opacity-40">{t.prev}</button>
                <span className="text-sm">{t.page} {page}</span>
                <button type="button" onClick={() => nextUrl && fetchUsers(page + 1)} disabled={!nextUrl || isLoadingUsers} className="rounded-full bg-rose-700 px-4 py-2 text-sm disabled:opacity-40">{t.next}</button>
              </div>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}

export default SuperuserPage;