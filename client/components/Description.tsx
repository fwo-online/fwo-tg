import { Caption, Cell, type CellProps, Info } from '@telegram-apps/telegram-ui';
import type { FC, ReactNode } from 'react';
import { Card } from './Card';

const DescriptionRoot: FC<{ header?: ReactNode; children: ReactNode }> = ({ children, header }) => {
  return (
    <div>
      <div className="font-semibold">{header}</div>
      {children}
    </div>
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
