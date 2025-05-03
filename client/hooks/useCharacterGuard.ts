import { useMountEffect } from '@/hooks/useMountEffect';
import { useSyncCharacter } from '@/modules/character/hooks/useSyncCharacter';
import { useCharacterStore } from '@/modules/character/store/character';
import { useSocket } from '@/stores/socket';
import { useCallback, useEffect } from 'react';

export const useCharacterGuard = () => {
  const socket = useSocket();
  const setGame = useCharacterStore((state) => state.setGame);
  const { syncCharacter } = useSyncCharacter();

  const handleGameEnd = useCallback(() => {
    setGame(undefined);
    syncCharacter();
  }, [setGame, syncCharacter]);

  useMountEffect(() => {
    socket.io.on('reconnect', () => syncCharacter);
  });

  useEffect(() => {
    socket.on('game:end', handleGameEnd);

    return () => {
      socket.off('game:end');
    };
  }, [socket, handleGameEnd]);
};
