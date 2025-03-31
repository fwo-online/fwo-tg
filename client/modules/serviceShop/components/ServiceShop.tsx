import { createInvoiceLink } from '@/api/payment';
import { Button } from '@/components/Button';
import { InvoiceType } from '@fwo/shared';
import { invoice } from '@telegram-apps/sdk-react';

import { useState, type FC } from 'react';

export const ServiceShop: FC = () => {
  const [status, setStatus] = useState('');

  const handleClick = async () => {
    const link = await createInvoiceLink(InvoiceType.ResetAttributes);

    invoice.open(link.url, 'url').then((status) => {
      setStatus(status);
    });
  };

  return (
    <>
      <Button onClick={handleClick}>Задонать</Button>
      {status}
    </>
  );
};
