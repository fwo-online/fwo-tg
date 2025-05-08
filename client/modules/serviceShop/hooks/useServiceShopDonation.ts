import { getDonationInvoice } from '@/api/serviceShop';
import { usePopup } from '@/hooks/usePopup';
import { useRequest } from '@/hooks/useRequest';
import { useSyncCharacter } from '@/modules/character/hooks/useSyncCharacter';
import { invoice } from '@telegram-apps/sdk-react';

export const useServiceShopDonation = () => {
  const { syncCharacter } = useSyncCharacter();
  const [loading, makeRequest] = useRequest();
  const popup = usePopup();

  const donateByStars = (amount: number) => {
    makeRequest(async () => {
      const { url } = await getDonationInvoice(amount);

      invoice.open(url, 'url').then((status) => {
        if (status === 'paid') {
          syncCharacter();
          popup.info({ message: 'Пожертвование успешно отправлено!' });
        }
        if (status === 'cancelled' || status === 'failed') {
          popup.info({ message: 'Что-то пошло не так' });
        }
      });
    });
  };

  return {
    donateByStars,
    loading,
  };
};
