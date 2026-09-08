import React from "react";
import { useTournament } from "../../context/TournamentContext";
import {
  LayoutDashboard,
  Shield,
  Swords,
  ClipboardList,
  Trophy,
  Settings,
  FileText,
  LogOut,
  ExternalLink,
  Lock,
  Sun,
  Moon,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { activeTab, setActiveTab, logoutAdmin, theme, setTheme } = useTournament();

  /*
   * =========================================================
   * ADMIN THEME
   * =========================================================
   *
   * Theme is stored in localStorage so it remains after refresh.
   *
   * IMPORTANT:
   * The "dark" / "light" class is applied to <html>,
   * because index.css uses:
   *
   * html.dark
   * html.light
   *
   * and Tailwind uses:
   *
   * @custom-variant dark (&:where(.dark, .dark *));
   */

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  /*
   * =========================================================
   * ADMIN NAVIGATION
   * =========================================================
   */

  const navTabs = [
    {
      id: "admin",
      label: "DASHBOARD",
      icon: LayoutDashboard,
    },
    {
      id: "admin-teams",
      label: "SQUADS & PLAYERS",
      icon: Shield,
    },
    {
      id: "admin-matches",
      label: "MATCH SCHEDULE",
      icon: Swords,
    },
    {
      id: "admin-results",
      label: "ENTER RESULTS / CSV",
      icon: ClipboardList,
    },
    {
      id: "admin-finals",
      label: "FINALS GENERATOR",
      icon: Trophy,
    },
    {
      id: "admin-rules",
      label: "RULES EDITOR",
      icon: FileText,
    },
    {
      id: "admin-settings",
      label: "ENGINE SETTINGS",
      icon: Settings,
    },
  ];

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        theme === "dark"
          ? "bg-[#06020c] text-white"
          : "bg-[#fff5f0] text-black"
      }`}
    >
      {/* =====================================================
          ADMIN TOP NAVIGATION BAR
          ===================================================== */}

      <div
        className={`sticky top-0 z-30 border-b-2 border-[#ff007f] transition-colors duration-200 ${
          theme === "dark"
            ? "bg-[#0e061c] shadow-[0_4px_20px_rgba(255,0,127,0.2)]"
            : "bg-white shadow-[0_4px_20px_rgba(255,0,127,0.12)]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* =================================================
              TOP ROW
              ================================================= */}

          <div className="flex items-center justify-between h-16 gap-3">
            {/* LEFT TITLE */}

            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-9 h-9 shrink-0 comic-border-sm flex items-center justify-center transition-colors duration-200 ${
                  theme === "dark"
                    ? "bg-[#210e3d]"
                    : "bg-white"
                }`}
              >
                <Lock className="w-5 h-5 text-[#ff007f]" />
              </div>

              <div className="min-w-0">
                <span
                  className={`font-headline text-xl sm:text-2xl tracking-wider ${
                    theme === "dark"
                      ? "text-white"
                      : "text-black"
                  }`}
                >
                  MISSION CONTROL
                </span>

                <span
                  className={`hidden sm:inline-block ml-2 px-1.5 py-0.5 text-[10px] font-mono border ${
                    theme === "dark"
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                      : "bg-emerald-500/10 text-emerald-700 border-emerald-500/40"
                  }`}
                >
                  ROOT ADJUDICATOR
                </span>
              </div>
            </div>

            {/* =================================================
                RIGHT QUICK ACTIONS
                ================================================= */}

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* THEME TOGGLE */}

              <button
                type="button"
                onClick={toggleTheme}
                className={`px-2.5 sm:px-3 py-1.5 border font-headline text-xs tracking-wider flex items-center gap-1.5 cursor-pointer transition-all duration-200 ${
                  theme === "dark"
                    ? "bg-white/5 hover:bg-white/10 text-zinc-300 border-zinc-700"
                    : "bg-black/5 hover:bg-black/10 text-zinc-800 border-zinc-400"
                }`}
                title={
                  theme === "dark"
                    ? "Switch to Light Mode"
                    : "Switch to Dark Mode"
                }
                aria-label={
                  theme === "dark"
                    ? "Switch to Light Mode"
                    : "Switch to Dark Mode"
                }
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="hidden sm:inline">
                      LIGHT
                    </span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="hidden sm:inline">
                      DARK
                    </span>
                  </>
                )}
              </button>

              {/* PUBLIC PORTAL */}

              <button
                type="button"
                onClick={() => setActiveTab("home")}
                className={`px-2.5 sm:px-3 py-1.5 border font-headline text-xs tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors ${
                  theme === "dark"
                    ? "bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border-zinc-700"
                    : "bg-black/5 hover:bg-black/10 text-zinc-800 hover:text-black border-zinc-400"
                }`}
                title="View Public Website"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#00f5ff]" />

                <span className="hidden sm:inline">
                  PUBLIC PORTAL
                </span>
              </button>

              {/* LOGOUT */}

              <button
                type="button"
                onClick={logoutAdmin}
                className="px-2.5 sm:px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/60 font-headline text-xs tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />

                <span className="hidden sm:inline">
                  LOGOUT
                </span>
              </button>
            </div>
          </div>

          {/* =================================================
              SUB NAVIGATION TABS
              ================================================= */}

          <div
            className={`flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-t pt-1 ${
              theme === "dark"
                ? "border-zinc-800/80"
                : "border-zinc-300"
            }`}
          >
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 font-headline text-sm tracking-wider flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all ${
                    isActive
                      ? "bg-[#ff007f] text-white shadow-[0_0_12px_rgba(255,0,127,0.4)]"
                        : theme === "dark"
                        ? "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                        : "text-zinc-600 hover:text-black hover:bg-black/5"
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive
                        ? "text-white"
                        : theme === "dark"
                          ? "text-zinc-400"
                          : "text-zinc-600"
                    }`}
                  />

                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* =====================================================
          MAIN CONTENT AREA
          ===================================================== */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};