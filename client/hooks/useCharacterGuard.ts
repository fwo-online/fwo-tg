import { useCharacter } from '@/contexts/character';
import { useWebSocket } from '@/contexts/webSocket';
import { useMountEffect } from '@/hooks/useMountEffect';
import { useUpdateCharacter } from '@/hooks/useUpdateCharacter';
import { useCallback, useEffect } from 'react';

export const useCharacterGuard = () => {
  const socket = useWebSocket();
  const { character, setCharacter } = useCharacter();
  const { updateCharacter } = useUpdateCharacter();

  const handleGameEnd = useCallback(() => {
    setCharacter(() => Object.assign(structuredClone(character), { game: undefined }));
    updateCharacter();
  }, [character, updateCharacter, setCharacter]);

  useMountEffect(() => {
    socket.io.on('reconnect', updateCharacter);
  });

  useEffect(() => {
    socket.on('game:end', handleGameEnd);

    return () => {
      socket.off('game:end');
    };
  }, [socket, handleGameEnd]);
};
