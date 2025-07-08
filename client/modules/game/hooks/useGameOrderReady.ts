import { usePopup } from '@/hooks/usePopup';
import { useRequest } from '@/hooks/useRequest';
import { useGameStore } from '@/modules/game/store/useGameStore';
import { useSocket } from '@/stores/socket';
import { useCallback } from 'react';

export const useGameOrderReady = () => {
  const socket = useSocket();
  const setReady = useGameStore((state) => state.setReady);
  const isReady = useGameStore((state) => state.ready);
  const [isPending, makeRequest] = useRequest();
  const popup = usePopup();

  const handleReady = useCallback(() => {
    makeRequest(async () => {
      const res = await socket.emitWithAck('game:order:ready', !isReady);
      if (!res.error) {
        setReady(res.ready);
      } else {
        popup.info({ message: res.error });
      }
    });
  }, [setReady, popup.info, socket.emitWithAck, isReady, makeRequest]);

  return {
    isReady,
    isPending,
    handleReady,
  };
};
