import { Button } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { ErrorPage } from './ErrorPage';
import { useNavigate } from 'react-router';
import { useWebSocket } from '@/contexts/webSocket';

export const ErrorConnectionPage: FC = () => {
  const navigate = useNavigate();
  const socket = useWebSocket();

  const hancleClick = () => {
    socket.connect();
    socket.on('connect', () => {
      navigate('/');
    });
  };

  return (
    <ErrorPage
      error="Обнаружена активная сессия. Продолжите предыдущую сессию или завершите её и обновите страницу"
      action={
        <Button onClick={hancleClick} stretched>
          Перезагрузить
        </Button>
      }
    />
  );
};
