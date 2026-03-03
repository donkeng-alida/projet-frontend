import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { clearSession, readSession, saveSession } from '../utils/session';

function StudentPage({ theme, langue, onToggleTheme, onLangueChange }) {
  const isDark = theme === 'dark';
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authToken, setAuthToken] = useState(() => readSession().token);
  const [authRole, setAuthRole] = useState(() => readSession().role);
  const [authScope, setAuthScope] = useState(() => readSession().scope);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [cycle, setCycle] = useState('');
  const [filiere, setFiliere] = useState('');
  const [subject, setSubject] = useState('');
  const [justification, setJustification] = useState('');
  const [attachment, setAttachment] = useState(null);
  const attachmentRef = useRef(null);
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [items, setItems] = useState([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [itemsError, setItemsError] = useState('');
  const [notes, setNotes] = useState([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [notesError, setNotesError] = useState('');

  const textes = {
    fr: {
      titre: 'Espace Etudiant',
      sousTitre: 'Envoyer une requete avec justificatif PDF',
      loginTitle: 'Connexion Etudiant',
      identifiant: 'Identifiant (email)',
      motDePasse: 'Mot de passe',
      seConnecter: 'Se connecter',
      deconnexion: 'Se deconnecter',
      accesRefuse: "Acces refuse : ce compte n'est pas etudiant.",
      erreurLogin: 'Identifiants invalides.',
      champsRequis: 'Veuillez renseigner tous les champs.',
      cycle: 'Cycle',
      filiere: 'Filiere',
      objet: 'Objet de la requete',
      justification: 'Justification',
      piece: 'Justificatif PDF',
      envoyer: 'Envoyer la requete',
      sent: 'Requete envoyee a l admin et au coordonnateur de votre filiere.',
      onlyPdf: 'Le justificatif doit etre un fichier PDF.',
      listTitle: 'Mes requetes',
      none: 'Aucune requete pour le moment.',
      notesTitle: 'Mes notes',
      notesIntro: 'Notes recues pour votre profil etudiant.',
      notesNone: 'Aucune note disponible.',
      matiere: 'Matiere',
      note: 'Note',
      enseignant: 'Enseignant',
      chargement: 'Chargement...',
      retour: 'Retour',
      accueil: 'Accueil',
      statut: 'Statut',
      date: 'Date',
      errorSend: "Erreur lors de l'envoi.",
    },
    en: {
      titre: 'Student Space',
      sousTitre: 'Send a request with PDF supporting document',
      loginTitle: 'Student Login',
      identifiant: 'Username (email)',
      motDePasse: 'Password',
      seConnecter: 'Sign in',
      deconnexion: 'Sign out',
      accesRefuse: 'Access denied: this account is not student.',
      erreurLogin: 'Invalid credentials.',
      champsRequis: 'Please fill in all fields.',
      cycle: 'Cycle',
      filiere: 'Track',
      objet: 'Request subject',
      justification: 'Justification',
      piece: 'PDF attachment',
      envoyer: 'Send request',
      sent: 'Request sent to admin and your track coordinator.',
      onlyPdf: 'Attachment must be a PDF file.',
      listTitle: 'My requests',
      none: 'No request yet.',
      notesTitle: 'My marks',
      notesIntro: 'Marks available for your student profile.',
      notesNone: 'No mark available.',
      matiere: 'Subject',
      note: 'Mark',
      enseignant: 'Teacher',
      chargement: 'Loading...',
      retour: 'Back',
      accueil: 'Home',
      statut: 'Status',
      date: 'Date',
      errorSend: 'Send failed.',
    },
  };

  const t = textes[langue] || textes.fr;
  const isStudent = authToken && (authScope === 'superuser' || authRole === 'etudiant');

  const fetchItems = useCallback(async () => {
    if (!authToken) return;
    setIsLoadingItems(true);
    setItemsError('');
    try {
      const res = await fetch(`${apiBase}/api/requests/`, {
        headers: { Authorization: `Token ${authToken}` },
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.detail || 'request_fetch_failed');
      }
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : [];
      setItems(list);
    } catch (err) {
      setItems([]);
      setItemsError(err?.message || 'Erreur');
    } finally {
      setIsLoadingItems(false);
    }
  }, [apiBase, authToken]);

  const fetchNotes = useCallback(async () => {
    if (!authToken) return;
    setIsLoadingNotes(true);
    setNotesError('');
    try {
      const res = await fetch(`${apiBase}/api/notes/?page_size=100`, {
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
    } catch (err) {
      setNotes([]);
      setNotesError(err?.message || 'Erreur');
    } finally {
      setIsLoadingNotes(false);
    }
  }, [apiBase, authToken]);

  useEffect(() => {
    if (isStudent) {
      fetchItems();
      fetchNotes();
    }
  }, [isStudent, fetchItems, fetchNotes]);

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
      if (data?.role !== 'etudiant' && !data?.is_superuser) {
        setAuthError(t.accesRefuse);
        clearSession();
        setAuthToken('');
        setAuthRole('');
        setAuthScope('');
        return;
      }
      const nextScope = data?.is_superuser ? 'superuser' : 'student';
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

  const handleSubmit = async () => {
    setStatus('');
    const fileFromRef = attachment || attachmentRef.current?.files?.[0] || null;
    if (!cycle.trim() || !filiere.trim() || !subject.trim() || !justification.trim() || !fileFromRef) {
      setStatus(t.champsRequis);
      return;
    }
    const fileName = (fileFromRef?.name || '').toLowerCase();
    if (!fileName.endsWith('.pdf')) {
      setStatus(t.onlyPdf);
      return;
    }

    const formData = new FormData();
    formData.append('cycle', cycle.trim());
    formData.append('filiere', filiere.trim());
    formData.append('subject', subject.trim());
    formData.append('justification', justification.trim());
    formData.append('attachment', fileFromRef);

    setIsSubmitting(true);
    try {
      const res = await fetch(`${apiBase}/api/requests/`, {
        method: 'POST',
        headers: { Authorization: `Token ${authToken}` },
        body: formData,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const detail =
          data?.detail ||
          (typeof data === 'object'
            ? Object.values(data)
                .flat()
                .join(' ')
            : '');
        throw new Error(detail || t.errorSend);
      }
      setStatus(t.sent);
      setSubject('');
      setJustification('');
      setAttachment(null);
      if (attachmentRef.current) {
        attachmentRef.current.value = '';
      }
      await fetchItems();
    } catch (err) {
      setStatus(err?.message || t.errorSend);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedItems = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        date: item?.created_at ? new Date(item.created_at).toLocaleString() : '-',
      })),
    [items]
  );

  const formattedNotes = useMemo(
    () =>
      notes.map((item) => ({
        ...item,
        date: item?.created_at ? new Date(item.created_at).toLocaleString() : '-',
      })),
    [notes]
  );

  if (!isStudent) {
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
            <h1 className={`text-2xl font-extrabold ${isDark ? 'text-white' : 'text-rose-800'}`}>{t.loginTitle}</h1>
            <div className="mt-6 space-y-3">
              <input
                className={`w-full rounded-xl border px-3 py-2 outline-none ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-slate-50'}`}
                placeholder={t.identifiant}
                value={loginId}
                onChange={(event) => setLoginId(event.target.value)}
              />
              <input
                className={`w-full rounded-xl border px-3 py-2 outline-none ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-slate-50'}`}
                placeholder={t.motDePasse}
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
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link to="/choix-profil" className="inline-flex items-center gap-2 rounded-full border border-rose-800 px-4 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-800 hover:text-white">
              {t.retour}
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
          <h2 className="text-xl font-semibold">{t.notesTitle}</h2>
          <p className={`mt-1 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{t.notesIntro}</p>
          <div className={`mt-3 rounded-xl border px-3 py-4 text-sm ${isDark ? 'border-slate-700 bg-slate-800 text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
            {isLoadingNotes ? <p>{t.chargement}</p> : null}
            {!isLoadingNotes && notesError ? <p className="text-rose-500">{notesError}</p> : null}
            {!isLoadingNotes && !notesError && formattedNotes.length === 0 ? <p>{t.notesNone}</p> : null}
            {formattedNotes.length > 0 ? (
              <div className="space-y-2">
                {formattedNotes.map((item) => (
                  <div
                    key={item.id}
                    className={`grid gap-2 rounded-xl border px-3 py-2 md:grid-cols-5 ${
                      isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div>
                      <p className="text-xs uppercase opacity-60">{t.matiere}</p>
                      <p className="font-semibold">{item.matiere || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase opacity-60">{t.note}</p>
                      <p className="font-semibold">{item.note || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase opacity-60">{t.enseignant}</p>
                      <p className="font-semibold">{item.teacher_username || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase opacity-60">{t.filiere}</p>
                      <p className="font-semibold">{Array.isArray(item.filieres) ? item.filieres.join(', ') : '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase opacity-60">{t.date}</p>
                      <p className="font-semibold">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <section className={`mt-6 rounded-3xl border p-5 ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              className={`rounded-xl border px-3 py-2 outline-none ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-slate-50'}`}
              placeholder={t.cycle}
              value={cycle}
              onChange={(event) => setCycle(event.target.value)}
            />
            <input
              className={`rounded-xl border px-3 py-2 outline-none ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-slate-50'}`}
              placeholder={t.filiere}
              value={filiere}
              onChange={(event) => setFiliere(event.target.value)}
            />
            <input
              className={`rounded-xl border px-3 py-2 outline-none md:col-span-2 ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-slate-50'}`}
              placeholder={t.objet}
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
            />
            <textarea
              className={`rounded-xl border px-3 py-2 outline-none md:col-span-2 ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-slate-50'}`}
              placeholder={t.justification}
              rows={4}
              value={justification}
              onChange={(event) => setJustification(event.target.value)}
            />
            <input
              className={`rounded-xl border px-3 py-2 outline-none md:col-span-2 ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-slate-50'}`}
              type="file"
              accept="application/pdf,.pdf"
              ref={attachmentRef}
              onChange={(event) => setAttachment(event.target.files?.[0] || null)}
            />
          </div>
          <button
            className="mt-4 rounded-full bg-rose-800 px-5 py-2 font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? '...' : t.envoyer}
          </button>
          {status ? <p className="mt-3 text-sm text-emerald-500">{status}</p> : null}
        </section>

        <section className={`mt-6 rounded-3xl border p-5 ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <h2 className="text-xl font-semibold">{t.listTitle}</h2>
          <div className={`mt-3 rounded-xl border px-3 py-4 text-sm ${isDark ? 'border-slate-700 bg-slate-800 text-slate-200' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
            {isLoadingItems ? <p>{t.chargement}</p> : null}
            {!isLoadingItems && itemsError ? <p className="text-rose-500">{itemsError}</p> : null}
            {!isLoadingItems && !itemsError && formattedItems.length === 0 ? <p>{t.none}</p> : null}
            {formattedItems.length > 0 ? (
              <div className="space-y-2">
                {formattedItems.map((item) => (
                  <div
                    key={item.id}
                    className={`grid gap-2 rounded-xl border px-3 py-2 md:grid-cols-5 ${
                      isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div>
                      <p className="text-xs uppercase opacity-60">{t.objet}</p>
                      <p className="font-semibold">{item.subject}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase opacity-60">{t.cycle}</p>
                      <p className="font-semibold">{item.cycle}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase opacity-60">{t.filiere}</p>
                      <p className="font-semibold">{item.filiere}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase opacity-60">{t.statut}</p>
                      <p className="font-semibold">{item.status}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase opacity-60">{t.date}</p>
                      <p className="font-semibold">{item.date}</p>
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

export default StudentPage;
