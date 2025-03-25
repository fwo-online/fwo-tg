import { Card } from '@/components/Card';
import type { Item, MinMax } from '@fwo/shared';
import { Modal } from '@telegram-apps/telegram-ui';
import { get, isNumber } from 'es-toolkit/compat';
import type { ReactNode, FC } from 'react';
import { ItemAttributes } from './ItemAttribites';
import { useCharacter } from '@/contexts/character';
import { useItemComponents } from '@/modules/items/hooks/useItemComponents';

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
      { name: 'Магическая атака', key: 'magic.attack' },
      { name: 'Магическая защита', key: 'magic.defence' },
    ],
  },
];

const isEmpty = (value: number | MinMax) => {
  return isNumber(value) ? !value : !value.min && !value.max;
};

const normalizeValue = (value: number | MinMax) => {
  return isNumber(value) ? value : `${value.min} - ${value.max}`;
};

const filterSections = (item: Item) => {
  return attributeSections
    .map(({ attributes, ...rest }) => ({
      ...rest,
      attributes: attributes.filter(({ key }) => !isEmpty(get(item, key))),
    }))
    .filter(({ attributes }) => Boolean(attributes.length));
};

export const ItemModal: FC<{
  item: Item;
  trigger: ReactNode;
  footer?: ReactNode;
}> = ({ item, trigger, footer }) => {
  const { character } = useCharacter();
  const { components, getComponentImage } = useItemComponents();

  return (
    <Modal trigger={trigger}>
      <Card className="p-4" header={item.info.name}>
        <div className="flex flex-col gap-4">
          <span className="text-sm">{item.info.description}</span>
          <div className="text-sm opacity-50">
            <span>Требуемые характеристики</span>
            <ItemAttributes
              itemAttributes={item.requiredAttributes}
              characterAttributes={character.attributes}
            />
          </div>
          <div>
            <span className="text-sm opacity-50">Характеристики</span>
            {filterSections(item).map(({ key, attributes }) => (
              <div key={key}>
                {attributes.map(({ name, key }) => (
                  <div key={key} className="flex gap-2">
                    <span key={key}>{name}</span>
                    <span className="flex-1 border-dotted border-b-black border-b-2 -translate-y-1.5" />
                    <span>{normalizeValue(get(item, key))}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div>
            <span className="text-sm opacity-50">Требуемые ресурсы</span>
            <div className="flex gap-4 flex-wrap">
              {components.map((component) => (
                <div
                  key={component}
                  className="flex flex-col items-center p-2 flex-1 bg-white text-black inset-shadow-black opacity-80"
                >
                  <img height={20} width={20} src={getComponentImage(component)} />
                  {item.craft?.components[component] || 0}
                </div>
              ))}
            </div>
          </div>

          <div>
            <span className="text-sm opacity-50">Характеристики персонажа</span>
            <ItemAttributes itemAttributes={item.attributes} />
          </div>
          {footer}
        </div>
      </Card>
    </Modal>
  );
};
