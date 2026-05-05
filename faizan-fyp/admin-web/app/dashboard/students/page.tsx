'use client';

import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/api';

interface Student {
  _id: string;
  name: string;
  age: number;
  currentLevel: number;
  parentFirebaseUid: string;
  createdAt: string;
}

export default function StudentsPage() {
  const [list, setList] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch<Student[]>('/api/admin/students')
      .then(setList)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Children</h1>
      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-600 border-b-2 border-amber-100">
                <th className="py-3 pr-4">Name</th>
                <th className="py-3 pr-4">Age</th>
                <th className="py-3 pr-4">Level</th>
                <th className="py-3 pr-4">Parent UID</th>
                <th className="py-3 pr-4">Added</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s) => (
                <tr key={s._id} className="border-b border-amber-50 last:border-0">
                  <td className="py-3 pr-4 font-medium">{s.name}</td>
                  <td className="py-3 pr-4">{s.age}</td>
                  <td className="py-3 pr-4">{s.currentLevel}</td>
                  <td className="py-3 pr-4 text-xs font-mono text-gray-500">
                    {s.parentFirebaseUid.slice(0, 12)}…
                  </td>
                  <td className="py-3 pr-4 text-sm text-gray-500">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-500">
                    No children yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
