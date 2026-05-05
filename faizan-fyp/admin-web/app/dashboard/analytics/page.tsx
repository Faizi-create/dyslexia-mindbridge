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

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    adminFetch<Analytics>('/api/admin/analytics').then(setData);
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>
      {data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Metric title="Total users" value={data.users} />
          <Metric title="Total children" value={data.students} />
          <Metric title="Exercises published" value={data.exercises} />
          <Metric title="Total learning sessions" value={data.totalSessions} />
          <Metric title="Sessions this week" value={data.sessionsThisWeek} />
        </div>
      ) : (
        <p className="text-gray-500">Loading…</p>
      )}
    </div>
  );
}

function Metric({ title, value }: { title: string; value: number }) {
  return (
    <div className="card">
      <div className="text-sm text-gray-600">{title}</div>
      <div className="text-4xl font-bold text-brand mt-2">{value}</div>
    </div>
  );
}
