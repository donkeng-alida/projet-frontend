import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';

function CoordinatorPage({ theme, langue, onToggleTheme, onLangueChange }) {
  const isDark = theme === 'dark';
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
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
      titre: 'Espace Coordonnateur',
      sousTitre: 'Notes du cycle',
      notesRecues: 'Notes recues',
      notesIntro: 'Notes des enseignants pour votre cycle.',
      notesVides: 'Aucune note pour le moment.',
      enseignantLib: 'Enseignant',
      etudiantLib: 'Etudiant',
      matiereLib: 'Matiere',
      noteLib: 'Note',
      cycleLib: 'Cycle',
      dateLib: 'Date',
      retourRoles: 'Retour aux roles',
      accueil: 'Accueil',
      connexionTitre: 'Connexion Coordonnateur',
      identifiant: 'Identifiant (email)',
      seConnecter: 'Se connecter',
      deconnexion: 'Se deconnecter',
      motDePasseLogin: 'Mot de passe',
      accesRefuse: "Acces refuse : ce compte n'est pas coordonnateur.",
      erreurLogin: 'Identifiants invalides.',
      champsRequis: 'Veuillez renseigner les champs.',
      chargement: 'Chargement...',
      retour: 'Retour',
      page: 'Page',
      precedent: 'Precedent',
      suivant: 'Suivant',
      taillePage: 'Taille de page',
    },
    en: {
      titre: 'Coordinator Space',
      sousTitre: 'Cycle marks',
      notesRecues: 'Received marks',
      notesIntro: 'Marks from teachers for your cycle.',
      notesVides: 'No marks yet.',
      enseignantLib: 'Teacher',
      etudiantLib: 'Student',
      matiereLib: 'Subject',
      noteLib: 'Mark',
      cycleLib: 'Cycle',
      dateLib: 'Date',
      retourRoles: 'Back to roles',
      accueil: 'Home',
      connexionTitre: 'Coordinator Login',
      identifiant: 'Username (email)',
      seConnecter: 'Sign in',
      deconnexion: 'Sign out',
      motDePasseLogin: 'Password',
      accesRefuse: 'Access denied: this account is not coordinator.',
      erreurLogin: 'Invalid credentials.',
      champsRequis: 'Please fill in all fields.',
      chargement: 'Loading...',
      retour: 'Back',
      page: 'Page',
      precedent: 'Prev',
      suivant: 'Next',
      taillePage: 'Page size',
    },
  };

  const t = textes[langue] || textes.fr;
  const isCoordinator = authToken && authRole === 'coordonnateur';

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
    if (isCoordinator) {
      fetchNotes(1, notesPageSize);
    }
  }, [isCoordinator, fetchNotes, notesPageSize]);

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

      if (data?.role !== 'coordonnateur') {
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

  const formattedNotes = useMemo(
    () =>
      notes.map((note) => ({
        ...note,
        date: note?.created_at ? new Date(note.created_at).toLocaleString() : '-',
      })),
    [notes]
  );

  if (!isCoordinator) {
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

        <section className={`mt-6 rounded-3xl border p-5 ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <h2 className="mb-2 inline-flex items-center gap-2 text-xl font-semibold">
            <BookOpen size={20} className="text-rose-800" />
            {t.notesRecues}
          </h2>
          <p className={`mb-4 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{t.notesIntro}</p>
          <div className={`rounded-xl border px-3 py-4 text-sm ${isDark ? 'border-slate-700 bg-slate-800 text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
            {isLoadingNotes ? <p>{t.chargement}</p> : null}
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

export default CoordinatorPage;