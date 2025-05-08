import { cancelClanRequest, createClanRequest, getClans } from '@/api/clan';
import { usePopup } from '@/hooks/usePopup';
import { useRequest } from '@/hooks/useRequest';
import useSWR from 'swr';

export const useClans = () => {
  const popup = usePopup();
  const { data: clans, mutate } = useSWR('clans', getClans, { suspense: true });

  const [isLoading, makeRequest] = useRequest();

  const createRequest = async (id: string) => {
    await makeRequest(() => createClanRequest(id));
    mutate();
    popup.info({ message: 'Заявка успешно отправлена' });
  };

  const cancelRequest = async (id: string) => {
    await makeRequest(() => cancelClanRequest(id));
    mutate();
    popup.info({ message: 'Заявка успешно отменена' });
  };

  return { clans, createRequest, cancelRequest, isLoading };
};
