import React from 'react';

export const AmbientFX: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 cyber-grid opacity-15 dark:opacity-30" />

      {/* Atmospheric radial glows */}
      <div className="absolute -top-40 left-1/4 w-96 h-96 bg-[#FF6FB5]/10 dark:bg-[#FF6FB5]/20 rounded-full blur-3xl" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-[#00E5FF]/10 dark:bg-[#00E5FF]/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 left-1/3 w-125 h-125 bg-[#FFD54F]/10 dark:bg-[#7C4DFF]/15 rounded-full blur-3xl" />

      {/* CRT scanlines in dark mode only */}
      <div className="hidden dark:block absolute inset-0 scanlines opacity-30" />

      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/5 dark:to-[#0D0714]/80" />
    </div>
  );
};
