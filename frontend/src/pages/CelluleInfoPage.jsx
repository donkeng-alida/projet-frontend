import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { clearSession, readSession, saveSession } from '../utils/session';

function CelluleInfoPage({ theme, langue, onToggleTheme, onLangueChange }) {
  const isDark = theme === 'dark';
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  const [notes, setNotes] = useState([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [notesError, setNotesError] = useState('');
  const [noteDrafts, setNoteDrafts] = useState({});
  const [savingNoteId, setSavingNoteId] = useState(null);

  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authToken, setAuthToken] = useState(() => readSession().token);
  const [authRole, setAuthRole] = useState(() => readSession().role);
  const [authScope, setAuthScope] = useState(() => readSession().scope);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const textes = {
    fr: {
      titre: 'Espace Cellule Info',
      sousTitre: "Modifier les notes autorisees par le coordonnateur.",
      notesRecues: 'Notes modifiables',
      notesIntro: "Seules les notes avec permission active sont modifiables.",
      notesVides: 'Aucune note a modifier pour le moment.',
      enseignantLib: 'Enseignant',
      etudiantLib: 'Etudiant',
      matiereLib: 'Matiere',
      noteLib: 'Note',
      cycleLib: 'Cycle',
      dateLib: 'Date',
      permission: 'Permission',
      enregistrer: 'Enregistrer',
      permissionActive: 'Active',
      permissionInactive: 'Inactive',
      retourRoles: 'Retour aux roles',
      accueil: 'Accueil',
      connexionTitre: 'Connexion Cellule Info',
      identifiant: 'Identifiant (email)',
      seConnecter: 'Se connecter',
      deconnexion: 'Se deconnecter',
      motDePasseLogin: 'Mot de passe',
      accesRefuse: "Acces refuse : ce compte n'est pas cellule-info.",
      erreurLogin: 'Identifiants invalides.',
      champsRequis: 'Veuillez renseigner les champs.',
      chargement: 'Chargement...',
      retour: 'Retour',
      majOk: 'Note modifiee avec succes.',
      majErreur: 'Modification refusee ou invalide.',
    },
    en: {
      titre: 'IT Cell Space',
      sousTitre: 'Edit marks authorized by the coordinator.',
      notesRecues: 'Editable marks',
      notesIntro: 'Only notes with active permission can be edited.',
      notesVides: 'No mark to edit at the moment.',
      enseignantLib: 'Teacher',
      etudiantLib: 'Student',
      matiereLib: 'Subject',
      noteLib: 'Mark',
      cycleLib: 'Cycle',
      dateLib: 'Date',
      permission: 'Permission',
      enregistrer: 'Save',
      permissionActive: 'Active',
      permissionInactive: 'Inactive',
      retourRoles: 'Back to roles',
      accueil: 'Home',
      connexionTitre: 'IT Cell Login',
      identifiant: 'Username (email)',
      seConnecter: 'Sign in',
      deconnexion: 'Sign out',
      motDePasseLogin: 'Password',
      accesRefuse: 'Access denied: this account is not IT cell.',
      erreurLogin: 'Invalid credentials.',
      champsRequis: 'Please fill in all fields.',
      chargement: 'Loading...',
      retour: 'Back',
      majOk: 'Mark updated successfully.',
      majErreur: 'Update denied or invalid.',
    },
  };

  const t = textes[langue] || textes.fr;
  const isCelluleInfo = authToken && (authScope === 'superuser' || authRole === 'cellule-info');

  const fetchNotes = useCallback(async () => {
    if (!authToken) return;
    setIsLoadingNotes(true);
    setNotesError('');
    try {
      const res = await fetch(`${apiBase}/api/notes/?page_size=200`, {
        headers: { Authorization: `Token ${authToken}` },
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.detail || 'notes_fetch_failed');
      }
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : [];
      setNotes(list);
      setNoteDrafts(
        Object.fromEntries(
          list.map((item) => [item.id, item?.note === null || item?.note === undefined ? '' : String(item.note)])
        )
      );
    } catch (err) {
      setNotes([]);
      setNotesError(err?.message || 'Erreur');
    } finally {
      setIsLoadingNotes(false);
    }
  }, [apiBase, authToken]);

  useEffect(() => {
    if (isCelluleInfo) {
      fetchNotes();
    }
  }, [isCelluleInfo, fetchNotes]);

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
      if (data?.role !== 'cellule-info' && !data?.is_superuser) {
        setAuthError(t.accesRefuse);
        clearSession();
        setAuthToken('');
        setAuthRole('');
        setAuthScope('');
        return;
      }
      const nextScope = data?.is_superuser ? 'superuser' : 'cellule-info';
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

  const saveNote = async (noteId) => {
    if (!authToken) return;
    setSavingNoteId(noteId);
    setStatusMessage('');
    try {
      const res = await fetch(`${apiBase}/api/notes/${noteId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${authToken}`,
        },
        body: JSON.stringify({ note: noteDrafts[noteId] }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.detail || t.majErreur);
      }
      setStatusMessage(t.majOk);
      await fetchNotes();
    } catch (err) {
      setStatusMessage(err?.message || t.majErreur);
    } finally {
      setSavingNoteId(null);
    }
  };

  const formattedNotes = useMemo(
    () =>
      notes.map((note) => ({
        ...note,
        date: note?.updated_at
          ? new Date(note.updated_at).toLocaleString()
          : note?.created_at
          ? new Date(note.created_at).toLocaleString()
          : '-',
      })),
    [notes]
  );

  if (!isCelluleInfo) {
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
              {isDark ? 'Light' : 'Dark'}
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
              {t.retour}
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
          <h2 className="mb-2 text-xl font-semibold">{t.notesRecues}</h2>
          <p className={`mb-4 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{t.notesIntro}</p>
          {statusMessage ? <p className="mb-3 text-sm text-emerald-500">{statusMessage}</p> : null}
          <div className={`rounded-xl border px-3 py-4 text-sm ${isDark ? 'border-slate-700 bg-slate-800 text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
            {isLoadingNotes ? <p>{t.chargement}</p> : null}
            {!isLoadingNotes && notesError ? <p className="text-rose-500">{notesError}</p> : null}
            {!isLoadingNotes && !notesError && formattedNotes.length === 0 ? <p>{t.notesVides}</p> : null}
            {formattedNotes.length > 0 ? (
              <div className="space-y-2">
                {formattedNotes.map((note) => (
                  <div
                    key={note.id}
                    className={`grid gap-2 rounded-xl border px-3 py-2 md:grid-cols-7 ${
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
                      <p className="text-xs uppercase opacity-60">{t.permission}</p>
                      <p className={`font-semibold ${note.teacher_can_edit ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {note.teacher_can_edit ? t.permissionActive : t.permissionInactive}
                      </p>
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
                    </div>
                    <div className="flex flex-col justify-between gap-2">
                      <p className="text-xs uppercase opacity-60">{t.dateLib}</p>
                      <p className="text-xs">{note.date}</p>
                      <button
                        type="button"
                        onClick={() => saveNote(note.id)}
                        disabled={savingNoteId === note.id}
                        className="rounded-lg bg-rose-700 px-2 py-1 text-xs font-semibold text-white disabled:opacity-60"
                      >
                        {savingNoteId === note.id ? '...' : t.enregistrer}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

export default CelluleInfoPage;
