import { Suspense } from 'react';
import { HashRouter } from 'react-router';
import { Router } from '@/router';
import { Placeholder } from '@/components/Placeholder';
import { Card } from '@/components/Card';

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
        <Router />
      </Suspense>
    </HashRouter>
  );
}
