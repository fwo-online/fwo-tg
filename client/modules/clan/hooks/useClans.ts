import { cancelClanRequest, createClanRequest, getClans } from '@/api/clan';
import { useRequest } from '@/hooks/useRequest';
import { popup } from '@telegram-apps/sdk-react';
import { clear, suspend } from 'suspend-react';

export const useClans = () => {
  const clans = suspend(() => getClans(), ['clans']);

  const [isLoading, makeRequest] = useRequest();

  const createRequest = async (id: string) => {
    await makeRequest(() => createClanRequest(id));
    clear(['clans']);
    popup.open({ message: 'Заявка успешно отправлена' });
  };

  const cancelRequest = async (id: string) => {
    await makeRequest(() => cancelClanRequest(id));
    clear(['clans']);
    popup.open({ message: 'Заявка успешно отменена' });
  };

  return { clans, createRequest, cancelRequest, isLoading };
};
