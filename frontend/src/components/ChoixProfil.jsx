import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';

function ChoixProfil({ onRoleSelect, theme, onToggleTheme, langue, onLangueChange }) {
  const [selectedRole, setSelectedRole] = useState(() => localStorage.getItem('role_selectionne') || '');
  const navigate = useNavigate();

  const textes = {
    fr: {
      titre: 'Choisissez votre profil',
      sousTitre: 'Selectionnez votre role',
      notice: 'Comptes crees par l admin',
      retour: 'Retour',
    },
    en: {
      titre: 'Choose your profile',
      sousTitre: 'Select your role',
      notice: 'Accounts are created by admin',
      retour: 'Back',
    },
  };

  const rolesParLangue = {
    fr: [
      { id: 'cellule-info', emoji: '💻', titre: 'Cellule info', desc: 'Saisir les notes dans le systeme' },
      { id: 'admin', emoji: '🛡️', titre: 'Administrateur', desc: 'Creer les comptes utilisateurs' },
      { id: 'superuser', emoji: '👑', titre: 'Superuser', desc: 'Superviser la plateforme et les acces' },
      { id: 'enseignant', emoji: '👨‍🏫', titre: 'Enseignant', desc: 'Corriger les examens et saisir les notes' },
      { id: 'coordonnateur', emoji: '🧭', titre: 'Coordonnateur', desc: 'Organiser les examens et verifier les notes' },
      { id: 'parent', emoji: '👨‍👩‍👧', titre: 'Parent', desc: 'Consulter les notes' },
      { id: 'etudiant', emoji: '🎓', titre: 'Etudiant', desc: 'Consulter ses notes et effectuer une requete' },
    ],
    en: [
      { id: 'cellule-info', emoji: '💻', titre: 'IT unit', desc: 'Enter grades into the system' },
      { id: 'admin', emoji: '🛡️', titre: 'Administrator', desc: 'Create user accounts' },
      { id: 'superuser', emoji: '👑', titre: 'Superuser', desc: 'Oversee platform and access control' },
      { id: 'enseignant', emoji: '👨‍🏫', titre: 'Teacher', desc: 'Grade exams and enter marks' },
      { id: 'coordonnateur', emoji: '🧭', titre: 'Coordinator', desc: 'Organize exams and verify grades' },
      { id: 'parent', emoji: '👨‍👩‍👧', titre: 'Parent', desc: 'Check student grades' },
      { id: 'etudiant', emoji: '🎓', titre: 'Student', desc: 'View grades and submit requests' },
    ],
  };

  const t = textes[langue] || textes.fr;
  const roles = rolesParLangue[langue] || rolesParLangue.fr;
  const isDark = theme === 'dark';

  const selectRole = (role) => {
    setSelectedRole(role);
    localStorage.setItem('role_selectionne', role);
    if (onRoleSelect) onRoleSelect(role);
    if (role === 'admin') {
      navigate('/admin');
      return;
    }
    if (role === 'cellule-info') {
      navigate('/cellule-info');
      return;
    }
    if (role === 'superuser') {
      navigate('/superuser');
      return;
    }
    if (role === 'enseignant') {
      navigate('/enseignant');
      return;
    }
    if (role === 'coordonnateur') {
      navigate('/coordonnateur');
      return;
    }
    if (role === 'etudiant') {
      navigate('/etudiant');
      return;
    }
    if (role === 'parent') {
      navigate('/parent');
    }
  };

  return (
    <div className={`min-h-screen px-4 py-8 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-5 flex justify-end gap-3">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-800 text-white shadow"
            onClick={onToggleTheme}
            type="button"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
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
          <h1 className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-rose-800'}`}>{t.titre}</h1>
          <p className={`mt-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{t.sousTitre}</p>
          <p className={`mb-8 mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t.notice}</p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {roles.map((role) => (
              <button
                key={role.id}
                className={`relative rounded-2xl border p-6 text-left transition hover:-translate-y-1 hover:border-rose-700 ${
                  selectedRole === role.id
                    ? 'border-green-500 ring-2 ring-green-400/40'
                    : isDark
                    ? 'border-slate-700 bg-slate-800/70'
                    : 'border-slate-200 bg-slate-50'
                }`}
                onClick={() => selectRole(role.id)}
                type="button"
              >
                <div className="text-3xl">{role.emoji}</div>
                <h3 className="mt-3 text-lg font-semibold">{role.titre}</h3>
                <p className={`mt-1 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{role.desc}</p>
              </button>
            ))}
          </div>

          <button
            className="mt-8 rounded-full border-2 border-rose-800 px-6 py-2 font-semibold text-rose-800 hover:bg-rose-800 hover:text-white"
            onClick={() => navigate('/')}
            type="button"
          >
            ← {t.retour}
          </button>
        </section>
      </div>
    </div>
  );
}

export default ChoixProfil;
