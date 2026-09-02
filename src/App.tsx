import React from 'react';
import { TournamentProvider, useTournament } from './context/TournamentContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AmbientFX } from './components/AmbientFX';
import { MatchScoreModal } from './components/MatchScoreModal';
import { Monitor, ArrowLeft, ShieldAlert } from 'lucide-react';

// Public Pages
import { HomePage } from './pages/HomePage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { GroupsPage } from './pages/GroupsPage';
import { MatchesPage } from './pages/MatchesPage';
import { FinalsPage } from './pages/FinalsPage';
import { TeamsPage } from './pages/TeamsPage';
import { TeamDetailPage } from './pages/TeamDetailPage';
import { RulesPage } from './pages/RulesPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminTeamsPage } from './pages/admin/AdminTeamsPage';
import { AdminMatchesPage } from './pages/admin/AdminMatchesPage';
import { AdminResultsPage } from './pages/admin/AdminResultsPage';
import { AdminFinalsPage } from './pages/admin/AdminFinalsPage';
import { AdminRulesPage } from './pages/admin/AdminRulesPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab, isAdminAuthenticated, toast } = useTournament();

  const isAdminTab = activeTab.startsWith('admin');

  const renderContent = () => {
    // Admin routing - Strictly accessible through desktop workstations
    if (isAdminTab) {
      return (
        <>
          {/* Mobile Access Notice: Exclude admin panel on mobile devices */}
          <div className="lg:hidden min-h-[80vh] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#150A24] border-4 border-black shadow-[8px_8px_0px_0px_#000] p-6 sm:p-8 max-w-md w-full text-center space-y-4">
              <div className="w-16 h-16 bg-[#FF6FB5] border-3 border-black shadow-[3px_3px_0px_0px_#000] mx-auto flex items-center justify-center text-white">
                <Monitor className="w-8 h-8 text-white" />
              </div>
              <div className="inline-block px-3 py-1 bg-[#FFD54F] border-2 border-black font-headline font-bold text-xs uppercase text-black shadow-[1px_1px_0px_0px_#000]">
                DESKTOP EXCLUSIVE
              </div>
              <h2 className="font-headline text-3xl sm:text-4xl text-zinc-950 dark:text-white tracking-wide">
                ADMIN PANEL
              </h2>
              <p className="text-sm font-display text-zinc-700 dark:text-zinc-300 leading-relaxed">
                The tournament referee, match telemetry, and room adjudication console is restricted to desktop workstations. Please access from a computer or desktop browser.
              </p>
              <button
                onClick={() => setActiveTab('home')}
                className="w-full py-3 bg-[#00E5FF] hover:bg-[#FFD54F] text-black font-headline text-lg tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000] transition-all cursor-pointer font-bold flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                RETURN TO TOURNAMENT HUB
              </button>
            </div>
          </div>

          {/* Desktop Workstation View */}
          <div className="hidden lg:block">
            {!isAdminAuthenticated ? (
              <AdminLoginPage />
            ) : (
              <AdminLayout>
                {activeTab === 'admin' && <AdminDashboardPage />}
                {activeTab === 'admin-teams' && <AdminTeamsPage />}
                {activeTab === 'admin-matches' && <AdminMatchesPage />}
                {activeTab === 'admin-results' && <AdminResultsPage />}
                {activeTab === 'admin-finals' && <AdminFinalsPage />}
                {activeTab === 'admin-rules' && <AdminRulesPage />}
                {activeTab === 'admin-settings' && <AdminSettingsPage />}
              </AdminLayout>
            )}
          </div>
        </>
      );
    }

    // Public routing
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'leaderboard':
        return <LeaderboardPage />;
      case 'groups':
        return <GroupsPage />;
      case 'matches':
        return <MatchesPage />;
      case 'finals':
        return <FinalsPage />;
      case 'teams':
        return <TeamsPage />;
      case 'team-detail':
        return <TeamDetailPage />;
      case 'rules':
        return <RulesPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5F0] text-zinc-900 dark:bg-[#0D0714] dark:text-[#f8fafc] flex flex-col relative selection:bg-[#FF6FB5] selection:text-white transition-colors duration-200">
      {/* Visual Ambient Effects (Halftone, Scanline, CRT glow) */}
      <AmbientFX />

      {/* Public Navigation Bar */}
      {!isAdminTab && <Navbar />}

      {/* Main Page Area */}
      <main className="flex-1 z-10">
        {renderContent()}
      </main>

      {/* Public Footer */}
      {!isAdminTab && <Footer />}

      {/* Global Match Score Detail Modal */}
      <MatchScoreModal />

      {/* Global Floating Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 font-mono text-xs comic-border-sm flex items-center gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.8)] transition-all animate-bounce ${
            toast.type === 'error'
              ? 'bg-red-950 text-red-200 border-red-500'
              : toast.type === 'success'
              ? 'bg-emerald-950 text-emerald-200 border-emerald-500'
              : 'bg-[#150a2e] text-[#00f5ff] border-[#00f5ff]'
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              toast.type === 'error'
                ? 'bg-red-400'
                : toast.type === 'success'
                ? 'bg-emerald-400'
                : 'bg-[#00f5ff]'
            }`}
          />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <TournamentProvider>
      <AppContent />
    </TournamentProvider>
  );
}
