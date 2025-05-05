import { Placeholder } from '@/components/Placeholder';
import type { FC, ReactNode } from 'react';

export const ErrorPage: FC<{ error?: string | Error; action?: ReactNode }> = ({
  error,
  action,
}) => {
  const desctiption = error instanceof Error ? error.message : error;

  return (
    <div className="flex flex-col justify-between">
      <Placeholder header="Ошибка" description={desctiption} />
      <div className="fixed bottom-4 left-2 right-2 flex flex-col">{action}</div>
    </div>
  );
};
