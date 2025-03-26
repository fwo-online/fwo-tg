import { useWebSocket } from '@/contexts/webSocket';
import { useMountEffect } from '@/hooks/useMountEffect';
import { useUpdateCharacter } from '@/hooks/useUpdateCharacter';
import { useEffect } from 'react';

export const useCharacterGuard = () => {
  const socket = useWebSocket();
  const { updateCharacter } = useUpdateCharacter();

  useMountEffect(() => {
    socket.io.on('reconnect', updateCharacter);
  });

  useEffect(() => {
    socket.on('game:end', updateCharacter);

    return () => {
      socket.off('game:end');
    };
  }, [socket, updateCharacter]);
};
