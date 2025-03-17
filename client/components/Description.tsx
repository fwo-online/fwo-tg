import type { FC, PropsWithChildren, ReactNode } from 'react';

const DescriptionRoot: FC<{ header?: ReactNode; children: ReactNode }> = ({ children, header }) => {
  return (
    <div>
      <div className="font-semibold">{header}</div>
      {children}
    </div>
  );
};

const DescriptionItem: FC<PropsWithChildren<{ after: ReactNode }>> = ({ after, children }) => {
  return (
    <div className="flex items-center justify-between text-sm">
      <span>{children}</span>
      <div>{after}</div>
    </div>
  );
};

export const Description = DescriptionRoot as typeof DescriptionRoot & {
  Item: typeof DescriptionItem;
};

Description.Item = DescriptionItem;
