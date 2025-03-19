import { Placeholder } from '@telegram-apps/telegram-ui';
import type { FC, ReactNode } from 'react';

export const ErrorPage: FC<{ error?: string | Error; action?: ReactNode }> = ({
  error,
  action,
}) => {
  const desctiption = error instanceof Error ? error.message : error;

  return (
    <Placeholder
      header="Ошибка"
      description={desctiption}
      action={<div className="fixed bottom-4 left-2 right-2 flex flex-col">{action}</div>}
    />
  );
};
