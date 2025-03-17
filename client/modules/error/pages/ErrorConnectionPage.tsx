import type { FC } from 'react';
import { ErrorPage } from './ErrorPage';
import { useSessionReconnect } from '@/hooks/useSessionGuard';
import { Button } from '@/components/Button';

export const ErrorConnectionPage: FC = () => {
  const reconnect = useSessionReconnect();

  return (
    <ErrorPage
      error="Обнаружена активная сессия. Продолжите предыдущую сессию или завершите её и обновите страницу"
      action={<Button onClick={reconnect}>Перезагрузить</Button>}
    />
  );
};
