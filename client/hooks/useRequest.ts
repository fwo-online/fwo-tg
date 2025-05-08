import { usePopup } from '@/hooks/usePopup';
import { useState } from 'react';

export const useRequest = () => {
  const [isLoading, setLoading] = useState(false);
  const popup = usePopup();

  const makeRequest = async <T>(fn: () => T): Promise<Awaited<T | undefined>> => {
    setLoading(true);

    try {
      return await fn();
    } catch (e) {
      if (e instanceof Error) {
        popup.info({ message: e.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return [isLoading, makeRequest] as const;
};
