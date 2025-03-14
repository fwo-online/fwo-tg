import { popup } from '@telegram-apps/sdk-react';
import { useTransition } from 'react';

export const useRequest = () => {
  const [isPending, startTransition] = useTransition();

  const makeRequest = (fn: () => unknown) => {
    startTransition(async () => {
      try {
        await fn();
      } catch (e) {
        if (popup.isSupported() && e instanceof Error) {
          await popup.open({ message: e.message });
        }
      }
    });
  };

  return [isPending, makeRequest] as const;
};
