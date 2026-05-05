'use client';

import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/api';

interface User {
  _id: string;
  email: string;
  name: string;
  role: 'parent' | 'child' | 'admin';
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const list = await adminFetch<User[]>('/api/admin/users');
      setUsers(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateRole = async (id: string, role: User['role']) => {
    await adminFetch(`/api/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    await adminFetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Users</h1>
      {error && <p className="text-softError mb-4">{error}</p>}
      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-600 border-b-2 border-amber-100">
                <th className="py-3 pr-4">Name</th>
                <th className="py-3 pr-4">Email</th>
                <th className="py-3 pr-4">Role</th>
                <th className="py-3 pr-4">Joined</th>
                <th className="py-3 pr-4" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-amber-50 last:border-0">
                  <td className="py-3 pr-4 font-medium">{u.name}</td>
                  <td className="py-3 pr-4 text-sm">{u.email}</td>
                  <td className="py-3 pr-4">
                    <select
                      value={u.role}
                      onChange={(e) => updateRole(u._id, e.target.value as User['role'])}
                      className="rounded border-2 border-amber-100 bg-white px-2 py-1 text-sm"
                    >
                      <option value="parent">parent</option>
                      <option value="child">child</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="py-3 pr-4 text-sm text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 pr-4">
                    <button
                      onClick={() => remove(u._id)}
                      className="text-softError font-medium hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-500">
                    No users yet.
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
