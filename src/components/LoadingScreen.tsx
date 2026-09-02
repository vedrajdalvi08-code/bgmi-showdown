import React, { useEffect, useState } from 'react';
import { Crosshair, Shield, Zap } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
}

const BGMI_TIPS = [
  'DEPLOYING TACTICAL COMBAT GRID // ERANGEL SECTOR 4',
  'SMOKE ROTATIONS MAXIMIZE ZONE SURVIVABILITY // SECURE HIGH GROUND',
  'AIRDROP INCOMING: AWM & LEVEL 3 ARMOR DETECTED',
  'SYNCHRONIZING AUTHORITATIVE KILL FEEDS & MATCH TELEMETRY...',
  'CALCULATING SQUAD PLACEMENTS AND FRAGGING LEADERBOARDS...'
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(12);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % BGMI_TIPS.length);
    }, 700);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          clearInterval(tipInterval);
          setTimeout(onComplete, 300);
          return 100;
        }
        return prev + Math.floor(Math.random() * 25) + 10;
      });
    }, 150);

    return () => {
      clearInterval(tipInterval);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-[#07040e] flex flex-col items-center justify-center p-6 select-none">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 cyber-grid opacity-20" />
      <div className="absolute inset-0 scanlines opacity-60" />

      {/* Center Tactical Box */}
      <div className="relative z-10 max-w-md w-full bg-[#110925]/90 comic-border p-8 text-center space-y-6">
        {/* Glowing Crest */}
        <div className="relative mx-auto w-20 h-20 bg-[#1a0c36] comic-border-sm flex items-center justify-center">
          <Crosshair className="w-10 h-10 text-[#00f5ff] animate-spin" style={{ animationDuration: '6s' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="w-5 h-5 text-[#ff007f] animate-pulse" />
          </div>
        </div>

        <div>
          <h1 className="font-headline text-4xl text-white tracking-widest neon-text-pink">
            BGMI SHOWDOWN
          </h1>
          <p className="font-marker text-[#00f5ff] text-sm tracking-wider mt-1">
            OFFICIAL ESPORTS PROTOCOL
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="h-3 w-full bg-[#07040e] border border-[#00f5ff]/40 rounded-none overflow-hidden p-0.5">
            <div
              className="h-full transition-all duration-200"
              style={{
                width: `${Math.min(100, progress)}%`,
                background: 'linear-gradient(90deg, #ff007f 0%, #b967ff 50%, #00f5ff 100%)'
              }}
            />
          </div>
          <div className="flex justify-between items-center text-xs font-display text-zinc-400">
            <span className="flex items-center gap-1 text-[#ffe600]">
              <Shield className="w-3 h-3" /> SECURE GRID
            </span>
            <span className="text-[#00f5ff] font-bold">{Math.min(100, progress)}%</span>
          </div>
        </div>

        {/* Tactical Tip */}
        <div className="flex items-center justify-center" style={{ minHeight: '40px' }}>
          <p className="text-xs font-mono text-zinc-400 uppercase tracking-wide animate-pulse">
            {BGMI_TIPS[tipIndex]}
          </p>
        </div>
      </div>
    </div>
  );
};
