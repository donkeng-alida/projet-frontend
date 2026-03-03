import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, FileText } from 'lucide-react';
import { clearSession, readSession, saveSession } from '../utils/session';

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
  const [noteDrafts, setNoteDrafts] = useState({});
  const [noteEditPermissions, setNoteEditPermissions] = useState({});
  const [savingNoteId, setSavingNoteId] = useState(null);
  const [requests, setRequests] = useState([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [requestsError, setRequestsError] = useState('');
  const [requestsPage, setRequestsPage] = useState(1);
  const [requestsNext, setRequestsNext] = useState('');
  const [requestsPrev, setRequestsPrev] = useState('');
  const [requestsCount, setRequestsCount] = useState(0);
  const [requestsPageSize, setRequestsPageSize] = useState(20);

  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authToken, setAuthToken] = useState(() => readSession().token);
  const [authRole, setAuthRole] = useState(() => readSession().role);
  const [authScope, setAuthScope] = useState(() => readSession().scope);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [publishStatus, setPublishStatus] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const textes = {
    fr: {
      titre: 'Espace Coordonnateur',
      sousTitre: 'Notes du cycle',
      notesRecues: 'Notes recues',
      notesIntro: 'Notes des enseignants pour votre cycle.',
      notesVides: 'Aucune note pour le moment.',
      soumettreBulletin: 'Soumettre bulletin',
      bulletinOk: 'Bulletin soumis aux etudiants et parents.',
      bulletinErreur: 'Erreur lors de la soumission du bulletin.',
      autoriserEnseignant: "Autoriser l'enseignant a modifier",
      enregistrerNote: 'Enregistrer la note',
      requetesRecues: 'Requetes etudiantes',
      requetesIntro: 'Requetes des etudiants de votre filiere.',
      requetesVides: 'Aucune requete pour le moment.',
      enseignantLib: 'Enseignant',
      etudiantLib: 'Etudiant',
      matiereLib: 'Matiere',
      noteLib: 'Note',
      cycleLib: 'Cycle',
      filiereLib: 'Filiere',
      objetLib: 'Objet',
      statutLib: 'Statut',
      justificatifLib: 'Justificatif',
      ouvrirPdf: 'Ouvrir PDF',
      telechargerPdf: 'Telecharger PDF',
      dateLib: 'Date',
      retourRoles: 'Retour aux roles',
      accueil: 'Accueil',
      connexionTitre: 'Connexion Coordonnateur',
      identifiant: 'Identifiant (email)',
      seConnecter: 'Se connecter',
      deconnexion: 'Se deconnecter',
      motDePasseLogin: 'Mot de passe',
      accesRefuse: "Acces refuse : ce compte n'est pas coordonnateur ou admin.",
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
      soumettreBulletin: 'Publish report card',
      bulletinOk: 'Report card published to students and parents.',
      bulletinErreur: 'Failed to publish report card.',
      autoriserEnseignant: 'Allow teacher edit',
      enregistrerNote: 'Save mark',
      requetesRecues: 'Student requests',
      requetesIntro: 'Requests from students in your track.',
      requetesVides: 'No request yet.',
      enseignantLib: 'Teacher',
      etudiantLib: 'Student',
      matiereLib: 'Subject',
      noteLib: 'Mark',
      cycleLib: 'Cycle',
      filiereLib: 'Track',
      objetLib: 'Subject',
      statutLib: 'Status',
      justificatifLib: 'Attachment',
      ouvrirPdf: 'Open PDF',
      telechargerPdf: 'Download PDF',
      dateLib: 'Date',
      retourRoles: 'Back to roles',
      accueil: 'Home',
      connexionTitre: 'Coordinator Login',
      identifiant: 'Username (email)',
      seConnecter: 'Sign in',
      deconnexion: 'Sign out',
      motDePasseLogin: 'Password',
      accesRefuse: 'Access denied: this account is not coordinator or admin.',
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
  const isCoordinator = authToken && (authScope === 'superuser' || authRole === 'coordonnateur' || authRole === 'admin');

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
      setNoteDrafts(
        Object.fromEntries(
          list.map((item) => [item.id, item?.note === null || item?.note === undefined ? '' : String(item.note)])
        )
      );
      setNoteEditPermissions(
        Object.fromEntries(
          list.map((item) => [item.id, Boolean(item?.teacher_can_edit)])
        )
      );
    } catch (err) {
      setNotes([]);
      setNotesError(err?.message || 'Erreur');
    } finally {
      setIsLoadingNotes(false);
    }
  }, [apiBase, authToken, notesPageSize]);

  const fetchRequests = useCallback(async (page = 1, pageSize = requestsPageSize) => {
    if (!authToken) return;
    setIsLoadingRequests(true);
    setRequestsError('');
    try {
      const res = await fetch(`${apiBase}/api/requests/?page=${page}&page_size=${pageSize}`, {
        headers: { Authorization: `Token ${authToken}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || 'requests_fetch_failed');
      }
      const data = await res.json();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : [];
      setRequestsCount(data?.count || list.length);
      setRequestsNext(data?.next || '');
      setRequestsPrev(data?.previous || '');
      setRequestsPage(page);
      setRequestsPageSize(pageSize);
      setRequests(list);
    } catch (err) {
      setRequests([]);
      setRequestsError(err?.message || 'Erreur');
    } finally {
      setIsLoadingRequests(false);
    }
  }, [apiBase, authToken, requestsPageSize]);

  useEffect(() => {
    if (isCoordinator) {
      fetchNotes(1, notesPageSize);
    }
  }, [isCoordinator, fetchNotes, notesPageSize]);

  useEffect(() => {
    if (isCoordinator) {
      fetchRequests(1, requestsPageSize);
    }
  }, [isCoordinator, fetchRequests, requestsPageSize]);

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

      if (data?.role !== 'coordonnateur' && data?.role !== 'admin' && !data?.is_superuser) {
        setAuthError(t.accesRefuse);
        clearSession();
        setAuthToken('');
        setAuthRole('');
        setAuthScope('');
        return;
      }
      const nextScope = data?.is_superuser ? 'superuser' : data.role === 'admin' ? 'admin' : 'coordinator';

      saveSession({
        token: data.token,
        role: data.role,
        user: data.username || data.email || loginId.trim(),
        scope: nextScope,
      });
      setAuthToken(data.token);
      setAuthRole(data.role);
      setAuthScope(nextScope);
      setLoginPassword('');
    } catch {
      setAuthError(t.erreurLogin);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    setAuthToken('');
    setAuthRole('');
    setAuthScope('');
    setLoginId('');
    setLoginPassword('');
  };

  const handlePublishBulletin = async () => {
    if (!authToken) return;
    setPublishStatus('');
    setIsPublishing(true);
    try {
      const res = await fetch(`${apiBase}/api/notes/publish/`, {
        method: 'POST',
        headers: { Authorization: `Token ${authToken}` },
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.detail || t.bulletinErreur);
      }
      setPublishStatus(t.bulletinOk);
      await fetchNotes(1, notesPageSize);
    } catch (err) {
      setPublishStatus(err?.message || t.bulletinErreur);
    } finally {
      setIsPublishing(false);
    }
  };

  const formattedNotes = useMemo(
    () =>
      notes.map((note) => ({
        ...note,
        date: note?.created_at ? new Date(note.created_at).toLocaleString() : '-',
      })),
    [notes]
  );

  const saveNoteChanges = async (noteId) => {
    if (!authToken) return;
    setSavingNoteId(noteId);
    try {
      const payload = {
        note: noteDrafts[noteId],
        teacher_can_edit: Boolean(noteEditPermissions[noteId]),
      };
      const res = await fetch(`${apiBase}/api/notes/${noteId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${authToken}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.detail || 'note_update_failed');
      }
      await fetchNotes(notesPage, notesPageSize);
    } catch (err) {
      setNotesError(err?.message || 'Erreur');
    } finally {
      setSavingNoteId(null);
    }
  };

  const formattedRequests = useMemo(
    () =>
      requests.map((item) => ({
        ...item,
        date: item?.created_at ? new Date(item.created_at).toLocaleString() : '-',
        pdfUrl: item?.attachment
          ? item.attachment.startsWith('http')
            ? item.attachment
            : `${apiBase}${item.attachment}`
          : '',
      })),
    [apiBase, requests]
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
          <button
            type="button"
            onClick={handlePublishBulletin}
            disabled={isPublishing}
            className="mb-3 rounded-full bg-rose-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isPublishing ? '...' : t.soumettreBulletin}
          </button>
          {publishStatus ? <p className="mb-3 text-sm text-emerald-500">{publishStatus}</p> : null}
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
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.01"
                        value={noteDrafts[note.id] ?? ''}
                        onChange={(event) =>
                          setNoteDrafts((prev) => ({ ...prev, [note.id]: event.target.value }))
                        }
                        className={`w-full rounded-lg border px-2 py-1 text-sm ${
                          isDark ? 'border-slate-700 bg-slate-950 text-slate-100' : 'border-slate-300 bg-white text-slate-900'
                        }`}
                      />
                      <label className="mt-2 flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={Boolean(noteEditPermissions[note.id])}
                          onChange={(event) =>
                            setNoteEditPermissions((prev) => ({ ...prev, [note.id]: event.target.checked }))
                          }
                        />
                        {t.autoriserEnseignant}
                      </label>
                      <button
                        type="button"
                        onClick={() => saveNoteChanges(note.id)}
                        disabled={savingNoteId === note.id}
                        className="mt-2 rounded-lg bg-rose-700 px-2 py-1 text-xs font-semibold text-white disabled:opacity-60"
                      >
                        {savingNoteId === note.id ? '...' : t.enregistrerNote}
                      </button>
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

        <section className={`mt-6 rounded-3xl border p-5 ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <h2 className="mb-2 inline-flex items-center gap-2 text-xl font-semibold">
            <FileText size={20} className="text-rose-800" />
            {t.requetesRecues}
          </h2>
          <p className={`mb-4 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{t.requetesIntro}</p>
          <div className={`rounded-xl border px-3 py-4 text-sm ${isDark ? 'border-slate-700 bg-slate-800 text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
            {isLoadingRequests ? <p>{t.chargement}</p> : null}
            {!isLoadingRequests && requestsError ? <p className="text-rose-500">{requestsError}</p> : null}
            {!isLoadingRequests && !requestsError && formattedRequests.length === 0 ? <p>{t.requetesVides}</p> : null}
            {formattedRequests.length > 0 ? (
              <div className="space-y-2">
                {formattedRequests.map((item) => (
                  <div
                    key={item.id}
                    className={`grid gap-2 rounded-xl border px-3 py-2 md:grid-cols-7 ${
                      isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div>
                      <p className="text-xs uppercase opacity-60">{t.etudiantLib}</p>
                      <p className="font-semibold">{item.student_username || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase opacity-60">{t.cycleLib}</p>
                      <p className="font-semibold">{item.cycle || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase opacity-60">{t.filiereLib}</p>
                      <p className="font-semibold">{item.filiere || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase opacity-60">{t.objetLib}</p>
                      <p className="font-semibold">{item.subject || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase opacity-60">{t.statutLib}</p>
                      <p className="font-semibold">{item.status || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase opacity-60">{t.justificatifLib}</p>
                      {item.pdfUrl ? (
                        <div className="flex flex-col gap-1">
                          <a
                            href={item.pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-rose-700 underline"
                          >
                            {t.ouvrirPdf}
                          </a>
                          <a
                            href={item.pdfUrl}
                            download
                            className="font-semibold text-rose-700 underline"
                          >
                            {t.telechargerPdf}
                          </a>
                        </div>
                      ) : (
                        <p className="font-semibold">-</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs uppercase opacity-60">{t.dateLib}</p>
                      <p className="font-semibold">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {requestsCount > 0 ? `${requestsCount} requetes` : ''}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 text-xs">
                {t.taillePage}
                <select
                  className={`rounded-full border px-2 py-1 text-xs ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-300 bg-white'}`}
                  value={requestsPageSize}
                  onChange={(event) => {
                    const size = Number(event.target.value);
                    setRequestsPageSize(size);
                    fetchRequests(1, size);
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
                onClick={() => requestsPrev && fetchRequests(requestsPage - 1, requestsPageSize)}
                disabled={!requestsPrev || isLoadingRequests}
                className={`rounded-full px-4 py-2 font-semibold ${
                  requestsPrev && !isLoadingRequests
                    ? 'bg-slate-200 text-slate-800'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                â† {t.precedent}
              </button>
              <span className={`${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t.page} {requestsPage}</span>
              <button
                type="button"
                onClick={() => requestsNext && fetchRequests(requestsPage + 1, requestsPageSize)}
                disabled={!requestsNext || isLoadingRequests}
                className={`rounded-full px-4 py-2 font-semibold ${
                  requestsNext && !isLoadingRequests
                    ? 'bg-rose-800 text-white'
                    : 'bg-rose-200 text-white/60'
                }`}
              >
                {t.suivant} â†’
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default CoordinatorPage;
