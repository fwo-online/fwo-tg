import { useCallback } from 'react';
import { useMountEffect } from '@/hooks/useMountEffect';
import { useSocketListener } from '@/hooks/useSocketListener';
import { useSyncCharacter } from '@/modules/character/hooks/useSyncCharacter';
import { useCharacterStore } from '@/modules/character/store/character';
import { useSocket } from '@/stores/socket';

export const useCharacterGuard = () => {
  const socket = useSocket();
  const setGame = useCharacterStore((state) => state.setGame);
  const setTower = useCharacterStore((state) => state.setTower);
  const setForest = useCharacterStore((state) => state.setForest);
  const { syncCharacter } = useSyncCharacter();

  const handleGameEnd = useCallback(() => {
    setGame(undefined);
    syncCharacter();
  }, [setGame, syncCharacter]);

  const handleTowerEnd = useCallback(() => {
    setTower(undefined);
    syncCharacter();
  }, [setTower, syncCharacter]);

  const handleForestEnd = useCallback(() => {
    setForest(undefined);
    syncCharacter();
  }, [setForest, syncCharacter]);

  useMountEffect(() => {
    socket.io.on('reconnect', () => syncCharacter());
  });

  useSocketListener('game:end', handleGameEnd);
  useSocketListener('tower:end', handleTowerEnd);
  useSocketListener('forest:end', handleForestEnd);
};
