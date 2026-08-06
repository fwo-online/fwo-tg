import { untrack } from '@solidjs/web';
import { createEffect, onCleanup, onSettled } from 'solid-js';
import { socketStore } from '@/context/socket';
import { useSocketListener } from '@/hooks/useSocketListener';
import { syncCharacter } from '@/modules/character/hooks/useSyncCharacter';
// import { characterStore } from '@/modules/character/store/character';
import { getSocket } from '@/stores/socket';

export const useCharacterGuard = () => {
  // const socket = untrack(() => getSocket());

  const handleGameEnd = () => {
    // characterStore.setGame(undefined);
    syncCharacter();
  };

  const handleTowerEnd = () => {
    // characterStore.setTower(undefined);
    syncCharacter();
  };

  const handleForestEnd = () => {
    // characterStore.setForest(undefined);
    syncCharacter();
  };
  createEffect(
    () => socketStore.socket(),
    () => {
      const socket = socketStore.socket();

      if (!socket) return;

      syncCharacter();
      socket.io.on('reconnect', () => syncCharacter());

      // onCleanup(() => socket.off(...));
    },
  );

  // onSettled(() => {
  //   syncCharacter();
  //   socket.io.on('reconnect', () => syncCharacter());
  // });

  useSocketListener('game:end', handleGameEnd);
  useSocketListener('tower:end', handleTowerEnd);
  useSocketListener('forest:end', handleForestEnd);
};
