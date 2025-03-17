import type { FC, PropsWithChildren, ReactNode } from 'react';

export const Placeholder: FC<PropsWithChildren<{ description?: ReactNode }>> = ({
  description,
}) => {
  return (
    <div className="text-sm font-semibold p-4 flex items-center justify-center">{description}</div>
  );
};
