import { useEffect, useState } from 'react';
import { Link, Routes, Route, useNavigate } from 'react-router-dom';
import { Moon, Sun, Home, Zap, LogIn, Edit3, TrendingUp, Gauge, Shield } from 'lucide-react';
import ChoixProfil from './components/ChoixProfil';
import AdminPage from './pages/AdminPage';
import TeacherPage from './pages/TeacherPage';
import CoordinatorPage from './pages/CoordinatorPage';

function AccueilPage({ isDark, theme, langue, setLangue, toggleTheme, t, profil }) {
  const navigate = useNavigate();

  return (
    <div
      className={`min-h-screen ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
    >
      <button
        className="fixed right-5 top-5 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-rose-800 text-white shadow-lg"
        onClick={toggleTheme}
        type="button"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <header className={`sticky top-0 z-40 border-b ${isDark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-white/90'} backdrop-blur`}>
        <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3 md:px-6">
          <Link to="/" className="text-2xl font-bold text-rose-800">JFnNote</Link>
          <nav className="ml-auto flex items-center gap-4 text-sm font-semibold md:gap-6">
            <a href="#accueil" className="inline-flex items-center gap-1 hover:text-rose-700"><Home size={16} />{t.accueil}</a>
            <a href="#fonctions" className="inline-flex items-center gap-1 hover:text-rose-700"><Zap size={16} />{t.fonctions}</a>
            <button
              className="rounded-full bg-rose-800 px-4 py-2 text-white"
              type="button"
              onClick={() => navigate('/choix-profil')}
            >
              <span className="inline-flex items-center gap-1"><LogIn size={16} />{t.connexion}</span>
            </button>
          </nav>
          <div className="hidden gap-2 sm:flex">
            <button className={`rounded-full px-3 py-1 text-xs font-bold ${langue === 'fr' ? 'bg-rose-800 text-white' : 'border border-rose-800 text-rose-800'}`} onClick={() => setLangue('fr')} type="button">FR</button>
            <button className={`rounded-full px-3 py-1 text-xs font-bold ${langue === 'en' ? 'bg-rose-800 text-white' : 'border border-rose-800 text-rose-800'}`} onClick={() => setLangue('en')} type="button">EN</button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 md:px-6">
        <section id="accueil" className="grid gap-8 rounded-3xl bg-gradient-to-br from-rose-900 to-slate-900 p-7 text-white shadow-2xl md:grid-cols-2 md:p-10">
          <div>
            <h1 className="text-3xl font-extrabold leading-tight md:text-5xl">{t.titre}</h1>
            <p className="mt-4 text-sm text-slate-100 md:text-base">{t.description}</p>
            <button className="mt-7 inline-flex items-center gap-2 rounded-full bg-rose-700 px-6 py-3 font-semibold hover:bg-rose-600" type="button" onClick={() => navigate('/choix-profil')}>
              <Zap size={18} />{t.btnPrincipal}
            </button>
            {profil ? <p className="mt-4 text-sm text-rose-100">Role: {profil}</p> : null}
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/30">
            <img src="/mon%20projet4.jpg" alt="Etudiants" className="h-full min-h-72 w-full object-cover" />
          </div>
        </section>

        <section id="fonctions" className="mt-12">
          <h2 className="text-center text-3xl font-bold">{t.titreSection}</h2>
          <p className={`mx-auto mt-2 max-w-2xl text-center ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{t.sousTitre}</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {t.cartes.map((carte) => {
              const Icone = carte.icone;
              return (
                <article key={carte.titre} className={`rounded-2xl border p-5 shadow-md ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
                  <div className="mb-3 inline-flex rounded-xl bg-rose-800 p-3 text-white"><Icone size={20} /></div>
                  <h3 className="text-lg font-semibold">{carte.titre}</h3>
                  <p className={`mt-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{carte.desc}</p>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <footer className={`${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'} border-t`}>
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-5 text-sm md:flex-row md:px-6">
          <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>{t.footer}</p>
          <div className="flex gap-2 sm:hidden">
            <button className={`rounded-full px-3 py-1 text-xs font-bold ${langue === 'fr' ? 'bg-rose-800 text-white' : 'border border-rose-800 text-rose-800'}`} onClick={() => setLangue('fr')} type="button">FR</button>
            <button className={`rounded-full px-3 py-1 text-xs font-bold ${langue === 'en' ? 'bg-rose-800 text-white' : 'border border-rose-800 text-rose-800'}`} onClick={() => setLangue('en')} type="button">EN</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState('light');
  const [langue, setLangue] = useState('fr');
  const [profil, setProfil] = useState('');

  const traductions = {
    fr: {
      accueil: 'Accueil',
      fonctions: 'Fonctionnalites',
      connexion: 'Se connecter',
      titre: 'Gerez vos notes avec precision',
      description: 'JFnNote vous aide a saisir, suivre et comprendre vos notes en toute simplicite.',
      btnPrincipal: 'Commencer',
      titreSection: 'Une gestion claire de vos resultats',
      sousTitre: 'Un espace simple et fiable pour garder le controle.',
      cartes: [
        { titre: 'Saisie rapide', desc: 'Saisissez vos notes en quelques secondes.', icone: Edit3 },
        { titre: 'Analyse lisible', desc: 'Tendances et graphiques clairs.', icone: TrendingUp },
        { titre: 'Tableau de bord', desc: 'Toutes vos moyennes reunies.', icone: Gauge },
        { titre: 'Securite renforcee', desc: 'Vos donnees sont protegees.', icone: Shield },
      ],
      footer: '© 2026 JFnNote - Fait avec soin a Douala par Donkeng Alida',
    },
    en: {
      accueil: 'Home',
      fonctions: 'Features',
      connexion: 'Sign in',
      titre: 'Manage your grades with precision',
      description: 'JFnNote helps you enter, track and understand your grades with clarity.',
      btnPrincipal: 'Get started',
      titreSection: 'A clear way to manage results',
      sousTitre: 'A simple and reliable space to stay in control.',
      cartes: [
        { titre: 'Fast entry', desc: 'Enter grades in a few seconds.', icone: Edit3 },
        { titre: 'Readable analysis', desc: 'Clear trends and visuals.', icone: TrendingUp },
        { titre: 'Dashboard', desc: 'All averages in one place.', icone: Gauge },
        { titre: 'Stronger security', desc: 'Your data stays protected.', icone: Shield },
      ],
      footer: '© 2026 JFnNote - Crafted with care in Douala by Donkeng Alida',
    },
  };

  const t = traductions[langue];
  const isDark = theme === 'dark';

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedLangue = localStorage.getItem('langue') || 'fr';
    setTheme(savedTheme);
    setLangue(savedLangue);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('langue', langue);
  }, [langue]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <AccueilPage
            isDark={isDark}
            theme={theme}
            langue={langue}
            setLangue={setLangue}
            toggleTheme={toggleTheme}
            t={t}
            profil={profil}
          />
        }
      />
      <Route
        path="/choix-profil"
        element={
          <ChoixProfil
            theme={theme}
            onToggleTheme={toggleTheme}
            langue={langue}
            onLangueChange={setLangue}
            onRoleSelect={setProfil}
          />
        }
      />
      <Route
        path="/admin"
        element={
          <AdminPage
            theme={theme}
            langue={langue}
            onToggleTheme={toggleTheme}
            onLangueChange={setLangue}
          />
        }
      />
      <Route
        path="/enseignant"
        element={
          <TeacherPage
            theme={theme}
            langue={langue}
            onToggleTheme={toggleTheme}
            onLangueChange={setLangue}
          />
        }
      />
      <Route
        path="/coordonnateur"
        element={
          <CoordinatorPage
            theme={theme}
            langue={langue}
            onToggleTheme={toggleTheme}
            onLangueChange={setLangue}
          />
        }
      />
      <Route
        path="*"
        element={
          <div className={`flex min-h-screen items-center justify-center ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-900'}`}>
            <Link to="/" className="rounded-full bg-rose-800 px-5 py-2 text-white">Retour a l accueil</Link>
          </div>
        }
      />
    </Routes>
  );
}

export default App;
