import { useWebSocket } from '@/contexts/webSocket';
import { useMountEffect } from '@/hooks/useMountEffect';
import { useUpdateCharacter } from '@/hooks/useUpdateCharacter';

export const useCharacterGuard = () => {
  const socket = useWebSocket();
  const { updateCharacter } = useUpdateCharacter();

  useMountEffect(() => {
    socket.io.on('reconnect', updateCharacter);
  });
};
