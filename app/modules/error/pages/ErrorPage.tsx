import { FixedLayout, Placeholder } from '@telegram-apps/telegram-ui';
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
      action={
        <FixedLayout style={{ padding: '16px' }} vertical="bottom">
          {action}
        </FixedLayout>
      }
    />
  );
};
