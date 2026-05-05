'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearAdminToken } from '@/lib/api';

const links = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/users', label: 'Users' },
  { href: '/dashboard/students', label: 'Children' },
  { href: '/dashboard/exercises', label: 'Exercises' },
  { href: '/dashboard/analytics', label: 'Analytics' },
  { href: '/dashboard/logs', label: 'Logs' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = () => {
    clearAdminToken();
    router.push('/login');
  };

  return (
    <aside className="w-64 shrink-0 border-r border-amber-100 bg-surface min-h-screen p-6 flex flex-col">
      <div className="mb-8">
        <div className="text-xl font-bold text-brand">MindBridge</div>
        <div className="text-xs text-gray-600 mt-1">Admin console</div>
      </div>
      <nav className="flex-1 space-y-1">
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`block rounded-xl px-4 py-2.5 font-medium transition ${
                active ? 'bg-brand text-white' : 'text-ink hover:bg-amber-100'
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
      <button onClick={logout} className="btn-ghost mt-6">
        Log out
      </button>
    </aside>
  );
}
