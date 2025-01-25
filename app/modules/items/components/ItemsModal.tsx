import type { Item, MinMax } from '@fwo/schemas';
import { Banner, Caption, Cell, Info, Modal, Section } from '@telegram-apps/telegram-ui';
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

const ItemAttributesRow: FC<{ name: string; attribute: number | MinMax }> = ({
  name,
  attribute,
}) => {
  return (
    <Cell
      style={{ '--tgui--cell--middle--padding': 0 }}
      disabled={isNumber(attribute) ? !attribute : !attribute.min && !attribute.max}
      after={
        isNumber(attribute) ? (
          <Info type="text">
            <Caption> {attribute}</Caption>
          </Info>
        ) : (
          <Info type="text">
            <Caption>
              {attribute.min} - {attribute.max}
            </Caption>
          </Info>
        )
      }
    >
      <Caption>{name}</Caption>
    </Cell>
  );
};

export const ItemModal: FC<{
  item: Item;
  trigger: (item: Item) => ReactNode;
  footer?: (item: Item) => ReactNode;
}> = ({ item, trigger, footer }) => {
  return (
    <Modal trigger={trigger(item)}>
      <Banner
        header={item.info.name}
        subheader={item.info.description}
        description={
          <Section>
            {attributeSections.map(({ key, label, attributes }) => (
              <Section key={key}>
                <Section.Header>{label}</Section.Header>
                {attributes.map(({ name, key }) => (
                  <ItemAttributesRow key={key} name={name} attribute={get(item, key)} />
                ))}
              </Section>
            ))}
          </Section>
        }
      >
        {footer?.(item)}
      </Banner>
    </Modal>
  );
};
