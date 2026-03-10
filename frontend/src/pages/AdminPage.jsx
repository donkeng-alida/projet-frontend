import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UserPlus, Users, ShieldCheck, ClipboardList, ArrowLeft, BookOpen, FileText, Moon, Sun, LogOut } from 'lucide-react';
import { clearSession, readSession, saveSession } from '../utils/session';

function AdminPage({ theme, langue, onToggleTheme, onLangueChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = theme === 'dark';
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [cycle, setCycle] = useState('');
  const [childStudent, setChildStudent] = useState('');
  const [generatedStudentPassword, setGeneratedStudentPassword] = useState('');
  const [generatedStudentLogin, setGeneratedStudentLogin] = useState('');
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
  const [noteDrafts, setNoteDrafts] = useState({});
  const [noteEditPermissions, setNoteEditPermissions] = useState({});
  const [noteShareTargets, setNoteShareTargets] = useState({});
  const [savingNoteId, setSavingNoteId] = useState(null);
  const [noteTransferStatus, setNoteTransferStatus] = useState({});
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
  const [authUser, setAuthUser] = useState(() => readSession().user);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [activeView, setActiveView] = useState('accounts');
  const [accountListMode, setAccountListMode] = useState('all');

  const textes = {
    fr: {
      titre: 'Espace Administrateur',
      sousTitre: 'Creation de comptes et gestion des utilisateurs',
      creerCompte: 'Creer un compte',
      nomComplet: 'Nom complet',
      email: 'Adresse email',
      role: 'Role',
      cycle: 'Cycle',
      enfantLie: 'Identifiant enfant (parent)',
      motDePasse: 'Mot de passe',
      mdpAutoEtudiant: 'Mot de passe genere automatiquement par le serveur.',
      mdpGenere: 'Mot de passe genere (a communiquer a l utilisateur)',
      identifiantGenere: 'Identifiant (email)',
      copier: 'Copier',
      copieOk: 'Mot de passe copie.',
      copieKo: 'Copie impossible.',
      utilisateurCree: 'Utilisateur cree avec succes.',
      erreurCreation: "Impossible de creer l'utilisateur.",
      nomManquant: 'Merci de saisir le nom complet.',
      emailManquant: 'Merci de saisir un email valide.',
      roleManquant: 'Merci de choisir un role.',
      cycleManquant: 'Merci de renseigner le cycle.',
      enfantManquant: "Merci de renseigner l'identifiant de l'enfant pour le parent.",
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
      autoriserEnseignant: "Autoriser l'enseignant a modifier",
      transferer: 'Transferer',
      transferEtudiant: 'Etudiant',
      transferCoordonnateur: 'Coordonnateur',
      transferEnseignant: 'Enseignant',
      enregistrerNote: 'Enregistrer la note',
      requetesRecues: 'Requetes etudiantes',
      requetesIntro: 'Requetes recues avec justificatif PDF.',
      requetesVides: 'Aucune requete pour le moment.',
      enseignantLib: 'Enseignant',
      etudiantLib: 'Etudiant',
      matiereLib: 'Matiere',
      noteLib: 'Note',
      cycleLib: 'Cycle',
      filieresLib: 'Filieres',
      filiereLib: 'Filiere',
      objetLib: 'Objet',
      statutLib: 'Statut',
      justificatifLib: 'Justificatif',
      ouvrirPdf: 'Ouvrir PDF',
      telechargerPdf: 'Telecharger PDF',
      dateLib: 'Date',
      connexionTitre: 'Connexion Administrateur',
      identifiant: 'Email (identifiant)',
      seConnecter: 'Se connecter',
      deconnexion: 'Se deconnecter',
      motDePasseLogin: 'Mot de passe',
      accesRefuse: "Acces refuse : ce compte n'est pas admin.",
      accesRefuseSuperuser: "Acces refuse : connectez-vous via l'espace superuser.",
      erreurLogin: 'Identifiants invalides.',
      champsRequis: 'Veuillez renseigner les champs.',
      retour: 'Retour',
      page: 'Page',
      precedent: 'Precedent',
      suivant: 'Suivant',
      taillePage: 'Taille de page',
      bonjour: 'Bonjour',
      resumeAdmin: 'Vue operationnelle de votre espace de gestion.',
      rafraichir: 'Rafraichir',
      notesTotal: 'Notes',
      requetesTotal: 'Requetes',
      bienvenueAide: 'Utilisez ce panneau pour creer des comptes et piloter les flux.',
      accessibiliteInfo: 'Les actions sont securisees et journalisees.',
    },
    en: {
      titre: 'Administrator Space',
      sousTitre: 'Account creation and user management',
      creerCompte: 'Create account',
      nomComplet: 'Full name',
      email: 'Email address',
      role: 'Role',
      cycle: 'Cycle',
      enfantLie: 'Child identifier (parent)',
      motDePasse: 'Password',
      mdpAutoEtudiant: 'Password is generated automatically by the server.',
      mdpGenere: 'Generated password (share with the user)',
      identifiantGenere: 'Login (email)',
      copier: 'Copy',
      copieOk: 'Password copied.',
      copieKo: 'Copy failed.',
      utilisateurCree: 'User created successfully.',
      erreurCreation: 'Unable to create user.',
      nomManquant: 'Please enter the full name.',
      emailManquant: 'Please enter a valid email.',
      roleManquant: 'Please choose a role.',
      cycleManquant: 'Please enter the cycle.',
      enfantManquant: 'Please enter child identifier for parent.',
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
      autoriserEnseignant: 'Allow teacher edit',
      transferer: 'Transfer',
      transferEtudiant: 'Student',
      transferCoordonnateur: 'Coordinator',
      transferEnseignant: 'Teacher',
      enregistrerNote: 'Save mark',
      requetesRecues: 'Student requests',
      requetesIntro: 'Requests received with PDF attachment.',
      requetesVides: 'No request yet.',
      enseignantLib: 'Teacher',
      etudiantLib: 'Student',
      matiereLib: 'Subject',
      noteLib: 'Mark',
      cycleLib: 'Cycle',
      filieresLib: 'Tracks',
      filiereLib: 'Track',
      objetLib: 'Subject',
      statutLib: 'Status',
      justificatifLib: 'Attachment',
      ouvrirPdf: 'Open PDF',
      telechargerPdf: 'Download PDF',
      dateLib: 'Date',
      connexionTitre: 'Admin Login',
      identifiant: 'Email (username)',
      seConnecter: 'Sign in',
      deconnexion: 'Sign out',
      motDePasseLogin: 'Password',
      accesRefuse: 'Access denied: this account is not admin.',
      accesRefuseSuperuser: 'Access denied: sign in via the superuser page.',
      erreurLogin: 'Invalid credentials.',
      champsRequis: 'Please fill in all fields.',
      retour: 'Back',
      page: 'Page',
      precedent: 'Prev',
      suivant: 'Next',
      taillePage: 'Page size',
      bonjour: 'Hello',
      resumeAdmin: 'Operational overview of your administration workspace.',
      rafraichir: 'Refresh',
      notesTotal: 'Marks',
      requetesTotal: 'Requests',
      bienvenueAide: 'Use this panel to create accounts and manage incoming flows.',
      accessibiliteInfo: 'Actions are secured and logged.',
    },
  };

  const t = textes[langue] || textes.fr;
  const isAdmin = authToken && (authRole === 'admin' || authScope === 'superuser');

  const goToAdminView = useCallback((view, mode = 'all') => {
    if (view === 'notes') {
      navigate('/admin/notes');
      return;
    }
    if (view === 'requests') {
      navigate('/admin/requetes');
      return;
    }
    if (mode === 'active') {
      navigate('/admin/comptes-actifs');
      return;
    }
    if (mode === 'inactive') {
      navigate('/admin/comptes-inactifs');
      return;
    }
    navigate('/admin/comptes');
  }, [navigate]);

  useEffect(() => {
    const normalizedPath = location.pathname.replace(/\/+$/, '').toLowerCase();
    const segments = normalizedPath.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1] || 'admin';

    if (normalizedPath === '/admin') {
      navigate('/admin/comptes', { replace: true });
      return;
    }

    if (lastSegment === 'notes') {
      setActiveView('notes');
      return;
    }
    if (lastSegment === 'requetes') {
      setActiveView('requests');
      return;
    }

    setActiveView('accounts');
    if (lastSegment === 'comptes-actifs') {
      setAccountListMode('active');
      return;
    }
    if (lastSegment === 'comptes-inactifs') {
      setAccountListMode('inactive');
      return;
    }
    setAccountListMode('all');
  }, [location.pathname, navigate]);

  const fetchUsers = useCallback(async () => {
    if (!authToken) return;
    setIsLoadingUsers(true);
    try {
      const res = await fetch(`${apiBase}/api/accounts/users/`, {
        headers: { Authorization: `Token ${authToken}` },
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.detail || 'users_fetch_failed');
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : [];
      setUsers(list);
    } catch (err) {
      setUsers([]);
      setStatus({
        type: 'error',
        message:
          (langue === 'fr' ? 'Impossible de charger les comptes.' : 'Failed to load accounts.') +
          (err?.message ? ` (${err.message})` : ''),
      });
    } finally {
      setIsLoadingUsers(false);
    }
  }, [apiBase, authToken, langue]);

  const updateUserStatus = async (userId, isActive) => {
    if (!authToken) return;
    try {
      const res = await fetch(`${apiBase}/api/accounts/users/${userId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Token ${authToken}` },
        body: JSON.stringify({ is_active: Boolean(isActive) }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.detail || 'user_update_failed');
      await fetchUsers();
    } catch (err) {
      setStatus({
        type: 'error',
        message: err?.message || (langue === 'fr' ? 'Modification refusée.' : 'Update denied.'),
      });
    }
  };

  const deleteUser = async (userId) => {
    if (!authToken) return;
    try {
      const res = await fetch(`${apiBase}/api/accounts/users/${userId}/`, {
        method: 'DELETE',
        headers: { Authorization: `Token ${authToken}` },
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.detail || 'user_delete_failed');
      await fetchUsers();
    } catch (err) {
      setStatus({
        type: 'error',
        message: err?.message || (langue === 'fr' ? 'Suppression refusée.' : 'Delete denied.'),
      });
    }
  };

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
      setNoteShareTargets(
        Object.fromEntries(
          list.map((item) => [
            item.id,
            {
              student: Boolean(item?.is_published),
              coordinator: Boolean(item?.visible_to_coordinator),
              teacher: Boolean(item?.visible_to_teacher),
            },
          ])
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
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (isAdmin) {
      fetchNotes(1, notesPageSize);
    }
  }, [isAdmin, fetchNotes, notesPageSize]);

  useEffect(() => {
    if (isAdmin) {
      fetchRequests(1, requestsPageSize);
    }
  }, [isAdmin, fetchRequests, requestsPageSize]);

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

    const getRoleLabelFromUser = (roleValue) => {
      if (!roleValue) return '-';
      if (langue === 'fr') {
        if (roleValue === 'admin') return 'Admin';
        if (roleValue === 'enseignant') return 'Enseignant';
        if (roleValue === 'coordonnateur') return 'Coordonnateur';
        if (roleValue === 'cellule-info') return 'Cellule info';
        if (roleValue === 'parent') return 'Parent';
        if (roleValue === 'etudiant') return 'Etudiant';
      } else {
        if (roleValue === 'admin') return 'Admin';
        if (roleValue === 'enseignant') return 'Teacher';
        if (roleValue === 'coordonnateur') return 'Coordinator';
        if (roleValue === 'cellule-info') return 'IT Cell';
        if (roleValue === 'parent') return 'Parent';
        if (roleValue === 'etudiant') return 'Student';
      }
      return roleValue;
    };

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
  }, [users, langue]);

  const handleCreateUser = async () => {
    if (!fullName.trim()) { setStatus({ type: 'error', message: t.nomManquant }); return; }
    if (!email.includes('@')) { setStatus({ type: 'error', message: t.emailManquant }); return; }
    if (!role) { setStatus({ type: 'error', message: t.roleManquant }); return; }
    if ((role === 'coordonnateur' || role === 'etudiant') && !cycle.trim()) { setStatus({ type: 'error', message: t.cycleManquant }); return; }
    if (role === 'parent' && !childStudent.trim()) { setStatus({ type: 'error', message: t.enfantManquant }); return; }
    if (!authToken) { setStatus({ type: 'error', message: t.accesRefuse }); return; }

    const parts = fullName.trim().split(/\s+/);
    const first_name = parts[0] || '';
    const last_name = parts.slice(1).join(' ');
    const username = email.trim().toLowerCase();

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });
    setGeneratedStudentPassword('');
    setGeneratedStudentLogin('');
    try {
      const payload = {
        username, first_name, last_name, email, role,
        cycle: role === 'coordonnateur' || role === 'etudiant' ? cycle.trim() : '',
        child_student: role === 'parent' ? childStudent.trim() : '',
      };

      const res = await fetch(`${apiBase}/api/accounts/users/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Token ${authToken}` },
        body: JSON.stringify(payload),
      });

      let createdUser = null;
      try { createdUser = await res.json(); } catch { createdUser = null; }

      if (!res.ok) {
        let detail = '';
        try {
          const data = createdUser;
          if (data && typeof data === 'object') {
            detail = data?.detail || Object.entries(data).map(([key, value]) => {
              if (Array.isArray(value)) return `${key}: ${value.join(' ')}`;
              if (typeof value === 'string') return `${key}: ${value}`;
              return '';
            }).filter(Boolean).join(' | ');
          }
        } catch { detail = ''; }
        throw new Error(detail || t.erreurCreation);
      }

      setStatus({ type: 'success', message: t.utilisateurCree });
      if (createdUser?.generated_password) {
        setGeneratedStudentPassword(String(createdUser.generated_password));
        setGeneratedStudentLogin(String(createdUser?.username || createdUser?.email || username));
      }
      setFullName(''); setEmail(''); setRole(''); setCycle(''); setChildStudent('');
      await fetchUsers();
    } catch (err) {
      setStatus({ type: 'error', message: err?.message || t.erreurCreation });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyGeneratedStudentPassword = async () => {
    if (!generatedStudentPassword) return;
    try {
      await navigator.clipboard.writeText(generatedStudentPassword);
      setStatus({ type: 'success', message: t.copieOk });
    } catch {
      setStatus({ type: 'error', message: t.copieKo });
    }
  };

  const handleLogin = async () => {
    if (!loginId.trim() || !loginPassword.trim()) { setAuthError(t.champsRequis); return; }
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/accounts/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginId.trim(), password: loginPassword }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        if (data?.detail?.includes('Restricted superuser')) { setAuthError(t.accesRefuseSuperuser); }
        else { setAuthError(data?.detail || t.erreurLogin); }
        return;
      }
      if (data?.role !== 'admin' && !data?.is_superuser) {
        setAuthError(t.accesRefuse);
        clearSession(); setAuthToken(''); setAuthRole(''); setAuthScope('');
        return;
      }
      const nextScope = data?.is_superuser ? 'superuser' : 'admin';
      saveSession({ token: data.token, role: data.role, user: data.username || data.email || loginId.trim(), scope: nextScope });
      setAuthToken(data.token); setAuthRole(data.role); setAuthScope(nextScope);
      setAuthUser(data.username || data.email || loginId.trim());
      setLoginPassword('');
    } catch { setAuthError(t.erreurLogin); }
    finally { setAuthLoading(false); }
  };

  const handleLogout = () => {
    clearSession();
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('full_name');
    setAuthToken(''); setAuthRole(''); setAuthScope('');
    setAuthUser('');
    setLoginId(''); setLoginPassword('');
  };

  const activeAccounts = users.filter((user) => user?.is_active !== false).length;
  const definedRoles = new Set(users.map((user) => user?.role).filter(Boolean)).size;

  const formattedNotes = useMemo(
    () => notes.map((note) => ({
      ...note,
      date: note?.created_at ? new Date(note.created_at).toLocaleString() : '-',
    })),
    [notes]
  );

  const saveNoteChanges = async (noteId) => {
    if (!authToken) return;
    setSavingNoteId(noteId);
    try {
      const share = noteShareTargets[noteId] || {};
      if (!share.student && !share.coordinator && !share.teacher) {
        setNoteTransferStatus((prev) => ({
          ...prev,
          [noteId]:
            langue === 'fr'
              ? 'Veuillez sélectionner au moins une cible de transfert.'
              : 'Please select at least one transfer target.',
        }));
        return;
      }
      const payload = {
        note: noteDrafts[noteId],
        teacher_can_edit: Boolean(noteEditPermissions[noteId]),
        visible_to_teacher: Boolean(share.teacher),
        visible_to_coordinator: Boolean(share.coordinator),
        is_published: Boolean(share.student),
      };
      const res = await fetch(`${apiBase}/api/notes/${noteId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Token ${authToken}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.detail || 'note_update_failed');
      const hasTransferTarget = Boolean(share.student || share.coordinator || share.teacher);
      if (hasTransferTarget) {
        const labels = [];
        if (share.student) labels.push(langue === 'fr' ? 'étudiant' : 'student');
        if (share.coordinator) labels.push(langue === 'fr' ? 'coordonnateur' : 'coordinator');
        if (share.teacher) labels.push(langue === 'fr' ? 'enseignant' : 'teacher');
        const listText =
          labels.length <= 1
            ? labels[0]
            : `${labels.slice(0, -1).join(', ')} ${langue === 'fr' ? 'et' : 'and'} ${
                labels[labels.length - 1]
              }`;
        setNoteDrafts((prev) => ({ ...prev, [noteId]: '' }));
        setNoteTransferStatus((prev) => ({
          ...prev,
          [noteId]:
            langue === 'fr'
              ? `Note transferee a ${listText}.`
              : `Mark transferred to ${listText}.`,
        }));
      } else {
        setNoteTransferStatus((prev) => ({ ...prev, [noteId]: '' }));
      }
      await fetchNotes(notesPage, notesPageSize);
    } catch (err) {
      setNotesError(err?.message || 'Erreur');
    } finally {
      setSavingNoteId(null);
    }
  };

  const formattedRequests = useMemo(
    () => requests.map((item) => ({
      ...item,
      date: item?.created_at ? new Date(item.created_at).toLocaleString() : '-',
      pdfUrl: item?.attachment
        ? item.attachment.startsWith('http') ? item.attachment : `${apiBase}${item.attachment}`
        : '',
    })),
    [apiBase, requests]
  );

  const quickStats = useMemo(
    () => [
      { key: 'active-accounts', label: t.comptesActifs, value: activeAccounts },
      { key: 'defined-roles', label: t.rolesDefinis, value: definedRoles },
      { key: 'notes', label: t.notesTotal, value: notesCount },
      { key: 'requests', label: t.requetesTotal, value: requestsCount },
    ],
    [t.comptesActifs, t.rolesDefinis, t.notesTotal, t.requetesTotal, activeAccounts, definedRoles, notesCount, requestsCount]
  );

  const pendingNotesCount = useMemo(
    () =>
      notes.filter((item) => item?.note === null || item?.note === undefined || String(item?.note).trim() === '').length,
    [notes]
  );

  const pendingRequestsCount = useMemo(
    () =>
      requests.filter((item) => !item?.status || (item.status !== 'approved' && item.status !== 'rejected')).length,
    [requests]
  );

  const displayedAccounts = useMemo(() => {
    if (accountListMode === 'active') return users.filter((user) => user?.is_active !== false);
    if (accountListMode === 'inactive') return users.filter((user) => user?.is_active === false);
    return users;
  }, [users, accountListMode]);

  const handleQuickStatClick = (key) => {
    if (key === 'active-accounts') {
      goToAdminView('accounts', 'active');
      return;
    }
    if (key === 'defined-roles') {
      goToAdminView('accounts', 'all');
      return;
    }
    if (key === 'notes') {
      goToAdminView('notes');
      return;
    }
    if (key === 'requests') {
      goToAdminView('requests');
    }
  };

  const openPdf = async (pdfUrl) => {
    if (!pdfUrl || !authToken) return;
    try {
      const res = await fetch(pdfUrl, {
        headers: { Authorization: `Token ${authToken}` },
      });
      if (!res.ok) throw new Error('pdf_fetch_failed');
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const win = window.open(objectUrl, '_blank', 'noopener,noreferrer');
      if (!win) {
        window.location.href = objectUrl;
      }
      setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000);
    } catch {
      // fallback: try direct open
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // -- classes reutilisables ------------------------------------------
  const page = isDark
    ? 'min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100'
    : 'min-h-screen bg-[#f4ddd0] text-slate-900'

  const card = isDark
    ? 'rounded-3xl border border-slate-800/70 bg-slate-900/80 p-6 shadow-xl backdrop-blur-sm'
    : 'rounded-3xl border border-[#c9dee0] bg-[#e8f1f2] p-6 shadow-[0_16px_40px_rgba(45,95,102,0.15)]'

  const input = isDark
    ? 'w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20'
    : 'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20'

  const statCard = isDark
    ? 'rounded-2xl border border-slate-700/60 bg-slate-800/60 p-4 transition hover:border-sky-700/40 hover:bg-slate-800'
    : 'rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-sky-200 hover:bg-sky-50/40'

  const rowCard = isDark
    ? 'grid gap-2 rounded-2xl border border-slate-700/60 bg-slate-900/80 px-3 py-3 transition hover:border-slate-600'
    : 'grid gap-2 rounded-2xl border border-[#d9e7e8] bg-white/90 px-3 py-3 shadow-sm transition hover:border-[#9bc3c8] hover:shadow-md'

  const sectionTitle = 'mb-4 inline-flex items-center gap-2 text-lg font-bold tracking-tight'
  const textMuted = isDark ? 'text-slate-300' : 'text-teal-900/70'
  const surfaceMuted = isDark ? 'border-slate-700/60 bg-slate-900/40 text-slate-200' : 'border-[#d3e5e7] bg-[#f4f9f9] text-teal-900'
  const sectionHint = `text-sm ${textMuted}`
  const fieldWrap = 'space-y-1'
  const statusBox = (type) =>
    `mt-3 rounded-xl px-3 py-2 text-sm font-medium ${
      type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
    }`
  const glassPanel = isDark
    ? 'rounded-2xl border border-slate-700/60 bg-slate-800/60'
    : 'rounded-2xl border border-[#d3e5e7] bg-[#f5fbfb]'

  const btnPrimary = 'rounded-xl bg-gradient-to-r from-sky-700 to-sky-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:from-sky-600 hover:to-sky-500 hover:shadow-sky-400/20 disabled:cursor-not-allowed disabled:opacity-60'

  const btnOutline = isDark
    ? 'inline-flex items-center gap-2 rounded-xl border border-sky-500/70 px-4 py-2 text-sm font-semibold text-sky-200 transition hover:bg-sky-600 hover:text-white'
    : 'inline-flex items-center gap-2 rounded-xl border border-sky-500 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-600 hover:text-white'

  const paginBtn = (active) => active
    ? 'rounded-xl bg-sky-700 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-sky-600'
    : 'rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-400 cursor-not-allowed'

  const paginBtnPrev = (active) => active
    ? (isDark
      ? 'rounded-xl bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-600'
      : 'rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-300')
    : 'rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-300 cursor-not-allowed'

  const fieldLabel = `text-xs font-semibold uppercase tracking-wider ${textMuted}`
  const tabBtn = (isActive) =>
    `rounded-xl px-4 py-2 text-sm font-semibold transition ${
      isActive
        ? 'bg-teal-700 text-white shadow'
        : isDark
          ? 'border border-slate-600 text-slate-200 hover:border-sky-400 hover:text-sky-200'
          : 'border border-[#bfd9dc] text-teal-900 hover:border-teal-600 hover:text-teal-700'
    }`
  const shell = isDark
    ? 'overflow-hidden rounded-[2rem] border border-slate-700 bg-slate-900/70 shadow-2xl'
    : 'overflow-hidden rounded-[2rem] border border-[#e9d5c8] bg-[#f9f6f3] shadow-[0_20px_60px_rgba(109,88,74,0.18)]'
  const rail = isDark
    ? 'flex flex-row md:flex-col items-center gap-2 border-b border-slate-700 bg-slate-900/90 p-3 md:min-h-[calc(100vh-5rem)] md:w-24 md:border-b-0 md:border-r'
    : 'flex flex-row md:flex-col items-center gap-2 border-b border-[#d2e5e6] bg-[#d7e6e8] p-3 md:min-h-[calc(100vh-5rem)] md:w-24 md:border-b-0 md:border-r'
  const railBtn = (active) =>
    `inline-flex h-10 w-10 items-center justify-center rounded-xl transition ${
      active
        ? 'bg-teal-700 text-white shadow'
        : isDark
          ? 'text-slate-300 hover:bg-slate-700 hover:text-white'
          : 'text-teal-800 hover:bg-white/80'
    }`
  const heroBadge = isDark
    ? 'rounded-full border border-slate-600 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300'
    : 'rounded-full border border-[#bcd8db] bg-[#edf6f7] px-3 py-1 text-xs font-semibold text-teal-800'

  // -- page login ----------------------------------------------------
  if (!isAdmin) {
    return (
      <div className={`${page} flex items-center justify-center px-4 py-10`}>
        <div className="w-full max-w-md">
          <div className="mb-5 flex justify-end gap-2">
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-700 text-white shadow transition hover:bg-sky-600"
              onClick={onToggleTheme}
              type="button"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <div className={`flex items-center gap-1 rounded-full p-1 ${isDark ? 'bg-slate-800/80' : 'bg-slate-100'}`}>
              {['fr', 'en'].map(l => (
                <button key={l}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition ${langue === l ? 'bg-sky-700 text-white shadow' : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-500 hover:text-sky-700'}`}
                  onClick={() => onLangueChange(l)} type="button">
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <section className={`${card} text-center`}>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-700 text-white shadow-lg shadow-sky-900/30">
              <ShieldCheck size={26} />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-sky-600 mb-1">École JFN-HUI</p>
            <h1 className={`text-2xl font-extrabold tracking-tight ${textMuted}`}>{t.connexionTitre}</h1>
            <p className={`mt-2 text-sm ${textMuted}`}>
              {langue === 'fr'
                ? 'Accès réservé aux administrateurs. Vos actions sont journalisées.'
                : 'Admin-only access. Your actions are logged.'}
            </p>

            <div className="mt-6 space-y-3 text-left">
              <div className={fieldWrap}>
                <label className={fieldLabel}>{t.identifiant}</label>
                <input className={input} placeholder={t.identifiant} value={loginId} autoComplete="username"
                  onChange={(event) => setLoginId(event.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              </div>
              <div className={fieldWrap}>
                <label className={fieldLabel}>{t.motDePasseLogin}</label>
                <input className={input} placeholder={t.motDePasseLogin} type="password" value={loginPassword}
                  autoComplete="current-password"
                  onChange={(event) => setLoginPassword(event.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              </div>
            </div>

            <button className={`mt-4 w-full ${btnPrimary}`} type="button" onClick={handleLogin} disabled={authLoading}>
              {authLoading ? '...' : t.seConnecter}
            </button>

            {authError && (
              <p className={statusBox('error')} role="status" aria-live="polite">{authError}</p>
            )}

            <Link to="/choix-profil"
              className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 px-6 py-2.5 text-sm font-semibold transition ${isDark ? 'border-slate-600 text-slate-200 hover:border-sky-400 hover:text-sky-200' : 'border-slate-300 text-slate-700 hover:border-sky-600 hover:text-sky-700'}`}>
              ← {t.retour}
            </Link>
          </section>
        </div>
      </div>
    );
  }

  // -- dashboard admin -----------------------------------------------
  return (
    <div className={`${page} px-3 py-4 md:px-6 md:py-8`}>
      <div className={`mx-auto w-full max-w-[1280px] ${shell}`}>
        <div className="flex flex-col md:flex-row">
          <aside className={rail}>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-teal-700 text-sm font-extrabold text-white">
              J
            </div>
            <button type="button" className={railBtn(activeView === 'accounts')} onClick={() => goToAdminView('accounts', 'all')} title={langue === 'fr' ? 'Comptes' : 'Accounts'}>
              <Users size={18} />
            </button>
            <button type="button" className={railBtn(activeView === 'notes')} onClick={() => goToAdminView('notes')} title={langue === 'fr' ? 'Notes' : 'Marks'}>
              <BookOpen size={18} />
            </button>
            <button type="button" className={railBtn(activeView === 'requests')} onClick={() => goToAdminView('requests')} title={langue === 'fr' ? 'Requêtes' : 'Requests'}>
              <FileText size={18} />
            </button>
            <div className="hidden flex-1 md:block" />
            <button className={railBtn(false)} type="button" onClick={onToggleTheme} aria-label="Toggle theme">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </aside>

          <main className="flex-1 p-3 md:p-6">
            <header className={`${card} mb-5`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-teal-700">École JFN-HUI</p>
                  <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-teal-900 md:text-3xl">{t.titre}</h1>
                  <p className={`mt-1 text-sm ${textMuted}`}>{t.sousTitre}</p>
                  <p className={`mt-1 text-sm font-medium ${textMuted}`}>{t.bonjour}, {authUser || 'admin'}.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={heroBadge}>{langue === 'fr' ? 'Espace sécurisé' : 'Secure workspace'}</span>
                  <Link to="/choix-profil" className={btnOutline}><ArrowLeft size={14} /> {t.retourRoles}</Link>
                  <Link to="/" className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-teal-600">{t.accueil}</Link>
                  {['fr', 'en'].map(l => (
                    <button key={l}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${langue === l ? 'bg-teal-700 text-white shadow' : isDark ? 'border border-slate-600 text-slate-300 hover:border-teal-400 hover:text-teal-200' : 'border border-[#b9d5d7] text-teal-900 hover:bg-[#edf7f8]'}`}
                      type="button" onClick={() => onLangueChange(l)}>
                      {l.toUpperCase()}
                    </button>
                  ))}
                  <button
                    className={`inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${isDark ? 'border-slate-600 text-slate-200 hover:border-teal-400 hover:text-teal-200' : 'border-[#b9d5d7] text-teal-900 hover:bg-[#edf7f8]'}`}
                    type="button" onClick={handleLogout}>
                    <LogOut size={14} /> {t.deconnexion}
                  </button>
                </div>
              </div>
              <p className={`mt-3 text-xs ${textMuted}`}>{t.bienvenueAide} {t.accessibiliteInfo}</p>
            </header>

        <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickStats.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => handleQuickStatClick(item.key)}
              className={`${isDark ? 'border-slate-700/60 bg-slate-900/40 hover:border-sky-500/50' : 'border-slate-200 bg-white hover:border-sky-300'} rounded-2xl border p-4 text-left shadow-sm transition`}
            >
              <p className={`text-xs font-semibold uppercase tracking-wide ${textMuted}`}>{item.label}</p>
              <p className="mt-2 text-2xl font-extrabold text-sky-700">{item.value}</p>
              <p className="mt-1 text-[11px] text-sky-700">
                {langue === 'fr' ? 'Cliquer pour ouvrir' : 'Click to open'}
              </p>
            </button>
          ))}
        </section>

        <section className={`${card} mb-6`}>
          <h2 className={sectionTitle}>
            <ShieldCheck size={19} className="text-sky-700" />
            {langue === 'fr' ? 'Priorites du jour' : 'Today priorities'}
          </h2>
          <div className="grid gap-3 md:grid-cols-3">
            <article className={`${surfaceMuted} rounded-2xl border p-4`}>
              <p className={`text-xs font-semibold uppercase tracking-wide ${textMuted}`}>
                {langue === 'fr' ? 'Notes en attente' : 'Pending marks'}
              </p>
              <p className="mt-2 text-2xl font-extrabold text-sky-700">{pendingNotesCount}</p>
              <button type="button" className="mt-3 text-xs font-semibold text-sky-700 underline" onClick={() => goToAdminView('notes')}>
                {langue === 'fr' ? 'Traiter maintenant' : 'Process now'}
              </button>
            </article>
            <article className={`${surfaceMuted} rounded-2xl border p-4`}>
              <p className={`text-xs font-semibold uppercase tracking-wide ${textMuted}`}>
                {langue === 'fr' ? 'Requetes en attente' : 'Pending requests'}
              </p>
              <p className="mt-2 text-2xl font-extrabold text-sky-700">{pendingRequestsCount}</p>
              <button type="button" className="mt-3 text-xs font-semibold text-sky-700 underline" onClick={() => goToAdminView('requests')}>
                {langue === 'fr' ? 'Traiter maintenant' : 'Process now'}
              </button>
            </article>
            <article className={`${surfaceMuted} rounded-2xl border p-4`}>
              <p className={`text-xs font-semibold uppercase tracking-wide ${textMuted}`}>
                {langue === 'fr' ? 'Comptes actifs' : 'Active accounts'}
              </p>
              <p className="mt-2 text-2xl font-extrabold text-sky-700">{activeAccounts}</p>
              <button
                type="button"
                className="mt-3 text-xs font-semibold text-sky-700 underline"
                onClick={() => {
                  goToAdminView('accounts', 'active');
                }}
              >
                {langue === 'fr' ? 'Creer un compte' : 'Create account'}
              </button>
            </article>
          </div>
        </section>

        <section className={`${card} mb-6`}>
          <h2 className={sectionTitle}>
            <UserPlus size={19} className="text-sky-700" />
            {langue === 'fr' ? 'Demarrage rapide' : 'Quick start'}
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={btnPrimary}
              onClick={() => {
                goToAdminView('accounts', 'all');
              }}
            >
              {langue === 'fr' ? '1. Creer un compte' : '1. Create account'}
            </button>
            <button type="button" className={btnOutline} onClick={() => goToAdminView('notes')}>
              {langue === 'fr' ? '2. Valider les notes' : '2. Validate marks'}
            </button>
            <button type="button" className={btnOutline} onClick={() => goToAdminView('requests')}>
              {langue === 'fr' ? '3. Traiter les requetes' : '3. Process requests'}
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className={tabBtn(activeView === 'accounts')}
              onClick={() => {
                goToAdminView('accounts', 'all');
              }}
            >
              {langue === 'fr' ? 'Comptes' : 'Accounts'}
            </button>
            <button type="button" className={tabBtn(activeView === 'notes')} onClick={() => goToAdminView('notes')}>
              {langue === 'fr' ? 'Notes' : 'Marks'}
            </button>
            <button type="button" className={tabBtn(activeView === 'requests')} onClick={() => goToAdminView('requests')}>
              {langue === 'fr' ? 'Requetes' : 'Requests'}
            </button>
          </div>
        </section>

        {/* création + stats */}
        {activeView === 'accounts' && (
        <section className="mt-0 grid gap-6 xl:grid-cols-3">

          <article className={`${card} xl:col-span-2`}>
            <h2 className={sectionTitle}>
              <UserPlus size={19} className="text-sky-700" /> {t.creerCompte}
            </h2>
            <p className={sectionHint}>
              {langue === 'fr'
                ? 'Créez un compte en moins d’une minute. Les champs affichés s’ajustent selon le rôle.'
                : 'Create an account in under a minute. Fields adapt to the selected role.'}
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className={fieldWrap}>
                <label className={fieldLabel}>{t.nomComplet}</label>
                <input className={input} placeholder={t.nomComplet} value={fullName}
                  onChange={(event) => setFullName(event.target.value)} />
              </div>
              <div className={fieldWrap}>
                <label className={fieldLabel}>{t.email}</label>
                <input className={input} placeholder={t.email} type="email" value={email}
                  onChange={(event) => setEmail(event.target.value)} />
              </div>
              <div className={`${fieldWrap} md:col-span-2`}>
                <label className={fieldLabel}>{t.role}</label>
                <select className={input} value={role}
                  onChange={(event) => setRole(event.target.value)}>
                  <option value="">{t.role}</option>
                  <option value="admin">{t.admin}</option>
                  <option value="enseignant">{t.enseignant}</option>
                  <option value="coordonnateur">{t.coordonnateur}</option>
                  <option value="cellule-info">{t.celluleInfo}</option>
                  <option value="parent">{t.parent}</option>
                  <option value="etudiant">{t.etudiant}</option>
                </select>
              </div>
              {(role === 'coordonnateur' || role === 'etudiant') && (
                <div className={`${fieldWrap} md:col-span-2`}>
                  <label className={fieldLabel}>{t.cycle}</label>
                  <input className={input} placeholder={t.cycle} value={cycle}
                    onChange={(event) => setCycle(event.target.value)} />
                </div>
              )}
              {role === 'parent' && (
                <div className={`${fieldWrap} md:col-span-2`}>
                  <label className={fieldLabel}>{t.enfantLie}</label>
                  <input className={input} placeholder={t.enfantLie} value={childStudent}
                    onChange={(event) => setChildStudent(event.target.value)} />
                </div>
              )}
              <div className={`${fieldWrap} md:col-span-2`}>
                <label className={fieldLabel}>{t.motDePasse}</label>
                <p className={sectionHint}>{t.mdpAutoEtudiant}</p>
              </div>
            </div>
            <button className={`mt-4 ${btnPrimary}`} type="button" onClick={handleCreateUser} disabled={isSubmitting}>
              {isSubmitting ? '...' : t.creer}
            </button>
            {status.message && (
              <p className={statusBox(status.type)} role="status" aria-live="polite">
                {status.message}
              </p>
            )}
            {generatedStudentPassword && (
              <div className={`mt-4 ${glassPanel} px-4 py-4`}>
                <p className={`text-sm font-semibold ${textMuted}`}>{t.mdpGenere}</p>
                {generatedStudentLogin && (
                  <p className={`mt-1 text-xs ${textMuted}`}>
                    {t.identifiantGenere}: <span className="font-mono">{generatedStudentLogin}</span>
                  </p>
                )}
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className={`flex-1 rounded-xl border px-3 py-2 font-mono text-sm ${surfaceMuted}`}>
                    {generatedStudentPassword}
                  </div>
                  <button type="button" className={btnOutline} onClick={copyGeneratedStudentPassword}>
                    {t.copier}
                  </button>
                </div>
              </div>
            )}
          </article>

          <article className={card}>
            <h2 className={sectionTitle}>
              <ShieldCheck size={19} className="text-sky-700" /> {t.statistiques}
            </h2>
            <div className="space-y-3">
              <div className={statCard}>
                <p className={fieldLabel}>{t.comptesActifs}</p>
                <p className="mt-1 text-3xl font-extrabold text-sky-700">{activeAccounts}</p>
                <p className={sectionHint}>
                  {langue === 'fr' ? 'Total des comptes actifs.' : 'Total active accounts.'}
                </p>
              </div>
              <div className={statCard}>
                <p className={fieldLabel}>{t.rolesDefinis}</p>
                <p className="mt-1 text-3xl font-extrabold text-sky-700">{definedRoles}</p>
                <p className={sectionHint}>
                  {langue === 'fr' ? 'Diversité des rôles enregistrés.' : 'Variety of roles registered.'}
                </p>
              </div>
            </div>
          </article>
        </section>
        )}

        {/* actions récentes */}
        {activeView === 'accounts' && (
        <section className={`mt-6 ${card}`}>
          <h2 className={sectionTitle}>
            <ClipboardList size={19} className="text-sky-700" /> {t.actions}
          </h2>
          <div className={`${glassPanel} px-4 py-4 text-sm ${textMuted}`}>
            {isLoadingUsers && recentActions.length === 0 && <p className="italic opacity-60">{t.chargementActions}</p>}
            {!isLoadingUsers && recentActions.length === 0 && <p className="italic opacity-60">{t.aucuneAction}</p>}
            {recentActions.length > 0 && (
              <ul className="space-y-2">
                {recentActions.map((action) => (
                  <li key={action.id} className={`flex items-start gap-2 rounded-xl px-3 py-2 ${textMuted}`}>
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500 mt-2" />
                    {action.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className={`mt-3 inline-flex items-center gap-2 text-xs ${textMuted}`}>
            <Users size={13} /> JFN-HUI · Admin Panel
          </div>
        </section>
        )}

        {activeView === 'accounts' && (
        <section className={`mt-6 ${card}`}>
          <h2 className={sectionTitle}>
            <Users size={19} className="text-sky-700" />
            {langue === 'fr' ? 'Comptes utilisateurs' : 'User accounts'}
          </h2>
          <div className="mb-4 flex flex-wrap gap-2">
            <button type="button" className={tabBtn(accountListMode === 'all')} onClick={() => goToAdminView('accounts', 'all')}>
              {langue === 'fr' ? 'Tous' : 'All'}
            </button>
            <button type="button" className={tabBtn(accountListMode === 'active')} onClick={() => goToAdminView('accounts', 'active')}>
              {langue === 'fr' ? 'Actifs' : 'Active'}
            </button>
            <button type="button" className={tabBtn(accountListMode === 'inactive')} onClick={() => goToAdminView('accounts', 'inactive')}>
              {langue === 'fr' ? 'Inactifs' : 'Inactive'}
            </button>
          </div>
          <div className={`rounded-2xl border px-3 py-4 text-sm ${surfaceMuted}`}>
            {isLoadingUsers && <p className="italic opacity-60">{t.chargementActions}</p>}
            {!isLoadingUsers && displayedAccounts.length === 0 && (
              <p className="italic opacity-60">{langue === 'fr' ? 'Aucun compte trouve.' : 'No account found.'}</p>
            )}
            {displayedAccounts.length > 0 && (
              <div className="space-y-2">
                {displayedAccounts.map((user) => {
                  const full = [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim();
                  const name = full || user?.full_name || user?.username || user?.email || '-';
                  return (
                    <article key={user?.id || `${user?.username}-${user?.email}`} className={`${rowCard} md:grid-cols-5`}>
                      <div>
                        <p className={fieldLabel}>{langue === 'fr' ? 'Nom' : 'Name'}</p>
                        <p className="mt-0.5 font-semibold">{name}</p>
                      </div>
                      <div>
                        <p className={fieldLabel}>{t.email}</p>
                        <p className="mt-0.5 font-semibold">{user?.email || '-'}</p>
                      </div>
                      <div>
                        <p className={fieldLabel}>{t.role}</p>
                        <p className="mt-0.5 font-semibold">{user?.role || '-'}</p>
                      </div>
                      <div>
                        <p className={fieldLabel}>{langue === 'fr' ? 'Statut' : 'Status'}</p>
                        <span
                          className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-bold ${
                            user?.is_active === false ? 'bg-slate-400/20 text-slate-500' : 'bg-emerald-500/10 text-emerald-500'
                          }`}
                        >
                          {user?.is_active === false
                            ? (langue === 'fr' ? 'Inactif' : 'Inactive')
                            : (langue === 'fr' ? 'Actif' : 'Active')}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-end gap-2">
                        <button
                          type="button"
                          onClick={() => updateUserStatus(user.id, user?.is_active === false)}
                          className={`rounded-lg px-3 py-2 text-xs font-bold ${
                            user?.is_active === false
                              ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                              : 'bg-amber-600 text-white hover:bg-amber-500'
                          }`}
                          disabled={!user?.id}
                          title={langue === 'fr' ? 'Activer / désactiver' : 'Enable / disable'}
                        >
                          {user?.is_active === false ? (langue === 'fr' ? 'Activer' : 'Enable') : (langue === 'fr' ? 'Désactiver' : 'Disable')}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const ok = window.confirm(
                              langue === 'fr'
                                ? `Supprimer définitivement le compte: ${name} ?`
                                : `Permanently delete account: ${name}?`
                            );
                            if (ok) deleteUser(user.id);
                          }}
                          className="rounded-lg bg-rose-700 px-3 py-2 text-xs font-bold text-white hover:bg-rose-600"
                          disabled={!user?.id}
                          title={langue === 'fr' ? 'Supprimer' : 'Delete'}
                        >
                          {langue === 'fr' ? 'Supprimer' : 'Delete'}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
        )}

        {/* notes reçues */}
        {activeView === 'notes' && (
        <section className={`mt-6 ${card}`}>
          <h2 className={sectionTitle}>
            <BookOpen size={19} className="text-sky-700" /> {t.notesRecues}
          </h2>
          <p className={`mb-4 text-sm ${textMuted}`}>{t.notesIntro}</p>

          <div className={`rounded-2xl border px-3 py-4 text-sm ${surfaceMuted}`}>
            {isLoadingNotes && <p className="italic opacity-60">{t.chargementActions}</p>}
            {!isLoadingNotes && notesError && <p className="rounded-xl bg-rose-500/10 px-3 py-2 text-rose-500">{notesError}</p>}
            {!isLoadingNotes && !notesError && formattedNotes.length === 0 && <p className="italic opacity-60">{t.notesVides}</p>}
            {formattedNotes.length > 0 && (
              <div className="space-y-2">
                {formattedNotes.map((note) => (
                  <div key={note.id} className={`${rowCard} md:grid-cols-6`}>
                    <div>
                      <p className={fieldLabel}>{t.enseignantLib}</p>
                      <p className="mt-0.5 font-semibold">{note.teacher_username || '-'}</p>
                    </div>
                    <div>
                      <p className={fieldLabel}>{t.cycleLib}</p>
                      <p className="mt-0.5 font-semibold">{note.cycle}</p>
                    </div>
                    <div>
                      <p className={fieldLabel}>{t.matiereLib}</p>
                      <p className="mt-0.5 font-semibold">{note.matiere}</p>
                    </div>
                    <div>
                      <p className={fieldLabel}>{t.etudiantLib}</p>
                      <p className="mt-0.5 font-semibold">{note.etudiant}</p>
                    </div>
                    <div>
                      <p className={fieldLabel}>{t.noteLib}</p>
                      <input type="number" min="0" max="20" step="0.01"
                        value={noteDrafts[note.id] ?? ''}
                        onChange={(event) => setNoteDrafts((prev) => ({ ...prev, [note.id]: event.target.value }))}
                        className={`mt-0.5 w-full rounded-lg border px-2 py-1.5 text-sm outline-none transition focus:ring-2 focus:ring-sky-400/20 ${isDark ? 'border-slate-600 bg-slate-800 text-slate-100' : 'border-slate-300 bg-white text-slate-800'}`}
                      />
                      <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs">
                        <input type="checkbox" className="accent-sky-600"
                          checked={Boolean(noteEditPermissions[note.id])}
                          onChange={(event) => setNoteEditPermissions((prev) => ({ ...prev, [note.id]: event.target.checked }))} />
                        {t.autoriserEnseignant}
                      </label>
                      <div className="mt-2 space-y-1 text-xs">
                        <p className={`${fieldLabel} text-[11px]`}>{t.transferer}</p>
                        <label className="flex cursor-pointer items-center gap-2">
                          <input
                            type="checkbox"
                            className="accent-sky-600"
                            checked={Boolean(noteShareTargets[note.id]?.student)}
                            onChange={(event) =>
                              setNoteShareTargets((prev) => ({
                                ...prev,
                                [note.id]: { ...(prev[note.id] || {}), student: event.target.checked },
                              }))
                            }
                          />
                          {t.transferEtudiant}
                        </label>
                        <label className="flex cursor-pointer items-center gap-2">
                          <input
                            type="checkbox"
                            className="accent-sky-600"
                            checked={Boolean(noteShareTargets[note.id]?.coordinator)}
                            onChange={(event) =>
                              setNoteShareTargets((prev) => ({
                                ...prev,
                                [note.id]: { ...(prev[note.id] || {}), coordinator: event.target.checked },
                              }))
                            }
                          />
                          {t.transferCoordonnateur}
                        </label>
                        <label className="flex cursor-pointer items-center gap-2">
                          <input
                            type="checkbox"
                            className="accent-sky-600"
                            checked={Boolean(noteShareTargets[note.id]?.teacher)}
                            onChange={(event) =>
                              setNoteShareTargets((prev) => ({
                                ...prev,
                                [note.id]: { ...(prev[note.id] || {}), teacher: event.target.checked },
                              }))
                            }
                          />
                          {t.transferEnseignant}
                        </label>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => saveNoteChanges(note.id)}
                          disabled={savingNoteId === note.id}
                          className="rounded-lg bg-sky-700 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-sky-600 disabled:opacity-60"
                        >
                          {savingNoteId === note.id ? '...' : t.enregistrerNote}
                        </button>
                        <button
                          type="button"
                          onClick={() => saveNoteChanges(note.id)}
                          disabled={savingNoteId === note.id}
                          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                            isDark
                              ? 'border border-sky-500 text-sky-200 hover:bg-sky-500/30'
                              : 'border border-sky-500 text-sky-700 hover:bg-sky-50'
                          } disabled:opacity-60`}
                        >
                          {t.transferer}
                        </button>
                      </div>
                      {noteTransferStatus[note.id] && (
                        <p className={`mt-2 text-xs font-semibold ${textMuted}`}>
                          {noteTransferStatus[note.id]}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className={fieldLabel}>{t.dateLib}</p>
                      <p className="mt-0.5 font-semibold">{note.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* pagination notes */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className={`text-sm ${textMuted}`}>
              {notesCount > 0 ? `${notesCount} notes` : ''}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <label className={`flex items-center gap-2 text-xs ${textMuted}`}>
                {t.taillePage}
                <select className={`rounded-lg border px-2 py-1.5 text-xs outline-none ${isDark ? 'border-slate-600 bg-slate-800 text-slate-100' : 'border-slate-300 bg-white text-slate-800'}`}
                  value={notesPageSize}
                  onChange={(event) => { const size = Number(event.target.value); setNotesPageSize(size); fetchNotes(1, size); }}>
                  {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
              <button type="button" onClick={() => notesPrev && fetchNotes(notesPage - 1, notesPageSize)}
                disabled={!notesPrev || isLoadingNotes}
                className={paginBtnPrev(!!notesPrev && !isLoadingNotes)}>
                ← {t.precedent}
              </button>
              <span className={`rounded-lg px-3 py-2 text-sm font-semibold ${textMuted}`}>
                {t.page} {notesPage}
              </span>
              <button type="button" onClick={() => notesNext && fetchNotes(notesPage + 1, notesPageSize)}
                disabled={!notesNext || isLoadingNotes}
                className={paginBtn(!!notesNext && !isLoadingNotes)}>
                {t.suivant} →
              </button>
            </div>
          </div>
        </section>
        )}

        {/* requêtes étudiantes */}
        {activeView === 'requests' && (
        <section className={`mt-6 ${card}`}>
          <h2 className={sectionTitle}>
            <FileText size={19} className="text-sky-700" /> {t.requetesRecues}
          </h2>
          <p className={`mb-4 text-sm ${textMuted}`}>{t.requetesIntro}</p>

          <div className={`rounded-2xl border px-3 py-4 text-sm ${surfaceMuted}`}>
            {isLoadingRequests && <p className="italic opacity-60">{t.chargementActions}</p>}
            {!isLoadingRequests && requestsError && <p className="rounded-xl bg-rose-500/10 px-3 py-2 text-rose-500">{requestsError}</p>}
            {!isLoadingRequests && !requestsError && formattedRequests.length === 0 && <p className="italic opacity-60">{t.requetesVides}</p>}
            {formattedRequests.length > 0 && (
              <div className="space-y-2">
                {formattedRequests.map((item) => (
                  <div key={item.id} className={`${rowCard} md:grid-cols-7`}>
                    <div>
                      <p className={fieldLabel}>{t.etudiantLib}</p>
                      <p className="mt-0.5 font-semibold">{item.student_username || '-'}</p>
                    </div>
                    <div>
                      <p className={fieldLabel}>{t.cycleLib}</p>
                      <p className="mt-0.5 font-semibold">{item.cycle || '-'}</p>
                    </div>
                    <div>
                      <p className={fieldLabel}>{t.filiereLib}</p>
                      <p className="mt-0.5 font-semibold">{item.filiere || '-'}</p>
                    </div>
                    <div>
                      <p className={fieldLabel}>{t.objetLib}</p>
                      <p className="mt-0.5 font-semibold">{item.subject || '-'}</p>
                    </div>
                    <div>
                      <p className={fieldLabel}>{t.statutLib}</p>
                      <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-bold ${
                        item.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500'
                        : item.status === 'rejected' ? 'bg-rose-500/10 text-rose-500'
                        : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {item.status || '-'}
                      </span>
                    </div>
                    <div>
                      <p className={fieldLabel}>{t.justificatifLib}</p>
                      {item.pdfUrl ? (
                        <div className="mt-1 flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => openPdf(item.pdfUrl)}
                            className="text-left text-xs font-semibold text-sky-700 underline underline-offset-2 hover:text-sky-500"
                          >
                            📄 {t.ouvrirPdf}
                          </button>
                          <a
                            href={item.pdfUrl}
                            download
                            className="text-xs font-semibold text-sky-700 underline underline-offset-2 hover:text-sky-500"
                          >
                            ⬇️ {t.telechargerPdf}
                          </a>
                        </div>
                      ) : (
                        <p className="mt-0.5 font-semibold">-</p>
                      )}
                    </div>
                    <div>
                      <p className={fieldLabel}>{t.dateLib}</p>
                      <p className="mt-0.5 font-semibold">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* pagination requêtes */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className={`text-sm ${textMuted}`}>
              {requestsCount > 0 ? `${requestsCount} requetes` : ''}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <label className={`flex items-center gap-2 text-xs ${textMuted}`}>
                {t.taillePage}
                <select className={`rounded-lg border px-2 py-1.5 text-xs outline-none ${isDark ? 'border-slate-600 bg-slate-800 text-slate-100' : 'border-slate-300 bg-white text-slate-800'}`}
                  value={requestsPageSize}
                  onChange={(event) => { const size = Number(event.target.value); setRequestsPageSize(size); fetchRequests(1, size); }}>
                  {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
              <button type="button" onClick={() => requestsPrev && fetchRequests(requestsPage - 1, requestsPageSize)}
                disabled={!requestsPrev || isLoadingRequests}
                className={paginBtnPrev(!!requestsPrev && !isLoadingRequests)}>
                ← {t.precedent}
              </button>
              <span className={`rounded-lg px-3 py-2 text-sm font-semibold ${textMuted}`}>
                {t.page} {requestsPage}
              </span>
              <button type="button" onClick={() => requestsNext && fetchRequests(requestsPage + 1, requestsPageSize)}
                disabled={!requestsNext || isLoadingRequests}
                className={paginBtn(!!requestsNext && !isLoadingRequests)}>
                {t.suivant} →
              </button>
            </div>
          </div>
        </section>
        )}

          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;


