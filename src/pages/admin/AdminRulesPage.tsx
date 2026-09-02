import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { FileText, Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { Rule } from '../../types';

export const AdminRulesPage: React.FC = () => {
  const { rules, adminToken, showToast, refreshAll } = useTournament();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);

  // Form states
  const [category, setCategory] = useState('Scoring System');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [orderIndex, setOrderIndex] = useState<number>(rules.length + 1);

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          category,
          title,
          content,
          order_index: Number(orderIndex)
        })
      });

      if (res.ok) {
        showToast('Rule created successfully', 'success');
        setShowAddModal(false);
        setTitle('');
        setContent('');
        refreshAll();
      }
    } catch {
      showToast('Failed to create rule', 'error');
    }
  };

  const handleUpdateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;

    try {
      const res = await fetch(`/api/admin/rules/${editingRule.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          category,
          title,
          content,
          order_index: Number(orderIndex)
        })
      });

      if (res.ok) {
        showToast('Rule updated successfully', 'success');
        setEditingRule(null);
        refreshAll();
      }
    } catch {
      showToast('Failed to update rule', 'error');
    }
  };

  const handleDeleteRule = async (ruleId: string, ruleTitle: string) => {
    if (!window.confirm(`Delete rule "${ruleTitle}"?`)) return;

    try {
      const res = await fetch(`/api/admin/rules/${ruleId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      if (res.ok) {
        showToast('Rule deleted', 'info');
        refreshAll();
      }
    } catch {
      showToast('Failed to delete rule', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="font-headline text-3xl text-white tracking-wider">
            TOURNAMENT RULEBOOK & REGULATORY EDITOR
          </h1>
          <p className="text-xs font-mono text-zinc-400 mt-0.5">
            Add or revise official rule clauses displayed on the public rulebook page.
          </p>
        </div>

        <button
          onClick={() => {
            setCategory('Scoring System');
            setTitle('');
            setContent('');
            setOrderIndex(rules.length + 1);
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-[#ff007f] hover:bg-[#ff1a8c] text-white font-headline text-sm tracking-wider comic-border-sm flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" /> ADD RULE ARTICLE
        </button>
      </div>

      {/* Rules list */}
      <div className="space-y-4">
        {rules.map(rule => (
          <div
            key={rule.id}
            className="p-5 bg-[#0e071e] border-2 border-zinc-800 hover:border-[#00f5ff]/50 transition-all space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-white/10 text-xs font-mono text-[#00f5ff] uppercase">
                  {rule.category}
                </span>
                <span className="text-xs font-mono text-zinc-500">
                  ORDER #{rule.order_index}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingRule(rule);
                    setCategory(rule.category);
                    setTitle(rule.title);
                    setContent(rule.content);
                    setOrderIndex(rule.order_index);
                  }}
                  className="p-1.5 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-zinc-700 cursor-pointer"
                  title="Edit Rule"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteRule(rule.id, rule.title)}
                  className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 cursor-pointer"
                  title="Delete Rule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="font-headline text-2xl text-white">
              {rule.title}
            </h3>

            <p className="text-zinc-300 font-body text-sm leading-relaxed whitespace-pre-line">
              {rule.content}
            </p>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT MODAL */}
      {(showAddModal || editingRule) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0d061c] comic-border-cyan p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-headline text-2xl text-white">
                {editingRule ? 'EDIT RULE ARTICLE' : 'ADD NEW RULE ARTICLE'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingRule(null);
                }}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingRule ? handleUpdateRule : handleCreateRule} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-[#150a2e] border border-zinc-700 text-white p-2 text-sm outline-none"
                >
                  <option value="Scoring System">Scoring System</option>
                  <option value="Tie-breaker Rules">Tie-breaker Rules</option>
                  <option value="Custom Room Protocol">Custom Room Protocol</option>
                  <option value="Anti-Cheat & Fair Play">Anti-Cheat & Fair Play</option>
                  <option value="General Code of Conduct">General Code of Conduct</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">Article Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Disconnections & Technical Rematches"
                  className="w-full bg-[#150a2e] border border-zinc-700 text-white p-2 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">Article Content</label>
                <textarea
                  rows={5}
                  required
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Enter rule text, clauses, and penalties..."
                  className="w-full bg-[#150a2e] border border-zinc-700 text-white p-2 text-xs font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">Display Order</label>
                <input
                  type="number"
                  value={orderIndex}
                  onChange={e => setOrderIndex(Number(e.target.value))}
                  className="w-24 bg-[#150a2e] border border-zinc-700 text-white p-2 text-sm outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingRule(null);
                  }}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 font-headline text-sm"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#ff007f] hover:bg-[#ff1a8c] text-white font-headline text-sm"
                >
                  {editingRule ? 'SAVE CHANGES' : 'CREATE RULE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
