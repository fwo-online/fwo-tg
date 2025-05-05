import type { FC, PropsWithChildren, ReactNode } from 'react';

export const Placeholder: FC<
  PropsWithChildren<{ header?: ReactNode; description?: ReactNode }>
> = ({ header, description }) => {
  return (
    <div className="flex flex-col gap-2 p-4">
      {header ? (
        <div className="font-semibold flex items-center justify-center">{header}</div>
      ) : null}
      <div className="text-sm font-semibold p-4 flex items-center justify-center">
        {description}
      </div>
    </div>
  );
};
