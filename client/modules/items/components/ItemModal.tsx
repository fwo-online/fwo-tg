import { Card } from '@/components/Card';
import { Modal } from '@/components/Modal';
import { characterClassNameMap } from '@/constants/character';
import { useCharacter } from '@/modules/character/store/character';
import { ItemAttributes } from '@/modules/items/components/ItemAttributes';
import { ItemCharacterAttributes } from '@/modules/items/components/ItemCharacterAttribites';
import { ItemComponents } from '@/modules/items/components/ItemComponents';
import { ItemPassive } from '@/modules/items/components/ItemPassive';
import { useItemType } from '@/modules/items/hooks/useItemType';
import type { Item } from '@fwo/shared';
import { sum } from 'es-toolkit/compat';
import type { FC, ReactElement, ReactNode } from 'react';

export const ItemModal: FC<{
  item: Item;
  trigger: ReactElement;
  footer?: ReactNode;
  showComponents?: boolean;
}> = ({ item, trigger, footer, showComponents }) => {
  const characterClass = useCharacter((character) => character.class);
  const attributes = useCharacter((character) => character.attributes);
  const types = useItemType(item);

  const showClass = !item.class.includes(characterClass);
  const showCharacterAttributes = sum(Object.values(item.attributes)) > 0;

  return (
    <Modal trigger={trigger}>
      <Card header={item.info.name}>
        <div className="flex flex-col gap-2 p-2 pt-0!">
          <div className="flex flex-col">
            {types.length ? <h5 className="text-sm">{types.join(' ')}</h5> : null}
            <h5 className="text-sm">Уровень {item.tier ?? 0}</h5>
            {showClass ? (
              <h5 className="text-sm text-red-500">
                Класс:
                {item.class
                  .map((characterClass) => characterClassNameMap[characterClass])
                  .join(',')}
              </h5>
            ) : null}
          </div>

          {item.info.description && <h5 className="text-sm">{item.info.description}</h5>}

          <div className="text-sm">
            <h5>Требуемые характеристики</h5>
            <ItemCharacterAttributes
              itemAttributes={item.requiredAttributes}
              characterAttributes={attributes}
            />
          </div>
          <div>
            <h5 className="text-sm">Характеристики</h5>
            <ItemAttributes item={item} />
          </div>

          {showCharacterAttributes ? (
            <div>
              <h5 className="text-sm">Характеристики персонажа</h5>
              <ItemCharacterAttributes itemAttributes={item.attributes} />
            </div>
          ) : null}

          {showComponents && (
            <div>
              <h5 className="text-sm">Требуемые компоненты</h5>
              {item.craft?.components ? <ItemComponents item={item} /> : '-'}
            </div>
          )}

          {item.passive && (
            <div>
              <span className="flex justify-between">
                <h5 className="text-sm">Пассивный эффект</h5>
                <h5 className="text-sm">{item.passive.unlocked ? '🟢 Активен' : '⚪ Неактивен'}</h5>
              </span>
              <ItemPassive passive={item.passive} />
            </div>
          )}

          <div />
          {footer}
        </div>
      </Card>
    </Modal>
  );
};
