import { Suspense } from 'react';
import { HashRouter } from 'react-router';
import { Router } from '@/router';
import { Placeholder } from '@/components/Placeholder';
import { Card } from '@/components/Card';
import { PopupProvider } from '@/context/popup';

export function App() {
  return (
    <HashRouter>
      <Suspense
        fallback={
          <Card className="m-4" header="Загрузка">
            <Placeholder description="Ищем вашего персонажа..." />
          </Card>
        }
      >
        <PopupProvider>
          <Router />
        </PopupProvider>
      </Suspense>
    </HashRouter>
  );
}
