'use client';

import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/api';

interface Log {
  _id: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  createdAt: string;
  context?: Record<string, unknown>;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [level, setLevel] = useState<'' | 'info' | 'warn' | 'error'>('');

  useEffect(() => {
    const q = level ? `?level=${level}` : '';
    adminFetch<Log[]>(`/api/admin/logs${q}`).then(setLogs);
  }, [level]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">System logs</h1>
      <div className="flex gap-2 mb-4">
        {(['', 'info', 'warn', 'error'] as const).map((l) => (
          <button
            key={l || 'all'}
            onClick={() => setLevel(l)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium ${
              level === l ? 'bg-brand text-white' : 'bg-white border-2 border-amber-100 text-ink'
            }`}
          >
            {l || 'all'}
          </button>
        ))}
      </div>
      <div className="card">
        {logs.length === 0 ? (
          <p className="text-gray-500">No logs yet. The system logs API is available at /api/admin/logs — wire errors into SystemLogModel from the backend when you're ready.</p>
        ) : (
          <ul className="divide-y divide-amber-50">
            {logs.map((l) => (
              <li key={l._id} className="py-3 flex gap-4">
                <span
                  className={`px-2 py-0.5 text-xs font-semibold rounded-full h-fit ${
                    l.level === 'error'
                      ? 'bg-softError/15 text-softError'
                      : l.level === 'warn'
                        ? 'bg-accent/20 text-accent'
                        : 'bg-brand/15 text-brand'
                  }`}
                >
                  {l.level}
                </span>
                <div className="flex-1">
                  <div className="text-sm">{l.message}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(l.createdAt).toLocaleString()}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
