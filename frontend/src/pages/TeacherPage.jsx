import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

const cycles = [
  'BTS',
  'DUT',
  'Licence Professionnelle',
  'Master Professionnel',
  'Cycle Management',
  'DUNIS',
  'LEONARD DE VINCI',
]

const filieresByCycle = {
  DUT: [
    'Génie Informatique (GI)',
    'Génie Électrique (AII)',
    'Génie Numérique (GN)',
    'Génie Civil',
    'Génie Télécommunication et Réseaux',
    'Mécatronique Automobile',
    'Electrotechnique',
    'Energies Renouvelables',
  ],
  BTS: [
    'Génie Informatique',
    'Génie Electrique',
    'Génie Civil',
    'Génie Télécom',
    'Gestion Comptable',
    'Gestion RH',
    'Management',
  ],
  'Licence Professionnelle': [
    'Génie Logiciel',
    'Systèmes Information',
    'Ingénierie Énergie',
    'Bâtiments Industriels',
  ],
  'Master Professionnel': [
    'Ingénierie Énergie',
    'Systèmes Automatisés',
    'Génie Informatique',
  ],
  'Cycle Management': [
    'Banque et Assurance',
    'Marketing Commerce',
    'Comptabilité Finance',
    'Ressources Humaines',
    'QSE',
  ],
  DUNIS: [
    'Computer Science',
    'Computer Engineering',
    'Business Administration',
    'Pre-Law',
    'Pre-Med',
  ],
  'LEONARD DE VINCI': ['ESILV Ingénieur', 'EMLV Management'],
}

const matieres = ['Mathématiques', 'Programmation', 'Réseaux', 'Algorithmique']

const etudiants = ['Alice', 'Bob', 'David', 'Sarah']

const baseNotes = (selectedMatieres) => {
  const notes = {}
  selectedMatieres.forEach((matiere) => {
    notes[matiere] = {}
    etudiants.forEach((etudiant) => {
      notes[matiere][etudiant] = ''
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
    suivant: 'Suivant →',
    retour: 'Retour',
    envoyer: '✅ Envoyer',
    cycleRequis: 'Choisissez un cycle',
    filiereRequise: 'Sélectionnez une filière',
    matiereRequise: 'Sélectionnez une matière',
    aucuneFiliere: 'Aucune filière disponible',
    envoyees: "✅ Notes envoyées à l'administration",
    connexionTitre: 'Connexion Enseignant',
    identifiant: 'Identifiant (email)',
    motDePasse: 'Mot de passe',
    seConnecter: 'Se connecter',
    deconnexion: 'Se déconnecter',
    accesRefuse: "Accès refusé : ce compte n'est pas enseignant.",
    erreurLogin: 'Identifiants invalides.',
    champsRequis: 'Veuillez renseigner les champs.',
    erreurEnvoi: 'Erreur lors de l’envoi.',
  },
  en: {
    titre: 'JFN-HUI · Teacher Space',
    cycle: 'Choose the Cycle',
    filiere: 'Choose the Track',
    matiere: 'Choose the Subject',
    notes: 'Enter Marks',
    suivant: 'Next →',
    retour: 'Back',
    envoyer: '✅ Send',
    cycleRequis: 'Please choose a cycle',
    filiereRequise: 'Please select at least one track',
    matiereRequise: 'Please select at least one subject',
    aucuneFiliere: 'No track available',
    envoyees: '✅ Marks sent to administration',
    connexionTitre: 'Teacher Login',
    identifiant: 'Username (email)',
    motDePasse: 'Password',
    seConnecter: 'Sign in',
    deconnexion: 'Sign out',
    accesRefuse: 'Access denied: this account is not a teacher.',
    erreurLogin: 'Invalid credentials.',
    champsRequis: 'Please fill in all fields.',
    erreurEnvoi: 'Send failed.',
  },
}

function TeacherPage() {
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
  const [step, setStep] = useState(1)
  const [selectedCycle, setSelectedCycle] = useState('')
  const [selectedFilieres, setSelectedFilieres] = useState([])
  const [selectedMatieres, setSelectedMatieres] = useState([])
  const [notes, setNotes] = useState({})
  const [loading, setLoading] = useState(false)
  const [theme, setTheme] = useState('light')
  const [langue, setLangue] = useState('fr')
  const [loginId, setLoginId] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('auth_token') || '')
  const [authRole, setAuthRole] = useState(() => localStorage.getItem('auth_role') || '')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [submitStatus, setSubmitStatus] = useState('')

  const isDark = theme === 'dark'
  const t = textes[langue]
  const isTeacher = authToken && authRole === 'enseignant'

  const showLoader = (callback) => {
    setLoading(true)
    setTimeout(() => {
      callback()
      setLoading(false)
    }, 300)
  }

  const nextToFilieres = () => {
    if (!selectedCycle) {
      alert(t.cycleRequis)
      return
    }
    showLoader(() => setStep(2))
  }

  const nextToMatieres = () => {
    if (selectedFilieres.length === 0) {
      alert(t.filiereRequise)
      return
    }
    showLoader(() => setStep(3))
  }

  const nextToNotes = () => {
    if (selectedMatieres.length === 0) {
      alert(t.matiereRequise)
      return
    }
    showLoader(() => {
      setNotes(baseNotes(selectedMatieres))
      setStep(4)
    })
  }

  const goBack = (to) => setStep(to)

  const toggleDark = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))

  const handleFiliereChange = (value, checked) => {
    setSelectedFilieres((prev) => (checked ? [...prev, value] : prev.filter((item) => item !== value)))
  }

  const handleMatiereChange = (value, checked) => {
    setSelectedMatieres((prev) => (checked ? [...prev, value] : prev.filter((item) => item !== value)))
  }

  const handleNoteChange = (matiere, etudiant, value) => {
    setNotes((prev) => ({
      ...prev,
      [matiere]: {
        ...prev[matiere],
        [etudiant]: value,
      },
    }))
  }

  const enregistrerNotes = () => {
    setSubmitStatus('')
    const token = authToken || localStorage.getItem('auth_token')
    if (!token) {
      setSubmitStatus(t.erreurLogin)
      return
    }
    fetch(`${apiBase}/api/notes/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({
        cycle: selectedCycle,
        filieres: selectedFilieres,
        notes,
      }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => null)
        if (!res.ok) {
          throw new Error(data?.detail || 'Erreur')
        }
        setSubmitStatus(t.envoyees)
      })
      .catch(() => {
        setSubmitStatus(t.erreurEnvoi)
      })
  }

  const filieres = useMemo(() => filieresByCycle[selectedCycle] || [], [selectedCycle])

  const handleLogin = async () => {
    if (!loginId.trim() || !loginPassword.trim()) {
      setAuthError(t.champsRequis)
      return
    }
    setAuthError('')
    setAuthLoading(true)
    try {
      const res = await fetch(`${apiBase}/api/accounts/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginId.trim(),
          password: loginPassword,
        }),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setAuthError(data?.detail || t.erreurLogin)
        return
      }

      if (data?.role !== 'enseignant') {
        setAuthError(t.accesRefuse)
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_role')
        setAuthToken('')
        setAuthRole('')
        return
      }

      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('auth_role', data.role)
      setAuthToken(data.token)
      setAuthRole(data.role)
      setLoginPassword('')
    } catch (error) {
      setAuthError(t.erreurLogin)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_role')
    setAuthToken('')
    setAuthRole('')
    setLoginId('')
    setLoginPassword('')
  }

  if (!isTeacher) {
    return (
      <div
        className={`min-h-screen px-4 py-6 font-[Poppins] ${
          isDark
            ? 'bg-slate-950 text-slate-100'
            : 'bg-gradient-to-br from-slate-50 to-slate-200 text-slate-900'
        }`}
      >
        <div className="mx-auto w-full max-w-md">
          <header className="mb-6 flex items-center justify-between rounded-3xl bg-gradient-to-br from-rose-900 to-rose-950 px-6 py-5 text-white shadow-2xl">
            <h3 className="text-lg font-semibold tracking-wide">{t.titre}</h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleDark}
                className="rounded-full bg-white/20 px-3 py-2 text-sm font-semibold"
              >
                {isDark ? '☀️' : '🌙'}
              </button>
              <button
                type="button"
                onClick={() => setLangue('fr')}
                className={`rounded-full px-3 py-2 text-sm font-semibold ${
                  langue === 'fr' ? 'bg-white/30' : 'bg-white/10'
                }`}
              >
                FR
              </button>
              <button
                type="button"
                onClick={() => setLangue('en')}
                className={`rounded-full px-3 py-2 text-sm font-semibold ${
                  langue === 'en' ? 'bg-white/30' : 'bg-white/10'
                }`}
              >
                EN
              </button>
            </div>
          </header>

          <div className={`rounded-3xl p-6 shadow-xl ${isDark ? 'bg-slate-900/80' : 'bg-white'}`}>
            <h2 className="mb-4 text-xl font-semibold">{t.connexionTitre}</h2>
            <div className="space-y-3">
              <input
                className={`w-full rounded-xl border px-4 py-3 outline-none ${
                  isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-300 bg-white'
                }`}
                placeholder={t.identifiant}
                value={loginId}
                onChange={(event) => setLoginId(event.target.value)}
              />
              <input
                className={`w-full rounded-xl border px-4 py-3 outline-none ${
                  isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-300 bg-white'
                }`}
                placeholder={t.motDePasse}
                type="password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={handleLogin}
              disabled={authLoading}
              className="mt-4 w-full rounded-xl bg-gradient-to-br from-rose-800 to-rose-600 px-5 py-3 font-semibold text-white disabled:opacity-60"
            >
              {authLoading ? '...' : t.seConnecter}
            </button>
            {authError ? <p className="mt-3 text-sm text-rose-500">{authError}</p> : null}
            <Link
              to="/choix-profil"
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-rose-800 px-5 py-3 font-semibold text-rose-800"
            >
              {t.retour}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen px-4 py-6 font-[Poppins] ${
        isDark
          ? 'bg-slate-950 text-slate-100'
          : 'bg-gradient-to-br from-slate-50 to-slate-200 text-slate-900'
      }`}
    >
      {loading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/30 border-t-rose-700" />
        </div>
      ) : null}

      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-6 flex items-center justify-between rounded-3xl bg-gradient-to-br from-rose-900 to-rose-950 px-6 py-5 text-white shadow-2xl">
          <h3 className="text-lg font-semibold tracking-wide">{t.titre}</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleDark}
              className="rounded-full bg-white/20 px-3 py-2 text-sm font-semibold"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <button
              type="button"
              onClick={() => setLangue('fr')}
              className={`rounded-full px-3 py-2 text-sm font-semibold ${
                langue === 'fr' ? 'bg-white/30' : 'bg-white/10'
              }`}
            >
              FR
            </button>
            <button
              type="button"
              onClick={() => setLangue('en')}
              className={`rounded-full px-3 py-2 text-sm font-semibold ${
                langue === 'en' ? 'bg-white/30' : 'bg-white/10'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full bg-white/10 px-3 py-2 text-sm font-semibold"
            >
              {t.deconnexion}
            </button>
          </div>
        </header>

        <div
          className={`rounded-3xl p-6 shadow-xl ${
            isDark ? 'bg-slate-900/80' : 'bg-white'
          } ${step === 1 ? 'block' : 'hidden'}`}
        >
          <div className="mb-4 flex items-center gap-3 text-lg font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-800 text-white">1</span>
            {t.cycle}
          </div>
          <div className={`rounded-2xl p-4 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
            {cycles.map((cycle) => (
              <label
                className={`mb-3 flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 shadow-sm ${
                  isDark ? 'bg-slate-900' : 'bg-white'
                }`}
                key={cycle}
              >
                <input
                  type="radio"
                  name="cycle"
                  value={cycle}
                  checked={selectedCycle === cycle}
                  onChange={() => setSelectedCycle(cycle)}
                />
                {cycle}
              </label>
            ))}
          </div>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={nextToFilieres}
              className="rounded-xl bg-gradient-to-br from-rose-800 to-rose-600 px-5 py-3 font-semibold text-white"
            >
              {t.suivant}
            </button>
          </div>
        </div>

        <div
          className={`rounded-3xl p-6 shadow-xl ${
            isDark ? 'bg-slate-900/80' : 'bg-white'
          } ${step === 2 ? 'block' : 'hidden'}`}
        >
          <div className="mb-4 flex items-center gap-3 text-lg font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-800 text-white">2</span>
            {t.filiere}
          </div>
          <div className={`rounded-2xl p-4 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
            {filieres.length === 0 ? (
              <p>{t.aucuneFiliere}</p>
            ) : (
              filieres.map((filiere) => (
                <label
                  className={`mb-3 flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 shadow-sm ${
                    isDark ? 'bg-slate-900' : 'bg-white'
                  }`}
                  key={filiere}
                >
                  <input
                    type="checkbox"
                    value={filiere}
                    checked={selectedFilieres.includes(filiere)}
                    onChange={(event) => handleFiliereChange(filiere, event.target.checked)}
                  />
                  {filiere}
                </label>
              ))
            )}
          </div>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => goBack(1)}
              className={`rounded-xl px-5 py-3 font-semibold ${
                isDark ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-800'
              }`}
            >
              {t.retour}
            </button>
            <button
              type="button"
              onClick={nextToMatieres}
              className="rounded-xl bg-gradient-to-br from-rose-800 to-rose-600 px-5 py-3 font-semibold text-white"
            >
              {t.suivant}
            </button>
          </div>
        </div>

        <div
          className={`rounded-3xl p-6 shadow-xl ${
            isDark ? 'bg-slate-900/80' : 'bg-white'
          } ${step === 3 ? 'block' : 'hidden'}`}
        >
          <div className="mb-4 flex items-center gap-3 text-lg font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-800 text-white">3</span>
            {t.matiere}
          </div>
          <div className={`rounded-2xl p-4 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
            {matieres.map((matiere) => (
              <label
                className={`mb-3 flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 shadow-sm ${
                  isDark ? 'bg-slate-900' : 'bg-white'
                }`}
                key={matiere}
              >
                <input
                  type="checkbox"
                  value={matiere}
                  checked={selectedMatieres.includes(matiere)}
                  onChange={(event) => handleMatiereChange(matiere, event.target.checked)}
                />
                {matiere}
              </label>
            ))}
          </div>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => goBack(2)}
              className={`rounded-xl px-5 py-3 font-semibold ${
                isDark ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-800'
              }`}
            >
              {t.retour}
            </button>
            <button
              type="button"
              onClick={nextToNotes}
              className="rounded-xl bg-gradient-to-br from-rose-800 to-rose-600 px-5 py-3 font-semibold text-white"
            >
              {t.suivant}
            </button>
          </div>
        </div>

        <div
          className={`rounded-3xl p-6 shadow-xl ${
            isDark ? 'bg-slate-900/80' : 'bg-white'
          } ${step === 4 ? 'block' : 'hidden'}`}
        >
          <div className="mb-4 flex items-center gap-3 text-lg font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-800 text-white">4</span>
            {t.notes}
          </div>
          <div className={`rounded-2xl p-4 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
            {selectedMatieres.map((matiere) => (
              <div key={matiere} className="mb-5">
                <h4 className="mb-2 text-sm font-semibold text-rose-800">{matiere}</h4>
                {etudiants.map((etudiant) => (
                  <div
                    className={`mb-2 grid grid-cols-[1fr_80px] items-center gap-3 rounded-xl px-3 py-2 ${
                      isDark ? 'bg-slate-900' : 'bg-white'
                    }`}
                    key={`${matiere}-${etudiant}`}
                  >
                    <span>{etudiant}</span>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={notes[matiere]?.[etudiant] ?? ''}
                      onChange={(event) => handleNoteChange(matiere, etudiant, event.target.value)}
                      className={`rounded-lg border px-2 py-1 text-sm ${
                        isDark
                          ? 'border-slate-700 bg-slate-950 text-slate-100'
                          : 'border-slate-300 bg-white text-slate-900'
                      }`}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => goBack(3)}
              className={`rounded-xl px-5 py-3 font-semibold ${
                isDark ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-800'
              }`}
            >
              {t.retour}
            </button>
            <button
              type="button"
              onClick={enregistrerNotes}
              className="rounded-xl bg-gradient-to-br from-rose-800 to-rose-600 px-5 py-3 font-semibold text-white"
            >
              {t.envoyer}
            </button>
          </div>
          {submitStatus ? <p className="mt-3 text-sm text-emerald-500">{submitStatus}</p> : null}
        </div>
      </div>
    </div>
  )
}

export default TeacherPage