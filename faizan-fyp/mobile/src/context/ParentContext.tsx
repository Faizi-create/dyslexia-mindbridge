import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ChildProfile } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface ParentCtx {
  selectedChild: ChildProfile | null;
  setSelectedChildId: (id: string) => void;
}

const Ctx = createContext<ParentCtx | undefined>(undefined);

export const ParentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { children: kids } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedId) {
      if (!kids.some((c) => c.id === selectedId) && kids[0]) {
        setSelectedId(kids[0].id);
      }
      return;
    }
    if (kids[0]) setSelectedId(kids[0].id);
  }, [kids, selectedId]);

  const selectedChild = useMemo(
    () => kids.find((c) => c.id === selectedId) ?? null,
    [kids, selectedId],
  );

  const value: ParentCtx = { selectedChild, setSelectedChildId: setSelectedId };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export function useParentContext(): ParentCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useParentContext must be used inside <ParentProvider>');
  return ctx;
}
