import { useRevalidator } from 'react-router';
import { cancelClanRequest, createClanRequest } from '@/api/clan';
import { usePopup } from '@/hooks/usePopup';
import { useRequest } from '@/hooks/useRequest';

export const useClans = () => {
  const popup = usePopup();
  const { revalidate } = useRevalidator();

  const [isLoading, makeRequest] = useRequest();

  const createRequest = async (id: string) => {
    await makeRequest(() => createClanRequest(id));
    revalidate();
    popup.info({ message: 'Заявка успешно отправлена' });
  };

  const cancelRequest = async (id: string) => {
    await makeRequest(() => cancelClanRequest(id));
    revalidate();
    popup.info({ message: 'Заявка успешно отменена' });
  };

  return { createRequest, cancelRequest, isLoading };
};
