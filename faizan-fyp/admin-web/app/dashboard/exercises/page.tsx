'use client';

import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/api';

type Module = 'phonics' | 'reading' | 'vocabulary' | 'pronunciation';
type Lang = 'en' | 'ur';

interface Exercise {
  _id: string;
  type: Module;
  language: Lang;
  difficulty: number;
  prompt: string;
  correctOptionId?: string;
  targetWord?: string;
}

interface DraftExercise {
  type: Module;
  language: Lang;
  difficulty: number;
  prompt: string;
  instruction?: string;
  options?: { id: string; label: string; hint?: string }[];
  correctOptionId?: string;
  targetWord?: string;
  explanation?: string;
}

const BLANK: DraftExercise = {
  type: 'phonics',
  language: 'en',
  difficulty: 1,
  prompt: '',
  instruction: '',
  options: [
    { id: 'a', label: '' },
    { id: 'b', label: '' },
  ],
  correctOptionId: 'a',
  explanation: '',
};

export default function ExercisesPage() {
  const [list, setList] = useState<Exercise[]>([]);
  const [filter, setFilter] = useState<Module | 'all'>('all');
  const [draft, setDraft] = useState<DraftExercise | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    const q = filter === 'all' ? '' : `?type=${filter}`;
    const res = await adminFetch<Exercise[]>(`/api/admin/exercises${q}`);
    setList(res);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const save = async () => {
    if (!draft) return;
    if (editingId) {
      await adminFetch(`/api/admin/exercises/${editingId}`, {
        method: 'PATCH',
        body: JSON.stringify(draft),
      });
    } else {
      await adminFetch('/api/admin/exercises', {
        method: 'POST',
        body: JSON.stringify(draft),
      });
    }
    setDraft(null);
    setEditingId(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this exercise?')) return;
    await adminFetch(`/api/admin/exercises/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Exercises</h1>
        <button onClick={() => setDraft({ ...BLANK })} className="btn-primary">
          + New exercise
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {(['all', 'phonics', 'reading', 'vocabulary', 'pronunciation'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium ${
              filter === f ? 'bg-brand text-white' : 'bg-white border-2 border-amber-100 text-ink'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="card">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-600 border-b-2 border-amber-100">
              <th className="py-3 pr-4">Type</th>
              <th className="py-3 pr-4">Lang</th>
              <th className="py-3 pr-4">Lvl</th>
              <th className="py-3 pr-4">Prompt</th>
              <th className="py-3 pr-4" />
            </tr>
          </thead>
          <tbody>
            {list.map((e) => (
              <tr key={e._id} className="border-b border-amber-50 last:border-0">
                <td className="py-3 pr-4">{e.type}</td>
                <td className="py-3 pr-4 uppercase">{e.language}</td>
                <td className="py-3 pr-4">{e.difficulty}</td>
                <td className="py-3 pr-4 text-sm">{e.prompt.slice(0, 80)}</td>
                <td className="py-3 pr-4 text-right">
                  <button
                    onClick={() => {
                      setEditingId(e._id);
                      setDraft(e as unknown as DraftExercise);
                    }}
                    className="text-brand font-medium hover:underline mr-3"
                  >
                    Edit
                  </button>
                  <button onClick={() => remove(e._id)} className="text-softError font-medium hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-500">
                  No exercises match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {draft && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50">
          <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingId ? 'Edit exercise' : 'New exercise'}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm font-medium">Type</span>
                <select
                  className="input mt-1"
                  value={draft.type}
                  onChange={(e) => setDraft({ ...draft, type: e.target.value as Module })}
                >
                  <option value="phonics">phonics</option>
                  <option value="reading">reading</option>
                  <option value="vocabulary">vocabulary</option>
                  <option value="pronunciation">pronunciation</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium">Language</span>
                <select
                  className="input mt-1"
                  value={draft.language}
                  onChange={(e) => setDraft({ ...draft, language: e.target.value as Lang })}
                >
                  <option value="en">English</option>
                  <option value="ur">Urdu</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium">Difficulty (1–5)</span>
                <input
                  type="number"
                  min={1}
                  max={5}
                  className="input mt-1"
                  value={draft.difficulty}
                  onChange={(e) => setDraft({ ...draft, difficulty: Number(e.target.value) })}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Correct option id</span>
                <input
                  type="text"
                  className="input mt-1"
                  value={draft.correctOptionId ?? ''}
                  onChange={(e) => setDraft({ ...draft, correctOptionId: e.target.value })}
                />
              </label>
            </div>
            <label className="block mt-3">
              <span className="text-sm font-medium">Prompt</span>
              <textarea
                className="input mt-1 h-24"
                value={draft.prompt}
                onChange={(e) => setDraft({ ...draft, prompt: e.target.value })}
              />
            </label>
            <label className="block mt-3">
              <span className="text-sm font-medium">Instruction (optional)</span>
              <input
                type="text"
                className="input mt-1"
                value={draft.instruction ?? ''}
                onChange={(e) => setDraft({ ...draft, instruction: e.target.value })}
              />
            </label>
            <label className="block mt-3">
              <span className="text-sm font-medium">Target word (pronunciation)</span>
              <input
                type="text"
                className="input mt-1"
                value={draft.targetWord ?? ''}
                onChange={(e) => setDraft({ ...draft, targetWord: e.target.value })}
              />
            </label>
            <label className="block mt-3">
              <span className="text-sm font-medium">Explanation</span>
              <textarea
                className="input mt-1 h-20"
                value={draft.explanation ?? ''}
                onChange={(e) => setDraft({ ...draft, explanation: e.target.value })}
              />
            </label>
            <div className="mt-4">
              <span className="text-sm font-medium">Options (id, label, hint)</span>
              {(draft.options ?? []).map((opt, i) => (
                <div key={i} className="grid grid-cols-3 gap-2 mt-2">
                  <input
                    className="input"
                    placeholder="id"
                    value={opt.id}
                    onChange={(e) => {
                      const next = [...(draft.options ?? [])];
                      next[i] = { ...next[i], id: e.target.value };
                      setDraft({ ...draft, options: next });
                    }}
                  />
                  <input
                    className="input"
                    placeholder="label"
                    value={opt.label}
                    onChange={(e) => {
                      const next = [...(draft.options ?? [])];
                      next[i] = { ...next[i], label: e.target.value };
                      setDraft({ ...draft, options: next });
                    }}
                  />
                  <input
                    className="input"
                    placeholder="hint"
                    value={opt.hint ?? ''}
                    onChange={(e) => {
                      const next = [...(draft.options ?? [])];
                      next[i] = { ...next[i], hint: e.target.value };
                      setDraft({ ...draft, options: next });
                    }}
                  />
                </div>
              ))}
              <button
                onClick={() =>
                  setDraft({
                    ...draft,
                    options: [...(draft.options ?? []), { id: '', label: '' }],
                  })
                }
                className="mt-2 text-brand font-medium hover:underline"
              >
                + Add option
              </button>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={save} className="btn-primary">
                Save
              </button>
              <button
                onClick={() => {
                  setDraft(null);
                  setEditingId(null);
                }}
                className="btn-ghost"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
