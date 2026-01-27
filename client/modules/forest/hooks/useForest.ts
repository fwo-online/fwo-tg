import {
  type ForestEventAction,
  type ForestEventResult,
  type ForestEventType,
  ForestState,
  type ForestStatus,
} from '@fwo/shared';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { useMountEffect } from '@/hooks/useMountEffect';
import { useSocketListener } from '@/hooks/useSocketListener';
import { useGameResult } from '@/modules/game/hooks/useGameResult';
import { useSocket } from '@/stores/socket';

export const useForest = () => {
  const socket = useSocket();
  const navigate = useNavigate();
  const [status, setStatus] = useState<ForestStatus | null>(null);
  const [lastResult, setLastResult] = useState<ForestEventResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { handleGameResult } = useGameResult();

  useMountEffect(() => {
    socket.emitWithAck('forest:connect').then((res) => {
      if (!res.error) {
        setStatus(res);
      } else {
        navigate('/');
      }
    });
  });

  useSocketListener('forest:end', (_reason, result) => {
    navigate('/');
    handleGameResult([result]);
  });
  useSocketListener('forest:updateStatus', setStatus);

  useSocketListener('forest:event', (_eventType: ForestEventType) => {
    // Событие уже обновится через updateStatus
  });

  useSocketListener('forest:eventResolved', (result: ForestEventResult) => {
    setLastResult(result);
  });

  useSocketListener('forest:eventTimeout', () => {
    setLastResult({ success: true, message: 'Ты прошёл мимо' });
  });

  useSocketListener('forest:battleStart', (gameID: string) => {
    navigate(`/game/${gameID}`);
  });

  const handleAction = useCallback(
    async (action: ForestEventAction) => {
      setLoading(true);
      try {
        const res = await socket.emitWithAck('forest:handleEvent', action);
        if (!res.error && res.result) {
          setLastResult(res.result);
        }
      } finally {
        setLoading(false);
      }
    },
    [socket],
  );

  const handleExit = useCallback(async () => {
    setLoading(true);
    try {
      await socket.emitWithAck('forest:exit');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [socket, navigate]);

  const clearLastResult = useCallback(() => {
    setLastResult(null);
  }, []);

  return {
    status,
    lastResult,
    loading,
    handleAction,
    handleExit,
    clearLastResult,
    isWaiting: status?.state === ForestState.Waiting,
    isEvent: status?.state === ForestState.Event,
    isBattle: status?.state === ForestState.Battle,
  };
};
