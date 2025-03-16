import { Description } from '@/components/Description';
import type { Item, MinMax } from '@fwo/shared';
import { Banner, Modal, Section } from '@telegram-apps/telegram-ui';
import { get, isNumber } from 'es-toolkit/compat';
import type { ReactNode, FC } from 'react';

const attributeSections = [
  {
    key: 'base',
    label: 'Базовые характеристики',
    attributes: [
      { name: 'Урон', key: 'hit' },
      { name: 'Здоровье', key: 'base.hp' },
      { name: 'Энергия', key: 'base.en' },
      { name: 'Мана', key: 'base.mp' },
    ],
  },
  {
    key: 'phys',
    label: 'Физические характеристики',
    attributes: [
      { name: 'Атака', key: 'phys.attack' },
      { name: 'Защита', key: 'phys.defence' },
    ],
  },
  {
    key: 'magic',
    label: 'Магические характеристики',
    attributes: [
      { name: 'Атака', key: 'magic.attack' },
      { name: 'Защита', key: 'magic.defence' },
    ],
  },
  {
    key: 'attributes',
    label: 'Характеристи персонажа',
    attributes: [
      { name: 'Сила', key: 'attributes.str' },
      { name: 'Ловкость', key: 'attributes.dex' },
      { name: 'Телосложение', key: 'attributes.con' },
      { name: 'Мудрость', key: 'attributes.wis' },
      { name: 'Интелект', key: 'attributes.int' },
    ],
  },
];

const isDisabled = (value: number | MinMax) => {
  return isNumber(value) ? !value : !value.min && !value.max;
};

const normalizeValue = (value: number | MinMax) => {
  return isNumber(value) ? value : `${value.min} - ${value.max}`;
};

export const ItemModal: FC<{
  item: Item;
  trigger: ReactNode;
  footer?: ReactNode;
}> = ({ item, trigger, footer }) => {
  return (
    <Modal trigger={trigger}>
      <Banner
        header={item.info.name}
        description={
          <>
            {item.info.description}
            <Section>
              {attributeSections.map(({ key, label, attributes }) => (
                <Description key={key} header={label}>
                  {attributes.map(({ name, key }) => (
                    <Description.Item
                      key={key}
                      after={normalizeValue(get(item, key))}
                      disabled={isDisabled(get(item, key))}
                    >
                      {name}
                    </Description.Item>
                  ))}
                </Description>
              ))}
            </Section>
          </>
        }
      >
        {footer}
      </Banner>
    </Modal>
  );
};
