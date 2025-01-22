import type { Item } from '@fwo/schemas';
import { Cell, Section } from '@telegram-apps/telegram-ui';
import { type ReactNode, use, useState, type FC } from 'react';

export const ShopList: FC<{ shopPromise: Promise<Item[]>; after: (item: Item) => ReactNode }> = ({
  shopPromise,
  after,
}) => {
  const [items] = useState(use(shopPromise));

  return (
    <Section>
      {items.map((item) => (
        <Cell key={item.code} after={after(item)}>
          {item.info.name}
        </Cell>
      ))}
    </Section>
  );
};
