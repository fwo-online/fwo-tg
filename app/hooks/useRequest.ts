import { popup, useSignal } from '@telegram-apps/sdk-react';
import { useTransition } from 'react';

export const useRequest = () => {
  const [isPending, startTransition] = useTransition();
  const isPopupSupported = useSignal(popup.isSupported);

  const makeRequest = (fn: () => unknown) => {
    startTransition(async () => {
      try {
        await fn();
      } catch (e) {
        if (isPopupSupported && e instanceof Error) {
          await popup.open({ message: e.message });
        }
      }
    });
  };

  return {
    isPending,
    makeRequest,
  };
};
