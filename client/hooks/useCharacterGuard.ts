import { useMountEffect } from '@/hooks/useMountEffect';
import { useSocketListener } from '@/hooks/useSocketListener';
import { useSyncCharacter } from '@/modules/character/hooks/useSyncCharacter';
import { useCharacterStore } from '@/modules/character/store/character';
import { useSocket } from '@/stores/socket';
import { useCallback } from 'react';

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

  useSocketListener('game:end', handleGameEnd);
};
