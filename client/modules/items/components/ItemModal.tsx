import { Card } from '@/components/Card';
import type { Item } from '@fwo/shared';
import { Modal } from '@/components/Modal';
import type { ReactNode, FC } from 'react';
import { ItemCharacterAttributes } from '@/modules/items/components/ItemCharacterAttribites';
import { ItemAttributes } from '@/modules/items/components/ItemAttributes';
import { ItemComponents } from '@/modules/items/components/ItemComponents';
import { useItemType } from '@/modules/items/hooks/useItemType';
import { sum } from 'es-toolkit/compat';
import { useCharacter } from '@/modules/character/store/character';

export const ItemModal: FC<{
  item: Item;
  trigger: ReactNode;
  footer?: ReactNode;
  showComponents?: boolean;
}> = ({ item, trigger, footer, showComponents }) => {
  const attributes = useCharacter((character) => character.attributes);
  const types = useItemType(item);

  const showCharacterAttributes = sum(Object.values(item.attributes)) > 0;

  return (
    <Modal trigger={trigger}>
      <Card header={item.info.name}>
        <div className="flex flex-col gap-2 p-2 pt-0!">
          {types.length ? <h5 className="text-sm">{types.join(' ')}</h5> : null}
          <h5 className="text-sm">Уровень {item.tier ?? 0}</h5>
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
              <ItemComponents item={item} />
            </div>
          )}

          <div />
          {footer}
        </div>
      </Card>
    </Modal>
  );
};
