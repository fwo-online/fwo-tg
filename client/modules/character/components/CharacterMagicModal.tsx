import { Description } from '@/components/Description';
import type { Magic } from '@fwo/shared';
import { Modal, List, Banner, Section } from '@telegram-apps/telegram-ui';
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
          description={
            <>
              {magic.description}
              <Section>
                <Description>
                  <Description.Item after={magic.lvl}>Уровень</Description.Item>
                  <Description.Item after={`💧${magic.cost}`}>Стоимость</Description.Item>
                </Description>
              </Section>
            </>
          }
        />
      </List>
    </Modal>
  );
};
