import { Caption, Cell, type CellProps, Info, Section } from '@telegram-apps/telegram-ui';
import type { FC, ReactNode } from 'react';

const DescriptionRoot: FC<{ header?: ReactNode; children: ReactNode }> = ({ children, header }) => {
  return (
    <Section>
      {header && <Section.Header>{header}</Section.Header>}
      {children}
    </Section>
  );
};

const DescriptionItem: FC<CellProps> = ({ after, children, ...props }) => {
  return (
    <Cell
      {...props}
      style={{ '--tgui--cell--middle--padding': 0 }}
      after={
        <Info type="text">
          <Caption> {after}</Caption>
        </Info>
      }
    >
      <Caption>{children}</Caption>
    </Cell>
  );
};

export const Description = DescriptionRoot as typeof DescriptionRoot & {
  Item: typeof DescriptionItem;
};

Description.Item = DescriptionItem;
