import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { EmailInboxModal } from './components/EmailInboxModal';
import { EmailDeliveryConfigModal } from './components/EmailDeliveryConfigModal';
import { SecurityTestPanel } from './components/SecurityTestPanel';
import { CampusBackground } from './components/CampusBackground';
import { ProblemStatementsModal } from './components/ProblemStatementsModal';
import { HackathonTimelineModal } from './components/HackathonTimelineModal';
import { ResearchBenchmarkModal } from './components/ResearchBenchmarkModal';
import { BackgroundThemeId, BackgroundContrast } from './types/theme';
import { MainLoginView } from './views/MainLoginView';
import { StudentPortalView } from './views/StudentPortalView';
import { FacultyLoginView } from './views/FacultyLoginView';
import { AdminLoginView } from './views/AdminLoginView';
import { ActivationView } from './views/ActivationView';
import { ForgotPasswordView } from './views/ForgotPasswordView';
import { StudentDashboard } from './views/StudentDashboard';
import { FacultyDashboard } from './views/FacultyDashboard';
import { FacultyRegisterView } from './views/FacultyRegisterView';
import { AdminDashboard } from './views/AdminDashboard';
import { checkSession, logoutUser } from './services/api';
import { AuthenticatedUser } from './types/auth';

type ViewMode =
  | 'MAIN_LOGIN'
  | 'STUDENT_PORTAL'
  | 'FACULTY_PORTAL'
  | 'FACULTY_REGISTER'
  | 'ADMIN_PORTAL'
  | 'ACTIVATION'
  | 'FORGOT_PASSWORD'
  | 'STUDENT_DASHBOARD'
  | 'FACULTY_DASHBOARD'
  | 'ADMIN_DASHBOARD';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('MAIN_LOGIN');
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
  const [activationToken, setActivationToken] = useState<string>('');
  const [resetToken, setResetToken] = useState<string>('');
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailConfigOpen, setEmailConfigOpen] = useState(false);
  const [configDefaultEmail, setConfigDefaultEmail] = useState('');
  const [testBenchOpen, setTestBenchOpen] = useState(false);
  const [problemStatementsOpen, setProblemStatementsOpen] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [researchBenchmarkOpen, setResearchBenchmarkOpen] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Background Theme & Atmospheric Scrim State (Defaults to exact Red Noir style)
  const [bgTheme, setBgTheme] = useState<BackgroundThemeId>(() => {
    try {
      const saved = localStorage.getItem('srm_portal_bg_theme');
      if (
        saved &&
        ['red-noir', 'campus-exterior', 'campus-atrium', 'oxford-navy', 'architectural-blueprint', 'pearl-slate'].includes(saved)
      ) {
        return saved as BackgroundThemeId;
      }
    } catch (e) {}
    return 'red-noir';
  });

  // Sync global body classes for floating modals and portals
  useEffect(() => {
    if (bgTheme === 'red-noir') {
      document.body.classList.add('theme-red-noir', 'selection-red');
    } else {
      document.body.classList.remove('theme-red-noir', 'selection-red');
    }
  }, [bgTheme]);

  const [bgContrast, setBgContrast] = useState<BackgroundContrast>(() => {
    try {
      const saved = localStorage.getItem('srm_portal_bg_contrast');
      if (saved && ['subtle', 'balanced', 'high'].includes(saved)) {
        return saved as BackgroundContrast;
      }
    } catch (e) {}
    return 'balanced';
  });

  const handleThemeChange = (newTheme: BackgroundThemeId) => {
    setBgTheme(newTheme);
    try {
      localStorage.setItem('srm_portal_bg_theme', newTheme);
    } catch (e) {}
  };

  const handleContrastChange = (newContrast: BackgroundContrast) => {
    setBgContrast(newContrast);
    try {
      localStorage.setItem('srm_portal_bg_contrast', newContrast);
    } catch (e) {}
  };

  const handleOpenEmailConfig = (defaultEmail?: string) => {
    if (defaultEmail) setConfigDefaultEmail(defaultEmail);
    setEmailConfigOpen(true);
  };

  // Initialize session and URL parameter routing
  useEffect(() => {
    let isMounted = true;

    // Safety fallback: Never keep user stuck on loading screen longer than 1.8 seconds
    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        setInitializing(false);
      }
    }, 1800);

    const handleUrlRouting = (): boolean => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        let hash = window.location.hash || '';
        if (hash.startsWith('#')) hash = hash.substring(1);
        const hashParams = new URLSearchParams(hash.includes('?') ? hash.substring(hash.indexOf('?')) : hash);

        const path = window.location.pathname.toLowerCase();
        const isResetPath = path.includes('/reset');
        const isActivatePath = path.includes('/activate');

        const resToken =
          searchParams.get('reset') ||
          searchParams.get('resetToken') ||
          searchParams.get('reset_token') ||
          hashParams.get('reset') ||
          hashParams.get('resetToken') ||
          hashParams.get('reset_token') ||
          (isResetPath ? (searchParams.get('token') || hashParams.get('token')) : null) ||
          (searchParams.get('type') === 'reset' ? searchParams.get('token') : null);

        const actToken =
          searchParams.get('activate') ||
          searchParams.get('activation_token') ||
          hashParams.get('activate') ||
          hashParams.get('activation_token') ||
          (isActivatePath ? (searchParams.get('token') || hashParams.get('token')) : null) ||
          (!isResetPath && !resToken ? (searchParams.get('token') || hashParams.get('token')) : null);

        if (resToken) {
          setResetToken(resToken);
          setCurrentView('FORGOT_PASSWORD');
          setInitializing(false);
          return true;
        }

        if (actToken) {
          setActivationToken(actToken);
          setCurrentView('ACTIVATION');
          setInitializing(false);
          return true;
        }

        if (searchParams.get('register') === 'faculty' || path.includes('/register-faculty')) {
          setCurrentView('FACULTY_REGISTER');
          setInitializing(false);
          return true;
        }

        if (isResetPath) {
          setCurrentView('FORGOT_PASSWORD');
          setInitializing(false);
          return true;
        }
      } catch (err) {
        console.warn('URL routing parse error:', err);
      }

      return false;
    };

    if (handleUrlRouting()) {
      clearTimeout(safetyTimer);
      return;
    }

    // Listen to hash and history navigation
    const handleNavEvent = () => {
      handleUrlRouting();
    };
    window.addEventListener('popstate', handleNavEvent);
    window.addEventListener('hashchange', handleNavEvent);

    // Verify existing session
    checkSession()
      .then((res) => {
        if (!isMounted) return;
        if (res.authenticated && res.user) {
          setCurrentUser(res.user);
          navigateToDashboard(res.user.role);
        } else {
          setCurrentView('MAIN_LOGIN');
        }
      })
      .catch((err) => {
        console.warn('Session verification fallback:', err);
        if (isMounted) setCurrentView('MAIN_LOGIN');
      })
      .finally(() => {
        clearTimeout(safetyTimer);
        if (isMounted) setInitializing(false);
      });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
      window.removeEventListener('popstate', handleNavEvent);
      window.removeEventListener('hashchange', handleNavEvent);
    };
  }, []);

  const navigateToDashboard = (role: 'STUDENT' | 'FACULTY' | 'ADMIN') => {
    if (role === 'STUDENT') setCurrentView('STUDENT_DASHBOARD');
    else if (role === 'FACULTY') setCurrentView('FACULTY_DASHBOARD');
    else if (role === 'ADMIN') setCurrentView('ADMIN_DASHBOARD');
    else setCurrentView('MAIN_LOGIN');
  };

  const handleLoginSuccess = (user: AuthenticatedUser) => {
    setCurrentUser(user);
    navigateToDashboard(user.role);
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setCurrentView('MAIN_LOGIN');
  };

  const handleOpenActivation = (token: string) => {
    setActivationToken(token);
    setCurrentView('ACTIVATION');
  };

  const handleOpenReset = (token: string) => {
    setResetToken(token);
    setCurrentView('FORGOT_PASSWORD');
  };

  if (initializing) {
    return (
      <div className={`relative min-h-screen flex items-center justify-center p-4 overflow-hidden ${bgTheme === 'red-noir' ? 'theme-red-noir bg-black text-white selection-red font-inter' : ''}`}>
        <CampusBackground themeId={bgTheme} contrast="high" />
        <div className="relative z-10 text-center space-y-4 max-w-sm p-8 rounded-2xl bg-zinc-950/80 border border-white/10 shadow-2xl backdrop-blur-xl">
          <div className="w-14 h-14 rounded-2xl bg-black border border-[#ef233c] text-[#ef233c] font-manrope font-bold text-2xl flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(239,35,60,0.4)] animate-pulse">
            SRM
          </div>
          <div>
            <h2 className="text-sm font-manrope font-bold text-white uppercase tracking-wider">
              SRM Institute of Science and Technology
            </h2>
            <p className="text-xs text-zinc-400 mt-1 font-inter">
              Loading Institutional Gateway...
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => setInitializing(false)}
              className="text-xs text-zinc-400 hover:text-[#ef233c] underline underline-offset-2 transition-colors cursor-pointer"
            >
              Click here to proceed directly to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative min-h-screen flex flex-col antialiased selection-red font-inter ${bgTheme === 'red-noir' ? 'theme-red-noir bg-transparent text-white' : 'text-slate-800'}`}>
      {/* Dynamic Collegiate Campus Background */}
      <CampusBackground themeId={bgTheme} contrast={bgContrast} />

      {/* Institutional Header */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenEmailInbox={() => setEmailModalOpen(true)}
        onOpenEmailConfig={() => handleOpenEmailConfig()}
        onOpenTestBench={() => setTestBenchOpen(true)}
        onNavigateHome={() => {
          if (currentUser) {
            navigateToDashboard(currentUser.role);
          } else {
            setCurrentView('MAIN_LOGIN');
          }
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10">
        {currentView === 'MAIN_LOGIN' && (
          <MainLoginView
            onLoginSuccess={handleLoginSuccess}
            onSelectStudentPortal={() => setCurrentView('STUDENT_PORTAL')}
            onSelectFacultyPortal={() => setCurrentView('FACULTY_PORTAL')}
            onSelectAdminPortal={() => setCurrentView('ADMIN_PORTAL')}
            onForgotPassword={() => {
              setResetToken('');
              setCurrentView('FORGOT_PASSWORD');
            }}
            onOpenProblems={() => setProblemStatementsOpen(true)}
            onOpenTimeline={() => setTimelineOpen(true)}
            onOpenEmailInbox={() => setEmailModalOpen(true)}
            onOpenBenchmark={() => setResearchBenchmarkOpen(true)}
          />
        )}

        {currentView === 'STUDENT_PORTAL' && (
          <StudentPortalView
            onLoginSuccess={handleLoginSuccess}
            onBackToMain={() => setCurrentView('MAIN_LOGIN')}
            onForgotPassword={() => {
              setResetToken('');
              setCurrentView('FORGOT_PASSWORD');
            }}
            onOpenEmailInbox={() => setEmailModalOpen(true)}
            onOpenProblems={() => setProblemStatementsOpen(true)}
            onOpenTimeline={() => setTimelineOpen(true)}
            onNavigateToActivation={handleOpenActivation}
            onOpenEmailConfig={handleOpenEmailConfig}
          />
        )}

        {currentView === 'FACULTY_PORTAL' && (
          <FacultyLoginView
            onLoginSuccess={handleLoginSuccess}
            onBackToMain={() => setCurrentView('MAIN_LOGIN')}
            onForgotPassword={() => {
              setResetToken('');
              setCurrentView('FORGOT_PASSWORD');
            }}
            onNavigateToRegister={() => setCurrentView('FACULTY_REGISTER')}
          />
        )}

        {currentView === 'FACULTY_REGISTER' && (
          <FacultyRegisterView
            onBack={() => {
              if (currentUser && currentUser.role === 'FACULTY') {
                setCurrentView('FACULTY_DASHBOARD');
              } else {
                setCurrentView('FACULTY_PORTAL');
              }
            }}
            onOpenEmailInbox={() => setEmailModalOpen(true)}
            onNavigateToActivation={handleOpenActivation}
          />
        )}

        {currentView === 'ADMIN_PORTAL' && (
          <AdminLoginView
            onLoginSuccess={handleLoginSuccess}
            onBackToMain={() => setCurrentView('MAIN_LOGIN')}
          />
        )}

        {currentView === 'ACTIVATION' && (
          <ActivationView
            token={activationToken}
            onActivationSuccess={(user) => {
              setCurrentUser(user);
            }}
            onGoToLogin={() => {
              setCurrentView('STUDENT_PORTAL');
            }}
            onGoToFacultyLogin={() => {
              setCurrentView('FACULTY_PORTAL');
            }}
          />
        )}

        {currentView === 'FORGOT_PASSWORD' && (
          <ForgotPasswordView
            resetToken={resetToken}
            onBackToLogin={() => setCurrentView('MAIN_LOGIN')}
            onOpenEmailInbox={() => setEmailModalOpen(true)}
          />
        )}

        {currentView === 'STUDENT_DASHBOARD' && currentUser && (
          <StudentDashboard
            user={currentUser}
            onLogout={handleLogout}
            onOpenTimeline={() => setTimelineOpen(true)}
            onOpenProblems={() => setProblemStatementsOpen(true)}
          />
        )}

        {currentView === 'FACULTY_DASHBOARD' && currentUser && (
          <FacultyDashboard
            user={currentUser}
            onLogout={handleLogout}
            onNavigateToFacultyRegister={() => setCurrentView('FACULTY_REGISTER')}
          />
        )}

        {currentView === 'ADMIN_DASHBOARD' && currentUser && (
          <AdminDashboard
            user={currentUser}
            onLogout={handleLogout}
            onOpenTestBench={() => setTestBenchOpen(true)}
            onOpenEmailInbox={() => setEmailModalOpen(true)}
            onOpenBenchmark={() => setResearchBenchmarkOpen(true)}
          />
        )}
      </main>

      {/* Institutional Footer */}
      <Footer />

      {/* Modals & Inspectors */}
      <EmailInboxModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        onNavigateToActivation={handleOpenActivation}
        onNavigateToReset={handleOpenReset}
        onOpenEmailConfig={() => handleOpenEmailConfig()}
      />

      <EmailDeliveryConfigModal
        isOpen={emailConfigOpen}
        onClose={() => setEmailConfigOpen(false)}
        defaultRecipientEmail={configDefaultEmail}
      />

      <SecurityTestPanel
        isOpen={testBenchOpen}
        onClose={() => setTestBenchOpen(false)}
      />

      {/* Integrated Floating Portals Dock (Always Accessible) */}

      {/* Problem Statements & Challenges Portal Modal */}
      <ProblemStatementsModal
        isOpen={problemStatementsOpen}
        onClose={() => setProblemStatementsOpen(false)}
      />

      {/* Hackathon Roadmap & Evaluation Rubrics Portal Modal */}
      <HackathonTimelineModal
        isOpen={timelineOpen}
        onClose={() => setTimelineOpen(false)}
      />

      {/* Empirical Research & Benchmark Suite Modal (Section 6) */}
      <ResearchBenchmarkModal
        isOpen={researchBenchmarkOpen}
        onClose={() => setResearchBenchmarkOpen(false)}
      />
    </div>
  );
}
