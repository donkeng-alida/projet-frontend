import { useEffect, useMemo, useState } from 'react';
import { Link, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { Moon, Sun, Home, Zap, LogIn, Edit3, TrendingUp, Gauge, Shield, HelpCircle } from 'lucide-react';
import ChoixProfil from './components/ChoixProfil';
import AdminPage from './pages/AdminPage';
import SuperuserPage from './pages/SuperuserPage';
import TeacherPage from './pages/TeacherPage';
import CoordinatorPage from './pages/CoordinatorPage';
import StudentPage from './pages/StudentPage';
import ParentPage from './pages/ParentPage';
import CelluleInfoPage from './pages/CelluleInfoPage';

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
            <Link to="/aide" className="inline-flex items-center gap-1 hover:text-rose-700"><HelpCircle size={16} />{t.aide}</Link>
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
                <Link
                  key={carte.titre}
                  to={`/fonctionnalites/${carte.slug}`}
                  className={`block rounded-2xl border p-5 shadow-md transition hover:-translate-y-0.5 ${
                    isDark ? 'border-slate-800 bg-slate-900 hover:border-sky-600/60' : 'border-slate-200 bg-white hover:border-sky-400'
                  }`}
                >
                  <div className="mb-3 inline-flex rounded-xl bg-rose-800 p-3 text-white"><Icone size={20} /></div>
                  <h3 className="text-lg font-semibold">{carte.titre}</h3>
                  <p className={`mt-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{carte.desc}</p>
                  <p className="mt-3 text-xs font-semibold text-sky-700">{t.voirDetails}</p>
                </Link>
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

function FeaturePage({ isDark, theme, langue, setLangue, toggleTheme, t }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const feature = t.featurePages?.[slug];
  const isFr = langue === 'fr';

  if (!feature) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'} p-6`}>
        <button className="rounded-full bg-sky-700 px-4 py-2 text-sm font-semibold text-white" type="button" onClick={() => navigate('/')}>
          {t.retourAccueil}
        </button>
        <p className="mt-6">{t.pageInconnue}</p>
      </div>
    );
  }

  const accentBySlug = {
    'saisie-rapide': {
      title: 'text-blue-700',
      chip: 'bg-blue-500/10 text-blue-700',
      panel: isDark ? 'border-blue-800/50 bg-blue-900/10' : 'border-blue-200 bg-blue-50/40',
    },
    'analyse-lisible': {
      title: 'text-emerald-700',
      chip: 'bg-emerald-500/10 text-emerald-700',
      panel: isDark ? 'border-emerald-800/50 bg-emerald-900/10' : 'border-emerald-200 bg-emerald-50/40',
    },
    'tableau-de-bord': {
      title: 'text-indigo-700',
      chip: 'bg-indigo-500/10 text-indigo-700',
      panel: isDark ? 'border-indigo-800/50 bg-indigo-900/10' : 'border-indigo-200 bg-indigo-50/40',
    },
    'securite-renforcee': {
      title: 'text-amber-700',
      chip: 'bg-amber-500/10 text-amber-700',
      panel: isDark ? 'border-amber-800/50 bg-amber-900/10' : 'border-amber-200 bg-amber-50/40',
    },
  };

  const accent = accentBySlug[slug] || accentBySlug['saisie-rapide'];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      <button
        className="fixed right-5 top-5 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-rose-800 text-white shadow-lg"
        onClick={toggleTheme}
        type="button"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <header className={`border-b ${isDark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-white/90'} backdrop-blur`}>
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 md:px-6">
          <button className="rounded-full bg-sky-700 px-4 py-2 text-sm font-semibold text-white" type="button" onClick={() => navigate('/')}>
            {t.retourAccueil}
          </button>
          <div className="flex gap-2">
            <button className={`rounded-full px-3 py-1 text-xs font-bold ${langue === 'fr' ? 'bg-rose-800 text-white' : 'border border-rose-800 text-rose-800'}`} onClick={() => setLangue('fr')} type="button">FR</button>
            <button className={`rounded-full px-3 py-1 text-xs font-bold ${langue === 'en' ? 'bg-rose-800 text-white' : 'border border-rose-800 text-rose-800'}`} onClick={() => setLangue('en')} type="button">EN</button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6">
        <section className={`rounded-3xl border p-6 md:p-8 ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <h1 className={`text-3xl font-extrabold ${accent.title}`}>{feature.title}</h1>
          <p className={`mt-3 text-base ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{feature.intro}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate(feature.ctaPath || '/choix-profil')}
              className="rounded-xl bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600"
            >
              {feature.ctaLabel || t.essayerMaintenant}
            </button>
            <button
              type="button"
              onClick={() => navigate('/aide')}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold ${isDark ? 'border-slate-600 text-slate-200 hover:border-sky-400' : 'border-slate-300 text-slate-700 hover:border-sky-500'}`}
            >
              {t.aide}
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <article className={`rounded-2xl border p-4 ${isDark ? 'border-slate-700 bg-slate-800/70' : 'border-slate-200 bg-slate-50'}`}>
              <h2 className="text-lg font-bold">{t.ceQueVousPouvezFaire}</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {feature.actions.map((item) => (
                  <li key={item} className={`rounded-lg px-3 py-2 ${accent.chip}`}>{item}</li>
                ))}
              </ul>
            </article>
            <article className={`rounded-2xl border p-4 ${isDark ? 'border-slate-700 bg-slate-800/70' : 'border-slate-200 bg-slate-50'}`}>
              <h2 className="text-lg font-bold">{t.pourquoiCestUtile}</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {feature.benefits.map((item) => (
                  <li key={item} className="rounded-lg bg-emerald-500/10 px-3 py-2 text-emerald-700">{item}</li>
                ))}
              </ul>
            </article>
          </div>

          {slug === 'saisie-rapide' && (
            <>
              <article className={`mt-6 rounded-2xl border p-4 ${accent.panel}`}>
                <h3 className="text-lg font-bold">{isFr ? 'Workflow de saisie en 3 etapes' : '3-step entry workflow'}</h3>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm">
                  <li>{isFr ? 'Choisir le cycle, la matiere et l etudiant.' : 'Select cycle, subject and student.'}</li>
                  <li>{isFr ? 'Entrer la note avec controle automatique des bornes.' : 'Enter mark with range validation.'}</li>
                  <li>{isFr ? 'Enregistrer puis transferer vers les destinataires.' : 'Save and share to recipients.'}</li>
                </ol>
              </article>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <article className={`rounded-2xl border p-4 ${isDark ? 'border-slate-700 bg-slate-800/70' : 'border-slate-200 bg-slate-50'}`}>
                  <h3 className="text-base font-bold">{feature.validationTitle}</h3>
                  <ul className="mt-3 space-y-2 text-sm">
                    {feature.validationRules?.map((item) => (
                      <li key={item} className="rounded-lg bg-sky-500/10 px-3 py-2 text-sky-700">{item}</li>
                    ))}
                  </ul>
                </article>
                <article className={`rounded-2xl border p-4 ${isDark ? 'border-slate-700 bg-slate-800/70' : 'border-slate-200 bg-slate-50'}`}>
                  <h3 className="text-base font-bold">{feature.commonErrorsTitle}</h3>
                  <ul className="mt-3 space-y-2 text-sm">
                    {feature.commonErrors?.map((item) => (
                      <li key={item} className="rounded-lg bg-rose-500/10 px-3 py-2 text-rose-700">{item}</li>
                    ))}
                  </ul>
                </article>
                <article className={`rounded-2xl border p-4 ${isDark ? 'border-slate-700 bg-slate-800/70' : 'border-slate-200 bg-slate-50'}`}>
                  <h3 className="text-base font-bold">{feature.bestPracticesTitle}</h3>
                  <ul className="mt-3 space-y-2 text-sm">
                    {feature.bestPractices?.map((item) => (
                      <li key={item} className="rounded-lg bg-emerald-500/10 px-3 py-2 text-emerald-700">{item}</li>
                    ))}
                  </ul>
                </article>
              </div>
            </>
          )}

          {slug === 'analyse-lisible' && (
            <>
              <article className={`mt-6 rounded-2xl border p-4 ${accent.panel}`}>
                <h3 className="text-lg font-bold">{isFr ? 'Indicateurs d analyse' : 'Analysis indicators'}</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-3 text-sm">
                  <div className="rounded-xl bg-white/60 p-3"><p className="font-semibold">{isFr ? 'Moyenne generale' : 'Overall average'}</p><p className="opacity-70">{isFr ? 'Suivi de performance global' : 'Global performance tracking'}</p></div>
                  <div className="rounded-xl bg-white/60 p-3"><p className="font-semibold">{isFr ? 'Tendance par periode' : 'Trend by period'}</p><p className="opacity-70">{isFr ? 'Evolution sur les semestres' : 'Progress across terms'}</p></div>
                  <div className="rounded-xl bg-white/60 p-3"><p className="font-semibold">{isFr ? 'Alertes faibles notes' : 'Low-score alerts'}</p><p className="opacity-70">{isFr ? 'Detection precoce des risques' : 'Early risk detection'}</p></div>
                </div>
              </article>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <article className={`rounded-2xl border p-4 ${isDark ? 'border-slate-700 bg-slate-800/70' : 'border-slate-200 bg-slate-50'}`}>
                  <h3 className="text-base font-bold">{feature.kpiTitle}</h3>
                  <ul className="mt-3 space-y-2 text-sm">
                    {feature.kpiItems?.map((item) => (
                      <li key={item} className="rounded-lg bg-emerald-500/10 px-3 py-2 text-emerald-700">{item}</li>
                    ))}
                  </ul>
                </article>
                <article className={`rounded-2xl border p-4 ${isDark ? 'border-slate-700 bg-slate-800/70' : 'border-slate-200 bg-slate-50'}`}>
                  <h3 className="text-base font-bold">{feature.interpretationTitle}</h3>
                  <ul className="mt-3 space-y-2 text-sm">
                    {feature.interpretationRules?.map((item) => (
                      <li key={item} className="rounded-lg bg-indigo-500/10 px-3 py-2 text-indigo-700">{item}</li>
                    ))}
                  </ul>
                </article>
                <article className={`rounded-2xl border p-4 ${isDark ? 'border-slate-700 bg-slate-800/70' : 'border-slate-200 bg-slate-50'}`}>
                  <h3 className="text-base font-bold">{feature.recommendedActionsTitle}</h3>
                  <ul className="mt-3 space-y-2 text-sm">
                    {feature.recommendedActions?.map((item) => (
                      <li key={item} className="rounded-lg bg-sky-500/10 px-3 py-2 text-sky-700">{item}</li>
                    ))}
                  </ul>
                </article>
              </div>
            </>
          )}

          {slug === 'tableau-de-bord' && (
            <>
              <article className={`mt-6 rounded-2xl border p-4 ${accent.panel}`}>
                <h3 className="text-lg font-bold">{isFr ? 'Widgets du tableau de bord' : 'Dashboard widgets'}</h3>
                <ul className="mt-3 grid gap-3 sm:grid-cols-2 text-sm">
                  <li className="rounded-xl bg-white/60 p-3">{isFr ? 'Comptes actifs et roles definis' : 'Active accounts and defined roles'}</li>
                  <li className="rounded-xl bg-white/60 p-3">{isFr ? 'Notes en attente de validation' : 'Marks pending validation'}</li>
                  <li className="rounded-xl bg-white/60 p-3">{isFr ? 'Requetes a traiter en priorite' : 'Priority requests to process'}</li>
                  <li className="rounded-xl bg-white/60 p-3">{isFr ? 'Actions recentes de l administration' : 'Recent administration actions'}</li>
                </ul>
              </article>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <article className={`rounded-2xl border p-4 ${isDark ? 'border-slate-700 bg-slate-800/70' : 'border-slate-200 bg-slate-50'}`}>
                  <h3 className="text-base font-bold">{feature.priorityViewTitle}</h3>
                  <ul className="mt-3 space-y-2 text-sm">
                    {feature.priorityViewItems?.map((item) => (
                      <li key={item} className="rounded-lg bg-indigo-500/10 px-3 py-2 text-indigo-700">{item}</li>
                    ))}
                  </ul>
                </article>
                <article className={`rounded-2xl border p-4 ${isDark ? 'border-slate-700 bg-slate-800/70' : 'border-slate-200 bg-slate-50'}`}>
                  <h3 className="text-base font-bold">{feature.dailyChecklistTitle}</h3>
                  <ul className="mt-3 space-y-2 text-sm">
                    {feature.dailyChecklist?.map((item) => (
                      <li key={item} className="rounded-lg bg-sky-500/10 px-3 py-2 text-sky-700">{item}</li>
                    ))}
                  </ul>
                </article>
                <article className={`rounded-2xl border p-4 ${isDark ? 'border-slate-700 bg-slate-800/70' : 'border-slate-200 bg-slate-50'}`}>
                  <h3 className="text-base font-bold">{feature.executionTipsTitle}</h3>
                  <ul className="mt-3 space-y-2 text-sm">
                    {feature.executionTips?.map((item) => (
                      <li key={item} className="rounded-lg bg-emerald-500/10 px-3 py-2 text-emerald-700">{item}</li>
                    ))}
                  </ul>
                </article>
              </div>
            </>
          )}

          {slug === 'securite-renforcee' && (
            <>
              <article className={`mt-6 rounded-2xl border p-4 ${accent.panel}`}>
                <h3 className="text-lg font-bold">{isFr ? 'Controles de securite' : 'Security controls'}</h3>
                <ul className="mt-3 space-y-2 text-sm">
                  <li className="rounded-lg bg-white/60 px-3 py-2">{isFr ? 'Acces limite par role (admin, enseignant, parent, etudiant).' : 'Role-based access control (admin, teacher, parent, student).'}</li>
                  <li className="rounded-lg bg-white/60 px-3 py-2">{isFr ? 'Session utilisateur et deconnexion securisee.' : 'User session with secure sign-out.'}</li>
                  <li className="rounded-lg bg-white/60 px-3 py-2">{isFr ? 'Visibilite des notes selon les droits de partage.' : 'Mark visibility based on sharing permissions.'}</li>
                </ul>
              </article>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <article className={`rounded-2xl border p-4 ${isDark ? 'border-slate-700 bg-slate-800/70' : 'border-slate-200 bg-slate-50'}`}>
                  <h3 className="text-base font-bold">{feature.preventionTitle}</h3>
                  <ul className="mt-3 space-y-2 text-sm">
                    {feature.preventionItems?.map((item) => (
                      <li key={item} className="rounded-lg bg-amber-500/10 px-3 py-2 text-amber-700">{item}</li>
                    ))}
                  </ul>
                </article>
                <article className={`rounded-2xl border p-4 ${isDark ? 'border-slate-700 bg-slate-800/70' : 'border-slate-200 bg-slate-50'}`}>
                  <h3 className="text-base font-bold">{feature.incidentTitle}</h3>
                  <ul className="mt-3 space-y-2 text-sm">
                    {feature.incidentSteps?.map((item) => (
                      <li key={item} className="rounded-lg bg-rose-500/10 px-3 py-2 text-rose-700">{item}</li>
                    ))}
                  </ul>
                </article>
                <article className={`rounded-2xl border p-4 ${isDark ? 'border-slate-700 bg-slate-800/70' : 'border-slate-200 bg-slate-50'}`}>
                  <h3 className="text-base font-bold">{feature.auditTitle}</h3>
                  <ul className="mt-3 space-y-2 text-sm">
                    {feature.auditItems?.map((item) => (
                      <li key={item} className="rounded-lg bg-sky-500/10 px-3 py-2 text-sky-700">{item}</li>
                    ))}
                  </ul>
                </article>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

function HelpPage({ isDark, theme, langue, setLangue, toggleTheme, t }) {
  const navigate = useNavigate();
  const [faqQuery, setFaqQuery] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [ticketStatus, setTicketStatus] = useState('');
  const [chatMessages, setChatMessages] = useState(() => [
    { from: 'bot', text: t.help.assistantBienvenue },
  ]);
  const filteredFaq = useMemo(() => {
    const query = faqQuery.trim().toLowerCase();
    if (!query) return t.help.faq;
    return t.help.faq.filter((item) =>
      `${item.q} ${item.a}`.toLowerCase().includes(query)
    );
  }, [faqQuery, t.help.faq]);

  useEffect(() => {
    setChatMessages([{ from: 'bot', text: t.help.assistantBienvenue }]);
  }, [langue, t.help.assistantBienvenue]);

  const getAssistantResponse = (message) => {
    const value = message.toLowerCase();
    if (value.includes('connect') || value.includes('login') || value.includes('mot de passe') || value.includes('password')) {
      return t.help.assistantConnexion;
    }
    if (value.includes('note') || value.includes('mark') || value.includes('visible')) {
      return t.help.assistantNotes;
    }
    if (value.includes('pdf') || value.includes('piece jointe') || value.includes('attachment')) {
      return t.help.assistantPdf;
    }
    if (value.includes('lent') || value.includes('slow') || value.includes('cache') || value.includes('bloqu')) {
      return t.help.assistantLenteur;
    }
    if (value.includes('admin') || value.includes('enseignant') || value.includes('teacher') || value.includes('role') || value.includes('profil')) {
      return t.help.assistantRole;
    }
    return t.help.assistantDefaut;
  };

  const sendAssistantMessage = (rawText) => {
    const text = rawText.trim();
    if (!text) return;
    setChatMessages((prev) => [...prev, { from: 'user', text }, { from: 'bot', text: getAssistantResponse(text) }]);
    setChatInput('');
  };

  const createSupportTicket = async () => {
    const transcript = chatMessages
      .map((msg) => `${msg.from === 'bot' ? t.help.assistantBot : t.help.assistantVous}: ${msg.text}`)
      .join('\n');
    const subject = encodeURIComponent(t.help.ticketSujet);
    const body = encodeURIComponent(`${t.help.ticketIntro}\n\n${transcript}`);
    const mailtoUrl = `mailto:${t.help.supportEmail}?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;

    try {
      await navigator.clipboard.writeText(`${t.help.ticketSujet}\n\n${t.help.ticketIntro}\n\n${transcript}`);
      setTicketStatus(t.help.ticketCreeEtCopie);
    } catch {
      setTicketStatus(t.help.ticketCree);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      <button
        className="fixed right-5 top-5 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-rose-800 text-white shadow-lg"
        onClick={toggleTheme}
        type="button"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <header className={`border-b ${isDark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-white/90'} backdrop-blur`}>
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-6">
          <button className="rounded-full bg-sky-700 px-4 py-2 text-sm font-semibold text-white" type="button" onClick={() => navigate('/')}>
            {t.retourAccueil}
          </button>
          <div className="flex gap-2">
            <button className={`rounded-full px-3 py-1 text-xs font-bold ${langue === 'fr' ? 'bg-rose-800 text-white' : 'border border-rose-800 text-rose-800'}`} onClick={() => setLangue('fr')} type="button">FR</button>
            <button className={`rounded-full px-3 py-1 text-xs font-bold ${langue === 'en' ? 'bg-rose-800 text-white' : 'border border-rose-800 text-rose-800'}`} onClick={() => setLangue('en')} type="button">EN</button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
        <section className={`rounded-3xl border p-6 md:p-8 ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <h1 className="text-3xl font-extrabold text-sky-700">{t.help.titre}</h1>
          <p className={`mt-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{t.help.intro}</p>

          <article className={`mt-6 rounded-2xl border p-4 ${isDark ? 'border-slate-700 bg-slate-800/70' : 'border-slate-200 bg-slate-50'}`}>
            <h2 className="text-lg font-bold">{t.help.demarrageTitre}</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm">
              {t.help.demarrage.map((step) => <li key={step}>{step}</li>)}
            </ol>
          </article>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {t.help.roles.map((item) => (
              <article key={item.role} className={`rounded-2xl border p-4 ${isDark ? 'border-slate-700 bg-slate-800/70' : 'border-slate-200 bg-slate-50'}`}>
                <h3 className="text-base font-bold text-sky-700">{item.role}</h3>
                <ul className="mt-2 space-y-2 text-sm">
                  {item.points.map((point) => <li key={point} className="rounded-lg bg-sky-500/10 px-3 py-2 text-sky-700">{point}</li>)}
                </ul>
              </article>
            ))}
          </div>

          <article className={`mt-6 rounded-2xl border p-4 ${isDark ? 'border-slate-700 bg-slate-800/70' : 'border-slate-200 bg-slate-50'}`}>
            <h2 className="text-lg font-bold">{t.help.faqTitre}</h2>
            <input
              type="search"
              value={faqQuery}
              onChange={(event) => setFaqQuery(event.target.value)}
              placeholder={t.help.rechercherFaq}
              className={`mt-3 w-full rounded-xl border px-3 py-2 text-sm outline-none ${
                isDark ? 'border-slate-600 bg-slate-900 text-slate-100' : 'border-slate-300 bg-white text-slate-800'
              }`}
            />
            <div className="mt-3 space-y-3 text-sm">
              {filteredFaq.map((item) => (
                <div key={item.q} className="rounded-xl bg-white/60 p-3">
                  <p className="font-semibold">{item.q}</p>
                  <p className="mt-1 opacity-80">{item.a}</p>
                </div>
              ))}
              {filteredFaq.length === 0 && (
                <p className={`rounded-xl px-3 py-2 ${isDark ? 'bg-slate-900 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                  {t.help.faqAucunResultat}
                </p>
              )}
            </div>
          </article>

          <article className={`mt-6 rounded-2xl border p-4 ${isDark ? 'border-slate-700 bg-slate-800/70' : 'border-slate-200 bg-slate-50'}`}>
            <h2 className="text-lg font-bold">{t.help.depannageTitre}</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {t.help.depannage.map((item) => (
                <div key={item.probleme} className="rounded-xl bg-white/60 p-3 text-sm">
                  <p className="font-semibold text-rose-700">{item.probleme}</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {item.actions.map((action) => <li key={action}>{action}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </article>

          <article className={`mt-6 rounded-2xl border p-4 ${isDark ? 'border-slate-700 bg-slate-800/70' : 'border-slate-200 bg-slate-50'}`}>
            <h2 className="text-lg font-bold">{t.help.supportTitre}</h2>
            <p className={`mt-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t.help.supportTexte}</p>
            <p className={`mt-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t.help.supportEmail}</p>
          </article>

          <article className={`mt-6 rounded-2xl border p-4 ${isDark ? 'border-slate-700 bg-slate-800/70' : 'border-slate-200 bg-slate-50'}`}>
            <h2 className="text-lg font-bold">{t.help.assistantTitre}</h2>
            <p className={`mt-1 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{t.help.assistantIntro}</p>
            <div className={`mt-3 max-h-64 space-y-2 overflow-auto rounded-xl border p-3 ${isDark ? 'border-slate-600 bg-slate-900' : 'border-slate-200 bg-white'}`}>
              {chatMessages.map((msg, index) => (
                <div key={`${msg.from}-${index}`} className={`rounded-lg px-3 py-2 text-sm ${msg.from === 'bot' ? 'bg-sky-500/10 text-sky-700' : 'bg-slate-500/10 text-slate-700'}`}>
                  <span className="font-semibold">{msg.from === 'bot' ? t.help.assistantBot : t.help.assistantVous}: </span>{msg.text}
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {t.help.assistantSuggestions.map((item) => (
                <button key={item} type="button" onClick={() => sendAssistantMessage(item)} className="rounded-full border border-sky-400 px-3 py-1 text-xs font-semibold text-sky-700">
                  {item}
                </button>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') sendAssistantMessage(chatInput);
                }}
                placeholder={t.help.assistantPlaceholder}
                className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${isDark ? 'border-slate-600 bg-slate-900 text-slate-100' : 'border-slate-300 bg-white text-slate-800'}`}
              />
              <button type="button" onClick={() => sendAssistantMessage(chatInput)} className="rounded-xl bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600">
                {t.help.assistantEnvoyer}
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={createSupportTicket}
                className="rounded-xl border border-sky-500 px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-50"
              >
                {t.help.ticketBouton}
              </button>
              {ticketStatus && <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{ticketStatus}</p>}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [langue, setLangue] = useState(() => localStorage.getItem('langue') || 'fr');
  const [profil, setProfil] = useState('');

  const traductions = {
    fr: {
      accueil: 'Accueil',
      fonctions: 'Fonctionnalites',
      connexion: 'Se connecter',
      aide: 'Aide',
      voirDetails: 'Voir details',
      retourAccueil: "Retour a l'accueil",
      pageInconnue: 'Fonctionnalite introuvable.',
      ceQueVousPouvezFaire: 'Ce que vous pouvez faire',
      pourquoiCestUtile: "Pourquoi c'est utile",
      essayerMaintenant: 'Essayer maintenant',
      titre: 'Gerez vos notes avec precision',
      description: 'JFnNote vous aide a saisir, suivre et comprendre vos notes en toute simplicite.',
      btnPrincipal: 'Commencer',
      titreSection: 'Une gestion claire de vos resultats',
      sousTitre: 'Un espace simple et fiable pour garder le controle.',
      cartes: [
        { slug: 'saisie-rapide', titre: 'Saisie rapide', desc: 'Saisissez vos notes en quelques secondes.', icone: Edit3 },
        { slug: 'analyse-lisible', titre: 'Analyse lisible', desc: 'Tendances et graphiques clairs.', icone: TrendingUp },
        { slug: 'tableau-de-bord', titre: 'Tableau de bord', desc: 'Toutes vos moyennes reunies.', icone: Gauge },
        { slug: 'securite-renforcee', titre: 'Securite renforcee', desc: 'Vos donnees sont protegees.', icone: Shield },
      ],
      featurePages: {
        'saisie-rapide': {
          title: 'Saisie rapide',
          intro: 'Entrez les notes sans perdre du temps grace a un formulaire simple et des controles automatiques.',
          ctaLabel: 'Ouvrir espace enseignant',
          ctaPath: '/enseignant',
          actions: ['Saisir les notes par matiere et cycle', 'Corriger une note instantanement', 'Valider rapidement les modifications'],
          benefits: ['Gain de temps pour les enseignants', 'Moins d erreurs de saisie', 'Processus administratif plus fluide'],
          validationTitle: 'Regles de validation',
          validationRules: [
            'Note comprise entre 0 et 20.',
            'Le cycle, la matiere et l etudiant sont obligatoires.',
            'Verifier les decimales (ex: 12.5).',
          ],
          commonErrorsTitle: 'Erreurs courantes',
          commonErrors: [
            'Mauvais etudiant selectionne.',
            'Confusion entre deux matieres proches.',
            'Note non enregistree avant changement de page.',
          ],
          bestPracticesTitle: 'Bonnes pratiques',
          bestPractices: [
            'Saisir par classe complete pour garder le rythme.',
            'Verifier les notes extremes avant validation.',
            'Utiliser le transfert seulement apres controle final.',
          ],
        },
        'analyse-lisible': {
          title: 'Analyse lisible',
          intro: 'Visualisez les tendances des resultats avec une lecture claire pour prendre de meilleures decisions.',
          ctaLabel: 'Ouvrir espace coordonnateur',
          ctaPath: '/coordonnateur',
          actions: ['Voir les resultats par periode', 'Comparer les performances par classe', 'Identifier les points de vigilance'],
          benefits: ['Decision plus rapide', 'Suivi pedagogique ameliore', 'Communication claire avec les acteurs'],
          kpiTitle: 'KPIs a suivre',
          kpiItems: [
            'Moyenne generale par classe et par matiere.',
            'Taux de progression sur la periode.',
            'Nombre d etudiants sous le seuil d alerte.',
          ],
          interpretationTitle: 'Interpretation rapide',
          interpretationRules: [
            'Moyenne en baisse: verifier la matiere la plus impactee.',
            'Dispersion elevee: cibler les etudiants en difficultes.',
            'Progression stable: maintenir la strategie pedagogique.',
          ],
          recommendedActionsTitle: 'Actions recommandees',
          recommendedActions: [
            'Planifier un accompagnement pour les groupes faibles.',
            'Partager un resume aux coordonnateurs.',
            'Suivre les cas critiques semaine par semaine.',
          ],
        },
        'tableau-de-bord': {
          title: 'Tableau de bord',
          intro: 'Centralisez les indicateurs importants dans un seul ecran pour piloter votre activite.',
          ctaLabel: 'Ouvrir tableau admin',
          ctaPath: '/admin/comptes',
          actions: ['Suivre les comptes actifs', 'Voir les notes et requetes en attente', 'Acceder aux actions prioritaires'],
          benefits: ['Vue globale immediate', 'Priorisation efficace', 'Meilleure reactivite des equipes'],
          priorityViewTitle: 'Vue prioritaire',
          priorityViewItems: [
            'Elements en attente a traiter en premier.',
            'Alertes operationnelles du jour.',
            'Actions urgentes en un coup d oeil.',
          ],
          dailyChecklistTitle: 'Checklist quotidienne',
          dailyChecklist: [
            'Verifier les notes non validees.',
            'Verifier les requetes en attente.',
            'Confirmer les creations de comptes.',
          ],
          executionTipsTitle: "Conseils d'execution",
          executionTips: [
            'Traiter les urgences avant les taches de confort.',
            'Rafraichir les donnees avant une decision.',
            'Documenter les actions sensibles.',
          ],
        },
        'securite-renforcee': {
          title: 'Securite renforcee',
          intro: 'Protegez les donnees avec des acces controles, une authentification stricte et une traçabilite des actions.',
          ctaLabel: 'Ouvrir espace superuser',
          ctaPath: '/superuser',
          actions: ['Limiter les droits par role', 'Gerer les sessions de connexion', 'Tracer les actions sensibles'],
          benefits: ['Protection des donnees scolaires', 'Conformite et fiabilite', 'Confiance des utilisateurs'],
          preventionTitle: 'Mesures preventives',
          preventionItems: [
            'Mots de passe forts et renouveles.',
            'Acces strictement limite par role.',
            'Verification des permissions avant partage.',
          ],
          incidentTitle: 'Reponse incident',
          incidentSteps: [
            'Identifier le compte ou l action suspecte.',
            'Suspendre immediatement les acces concernes.',
            'Notifier l equipe support avec traces.',
          ],
          auditTitle: 'Audit et suivi',
          auditItems: [
            'Relecture periodique des journaux d actions.',
            'Controle des comptes inactifs.',
            'Verification des flux de transfert.',
          ],
        },
      },
      help: {
        titre: "Centre d'aide",
        intro: "Cette page vous guide pas a pas pour utiliser l'application selon votre role.",
        demarrageTitre: 'Demarrage rapide',
        demarrage: [
          "Choisissez votre profil puis connectez-vous.",
          "Consultez votre espace de travail (notes, requetes, comptes).",
          "Effectuez votre action principale puis verifiez le message de confirmation.",
        ],
        actionsRapidesTitre: 'Actions rapides',
        actionsRapides: [
          { label: 'Ouvrir Admin', desc: 'Gerer les comptes, notes et requetes.', path: '/admin/comptes' },
          { label: 'Espace Enseignant', desc: 'Saisie et suivi des notes.', path: '/enseignant' },
          { label: 'Espace Etudiant', desc: 'Consulter les notes et faire une requete.', path: '/etudiant' },
          { label: 'Choix du profil', desc: 'Changer rapidement de role.', path: '/choix-profil' },
        ],
        roles: [
          { role: 'Admin', points: ['Creer les comptes', 'Valider et transferer les notes', 'Traiter les requetes'] },
          { role: 'Enseignant', points: ['Saisir les notes', 'Suivre les classes', 'Corriger en cas d erreur'] },
          { role: 'Etudiant / Parent', points: ['Consulter les notes', 'Suivre les mises a jour', 'Soumettre une requete si besoin'] },
          { role: 'Coordonnateur / Cellule info', points: ['Suivre les flux', 'Verifier la coherence', 'Assister les utilisateurs'] },
        ],
        faqTitre: 'Questions frequentes',
        rechercherFaq: 'Rechercher une question...',
        faqAucunResultat: 'Aucune reponse ne correspond a votre recherche.',
        faq: [
          { q: "Je n'arrive pas a me connecter, que faire ?", a: "Verifiez l'email, le mot de passe et le role. Si le probleme persiste, contactez l'administrateur." },
          { q: 'Pourquoi une note ne se voit pas ?', a: 'La note peut ne pas etre transferee au bon destinataire. Verifiez les options de partage.' },
          { q: 'Comment passer du francais a l anglais ?', a: "Utilisez les boutons FR/EN en haut de la page." },
        ],
        depannageTitre: 'Depannage courant',
        depannage: [
          {
            probleme: 'Impossible de se connecter',
            actions: ['Verifier email/mot de passe.', 'Verifier le role choisi.', "Reessayer apres deconnexion/reconnexion."],
          },
          {
            probleme: 'Note non visible',
            actions: ["Verifier si la note est enregistree.", 'Verifier les options de transfert.', "Controler l'espace de destination."],
          },
          {
            probleme: 'Piece jointe PDF ne s ouvre pas',
            actions: ['Verifier votre connexion internet.', 'Tester le bouton telecharger.', 'Reessayer depuis un autre navigateur.'],
          },
          {
            probleme: 'Page lente ou bloquee',
            actions: ['Actualiser la page.', 'Vider le cache du navigateur.', "Contacter le support avec le message d'erreur."],
          },
        ],
        supportTitre: 'Support',
        supportTexte: "En cas de blocage, capturez l'ecran et envoyez les details (page, action, message d'erreur) a l'equipe support.",
        assistantTitre: "Assistant d'aide",
        assistantIntro: 'Posez une question simple et recevez une orientation immediate.',
        assistantBienvenue: 'Bonjour, je peux vous aider. Decrivez votre probleme en quelques mots.',
        assistantBot: 'Assistant',
        assistantVous: 'Vous',
        assistantEnvoyer: 'Envoyer',
        assistantPlaceholder: 'Ex: Je ne peux pas me connecter',
        assistantSuggestions: [
          "Je n'arrive pas a me connecter",
          'Je ne vois pas ma note',
          "Le PDF ne s'ouvre pas",
          'La page est lente',
        ],
        assistantConnexion: "Verifier vos identifiants, le role choisi et la connexion internet. Ensuite, deconnectez-vous puis reconnectez-vous.",
        assistantNotes: "Verifiez si la note est enregistree et si les options de partage sont actives vers le bon destinataire.",
        assistantPdf: "Essayez d'abord le bouton telecharger, puis testez un autre navigateur si le probleme persiste.",
        assistantLenteur: 'Actualisez la page, videz le cache navigateur et reduisez le nombre d onglets ouverts.',
        assistantRole: "Verifiez votre profil actif dans l'application. Si besoin, retournez sur Choix profil pour changer de role.",
        assistantDefaut: "Je vous conseille de preciser: connexion, note, PDF, lenteur ou role. Je vous guiderai ensuite.",
        supportEmail: 'support@jfnnote.app',
        ticketBouton: 'Creer un ticket support',
        ticketSujet: 'Ticket support JFnNote',
        ticketIntro: "Bonjour support, voici les details de mon probleme :",
        ticketCree: "Ticket prepare. Votre application mail est en cours d'ouverture.",
        ticketCreeEtCopie: "Ticket prepare et contenu copie. Collez-le dans votre email si necessaire.",
      },
      footer: '© 2026 JFnNote - Fait avec soin a Douala par Donkeng Alida',
    },
    en: {
      accueil: 'Home',
      fonctions: 'Features',
      connexion: 'Sign in',
      aide: 'Help',
      voirDetails: 'View details',
      retourAccueil: 'Back to home',
      pageInconnue: 'Feature not found.',
      ceQueVousPouvezFaire: 'What you can do',
      pourquoiCestUtile: 'Why this is useful',
      essayerMaintenant: 'Try it now',
      titre: 'Manage your grades with precision',
      description: 'JFnNote helps you enter, track and understand your grades with clarity.',
      btnPrincipal: 'Get started',
      titreSection: 'A clear way to manage results',
      sousTitre: 'A simple and reliable space to stay in control.',
      cartes: [
        { slug: 'saisie-rapide', titre: 'Fast entry', desc: 'Enter grades in a few seconds.', icone: Edit3 },
        { slug: 'analyse-lisible', titre: 'Readable analysis', desc: 'Clear trends and visuals.', icone: TrendingUp },
        { slug: 'tableau-de-bord', titre: 'Dashboard', desc: 'All averages in one place.', icone: Gauge },
        { slug: 'securite-renforcee', titre: 'Stronger security', desc: 'Your data stays protected.', icone: Shield },
      ],
      featurePages: {
        'saisie-rapide': {
          title: 'Fast Entry',
          intro: 'Enter marks quickly with a simple form and built-in input checks.',
          ctaLabel: 'Open teacher space',
          ctaPath: '/enseignant',
          actions: ['Enter marks by subject and cycle', 'Edit a mark instantly', 'Validate updates quickly'],
          benefits: ['Time saving for teachers', 'Fewer data entry mistakes', 'Smoother administrative flow'],
          validationTitle: 'Validation rules',
          validationRules: [
            'Mark must be between 0 and 20.',
            'Cycle, subject and student are required.',
            'Check decimal format (example: 12.5).',
          ],
          commonErrorsTitle: 'Common mistakes',
          commonErrors: [
            'Wrong student selected.',
            'Confusion between similar subjects.',
            'Mark not saved before leaving page.',
          ],
          bestPracticesTitle: 'Best practices',
          bestPractices: [
            'Enter marks class by class to stay consistent.',
            'Review extreme values before final validation.',
            'Use sharing only after final verification.',
          ],
        },
        'analyse-lisible': {
          title: 'Readable Analysis',
          intro: 'Understand trends with clear views to support better academic decisions.',
          ctaLabel: 'Open coordinator space',
          ctaPath: '/coordonnateur',
          actions: ['Review results by period', 'Compare performance by class', 'Detect risk signals early'],
          benefits: ['Faster decisions', 'Better academic monitoring', 'Clear communication for stakeholders'],
          kpiTitle: 'KPIs to monitor',
          kpiItems: [
            'Overall average by class and subject.',
            'Progression rate over the period.',
            'Number of students below alert threshold.',
          ],
          interpretationTitle: 'Quick interpretation',
          interpretationRules: [
            'Average declining: check the most impacted subject.',
            'High spread: target students in difficulty.',
            'Stable progression: maintain current strategy.',
          ],
          recommendedActionsTitle: 'Recommended actions',
          recommendedActions: [
            'Schedule support sessions for low-performing groups.',
            'Share a summary with coordinators.',
            'Track critical cases week by week.',
          ],
        },
        'tableau-de-bord': {
          title: 'Dashboard',
          intro: 'Centralize key indicators in one place to drive daily operations.',
          ctaLabel: 'Open admin dashboard',
          ctaPath: '/admin/comptes',
          actions: ['Track active accounts', 'View pending marks and requests', 'Access priority actions quickly'],
          benefits: ['Immediate global view', 'Efficient prioritization', 'Better operational responsiveness'],
          priorityViewTitle: 'Priority view',
          priorityViewItems: [
            'Items pending that must be handled first.',
            'Today operational alerts.',
            'Urgent actions at a glance.',
          ],
          dailyChecklistTitle: 'Daily checklist',
          dailyChecklist: [
            'Review unvalidated marks.',
            'Review pending requests.',
            'Confirm newly created accounts.',
          ],
          executionTipsTitle: 'Execution tips',
          executionTips: [
            'Handle urgent tasks before comfort tasks.',
            'Refresh data before decisions.',
            'Document sensitive operations.',
          ],
        },
        'securite-renforcee': {
          title: 'Stronger Security',
          intro: 'Protect school data with controlled access, secure authentication, and action traceability.',
          ctaLabel: 'Open superuser space',
          ctaPath: '/superuser',
          actions: ['Restrict permissions by role', 'Manage active sessions', 'Log sensitive actions'],
          benefits: ['Safer educational data', 'Higher reliability and compliance', 'Increased user trust'],
          preventionTitle: 'Preventive controls',
          preventionItems: [
            'Strong and regularly updated passwords.',
            'Strict role-based access control.',
            'Permission check before sharing.',
          ],
          incidentTitle: 'Incident response',
          incidentSteps: [
            'Identify suspicious account or action.',
            'Immediately suspend impacted access.',
            'Notify support team with logs.',
          ],
          auditTitle: 'Audit and monitoring',
          auditItems: [
            'Periodic review of action logs.',
            'Inactive accounts control.',
            'Transfer flow verification.',
          ],
        },
      },
      help: {
        titre: 'Help Center',
        intro: 'This page provides step-by-step guidance based on your user role.',
        demarrageTitre: 'Quick start',
        demarrage: [
          'Choose your profile and sign in.',
          'Open your workspace (marks, requests, accounts).',
          'Perform your main action and confirm success message.',
        ],
        actionsRapidesTitre: 'Quick actions',
        actionsRapides: [
          { label: 'Open Admin', desc: 'Manage accounts, marks and requests.', path: '/admin/comptes' },
          { label: 'Teacher Space', desc: 'Marks entry and follow-up.', path: '/enseignant' },
          { label: 'Student Space', desc: 'View marks and submit requests.', path: '/etudiant' },
          { label: 'Profile selector', desc: 'Switch role quickly.', path: '/choix-profil' },
        ],
        roles: [
          { role: 'Admin', points: ['Create accounts', 'Validate and share marks', 'Process requests'] },
          { role: 'Teacher', points: ['Enter marks', 'Monitor classes', 'Fix issues if needed'] },
          { role: 'Student / Parent', points: ['View marks', 'Follow updates', 'Submit requests when needed'] },
          { role: 'Coordinator / IT Cell', points: ['Monitor flows', 'Check consistency', 'Assist users'] },
        ],
        faqTitre: 'Frequently asked questions',
        rechercherFaq: 'Search a question...',
        faqAucunResultat: 'No answer matches your search.',
        faq: [
          { q: "I can't sign in, what should I do?", a: 'Check email, password and role. If the issue continues, contact the administrator.' },
          { q: "Why isn't a mark visible?", a: 'The mark may not be shared to the correct target. Check sharing options.' },
          { q: 'How do I switch language?', a: 'Use the FR/EN buttons at the top of the page.' },
        ],
        depannageTitre: 'Common troubleshooting',
        depannage: [
          {
            probleme: "Can't sign in",
            actions: ['Check email/password.', 'Check selected role.', 'Try again after sign out/sign in.'],
          },
          {
            probleme: 'Mark not visible',
            actions: ['Check if mark is saved.', 'Check sharing options.', 'Verify destination workspace.'],
          },
          {
            probleme: "PDF attachment won't open",
            actions: ['Check internet connection.', 'Try the download button.', 'Retry from another browser.'],
          },
          {
            probleme: 'Slow or frozen page',
            actions: ['Refresh the page.', 'Clear browser cache.', 'Contact support with the error message.'],
          },
        ],
        supportTitre: 'Support',
        supportTexte: 'If blocked, capture your screen and send details (page, action, error message) to the support team.',
        assistantTitre: 'Help assistant',
        assistantIntro: 'Ask a simple question and get immediate guidance.',
        assistantBienvenue: 'Hello, I can help you. Describe your issue in a few words.',
        assistantBot: 'Assistant',
        assistantVous: 'You',
        assistantEnvoyer: 'Send',
        assistantPlaceholder: "Example: I can't sign in",
        assistantSuggestions: [
          "I can't sign in",
          "I can't see my mark",
          "The PDF won't open",
          'The page is slow',
        ],
        assistantConnexion: 'Check your credentials, selected role and internet connection, then sign out and sign in again.',
        assistantNotes: 'Check if the mark is saved and if sharing options are enabled to the correct target.',
        assistantPdf: 'Try the download button first, then test another browser if the issue persists.',
        assistantLenteur: 'Refresh the page, clear browser cache, and reduce the number of open tabs.',
        assistantRole: 'Check your active profile in the app. If needed, go back to profile selection and switch role.',
        assistantDefaut: 'Please specify: sign in, mark visibility, PDF, slowness, or role. I will guide you.',
        supportEmail: 'support@jfnnote.app',
        ticketBouton: 'Create support ticket',
        ticketSujet: 'JFnNote support ticket',
        ticketIntro: 'Hello support team, here are the details of my issue:',
        ticketCree: 'Ticket prepared. Your mail app is being opened.',
        ticketCreeEtCopie: 'Ticket prepared and content copied. Paste it into your email if needed.',
      },
      footer: '© 2026 JFnNote - Crafted with care in Douala by Donkeng Alida',
    },
  };

  const t = traductions[langue];
  const isDark = theme === 'dark';

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
        path="/fonctionnalites/:slug"
        element={
          <FeaturePage
            isDark={isDark}
            theme={theme}
            langue={langue}
            setLangue={setLangue}
            toggleTheme={toggleTheme}
            t={t}
          />
        }
      />
      <Route
        path="/aide"
        element={
          <HelpPage
            isDark={isDark}
            theme={theme}
            langue={langue}
            setLangue={setLangue}
            toggleTheme={toggleTheme}
            t={t}
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
        path="/admin/comptes"
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
        path="/admin/comptes-actifs"
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
        path="/admin/comptes-inactifs"
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
        path="/admin/notes"
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
        path="/admin/requetes"
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
        path="/superuser"
        element={
          <SuperuserPage
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
        path="/etudiant"
        element={
          <StudentPage
            theme={theme}
            langue={langue}
            onToggleTheme={toggleTheme}
            onLangueChange={setLangue}
          />
        }
      />
      <Route
        path="/parent"
        element={
          <ParentPage
            theme={theme}
            langue={langue}
            onToggleTheme={toggleTheme}
            onLangueChange={setLangue}
          />
        }
      />
      <Route
        path="/cellule-info"
        element={
          <CelluleInfoPage
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

