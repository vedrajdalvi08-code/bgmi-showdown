import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { Lock, Shield, ArrowLeft, AlertTriangle, Key, Terminal } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { loginAdmin, setActiveTab, showToast } = useTournament();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter the administrator password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Authentication rejected');
        showToast(data.error || 'Login failed', 'error');
        return;
      }

      loginAdmin(data.token);
      setActiveTab('admin');
    } catch (err: any) {
      setError(err.message || 'Network error during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#0d061c] comic-border-xl p-8 relative overflow-hidden space-y-6">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-[#ff007f]">
            <Terminal className="w-4 h-4" />
            <span>AUTHORITATIVE ACCESS PROTOCOL</span>
          </div>
          <button
            onClick={() => setActiveTab('home')}
            className="text-xs font-mono text-zinc-500 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3" /> RETURN
          </button>
        </div>

        {/* Lock Graphic */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-[#1b0d36] comic-border-sm mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8 text-[#ff007f] animate-pulse" />
          </div>
          <h2 className="font-headline text-3xl text-white tracking-wider">
            MISSION CONTROL LOGIN
          </h2>
          <p className="text-xs font-display text-zinc-400">
            Adjudication & tournament operations restricted to authenticated organizers.
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3 bg-red-900/30 border border-red-500 text-red-200 text-xs font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-zinc-400 uppercase tracking-widest mb-1.5">
              ADMIN KEY / SECURITY PASSPHRASE
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="admin-password-input"
                type="password"
                placeholder="Enter admin password..."
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
                className="w-full bg-[#150a2e] border border-zinc-700 focus:border-[#ff007f] text-white pl-9 pr-4 py-2.5 font-mono text-sm placeholder-zinc-500 outline-none transition-colors"
              />
            </div>
            <p className="text-[11px] font-mono text-zinc-500 mt-1.5">
              Default password: <code className="text-[#00f5ff] bg-black/40 px-1 py-0.5">admin123</code> (configurable in Settings or .env)
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-linear-to-r from-[#ff007f] to-[#b967ff] hover:from-[#ff1a8c] hover:to-[#c780ff] text-white font-headline text-lg tracking-wider comic-border-sm cursor-pointer disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,0,127,0.3)]"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                VERIFYING CLEARANCE...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" /> AUTHENTICATE & ENTER
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-zinc-900 text-center">
          <p className="text-[11px] font-mono text-zinc-500">
            5 failed attempts trigger a temporary IP lockout to protect match integrity.
          </p>
        </div>
      </div>
    </div>
  );
};
