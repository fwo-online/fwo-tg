import { getDonationInvoice } from '@/api/serviceShop';
import { useRequest } from '@/hooks/useRequest';
import { useUpdateCharacter } from '@/hooks/useUpdateCharacter';
import { invoice, popup } from '@telegram-apps/sdk-react';

export const useServiceShopDonation = () => {
  const { updateCharacter } = useUpdateCharacter();
  const [loading, makeRequest] = useRequest();

  const donateByStars = (amount: number) => {
    makeRequest(async () => {
      const { url } = await getDonationInvoice(amount);

      invoice.open(url, 'url').then((status) => {
        if (status === 'paid') {
          updateCharacter();
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
