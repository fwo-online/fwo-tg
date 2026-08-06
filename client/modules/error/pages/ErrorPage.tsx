import { useNavigate } from '@solidjs/router';
import type { JSX } from '@solidjs/web/jsx-runtime';
// import { useNavigate } from 'react-router';
import { onSettled } from 'solid-js';
import { Button } from '@/components/Button';
import { Placeholder } from '@/components/Placeholder';

export const ErrorPage = ({ error, action }: { error?: string | Error; action?: JSX.Element }) => {
  const navigate = useNavigate();
  const desctiption = error instanceof Error ? error.message : error;

  // onSettled(() => {
  //   queueMicrotask(() => navigate('/'));
  // });
  return (
    <div class="flex flex-col justify-between">
      <Placeholder header="Ошибка" description={desctiption} />
      {action && <div class="fixed bottom-4 left-2 right-2 flex flex-col">{action}</div>}

      <Button onClick={() => navigate('/character')}>Назад</Button>
    </div>
  );
};
