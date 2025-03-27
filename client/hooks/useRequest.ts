import { useModal } from '@/contexts/modal';
import { useTransition } from 'react';

export const useRequest = () => {
  const [isPending, startTransition] = useTransition();
  const modal = useModal();

  const makeRequest = async (fn: () => unknown) => {
    startTransition(async () => {
      try {
        await fn();
      } catch (e) {
        if (e instanceof Error) {
          modal.info({ message: e.message });
        }
      }
    });
  };

  return [isPending, makeRequest] as const;
};
