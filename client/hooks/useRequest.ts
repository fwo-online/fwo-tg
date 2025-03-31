import { popup } from '@telegram-apps/sdk-react';
import { useState } from 'react';

export const useRequest = () => {
  const [isLoading, setLoading] = useState(false);

  const makeRequest = async <T>(fn: () => T): Promise<Awaited<T | undefined>> => {
    setLoading(true);

    try {
      return await fn();
    } catch (e) {
      if (e instanceof Error) {
        popup.open({ message: e.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return [isLoading, makeRequest] as const;
};
