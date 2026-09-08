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
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          category,
          title,
          content,
          order_index: Number(orderIndex),
        }),
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
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          category,
          title,
          content,
          order_index: Number(orderIndex),
        }),
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

  const handleDeleteRule = async (
    ruleId: string,
    ruleTitle: string
  ) => {
    if (!window.confirm(`Delete rule "${ruleTitle}"?`)) return;

    try {
      const res = await fetch(`/api/admin/rules/${ruleId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (res.ok) {
        showToast('Rule deleted', 'info');
        refreshAll();
      }
    } catch {
      showToast('Failed to delete rule', 'error');
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingRule(null);
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div
        className="
          flex
          flex-col
          sm:flex-row
          sm:items-center
          justify-between
          gap-4
          border-b
          border-zinc-300
          dark:border-zinc-800
          pb-4
        "
      >
        <div>
          <div className="flex items-center gap-3">
            <FileText
              className="
                w-7
                h-7
                text-[#d9006c]
                dark:text-[#ff007f]
              "
            />

            <h1
              className="
                font-headline
                text-3xl
                text-black
                dark:text-white
                tracking-wider
              "
            >
              TOURNAMENT RULEBOOK & REGULATORY EDITOR
            </h1>
          </div>

          <p
            className="
              text-xs
              font-mono
              text-zinc-600
              dark:text-zinc-400
              mt-1
            "
          >
            Add or revise official rule clauses displayed on the
            public rulebook page.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setCategory('Scoring System');
            setTitle('');
            setContent('');
            setOrderIndex(rules.length + 1);
            setShowAddModal(true);
          }}
          className="
            px-4
            py-2
            bg-[#ff007f]
            hover:bg-[#ff1a8c]
            text-white
            font-headline
            text-sm
            tracking-wider
            comic-border-sm
            flex
            items-center
            gap-2
            cursor-pointer
            transition-colors
          "
        >
          <Plus className="w-4 h-4" />
          ADD RULE ARTICLE
        </button>
      </div>

      {/* RULES LIST */}
      <div className="space-y-4">

        {rules.length === 0 ? (
          <div
            className="
              p-8
              text-center
              bg-white
              dark:bg-[#0e071e]
              border-2
              border-dashed
              border-zinc-300
              dark:border-zinc-800
            "
          >
            <FileText
              className="
                w-10
                h-10
                mx-auto
                mb-3
                text-zinc-400
                dark:text-zinc-600
              "
            />

            <p
              className="
                font-headline
                text-xl
                text-zinc-600
                dark:text-zinc-400
              "
            >
              NO RULE ARTICLES FOUND
            </p>

            <p
              className="
                text-xs
                font-mono
                text-zinc-500
                mt-1
              "
            >
              Click "ADD RULE ARTICLE" to create the first rule.
            </p>
          </div>
        ) : (
          rules.map((rule) => (
            <div
              key={rule.id}
              className="
                p-5
                bg-white
                dark:bg-[#0e071e]
                border-2
                border-zinc-300
                dark:border-zinc-800
                hover:border-[#00bcd4]
                dark:hover:border-[#00f5ff]/50
                shadow-sm
                dark:shadow-none
                transition-all
                space-y-3
              "
            >

              {/* CARD TOP */}
              <div
                className="
                  flex
                  flex-col
                  sm:flex-row
                  sm:items-center
                  justify-between
                  gap-3
                "
              >

                <div className="flex items-center gap-2 flex-wrap">

                  <span
                    className="
                      px-2
                      py-0.5
                      bg-cyan-50
                      dark:bg-white/10
                      border
                      border-cyan-200
                      dark:border-transparent
                      text-xs
                      font-mono
                      text-[#008ca3]
                      dark:text-[#00f5ff]
                      uppercase
                    "
                  >
                    {rule.category}
                  </span>

                  <span
                    className="
                      text-xs
                      font-mono
                      text-zinc-500
                      dark:text-zinc-500
                    "
                  >
                    ORDER #{rule.order_index}
                  </span>

                </div>

                {/* ACTION BUTTONS */}
                <div className="flex items-center gap-2">

                  <button
                    type="button"
                    onClick={() => {
                      setEditingRule(rule);
                      setCategory(rule.category);
                      setTitle(rule.title);
                      setContent(rule.content);
                      setOrderIndex(rule.order_index);
                    }}
                    className="
                      p-1.5
                      bg-zinc-100
                      dark:bg-white/5
                      hover:bg-zinc-200
                      dark:hover:bg-white/10
                      text-zinc-700
                      dark:text-zinc-300
                      hover:text-black
                      dark:hover:text-white
                      border
                      border-zinc-300
                      dark:border-zinc-700
                      cursor-pointer
                      transition-colors
                    "
                    title="Edit Rule"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteRule(rule.id, rule.title)
                    }
                    className="
                      p-1.5
                      bg-red-50
                      dark:bg-red-950/40
                      hover:bg-red-100
                      dark:hover:bg-red-900/60
                      text-red-600
                      dark:text-red-400
                      border
                      border-red-200
                      dark:border-red-800/40
                      cursor-pointer
                      transition-colors
                    "
                    title="Delete Rule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>
              </div>

              {/* TITLE */}
              <h3
                className="
                  font-headline
                  text-2xl
                  text-black
                  dark:text-white
                "
              >
                {rule.title}
              </h3>

              {/* CONTENT */}
              <p
                className="
                  text-zinc-700
                  dark:text-zinc-300
                  font-body
                  text-sm
                  leading-relaxed
                  whitespace-pre-line
                "
              >
                {rule.content}
              </p>

            </div>
          ))
        )}

      </div>

      {/* CREATE / EDIT MODAL */}
      {(showAddModal || editingRule) && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            p-4
            bg-black/50
            dark:bg-black/80
            backdrop-blur-sm
          "
        >

          <div
            className="
              w-full
              max-w-lg
              bg-white
              dark:bg-[#0d061c]
              border-2
              border-[#00bcd4]
              dark:border-[#00f5ff]
              p-6
              space-y-4
              shadow-2xl
              dark:shadow-none
            "
          >

            {/* MODAL HEADER */}
            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-zinc-300
                dark:border-zinc-800
                pb-3
              "
            >
              <h3
                className="
                  font-headline
                  text-2xl
                  text-black
                  dark:text-white
                "
              >
                {editingRule
                  ? 'EDIT RULE ARTICLE'
                  : 'ADD NEW RULE ARTICLE'}
              </h3>

              <button
                type="button"
                onClick={closeModal}
                className="
                  p-1
                  text-zinc-500
                  dark:text-zinc-400
                  hover:text-black
                  dark:hover:text-white
                  cursor-pointer
                  transition-colors
                "
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* FORM */}
            <form
              onSubmit={
                editingRule
                  ? handleUpdateRule
                  : handleCreateRule
              }
              className="space-y-4"
            >

              {/* CATEGORY */}
              <div>
                <label
                  className="
                    block
                    text-xs
                    font-mono
                    text-zinc-600
                    dark:text-zinc-400
                    uppercase
                    mb-1
                  "
                >
                  Category
                </label>

                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                  className="
                    w-full
                    bg-zinc-50
                    dark:bg-[#150a2e]
                    border
                    border-zinc-300
                    dark:border-zinc-700
                    focus:border-[#00bcd4]
                    dark:focus:border-[#00f5ff]
                    text-black
                    dark:text-white
                    p-2
                    text-sm
                    outline-none
                    cursor-pointer
                  "
                >
                  <option value="Scoring System">
                    Scoring System
                  </option>

                  <option value="Tie-breaker Rules">
                    Tie-breaker Rules
                  </option>

                  <option value="Custom Room Protocol">
                    Custom Room Protocol
                  </option>

                  <option value="Anti-Cheat & Fair Play">
                    Anti-Cheat & Fair Play
                  </option>

                  <option value="General Code of Conduct">
                    General Code of Conduct
                  </option>
                </select>
              </div>

              {/* ARTICLE TITLE */}
              <div>
                <label
                  className="
                    block
                    text-xs
                    font-mono
                    text-zinc-600
                    dark:text-zinc-400
                    uppercase
                    mb-1
                  "
                >
                  Article Title
                </label>

                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  placeholder="e.g. Disconnections & Technical Rematches"
                  className="
                    w-full
                    bg-zinc-50
                    dark:bg-[#150a2e]
                    border
                    border-zinc-300
                    dark:border-zinc-700
                    focus:border-[#00bcd4]
                    dark:focus:border-[#00f5ff]
                    text-black
                    dark:text-white
                    placeholder:text-zinc-400
                    dark:placeholder:text-zinc-600
                    p-2
                    text-sm
                    outline-none
                  "
                />
              </div>

              {/* ARTICLE CONTENT */}
              <div>
                <label
                  className="
                    block
                    text-xs
                    font-mono
                    text-zinc-600
                    dark:text-zinc-400
                    uppercase
                    mb-1
                  "
                >
                  Article Content
                </label>

                <textarea
                  rows={5}
                  required
                  value={content}
                  onChange={(e) =>
                    setContent(e.target.value)
                  }
                  placeholder="Enter rule text, clauses, and penalties..."
                  className="
                    w-full
                    bg-zinc-50
                    dark:bg-[#150a2e]
                    border
                    border-zinc-300
                    dark:border-zinc-700
                    focus:border-[#00bcd4]
                    dark:focus:border-[#00f5ff]
                    text-black
                    dark:text-white
                    placeholder:text-zinc-400
                    dark:placeholder:text-zinc-600
                    p-2
                    text-xs
                    font-mono
                    outline-none
                    resize-y
                  "
                />
              </div>

              {/* DISPLAY ORDER */}
              <div>
                <label
                  className="
                    block
                    text-xs
                    font-mono
                    text-zinc-600
                    dark:text-zinc-400
                    uppercase
                    mb-1
                  "
                >
                  Display Order
                </label>

                <input
                  type="number"
                  min="1"
                  value={orderIndex}
                  onChange={(e) =>
                    setOrderIndex(
                      Number(e.target.value)
                    )
                  }
                  className="
                    w-24
                    bg-zinc-50
                    dark:bg-[#150a2e]
                    border
                    border-zinc-300
                    dark:border-zinc-700
                    focus:border-[#00bcd4]
                    dark:focus:border-[#00f5ff]
                    text-black
                    dark:text-white
                    p-2
                    text-sm
                    outline-none
                  "
                />
              </div>

              {/* FOOTER BUTTONS */}
              <div
                className="
                  flex
                  justify-end
                  gap-2
                  pt-3
                  border-t
                  border-zinc-300
                  dark:border-zinc-800
                "
              >

                <button
                  type="button"
                  onClick={closeModal}
                  className="
                    px-4
                    py-2
                    bg-zinc-200
                    dark:bg-zinc-800
                    hover:bg-zinc-300
                    dark:hover:bg-zinc-700
                    text-zinc-800
                    dark:text-zinc-300
                    font-headline
                    text-sm
                    cursor-pointer
                    transition-colors
                  "
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  className="
                    px-5
                    py-2
                    bg-[#ff007f]
                    hover:bg-[#ff1a8c]
                    text-white
                    font-headline
                    text-sm
                    flex
                    items-center
                    gap-2
                    cursor-pointer
                    transition-colors
                  "
                >
                  <Check className="w-4 h-4" />

                  {editingRule
                    ? 'SAVE CHANGES'
                    : 'CREATE RULE'}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};