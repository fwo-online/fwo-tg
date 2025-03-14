import { Description } from '@/components/Description';
import type { Magic } from '@fwo/schemas';
import { Modal, List, Banner } from '@telegram-apps/telegram-ui';
import type { FC, ReactNode } from 'react';

export const CharacterMagicModal: FC<{ magic: Magic; trigger?: ReactNode }> = ({
  magic,
  trigger,
}) => {
  return (
    <Modal trigger={trigger}>
      <List>
        <Banner
          header={magic.displayName}
          subheader={magic.description}
          description={
            <Description>
              <Description.Item after={magic.lvl}>Уровень</Description.Item>
              <Description.Item after={`💧${magic.cost}`}>Стоимость</Description.Item>
            </Description>
          }
        />
      </List>
    </Modal>
  );
};
