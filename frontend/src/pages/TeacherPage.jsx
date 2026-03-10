import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { clearSession, readSession, saveSession } from '../utils/session'

const cycles = [
  'BTS',
  'DUT',
  'Licence Professionnelle',
  'Master Professionnel',
  "Cycle d'Ingénieur",
  'Cycle Management',
  'DUNIS',
  'LEONARD DE VINCI',
]

const filieresByCycle = {
  DUT: [
    'Génie Informatique (GI)',
    "Génie Électrique (GE) : option Automatisme et Informatique Industrielle (AII)",
    'Génie Numérique (GN)',
    'Génie Civil',
    'Génie Télécommunication et Réseaux',
    'Mécatronique Automobile',
    'Gestion des Entreprises et des Organisations',
    'Gestion Comptable et Financière',
    'Gestion et Management des Organisations',
    'Gestion des Ressources Humaines',
    'Electrotechnique',
    'Energies Renouvelables',
  ],
  BTS: [
    'Génie Électrique (GE)',
    'Génie Civil',
    'Génie Mécanique et Productive',
    'Génie Chimique et les Procédés',
    'Génie Thermique (Froid et Climatisation)',
    'Génie Logiciel',
    'Réseau et Sécurité',
    'Télécommunication',
    'Infographie et Web Design',
    'E-commerce et Marketing Digital',
    'Informatique Industriel et Automatisme (IIA)',
    'Maintenance des Systèmes Informatiques',
    'Maintenance des Appareils Biomédicaux (MAB)',
    'Gestion Comptabilité / Accountancy (ACC)',
    'Gestion Ressources Humaines (GRH) / Human Resource and Management (HRM)',
    'Génie Informatique (GI) / Software Engineering',
    "Droit des Affaires et de l'Entreprise",
    'Assurance',
    'Banque et Finance',
    'Gestion de la Qualité',
    'Commerce International',
    'Transport et Logistique',
    'Management des Projets',
    'Douane et Transit (DOT)',
    'Marketing Commerce Vente (MCV)',
    'Comptabilité et gestion (CGE)',
  ],
  'Licence Professionnelle': [
    'Géotechnique et Infrastructure',
    "Ingénierie de l'Énergie Électrique",
    'Ingénierie des Systèmes Automatisés',
    'Bâtiments et Constructions Industrielles',
    'Génie Informatique (Génie Logiciel, Systèmes Information)',
  ],
  'Master Professionnel': [
    'Géotechnique et Infrastructure',
    "Ingénierie de l'Énergie Électrique",
    'Ingénierie des Systèmes Automatisés',
    'Bâtiments et Constructions Industrielles',
    'Génie Informatique (Génie Logiciel, Systèmes Information)',
  ],
  "Cycle d'Ingénieur": [
    'Génie Civil',
    'Génie Électrique',
    'Génie Informatique',
    'Génie Télécommunication',
  ],
  'Cycle Management': [
    'Banque et Assurance',
    'Marketing et Commerce',
    'Comptabilité Finance et Audit',
    'Gestion des Ressources Humaines',
    'Qualité, Sécurité et Environnement : Cycle de Management',
  ],
  DUNIS: [
    'Computer science',
    'Computer engineering',
    'Business administration',
    'Pre-Law',
    'Pre-Med',
  ],
  'LEONARD DE VINCI': ['EMLV', 'ESILV'],
}

const matieres = ['Mathématiques', 'Programmation', 'Réseaux', 'Algorithmique']

const baseNotes = (selectedMatieres, studentKeys) => {
  const notes = {}
  selectedMatieres.forEach((matiere) => {
    notes[matiere] = {}
    studentKeys.forEach((studentKey) => {
      notes[matiere][studentKey] = ''
    })
  })
  return notes
}

const textes = {
  fr: {
    titre: 'JFN-HUI · Espace Enseignant',
    cycle: 'Choisir le Cycle',
    filiere: 'Choisir la Filière',
    matiere: 'Choisir la Matière',
    notes: 'Saisie des Notes',
    typeExamen: "Type d'examen",
    typeRequis: "Veuillez choisir le type d'examen.",
    ccLabel: 'CC (Contrôle continu)',
    snLabel: 'SN (Session normale)',
    suivant: 'Suivant →',
    retour: 'Retour',
    envoyer: 'Envoyer',
    cycleRequis: 'Choisissez un cycle',
    filiereRequise: 'Sélectionnez une filière',
    matiereRequise: 'Sélectionnez une matière',
    aucuneFiliere: 'Aucune filière disponible',
    envoyees: "Notes envoyées à l'administration et au coordonnateur",
    connexionTitre: 'Connexion Enseignant',
    identifiant: 'Identifiant (email)',
    motDePasse: 'Mot de passe',
    seConnecter: 'Se connecter',
    deconnexion: 'Se déconnecter',
    accesRefuse: "Accès refusé : ce compte n'est pas enseignant ou admin.",
    erreurLogin: 'Identifiants invalides.',
    champsRequis: 'Veuillez renseigner les champs.',
    erreurEnvoi: "Erreur lors de l'envoi.",
    notesSoumises: 'Notes déjà soumises',
    notesSoumisesIntro: "Modification possible uniquement après autorisation du coordonnateur ou de l'admin.",
    permissionAccordee: 'Permission accordée',
    permissionRefusee: 'Verrouillée',
    enregistrerNote: 'Mettre à jour',
    majOk: 'Note modifiée.',
    majErreur: 'Modification refusée ou invalide.',
  },
  en: {
    titre: 'JFN-HUI · Teacher Space',
    cycle: 'Choose the Cycle',
    filiere: 'Choose the Track',
    matiere: 'Choose the Subject',
    notes: 'Enter Marks',
    typeExamen: 'Exam type',
    typeRequis: 'Please choose the exam type.',
    ccLabel: 'CC (Continuous assessment)',
    snLabel: 'SN (Normal session)',
    suivant: 'Next →',
    retour: 'Back',
    envoyer: 'Send',
    cycleRequis: 'Please choose a cycle',
    filiereRequise: 'Please select at least one track',
    matiereRequise: 'Please select at least one subject',
    aucuneFiliere: 'No track available',
    envoyees: 'Marks sent to administration and coordinator',
    connexionTitre: 'Teacher Login',
    identifiant: 'Username (email)',
    motDePasse: 'Password',
    seConnecter: 'Sign in',
    deconnexion: 'Sign out',
    accesRefuse: 'Access denied: this account is not teacher or admin.',
    erreurLogin: 'Invalid credentials.',
    champsRequis: 'Please fill in all fields.',
    erreurEnvoi: 'Send failed.',
    notesSoumises: 'Submitted marks',
    notesSoumisesIntro: 'Edit is possible only after coordinator/admin permission.',
    permissionAccordee: 'Allowed',
    permissionRefusee: 'Locked',
    enregistrerNote: 'Update',
    majOk: 'Mark updated.',
    majErreur: 'Update denied or invalid.',
  },
}

function TeacherPage() {
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
  const [step, setStep] = useState(1)
  const [selectedCycle, setSelectedCycle] = useState('')
  const [selectedFilieres, setSelectedFilieres] = useState([])
  const [selectedMatieres, setSelectedMatieres] = useState([])
  const [noteType, setNoteType] = useState('CC')
  const [notes, setNotes] = useState({})
  const [loading, setLoading] = useState(false)
  const [theme, setTheme] = useState('light')
  const [langue, setLangue] = useState('fr')
  const [loginId, setLoginId] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [authToken, setAuthToken] = useState(() => readSession().token)
  const [authRole, setAuthRole] = useState(() => readSession().role)
  const [authScope, setAuthScope] = useState(() => readSession().scope)
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [submitStatus, setSubmitStatus] = useState('')
  const [submittedNotes, setSubmittedNotes] = useState([])
  const [isLoadingSubmitted, setIsLoadingSubmitted] = useState(false)
  const [submittedError, setSubmittedError] = useState('')
  const [students, setStudents] = useState([])
  const [isLoadingStudents, setIsLoadingStudents] = useState(false)
  const [studentsError, setStudentsError] = useState('')
  const [noteDrafts, setNoteDrafts] = useState({})
  const [savingNoteId, setSavingNoteId] = useState(null)
  const [notesView, setNotesView] = useState('flow')

  const isDark = theme === 'dark'
  const t = textes[langue]
  const isTeacher = authToken && (authScope === 'superuser' || authRole === 'enseignant' || authRole === 'admin')
  const studentKeys = useMemo(
    () => students.map((u) => String(u?.username || u?.email || '')).map((v) => v.trim()).filter(Boolean),
    [students]
  )

  const getStudentLabel = (student) => {
    const fullName = `${student?.first_name || ''} ${student?.last_name || ''}`.trim()
    return fullName || student?.username || student?.email || '-'
  }

  /* ── Fetch étudiants par cycle ── */
  const fetchStudents = useCallback(async () => {
    const token = authToken || readSession().token
    if (!token || !selectedCycle) return
    setIsLoadingStudents(true)
    setStudentsError('')
    try {
      const params = new URLSearchParams({ cycle: selectedCycle })
      const res = await fetch(`${apiBase}/api/accounts/students/?${params.toString()}`, {
        headers: { Authorization: `Token ${token}` },
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.detail || 'students_fetch_failed')
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : []
      setStudents(list)
    } catch (err) {
      setStudents([])
      setStudentsError(err?.message || 'Erreur')
    } finally {
      setIsLoadingStudents(false)
    }
  }, [apiBase, authToken, selectedCycle])

  /* ── Fetch notes soumises ── */
  const fetchSubmittedNotes = useCallback(async () => {
    const token = authToken || readSession().token
    if (!token) return
    setIsLoadingSubmitted(true)
    setSubmittedError('')
    try {
      const res = await fetch(`${apiBase}/api/notes/?page_size=200`, {
        headers: { Authorization: `Token ${token}` },
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.detail || 'notes_fetch_failed')
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : []
      setSubmittedNotes(list)
      setNoteDrafts(
        Object.fromEntries(
          list.map((item) => [
            item.id,
            item?.note === null || item?.note === undefined ? '' : String(item.note),
          ])
        )
      )
    } catch (err) {
      setSubmittedNotes([])
      setSubmittedError(err?.message || 'Erreur')
    } finally {
      setIsLoadingSubmitted(false)
    }
  }, [apiBase, authToken])

  useEffect(() => {
    if (isTeacher) fetchSubmittedNotes()
  }, [isTeacher, fetchSubmittedNotes])

  useEffect(() => {
    if (!isTeacher || !selectedCycle) return
    fetchStudents()
  }, [isTeacher, selectedCycle, fetchStudents])

  /* ── Helpers navigation ── */
  const showLoader = (callback) => {
    setLoading(true)
    setTimeout(() => {
      callback()
      setLoading(false)
    }, 300)
  }

  const nextToFilieres = () => {
    if (!selectedCycle) { alert(t.cycleRequis); return }
    showLoader(() => setStep(2))
  }

  const nextToMatieres = () => {
    if (selectedFilieres.length === 0) { alert(t.filiereRequise); return }
    showLoader(() => setStep(3))
  }

  const nextToNotes = () => {
    if (selectedMatieres.length === 0) { alert(t.matiereRequise); return }
    if (isLoadingStudents) { alert(langue === 'fr' ? 'Chargement des étudiants...' : 'Loading students...'); return }
    if (studentKeys.length === 0) { alert(langue === 'fr' ? 'Aucun étudiant trouvé pour ce cycle.' : 'No student found for this cycle.'); return }
    showLoader(() => { setNotes(baseNotes(selectedMatieres, studentKeys)); setStep(4) })
  }

  const goBack = (to) => setStep(to)
  const toggleDark = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))

  const handleFiliereChange = (value, checked) =>
    setSelectedFilieres((prev) => (checked ? [...prev, value] : prev.filter((i) => i !== value)))

  const handleMatiereChange = (value, checked) =>
    setSelectedMatieres((prev) => (checked ? [...prev, value] : prev.filter((i) => i !== value)))

  const handleNoteChange = (matiere, etudiant, value) =>
    setNotes((prev) => ({ ...prev, [matiere]: { ...prev[matiere], [etudiant]: value } }))

  /* ── Envoyer notes ── */
  const enregistrerNotes = () => {
    setSubmitStatus('')
    const token = authToken || readSession().token
    if (!token) { setSubmitStatus(t.erreurLogin); return }
    if (!noteType) { setSubmitStatus(t.typeRequis); return }
    fetch(`${apiBase}/api/notes/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Token ${token}` },
      body: JSON.stringify({ cycle: selectedCycle, filieres: selectedFilieres, note_type: noteType, notes }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => null)
        if (!res.ok) throw new Error(data?.detail || 'Erreur')
        setSubmitStatus(t.envoyees)
        setNotes(baseNotes(selectedMatieres, studentKeys))
        fetchSubmittedNotes()
      })
      .catch(() => setSubmitStatus(t.erreurEnvoi))
  }

  /* ── Modifier note soumise ── */
  const modifierNoteSoumise = async (noteId) => {
    const token = authToken || readSession().token
    if (!token) return
    setSavingNoteId(noteId)
    try {
      const res = await fetch(`${apiBase}/api/notes/${noteId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Token ${token}` },
        body: JSON.stringify({ note: noteDrafts[noteId] }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.detail || t.majErreur)
      setSubmitStatus(t.majOk)
      fetchSubmittedNotes()
    } catch {
      setSubmitStatus(t.majErreur)
    } finally {
      setSavingNoteId(null)
    }
  }

  /* ── Login / Logout ── */
  const handleLogin = async () => {
    if (!loginId.trim() || !loginPassword.trim()) { setAuthError(t.champsRequis); return }
    setAuthError('')
    setAuthLoading(true)
    try {
      const res = await fetch(`${apiBase}/api/accounts/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginId.trim(), password: loginPassword }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) { setAuthError(data?.detail || t.erreurLogin); return }
      if (data?.role !== 'enseignant' && data?.role !== 'admin' && !data?.is_superuser) {
        setAuthError(t.accesRefuse)
        clearSession(); setAuthToken(''); setAuthRole(''); setAuthScope('')
        return
      }
      const nextScope = data?.is_superuser ? 'superuser' : data.role === 'admin' ? 'admin' : 'teacher'
      saveSession({
        token: data.token,
        role: data.role,
        user: data.username || data.email || loginId.trim(),
        scope: nextScope,
      })
      setAuthToken(data.token)
      setAuthRole(data.role)
      setAuthScope(nextScope)
      setLoginPassword('')
    } catch {
      setAuthError(t.erreurLogin)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    clearSession()
    setAuthToken(''); setAuthRole(''); setAuthScope(''); setLoginId(''); setLoginPassword('')
  }

  const filieres = useMemo(() => filieresByCycle[selectedCycle] || [], [selectedCycle])

  const sortedSubmittedNotes = useMemo(() => {
    const getTime = (item) => {
      const raw = item?.created_at || item?.date_created || item?.date || null
      if (!raw) return 0
      const ts = Date.parse(raw)
      return Number.isNaN(ts) ? 0 : ts
    }
    return [...submittedNotes].sort((a, b) => {
      const delta = getTime(b) - getTime(a)
      if (delta !== 0) return delta
      return (typeof b?.id === 'number' ? b.id : 0) - (typeof a?.id === 'number' ? a.id : 0)
    })
  }, [submittedNotes])

  /* ═══════════════════════════════
     Styles utilitaires communs
  ═══════════════════════════════ */
  const bg = isDark ? 'bg-slate-950 text-slate-100' : 'bg-gradient-to-br from-slate-50 to-slate-200 text-slate-900'
  const cardBg = isDark ? 'bg-slate-900/80' : 'bg-white'
  const innerBg = isDark ? 'bg-slate-800' : 'bg-slate-100'
  const rowBg = isDark ? 'bg-slate-900' : 'bg-white'
  const btnBack = isDark ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-800'
  const btnPrimary = 'rounded-xl bg-gradient-to-br from-rose-800 to-rose-600 px-5 py-3 font-semibold text-white'
  const inputClass = `w-full rounded-xl border px-4 py-3 outline-none ${isDark ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-slate-300 bg-white text-slate-900'}`

  /* ═══════════════════════════════
     PAGE DE CONNEXION
  ═══════════════════════════════ */
  if (!isTeacher) {
    return (
      <div className={`min-h-screen px-4 py-6 font-[Poppins] ${bg}`}>
        <div className="mx-auto w-full max-w-md">
          {/* Header */}
          <header className="mb-6 flex items-center justify-between rounded-3xl bg-gradient-to-br from-rose-900 to-rose-950 px-6 py-5 text-white shadow-2xl">
            <h3 className="text-lg font-semibold tracking-wide">{t.titre}</h3>
            <div className="flex items-center gap-2">
              <button type="button" onClick={toggleDark} className="rounded-full bg-white/20 px-3 py-2 text-sm font-semibold">
                {isDark ? '☀️' : '🌙'}
              </button>
              {['fr', 'en'].map((l) => (
                <button key={l} type="button" onClick={() => setLangue(l)}
                  className={`rounded-full px-3 py-2 text-sm font-semibold ${langue === l ? 'bg-white/30' : 'bg-white/10'}`}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </header>

          {/* Formulaire login */}
          <div className={`rounded-3xl p-6 shadow-xl ${cardBg}`}>
            <h2 className="mb-4 text-xl font-semibold">{t.connexionTitre}</h2>
            <div className="space-y-3">
              <input className={inputClass} placeholder={t.identifiant} value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
              <input className={inputClass} placeholder={t.motDePasse} type="password" value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
            </div>
            <button type="button" onClick={handleLogin} disabled={authLoading}
              className={`mt-4 w-full ${btnPrimary} disabled:opacity-60`}>
              {authLoading ? '⏳ ...' : t.seConnecter}
            </button>
            {authError && <p className="mt-3 text-sm text-rose-500">{authError}</p>}
            <Link to="/choix-profil"
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-rose-800 px-5 py-3 font-semibold text-rose-800 hover:bg-rose-800 hover:text-white transition">
              ← {t.retour}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  /* ═══════════════════════════════
     DASHBOARD ENSEIGNANT
  ═══════════════════════════════ */
  return (
    <div className={`min-h-screen px-4 py-6 font-[Poppins] ${bg}`}>
      {/* Loader plein écran */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/30 border-t-rose-700" />
        </div>
      )}

      <div className="mx-auto w-full max-w-5xl">
        {/* Header */}
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-gradient-to-br from-rose-900 to-rose-950 px-6 py-5 text-white shadow-2xl">
          <h3 className="text-lg font-semibold tracking-wide">{t.titre}</h3>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={toggleDark} className="rounded-full bg-white/20 px-3 py-2 text-sm font-semibold">
              {isDark ? '☀️' : '🌙'}
            </button>
            {['fr', 'en'].map((l) => (
              <button key={l} type="button" onClick={() => setLangue(l)}
                className={`rounded-full px-3 py-2 text-sm font-semibold ${langue === l ? 'bg-white/30' : 'bg-white/10'}`}>
                {l.toUpperCase()}
              </button>
            ))}
            <button type="button" onClick={handleLogout} className="rounded-full bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/20 transition">
              🚪 {t.deconnexion}
            </button>
          </div>
        </header>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setNotesView('flow')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              notesView === 'flow'
                ? 'bg-rose-700 text-white'
                : isDark
                ? 'border border-slate-600 text-slate-200 hover:border-rose-600'
                : 'border border-rose-700 text-rose-700 hover:bg-rose-50'
            }`}
          >
            {t.notes}
          </button>
          <button
            type="button"
            onClick={() => setNotesView('submitted')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              notesView === 'submitted'
                ? 'bg-rose-700 text-white'
                : isDark
                ? 'border border-slate-600 text-slate-200 hover:border-rose-600'
                : 'border border-rose-700 text-rose-700 hover:bg-rose-50'
            }`}
          >
            {t.notesSoumises}
          </button>
        </div>

        {notesView === 'flow' && (
        <>
        {/* ── ÉTAPE 1 : Cycle ── */}
        <div className={`rounded-3xl p-6 shadow-xl ${cardBg} ${step === 1 ? 'block' : 'hidden'}`}>
          <div className="mb-4 flex items-center gap-3 text-lg font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-800 text-white">1</span>
            {t.cycle}
          </div>
          <div className={`rounded-2xl p-4 ${innerBg}`}>
            {cycles.map((cycle) => (
              <label key={cycle} className={`mb-3 flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 shadow-sm transition hover:shadow-md ${rowBg}`}>
                <input type="radio" name="cycle" value={cycle}
                  checked={selectedCycle === cycle}
                  onChange={() => setSelectedCycle(cycle)} />
                {cycle}
              </label>
            ))}
          </div>
          <div className="mt-4 flex gap-3">
            <button type="button" onClick={nextToFilieres} className={btnPrimary}>{t.suivant}</button>
          </div>
        </div>

        {/* ── ÉTAPE 2 : Filières ── */}
        <div className={`rounded-3xl p-6 shadow-xl ${cardBg} ${step === 2 ? 'block' : 'hidden'}`}>
          <div className="mb-4 flex items-center gap-3 text-lg font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-800 text-white">2</span>
            {t.filiere}
          </div>
          <div className={`rounded-2xl p-4 ${innerBg}`}>
            {filieres.length === 0
              ? <p className="italic opacity-60">{t.aucuneFiliere}</p>
              : filieres.map((filiere) => (
                <label key={filiere} className={`mb-3 flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 shadow-sm transition hover:shadow-md ${rowBg}`}>
                  <input type="checkbox" value={filiere}
                    checked={selectedFilieres.includes(filiere)}
                    onChange={(e) => handleFiliereChange(filiere, e.target.checked)} />
                  {filiere}
                </label>
              ))}
          </div>
          <div className="mt-4 flex gap-3">
            <button type="button" onClick={() => goBack(1)} className={`rounded-xl px-5 py-3 font-semibold ${btnBack}`}>{t.retour}</button>
            <button type="button" onClick={nextToMatieres} className={btnPrimary}>{t.suivant}</button>
          </div>
        </div>

        {/* ── ÉTAPE 3 : Matières ── */}
        <div className={`rounded-3xl p-6 shadow-xl ${cardBg} ${step === 3 ? 'block' : 'hidden'}`}>
          <div className="mb-4 flex items-center gap-3 text-lg font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-800 text-white">3</span>
            {t.matiere}
          </div>
          <div className={`rounded-2xl p-4 ${innerBg}`}>
            {matieres.map((matiere) => (
              <label key={matiere} className={`mb-3 flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 shadow-sm transition hover:shadow-md ${rowBg}`}>
                <input type="checkbox" value={matiere}
                  checked={selectedMatieres.includes(matiere)}
                  onChange={(e) => handleMatiereChange(matiere, e.target.checked)} />
                {matiere}
              </label>
            ))}
          </div>
          <div className="mt-4 flex gap-3">
            <button type="button" onClick={() => goBack(2)} className={`rounded-xl px-5 py-3 font-semibold ${btnBack}`}>{t.retour}</button>
            <button type="button" onClick={nextToNotes} className={btnPrimary}>{t.suivant}</button>
          </div>
        </div>

        {/* ── ÉTAPE 4 : Saisie des notes ── */}
        <div className={`rounded-3xl p-6 shadow-xl ${cardBg} ${step === 4 ? 'block' : 'hidden'}`}>
          <div className="mb-4 flex items-center gap-3 text-lg font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-800 text-white">4</span>
            {t.notes}
          </div>
          <div className={`mb-4 rounded-2xl p-4 ${innerBg}`}>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide opacity-70">
              {t.typeExamen}
            </label>
            <select
              value={noteType}
              onChange={(e) => setNoteType(e.target.value)}
              className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${
                isDark ? 'border-slate-700 bg-slate-950 text-slate-100' : 'border-slate-300 bg-white text-slate-900'
              }`}
            >
              <option value="CC">{t.ccLabel}</option>
              <option value="SN">{t.snLabel}</option>
            </select>
          </div>
          <button
            type="button"
            onClick={fetchStudents}
            disabled={!selectedCycle || isLoadingStudents}
            className={`mb-3 rounded-xl px-4 py-2 text-xs font-semibold transition ${
              isDark
                ? 'border border-slate-700 text-slate-200 hover:border-rose-700 hover:text-white disabled:opacity-60'
                : 'border border-rose-700 text-rose-700 hover:bg-rose-50 disabled:opacity-60'
            }`}
          >
            {isLoadingStudents ? '...' : (langue === 'fr' ? 'Actualiser les étudiants' : 'Refresh students')}
          </button>
          <>
              <div className={`rounded-2xl p-4 ${innerBg}`}>
                {selectedMatieres.map((matiere) => (
                  <div key={matiere} className="mb-5">
                    <h4 className="mb-2 text-sm font-semibold text-rose-800">{matiere}</h4>
                    {isLoadingStudents ? <p className="italic opacity-60">{langue === 'fr' ? 'Chargement des étudiants...' : 'Loading students...'}</p> : null}
                    {!isLoadingStudents && studentsError ? <p className="text-rose-500">{studentsError}</p> : null}
                    {!isLoadingStudents && !studentsError && students.length === 0 ? <p className="italic opacity-60">{langue === 'fr' ? 'Aucun étudiant pour ce cycle.' : 'No student for this cycle.'}</p> : null}
                    {students.map((student) => {
                      const studentKey = String(student?.username || student?.email || '').trim()
                      if (!studentKey) return null
                      return (
                        <div
                          key={`${matiere}-${studentKey}`}
                          className={`mb-2 grid grid-cols-[1fr_80px] items-center gap-3 rounded-xl px-3 py-2 ${rowBg}`}
                        >
                          <span>{getStudentLabel(student)}</span>
                          <input
                            type="number"
                            min="0"
                            max="20"
                            value={notes[matiere]?.[studentKey] ?? ''}
                            onChange={(e) => handleNoteChange(matiere, studentKey, e.target.value)}
                            className={`rounded-lg border px-2 py-1 text-sm outline-none ${
                              isDark ? 'border-slate-700 bg-slate-950 text-slate-100' : 'border-slate-300 bg-white text-slate-900'
                            }`}
                          />
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-3">
                <button type="button" onClick={() => goBack(3)} className={`rounded-xl px-5 py-3 font-semibold ${btnBack}`}>{t.retour}</button>
                <button type="button" onClick={enregistrerNotes} className={btnPrimary}>{t.envoyer}</button>
              </div>
              {submitStatus && (
                <p className={`mt-3 text-sm font-semibold ${submitStatus === t.majOk || submitStatus === t.envoyees ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {submitStatus}
                </p>
              )}
            </>
        </div>
        </>
        )}

        {notesView === 'submitted' && (
          <section className={`rounded-3xl p-6 shadow-xl ${cardBg}`}>
            <div className="mb-4 flex items-center gap-3 text-lg font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-800 text-white">5</span>
              {t.notesSoumises}
            </div>
            <p className={`mb-4 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{t.notesSoumisesIntro}</p>
            <div className={`rounded-2xl p-4 ${innerBg}`}>
              {isLoadingSubmitted && <p className="italic opacity-60">{langue === 'fr' ? 'Chargement...' : 'Loading...'}</p>}
              {!isLoadingSubmitted && submittedError && <p className="text-rose-500">{submittedError}</p>}
              {!isLoadingSubmitted && !submittedError && submittedNotes.length === 0 && (
                <p className="italic opacity-60 text-sm">{t.notesSoumisesIntro}</p>
              )}
              {sortedSubmittedNotes.map((item) => (
                <div key={item.id}
                  className={`mb-3 grid gap-3 rounded-xl border p-3 md:grid-cols-6 ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'}`}>
                  <div className="space-y-1">
                    <p className="text-xs uppercase opacity-60">{t.matiere}</p>
                    <p className="font-semibold">{item.matiere}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase opacity-60">{t.filiere}</p>
                    <p className="font-semibold">{Array.isArray(item.filieres) ? item.filieres.join(', ') : '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase opacity-60">Étudiant</p>
                    <p className="font-semibold">{item.etudiant}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase opacity-60">Note</p>
                    <input type="number" min="0" max="20" step="0.01"
                      value={noteDrafts[item.id] ?? ''}
                      onChange={(e) => setNoteDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))}
                      disabled={!item.teacher_can_edit}
                      className={`w-full rounded-lg border px-2 py-1 text-sm outline-none ${isDark ? 'border-slate-700 bg-slate-950 text-slate-100' : 'border-slate-300 bg-white text-slate-900'} ${!item.teacher_can_edit ? 'opacity-60 cursor-not-allowed' : ''}`} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase opacity-60">Permission</p>
                    <p className={`font-semibold ${item.teacher_can_edit ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {item.teacher_can_edit ? t.permissionAccordee : t.permissionRefusee}
                    </p>
                  </div>
                  <div className="flex items-end">
                    <button type="button"
                      onClick={() => modifierNoteSoumise(item.id)}
                      disabled={!item.teacher_can_edit || savingNoteId === item.id}
                      className="w-full rounded-lg bg-rose-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-60 disabled:cursor-not-allowed">
                      {savingNoteId === item.id ? '⏳' : t.enregistrerNote}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  )
}

export default TeacherPage
