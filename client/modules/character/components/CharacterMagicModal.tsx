import { Card } from '@/components/Card';
import { Description } from '@/components/Description';
import { Modal } from '@/components/Modal';
import type { Magic } from '@fwo/shared';
import type { FC, ReactElement } from 'react';

export const CharacterMagicModal: FC<{ magic: Magic; trigger?: ReactElement }> = ({
  magic,
  trigger,
}) => {
  return (
    <Modal trigger={trigger}>
      <Card header={magic.displayName}>
        <span className="text-sm">{magic.description}</span>
        <Description>
          <Description.Item after={magic.lvl}>Уровень</Description.Item>
          <Description.Item after={`💧${magic.cost}`}>Стоимость</Description.Item>
        </Description>
      </Card>
    </Modal>
  );
};
