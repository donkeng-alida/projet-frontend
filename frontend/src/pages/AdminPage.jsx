import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Users, ShieldCheck, ClipboardList, ArrowLeft, BookOpen } from 'lucide-react';

function AdminPage({ theme, langue, onToggleTheme, onLangueChange }) {
  const isDark = theme === 'dark';
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [cycle, setCycle] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  const [recentActions, setRecentActions] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [notes, setNotes] = useState([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [notesError, setNotesError] = useState('');
  const [notesPage, setNotesPage] = useState(1);
  const [notesNext, setNotesNext] = useState('');
  const [notesPrev, setNotesPrev] = useState('');
  const [notesCount, setNotesCount] = useState(0);
  const [notesPageSize, setNotesPageSize] = useState(50);

  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('auth_token') || '');
  const [authRole, setAuthRole] = useState(() => localStorage.getItem('auth_role') || '');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const textes = {
    fr: {
      titre: 'Espace Administrateur',
      sousTitre: 'Creation de comptes et gestion des utilisateurs',
      creerCompte: 'Creer un compte',
      nomComplet: 'Nom complet',
      email: 'Adresse email',
      role: 'Role',
      cycle: 'Cycle (coordonnateur)',
      motDePasse: 'Mot de passe',
      utilisateurCree: 'Utilisateur cree avec succes.',
      erreurCreation: "Impossible de creer l'utilisateur.",
      nomManquant: 'Merci de saisir le nom complet.',
      emailManquant: 'Merci de saisir un email valide.',
      roleManquant: 'Merci de choisir un role.',
      cycleManquant: 'Merci de renseigner le cycle du coordonnateur.',
      mdpManquant: 'Merci de saisir un mot de passe.',
      admin: 'Admin',
      enseignant: 'Enseignant',
      coordonnateur: 'Coordonnateur',
      celluleInfo: 'Cellule info',
      parent: 'Parent',
      etudiant: 'Etudiant',
      creer: 'Creer',
      statistiques: 'Statistiques',
      comptesActifs: 'Comptes actifs',
      rolesDefinis: 'Roles definis',
      actions: 'Actions recentes',
      aucuneAction: 'Aucune action recente pour le moment',
      chargementActions: 'Chargement...',
      retourRoles: 'Retour aux roles',
      accueil: 'Accueil',
      notesRecues: 'Notes recues',
      notesIntro: 'Toutes les notes envoyees par les enseignants.',
      notesVides: 'Aucune note pour le moment.',
      enseignantLib: 'Enseignant',
      etudiantLib: 'Etudiant',
      matiereLib: 'Matiere',
      noteLib: 'Note',
      cycleLib: 'Cycle',
      filieresLib: 'Filieres',
      dateLib: 'Date',
      connexionTitre: 'Connexion Administrateur',
      identifiant: 'Identifiant (email)',
      seConnecter: 'Se connecter',
      deconnexion: 'Se deconnecter',
      motDePasseLogin: 'Mot de passe',
      accesRefuse: "Acces refuse : ce compte n'est pas admin.",
      erreurLogin: 'Identifiants invalides.',
      champsRequis: 'Veuillez renseigner les champs.',
      retour: 'Retour',
      page: 'Page',
      precedent: 'Precedent',
      suivant: 'Suivant',
      taillePage: 'Taille de page',
    },
    en: {
      titre: 'Administrator Space',
      sousTitre: 'Account creation and user management',
      creerCompte: 'Create account',
      nomComplet: 'Full name',
      email: 'Email address',
      role: 'Role',
      cycle: 'Cycle (coordinator)',
      motDePasse: 'Password',
      utilisateurCree: 'User created successfully.',
      erreurCreation: 'Unable to create user.',
      nomManquant: 'Please enter the full name.',
      emailManquant: 'Please enter a valid email.',
      roleManquant: 'Please choose a role.',
      cycleManquant: 'Please enter coordinator cycle.',
      mdpManquant: 'Please enter a password.',
      admin: 'Admin',
      enseignant: 'Teacher',
      coordonnateur: 'Coordinator',
      celluleInfo: 'IT Cell',
      parent: 'Parent',
      etudiant: 'Student',
      creer: 'Create',
      statistiques: 'Statistics',
      comptesActifs: 'Active accounts',
      rolesDefinis: 'Defined roles',
      actions: 'Recent actions',
      aucuneAction: 'No recent action yet',
      chargementActions: 'Loading...',
      retourRoles: 'Back to roles',
      accueil: 'Home',
      notesRecues: 'Received marks',
      notesIntro: 'All marks submitted by teachers.',
      notesVides: 'No marks yet.',
      enseignantLib: 'Teacher',
      etudiantLib: 'Student',
      matiereLib: 'Subject',
      noteLib: 'Mark',
      cycleLib: 'Cycle',
      filieresLib: 'Tracks',
      dateLib: 'Date',
      connexionTitre: 'Admin Login',
      identifiant: 'Username (email)',
      seConnecter: 'Sign in',
      deconnexion: 'Sign out',
      motDePasseLogin: 'Password',
      accesRefuse: 'Access denied: this account is not admin.',
      erreurLogin: 'Invalid credentials.',
      champsRequis: 'Please fill in all fields.',
      retour: 'Back',
      page: 'Page',
      precedent: 'Prev',
      suivant: 'Next',
      taillePage: 'Page size',
    },
  };

  const t = textes[langue] || textes.fr;
  const roleLabels = {
    admin: t.admin,
    enseignant: t.enseignant,
    coordonnateur: t.coordonnateur,
    'cellule-info': t.celluleInfo,
    parent: t.parent,
    etudiant: t.etudiant,
  };

  const isAdmin = authToken && authRole === 'admin';

  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch(`${apiBase}/api/accounts/users/`);
      if (!res.ok) throw new Error('users_fetch_failed');
      const data = await res.json();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : [];
      setUsers(list);
    } catch (err) {
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  }, [apiBase]);

  const fetchNotes = useCallback(async (page = 1, pageSize = notesPageSize) => {
    if (!authToken) return;
    setIsLoadingNotes(true);
    setNotesError('');
    try {
      const res = await fetch(`${apiBase}/api/notes/?page=${page}&page_size=${pageSize}`, {
        headers: { Authorization: `Token ${authToken}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || 'notes_fetch_failed');
      }
      const data = await res.json();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : [];
      setNotesCount(data?.count || list.length);
      setNotesNext(data?.next || '');
      setNotesPrev(data?.previous || '');
      setNotesPage(page);
      setNotesPageSize(pageSize);
      setNotes(list);
    } catch (err) {
      setNotes([]);
      setNotesError(err?.message || 'Erreur');
    } finally {
      setIsLoadingNotes(false);
    }
  }, [apiBase, authToken, notesPageSize]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (isAdmin) {
      fetchNotes(1, notesPageSize);
    }
  }, [isAdmin, fetchNotes, notesPageSize]);

  useEffect(() => {
    const parseUserTime = (user) => {
      const raw = user?.created_at || user?.date_joined || null;
      if (!raw) return 0;
      const ts = Date.parse(raw);
      return Number.isNaN(ts) ? 0 : ts;
    };

    const getDisplayName = (user) => {
      const full = [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim();
      return full || user?.full_name || user?.username || user?.email || 'Unknown';
    };

    const getRoleLabelFromUser = (roleValue) => roleLabels[roleValue] || roleValue || '-';

    const actionsFromUsers = [...users]
      .sort((a, b) => {
        const delta = parseUserTime(b) - parseUserTime(a);
        if (delta !== 0) return delta;
        const aId = typeof a?.id === 'number' ? a.id : 0;
        const bId = typeof b?.id === 'number' ? b.id : 0;
        return bId - aId;
      })
      .slice(0, 8)
      .map((user, index) => ({
        id: `${user?.id || user?.username || user?.email || 'u'}-${index}`,
        text:
          langue === 'fr'
            ? `Compte cree: ${getDisplayName(user)} (${getRoleLabelFromUser(user?.role)})`
            : `Account created: ${getDisplayName(user)} (${getRoleLabelFromUser(user?.role)})`,
      }));

    setRecentActions(actionsFromUsers);
  }, [
    users,
    langue,
    t.admin,
    t.enseignant,
    t.coordonnateur,
    t.celluleInfo,
    t.parent,
    t.etudiant,
  ]);

  const handleCreateUser = async () => {
    if (!fullName.trim()) {
      setStatus({ type: 'error', message: t.nomManquant });
      return;
    }
    if (!email.includes('@')) {
      setStatus({ type: 'error', message: t.emailManquant });
      return;
    }
    if (!role) {
      setStatus({ type: 'error', message: t.roleManquant });
      return;
    }
    if (role === 'coordonnateur' && !cycle.trim()) {
      setStatus({ type: 'error', message: t.cycleManquant });
      return;
    }
    if (!password.trim()) {
      setStatus({ type: 'error', message: t.mdpManquant });
      return;
    }

    const parts = fullName.trim().split(/\s+/);
    const first_name = parts[0] || '';
    const last_name = parts.slice(1).join(' ');
    const username = email.trim().toLowerCase();

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });
    try {
      const res = await fetch(`${apiBase}/api/accounts/users/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          first_name,
          last_name,
          email,
          role,
          cycle: role === 'coordonnateur' ? cycle.trim() : '',
          password,
        }),
      });

      let createdUser = null;
      try {
        createdUser = await res.json();
      } catch (err) {
        createdUser = null;
      }

      if (!res.ok) {
        let detail = '';
        try {
          const data = createdUser;
          if (data && typeof data === 'object') {
            detail =
              data?.detail ||
              Object.entries(data)
                .map(([key, value]) => {
                  if (Array.isArray(value)) {
                    return `${key}: ${value.join(' ')}`;
                  }
                  if (typeof value === 'string') {
                    return `${key}: ${value}`;
                  }
                  return '';
                })
                .filter(Boolean)
                .join(' | ');
          }
        } catch (err) {
          detail = '';
        }
        throw new Error(detail || t.erreurCreation);
      }

      setStatus({ type: 'success', message: t.utilisateurCree });
      setFullName('');
      setEmail('');
      setRole('');
      setCycle('');
      setPassword('');

      await fetchUsers();
    } catch (err) {
      setStatus({ type: 'error', message: err?.message || t.erreurCreation });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async () => {
    if (!loginId.trim() || !loginPassword.trim()) {
      setAuthError(t.champsRequis);
      return;
    }
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/accounts/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginId.trim(),
          password: loginPassword,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setAuthError(data?.detail || t.erreurLogin);
        return;
      }

      if (data?.role !== 'admin') {
        setAuthError(t.accesRefuse);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_role');
        setAuthToken('');
        setAuthRole('');
        return;
      }

      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_role', data.role);
      setAuthToken(data.token);
      setAuthRole(data.role);
      setLoginPassword('');
    } catch (error) {
      setAuthError(t.erreurLogin);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_role');
    setAuthToken('');
    setAuthRole('');
    setLoginId('');
    setLoginPassword('');
  };

  const activeAccounts = users.filter((user) => user?.is_active !== false).length;
  const definedRoles = new Set(
    users
      .map((user) => user?.role)
      .filter(Boolean)
  ).size;

  const formattedNotes = useMemo(
    () =>
      notes.map((note) => ({
        ...note,
        date: note?.created_at ? new Date(note.created_at).toLocaleString() : '-',
      })),
    [notes]
  );

  if (!isAdmin) {
    return (
      <div className={`min-h-screen px-4 py-8 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
        <div className="mx-auto w-full max-w-md">
          <div className="mb-5 flex justify-end gap-3">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-800 text-white shadow"
              onClick={onToggleTheme}
              type="button"
              aria-label="Toggle theme"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <div className={`flex items-center gap-1 rounded-full p-1 ${isDark ? 'bg-slate-800' : 'bg-white shadow'}`}>
              <button
                className={`rounded-full px-3 py-1 text-xs font-bold ${langue === 'fr' ? 'bg-rose-800 text-white' : 'text-rose-800'}`}
                onClick={() => onLangueChange('fr')}
                type="button"
              >
                FR
              </button>
              <button
                className={`rounded-full px-3 py-1 text-xs font-bold ${langue === 'en' ? 'bg-rose-800 text-white' : 'text-rose-800'}`}
                onClick={() => onLangueChange('en')}
                type="button"
              >
                EN
              </button>
            </div>
          </div>

          <section className={`rounded-3xl border p-6 text-center shadow-xl md:p-10 ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
            <h1 className={`text-2xl font-extrabold ${isDark ? 'text-white' : 'text-rose-800'}`}>{t.connexionTitre}</h1>
            <div className="mt-6 space-y-3">
              <input
                className={`w-full rounded-xl border px-3 py-2 outline-none ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-slate-50'}`}
                placeholder={t.identifiant}
                value={loginId}
                onChange={(event) => setLoginId(event.target.value)}
              />
              <input
                className={`w-full rounded-xl border px-3 py-2 outline-none ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-slate-50'}`}
                placeholder={t.motDePasseLogin}
                type="password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
              />
            </div>
            <button
              className="mt-4 rounded-full bg-rose-800 px-5 py-2 font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              onClick={handleLogin}
              disabled={authLoading}
            >
              {authLoading ? '...' : t.seConnecter}
            </button>
            {authError ? <p className="mt-3 text-sm text-rose-500">{authError}</p> : null}
            <Link
              to="/choix-profil"
              className="mt-4 inline-flex items-center justify-center rounded-full border-2 border-rose-800 px-6 py-2 font-semibold text-rose-800 hover:bg-rose-800 hover:text-white"
            >
              ← {t.retour}
            </Link>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen px-4 py-8 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link to="/choix-profil" className="inline-flex items-center gap-2 rounded-full border border-rose-800 px-4 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-800 hover:text-white">
              <ArrowLeft size={16} />
              {t.retourRoles}
            </Link>
            <Link to="/" className="inline-flex items-center gap-2 rounded-full bg-rose-800 px-4 py-2 text-sm font-semibold text-white">
              {t.accueil}
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="rounded-full bg-rose-800 px-3 py-1 text-xs font-bold text-white"
              type="button"
              onClick={onToggleTheme}
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
            <button
              className={`rounded-full px-3 py-1 text-xs font-bold ${langue === 'fr' ? 'bg-rose-800 text-white' : 'border border-rose-800 text-rose-800'}`}
              type="button"
              onClick={() => onLangueChange('fr')}
            >
              FR
            </button>
            <button
              className={`rounded-full px-3 py-1 text-xs font-bold ${langue === 'en' ? 'bg-rose-800 text-white' : 'border border-rose-800 text-rose-800'}`}
              type="button"
              onClick={() => onLangueChange('en')}
            >
              EN
            </button>
            <button
              className="rounded-full border border-rose-800 px-3 py-1 text-xs font-bold text-rose-800"
              type="button"
              onClick={handleLogout}
            >
              {t.deconnexion}
            </button>
          </div>
        </div>

        <header className={`rounded-3xl border p-6 md:p-8 ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <h1 className="text-3xl font-extrabold text-rose-800">{t.titre}</h1>
          <p className={`mt-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{t.sousTitre}</p>
        </header>

        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          <article className={`rounded-3xl border p-5 lg:col-span-2 ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
            <h2 className="mb-4 inline-flex items-center gap-2 text-xl font-semibold">
              <UserPlus size={20} className="text-rose-800" />
              {t.creerCompte}
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                className={`rounded-xl border px-3 py-2 outline-none ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-slate-50'}`}
                placeholder={t.nomComplet}
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
              <input
                className={`rounded-xl border px-3 py-2 outline-none ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-slate-50'}`}
                placeholder={t.email}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <select
                className={`rounded-xl border px-3 py-2 outline-none md:col-span-2 ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-slate-50'}`}
                value={role}
                onChange={(event) => setRole(event.target.value)}
              >
                <option value="">{t.role}</option>
                <option value="admin">{t.admin}</option>
                <option value="enseignant">{t.enseignant}</option>
                <option value="coordonnateur">{t.coordonnateur}</option>
                <option value="cellule-info">{t.celluleInfo}</option>
                <option value="parent">{t.parent}</option>
                <option value="etudiant">{t.etudiant}</option>
              </select>
              {role === 'coordonnateur' ? (
                <input
                  className={`rounded-xl border px-3 py-2 outline-none md:col-span-2 ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-slate-50'}`}
                  placeholder={t.cycle}
                  value={cycle}
                  onChange={(event) => setCycle(event.target.value)}
                />
              ) : null}
              <input
                className={`rounded-xl border px-3 py-2 outline-none md:col-span-2 ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-slate-50'}`}
                placeholder={t.motDePasse}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <button
              className="mt-4 rounded-full bg-rose-800 px-5 py-2 font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              onClick={handleCreateUser}
              disabled={isSubmitting}
            >
              {isSubmitting ? '...' : t.creer}
            </button>
            {status.message ? (
              <p className={`mt-3 text-sm ${status.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {status.message}
              </p>
            ) : null}
          </article>

          <article className={`rounded-3xl border p-5 ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
            <h2 className="mb-4 inline-flex items-center gap-2 text-xl font-semibold">
              <ShieldCheck size={20} className="text-rose-800" />
              {t.statistiques}
            </h2>
            <div className="space-y-3">
              <div className={`rounded-xl border p-3 ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
                <p className="text-sm">{t.comptesActifs}</p>
                <p className="text-2xl font-bold">{activeAccounts}</p>
              </div>
              <div className={`rounded-xl border p-3 ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
                <p className="text-sm">{t.rolesDefinis}</p>
                <p className="text-2xl font-bold">{definedRoles}</p>
              </div>
            </div>
          </article>
        </section>

        <section className={`mt-6 rounded-3xl border p-5 ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <h2 className="mb-4 inline-flex items-center gap-2 text-xl font-semibold">
            <ClipboardList size={20} className="text-rose-800" />
            {t.actions}
          </h2>
          <div className={`rounded-xl border px-3 py-4 text-sm ${isDark ? 'border-slate-700 bg-slate-800 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
            {isLoadingUsers && recentActions.length === 0 ? <p>{t.chargementActions}</p> : null}
            {!isLoadingUsers && recentActions.length === 0 ? <p>{t.aucuneAction}</p> : null}
            {recentActions.length > 0 ? (
              <ul className="space-y-2">
                {recentActions.map((action) => (
                  <li key={action.id}>- {action.text}</li>
                ))}
              </ul>
            ) : null}
          </div>
          <div className="mt-4 inline-flex items-center gap-2 text-sm text-slate-500">
            <Users size={16} />
            <span>{isDark ? 'Admin panel prototype' : 'Admin panel prototype'}</span>
          </div>
        </section>

        <section className={`mt-6 rounded-3xl border p-5 ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <h2 className="mb-2 inline-flex items-center gap-2 text-xl font-semibold">
            <BookOpen size={20} className="text-rose-800" />
            {t.notesRecues}
          </h2>
          <p className={`mb-4 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{t.notesIntro}</p>
          <div className={`rounded-xl border px-3 py-4 text-sm ${isDark ? 'border-slate-700 bg-slate-800 text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
            {isLoadingNotes ? <p>{t.chargementActions}</p> : null}
            {!isLoadingNotes && notesError ? <p className="text-rose-500">{notesError}</p> : null}
            {!isLoadingNotes && !notesError && formattedNotes.length === 0 ? <p>{t.notesVides}</p> : null}
            {formattedNotes.length > 0 ? (
              <div className="space-y-2">
                {formattedNotes.map((note) => (
                  <div
                    key={note.id}
                    className={`grid gap-2 rounded-xl border px-3 py-2 md:grid-cols-6 ${
                      isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div>
                      <p className="text-xs uppercase opacity-60">{t.enseignantLib}</p>
                      <p className="font-semibold">{note.teacher_username || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase opacity-60">{t.cycleLib}</p>
                      <p className="font-semibold">{note.cycle}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase opacity-60">{t.matiereLib}</p>
                      <p className="font-semibold">{note.matiere}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase opacity-60">{t.etudiantLib}</p>
                      <p className="font-semibold">{note.etudiant}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase opacity-60">{t.noteLib}</p>
                      <p className="font-semibold">{note.note}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase opacity-60">{t.dateLib}</p>
                      <p className="font-semibold">{note.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {notesCount > 0 ? `${notesCount} notes` : ''}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 text-xs">
                {t.taillePage}
                <select
                  className={`rounded-full border px-2 py-1 text-xs ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-300 bg-white'}`}
                  value={notesPageSize}
                  onChange={(event) => {
                    const size = Number(event.target.value);
                    setNotesPageSize(size);
                    fetchNotes(1, size);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </label>
              <button
                type="button"
                onClick={() => notesPrev && fetchNotes(notesPage - 1, notesPageSize)}
                disabled={!notesPrev || isLoadingNotes}
                className={`rounded-full px-4 py-2 font-semibold ${
                  notesPrev && !isLoadingNotes
                    ? 'bg-slate-200 text-slate-800'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                ← {t.precedent}
              </button>
              <span className={`${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t.page} {notesPage}</span>
              <button
                type="button"
                onClick={() => notesNext && fetchNotes(notesPage + 1, notesPageSize)}
                disabled={!notesNext || isLoadingNotes}
                className={`rounded-full px-4 py-2 font-semibold ${
                  notesNext && !isLoadingNotes
                    ? 'bg-rose-800 text-white'
                    : 'bg-rose-200 text-white/60'
                }`}
              >
                {t.suivant} →
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminPage;