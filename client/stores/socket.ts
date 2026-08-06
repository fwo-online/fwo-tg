import { socketStore } from '@/context/socket';

export function getSocket() {
  const value = socketStore.socket();

  if (!value) {
    throw new Error('Socket is not initialized');
  }

  return value;
}
