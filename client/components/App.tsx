import { RouterProvider } from 'react-router';
import { Loading } from 'solid-js';
import { Card } from '@/components/Card';
import { Placeholder } from '@/components/Placeholder';
import { DialogHost } from '@/components/Popup';
import { router } from '@/router';

export function App() {
  return (
    <Loading
      fallback={
        <Card class="m-4" header="Загрузка">
          <Placeholder description="Ищем вашего персонажа..." />
        </Card>
      }
    >
      <DialogHost />
      {/* <PopupProvider> */}
      <RouterProvider router={router} />
      {/* </PopupProvider> */}
    </Loading>
  );
}
