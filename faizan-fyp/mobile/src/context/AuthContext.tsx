import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { firebaseAuth } from '@/config/firebase';
import {
  createChildProfile,
  fetchUserProfile,
  listChildrenForParent,
  loginWithEmail,
  logout as firebaseLogout,
  registerParent,
  resetPassword,
} from '@/services/authService';
import {
  clearActiveChildId,
  clearActiveMode,
  getActiveChildId,
  getActiveMode,
  setActiveChildId as persistActiveChildId,
  setActiveMode as persistActiveMode,
} from '@/services/session';
import { ChildProfile, UserProfile } from '@/types';

type ActiveMode = 'parent' | 'child' | null;

interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  profile: UserProfile | null;
  children: ChildProfile[];
  activeChild: ChildProfile | null;
  activeMode: ActiveMode;
  loading: boolean;
  error: string | null;

  register: (params: { email: string; password: string; name: string }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;

  refreshChildren: () => Promise<void>;
  addChild: (params: { name: string; age: number; grade?: string; avatarIndex: number }) => Promise<ChildProfile>;
  enterChildMode: (childId: string) => Promise<void>;
  enterParentMode: () => Promise<void>;
  exitActiveMode: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [childrenList, setChildrenList] = useState<ChildProfile[]>([]);
  const [activeChild, setActiveChild] = useState<ChildProfile | null>(null);
  const [activeMode, setActiveMode] = useState<ActiveMode>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      setFirebaseUser(user);
      try {
        if (!user) {
          setProfile(null);
          setChildrenList([]);
          setActiveChild(null);
          setActiveMode(null);
          await clearActiveChildId();
          await clearActiveMode();
          return;
        }

        const p = await fetchUserProfile(user.uid);
        setProfile(p);

        if (p?.role === 'parent') {
          const kids = await listChildrenForParent(user.uid);
          setChildrenList(kids);

          const savedMode = await getActiveMode();
          const savedChildId = await getActiveChildId();
          const savedChild = savedChildId ? kids.find((k) => k.id === savedChildId) ?? null : null;

          if (savedMode === 'child' && savedChild) {
            setActiveChild(savedChild);
            setActiveMode('child');
          } else if (savedMode === 'parent') {
            setActiveMode('parent');
          } else {
            setActiveMode(null);
          }
        }
      } finally {
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  const register = useCallback(async (params: { email: string; password: string; name: string }) => {
    setError(null);
    try {
      await registerParent(params);
    } catch (e: any) {
      setError(humanizeAuthError(e));
      throw e;
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      await loginWithEmail(email, password);
    } catch (e: any) {
      setError(humanizeAuthError(e));
      throw e;
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    setError(null);
    try {
      await resetPassword(email);
    } catch (e: any) {
      setError(humanizeAuthError(e));
      throw e;
    }
  }, []);

  const signOut = useCallback(async () => {
    await clearActiveChildId();
    await clearActiveMode();
    await firebaseLogout();
  }, []);

  const refreshChildren = useCallback(async () => {
    if (!firebaseUser) return;
    const kids = await listChildrenForParent(firebaseUser.uid);
    setChildrenList(kids);
  }, [firebaseUser]);

  const addChild = useCallback(
    async (params: { name: string; age: number; grade?: string; avatarIndex: number }) => {
      if (!firebaseUser) throw new Error('Not signed in');
      const child = await createChildProfile({ parentId: firebaseUser.uid, ...params });
      setChildrenList((prev) => [...prev, child]);
      return child;
    },
    [firebaseUser],
  );

  const enterChildMode = useCallback(
    async (childId: string) => {
      const child = childrenList.find((c) => c.id === childId);
      if (!child) throw new Error('Child not found');
      await persistActiveChildId(childId);
      await persistActiveMode('child');
      setActiveChild(child);
      setActiveMode('child');
    },
    [childrenList],
  );

  const enterParentMode = useCallback(async () => {
    await clearActiveChildId();
    await persistActiveMode('parent');
    setActiveChild(null);
    setActiveMode('parent');
  }, []);

  const exitActiveMode = useCallback(async () => {
    await clearActiveChildId();
    await clearActiveMode();
    setActiveChild(null);
    setActiveMode(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      firebaseUser,
      profile,
      children: childrenList,
      activeChild,
      activeMode,
      loading,
      error,
      register,
      login,
      forgotPassword,
      signOut,
      refreshChildren,
      addChild,
      enterChildMode,
      enterParentMode,
      exitActiveMode,
    }),
    [firebaseUser, profile, childrenList, activeChild, activeMode, loading, error, register, login, forgotPassword, signOut, refreshChildren, addChild, enterChildMode, enterParentMode, exitActiveMode],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

function humanizeAuthError(e: any): string {
  const code: string = e?.code ?? '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'That email is already registered. Try logging in.';
    case 'auth/invalid-email':
      return 'That email address looks invalid.';
    case 'auth/weak-password':
      return 'Password is too weak — use at least 6 characters.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email or password is incorrect.';
    case 'auth/network-request-failed':
      return 'Network error — check your connection.';
    default:
      return e?.message ?? 'Something went wrong. Please try again.';
  }
}
