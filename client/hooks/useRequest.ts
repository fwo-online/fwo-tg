import { useModal } from '@/contexts/modal';
import { useTransition } from 'react';

export const useRequest = () => {
  const [isPending, startTransition] = useTransition();
  const { showInfoModal } = useModal();

  const makeRequest = (fn: () => unknown) => {
    startTransition(async () => {
      try {
        await fn();
      } catch (e) {
        if (e instanceof Error) {
          showInfoModal({ message: e.message });
        }
      }
    });
  };

  return [isPending, makeRequest] as const;
};
