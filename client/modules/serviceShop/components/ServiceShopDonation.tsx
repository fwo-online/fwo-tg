import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useServiceShopDonation } from '@/modules/serviceShop/hooks/useServiceShopDonation';
import { InvoiceType, invoiceTypes } from '@fwo/shared';
import { type ChangeEventHandler, useState, type FC } from 'react';

const { title } = invoiceTypes[InvoiceType.Donation];

export const ServiceShopDonation: FC = () => {
  const [stars, setStars] = useState('50');
  const { loading, donateByStars } = useServiceShopDonation();

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (Number.isNaN(e.target.valueAsNumber) && e.target.value) {
      return;
    }

    setStars(e.target.valueAsNumber.toString());
  };

  const handleDonateStars = () => {
    const starsNumber = Number(stars);
    if (!Number.isNaN(starsNumber) && starsNumber) {
      donateByStars(starsNumber);
    }
  };

  return (
    <Card header={title}>
      <h5>
        Ваше имя будет периодически появляться в боевом чате и навсегда останется в наших сердцах!
      </h5>
      <div className="flex flex-col gap-2">
        <input
          className="nes-input"
          placeholder="Введите количество"
          inputMode="numeric"
          type="number"
          min={50}
          value={stars}
          onChange={handleChange}
        />
        <div className="flex gap-2">
          <Button className="flex-1" disabled={loading || !stars} onClick={handleDonateStars}>
            {stars}⭐
          </Button>
        </div>
      </div>
    </Card>
  );
};
