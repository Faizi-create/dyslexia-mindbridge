import * as SecureStore from 'expo-secure-store';

const ACTIVE_CHILD_KEY = 'dmb.activeChildId';
const ACTIVE_MODE_KEY = 'dmb.activeMode';

export type ActiveMode = 'parent' | 'child';

export async function setActiveChildId(childId: string): Promise<void> {
  await SecureStore.setItemAsync(ACTIVE_CHILD_KEY, childId);
}

export async function getActiveChildId(): Promise<string | null> {
  return SecureStore.getItemAsync(ACTIVE_CHILD_KEY);
}

export async function clearActiveChildId(): Promise<void> {
  await SecureStore.deleteItemAsync(ACTIVE_CHILD_KEY);
}

export async function setActiveMode(mode: ActiveMode): Promise<void> {
  await SecureStore.setItemAsync(ACTIVE_MODE_KEY, mode);
}

export async function getActiveMode(): Promise<ActiveMode | null> {
  return (await SecureStore.getItemAsync(ACTIVE_MODE_KEY)) as ActiveMode | null;
}

export async function clearActiveMode(): Promise<void> {
  await SecureStore.deleteItemAsync(ACTIVE_MODE_KEY);
}
