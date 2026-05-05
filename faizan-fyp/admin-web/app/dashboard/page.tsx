'use client';

import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/api';

interface Analytics {
  users: number;
  students: number;
  exercises: number;
  totalSessions: number;
  sessionsThisWeek: number;
}

export default function DashboardOverview() {
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminFetch<Analytics>('/api/admin/analytics')
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Overview</h1>
      <p className="text-gray-600 mb-6">System-wide metrics for Dyslexia MindBridge.</p>

      {error && <p className="text-softError mb-4">{error}</p>}
      {!data && !error && <p className="text-gray-500">Loading…</p>}

      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Stat label="Users" value={data.users} />
          <Stat label="Children" value={data.students} />
          <Stat label="Exercises" value={data.exercises} />
          <Stat label="Sessions" value={data.totalSessions} />
          <Stat label="This week" value={data.sessionsThisWeek} />
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card">
      <div className="text-3xl font-bold text-brand">{value}</div>
      <div className="text-sm text-gray-600 mt-1">{label}</div>
    </div>
  );
}
