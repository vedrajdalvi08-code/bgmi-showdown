import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { FileText, Award, ShieldAlert, CheckCircle2, ChevronRight, Scale, Crosshair } from 'lucide-react';

export const RulesPage: React.FC = () => {
  const { rules, settings } = useTournament();
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(rules.map(r => r.category)))];

  const filteredRules = activeCategory === 'All'
    ? rules
    : rules.filter(r => r.category === activeCategory);

  const placementPoints = settings?.placement_points || {
    1: 10, 2: 6, 3: 5, 4: 4, 5: 3, 6: 2, 7: 1, 8: 1, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header */}
      <div className="border-b-4 border-black pb-6 text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF6FB5] text-white border-2 border-black shadow-[2px_2px_0px_0px_#000] font-headline text-xs tracking-widest uppercase font-bold">
          <Scale className="w-4 h-4 text-[#FFD54F]" /> KRAFTON ESPORTS COMPLIANCE CODE
        </div>
        <h1 className="font-headline text-5xl sm:text-7xl text-zinc-950 dark:text-white tracking-wider">
          OFFICIAL RULEBOOK & SCORING
        </h1>
        <p className="text-zinc-700 dark:text-zinc-300 text-sm font-display leading-relaxed">
          The definitive regulatory code governing room customs, authoritative point allocations, tie-breaking protocols, and anti-cheat policies.
        </p>
      </div>

      {/* OFFICIAL SCORING MATRIX SECTION */}
      <div className="bg-white dark:bg-[#150A24] border-3 border-black shadow-[6px_6px_0px_0px_#000] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4">
          <div>
            <div className="text-xs font-headline font-bold text-[#FF6FB5] uppercase tracking-widest flex items-center gap-1.5 mb-1">
              <Award className="w-4 h-4 text-black dark:text-[#FFD54F]" /> AUTHORITATIVE POINT MATRIX
            </div>
            <h2 className="font-headline text-3xl text-zinc-950 dark:text-white tracking-wide">
              PLACEMENT & FINISH POINT ALLOCATION
            </h2>
          </div>
          <div className="px-3.5 py-1.5 bg-[#FFD54F] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-black font-headline text-sm tracking-wider self-start sm:self-auto font-bold">
            1 FINISH = {settings?.kill_point_value || 1} POINT
          </div>
        </div>

        {/* 16 Placements Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
          {Array.from({ length: 16 }, (_, i) => i + 1).map(rank => {
            const pts = (placementPoints as any)[rank] ?? 0;
            return (
              <div
                key={rank}
                className={`p-3 text-center border-2 border-black transition-all ${
                  rank === 1
                    ? 'bg-[#FFF9C4] dark:bg-[#251540] shadow-[3px_3px_0px_0px_#FF6FB5]'
                    : rank <= 3
                    ? 'bg-[#E0F7FA] dark:bg-[#00E5FF]/15 shadow-[2px_2px_0px_0px_#000]'
                    : rank <= 8
                    ? 'bg-[#FFF5F0] dark:bg-[#1A0F2E] shadow-[2px_2px_0px_0px_#000]'
                    : 'bg-zinc-100 dark:bg-[#0E061A] shadow-[1px_1px_0px_0px_#000] opacity-75'
                }`}
              >
                <div className="text-xs font-mono font-bold text-zinc-600 dark:text-zinc-400">#{rank}</div>
                <div className="font-headline text-2xl text-zinc-950 dark:text-white tracking-wider my-0.5">
                  {pts} <span className="text-xs font-display text-zinc-500">PTS</span>
                </div>
                <div className="text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-400">
                  {rank === 1 ? '🍗 WWCD' : rank <= 8 ? 'QUALIFY' : '0 PTS'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Scoring formula notice */}
        <div className="p-4 bg-[#FFF5F0] dark:bg-[#0E061A] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-mono text-zinc-800 dark:text-zinc-300 flex items-center justify-between flex-wrap gap-2">
          <span>TOTAL MATCH SCORE = PLACEMENT POINTS + (TOTAL ELIMINATIONS × {settings?.kill_point_value || 1})</span>
          <span className="text-emerald-700 dark:text-[#00E676] font-bold">AUTOMATICALLY CALCULATED ON RESULT INGESTION</span>
        </div>
      </div>

      {/* CATEGORY FILTER TABS */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 font-headline text-base tracking-wider cursor-pointer border-2 border-black transition-all ${
              activeCategory === cat
                ? 'bg-[#FF6FB5] text-white shadow-[3px_3px_0px_0px_#000] -translate-y-0.5'
                : 'bg-white dark:bg-[#150A24] text-zinc-800 dark:text-zinc-300 hover:bg-[#FFD54F] hover:text-black shadow-[2px_2px_0px_0px_#000]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* RULE ARTICLES LIST */}
      <div className="space-y-4">
        {filteredRules.map((rule, idx) => (
          <div
            key={rule.id}
            className="p-6 bg-white dark:bg-[#150A24] border-3 border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-y-0.5 transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 bg-[#00E5FF] text-black text-xs font-headline font-bold border border-black uppercase shadow-[1px_1px_0px_0px_#000]">
                {rule.category}
              </span>
              <span className="text-xs font-mono font-bold text-zinc-500">
                ARTICLE 0{idx + 1}
              </span>
            </div>

            <h3 className="font-headline text-2xl text-zinc-950 dark:text-white tracking-wide">
              {rule.title}
            </h3>

            <p className="text-zinc-700 dark:text-zinc-300 font-display text-sm leading-relaxed whitespace-pre-line">
              {rule.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
