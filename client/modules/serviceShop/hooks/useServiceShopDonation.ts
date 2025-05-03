import { getDonationInvoice } from '@/api/serviceShop';
import { useRequest } from '@/hooks/useRequest';
import { useSyncCharacter } from '@/modules/character/hooks/useSyncCharacter';
import { invoice, popup } from '@telegram-apps/sdk-react';

export const useServiceShopDonation = () => {
  const { syncCharacter } = useSyncCharacter();
  const [loading, makeRequest] = useRequest();

  const donateByStars = (amount: number) => {
    makeRequest(async () => {
      const { url } = await getDonationInvoice(amount);

      invoice.open(url, 'url').then((status) => {
        if (status === 'paid') {
          syncCharacter();
          popup.open({ message: 'Пожертвование успешно отправлено!' });
        }
        if (status === 'cancelled' || status === 'failed') {
          popup.open({ message: 'Что-то пошло не так' });
        }
      });
    });
  };

  return {
    donateByStars,
    loading,
  };
};
