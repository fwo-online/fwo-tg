import { Suspense } from 'react';
import { RouterProvider } from 'react-router';
import { Card } from '@/components/Card';
import { Placeholder } from '@/components/Placeholder';
import { PopupProvider } from '@/context/popup';
import { router } from '@/router';

export function App() {
  return (
    <Suspense
      fallback={
        <Card className="m-4" header="Загрузка">
          <Placeholder description="Ищем вашего персонажа..." />
        </Card>
      }
    >
      <PopupProvider>
        <RouterProvider router={router} />
      </PopupProvider>
    </Suspense>
  );
}
