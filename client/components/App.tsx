// import { RouterProvider } from 'react-router';

// import { Root } from "@solidjs/router";
import { createRouter, useLocation } from '@solidjs/router';
import { Loading } from 'solid-js';
import { Card } from '@/components/Card';
import { Placeholder } from '@/components/Placeholder';
import { DialogHost } from '@/components/Popup';
import { router } from '@/router';

// console.log(Router);

const Router = createRouter({ routes: router });

export function App() {
  // const location = useLocation();

  // console.log(location);
  return (
    <Loading
      fallback={
        <Card class="m-4" header="Загрузка">
          <Placeholder description="Ищем вашего персонажа..." />
        </Card>
      }
    >
      <DialogHost />
      <Router />
      {/* <PopupProvider> */}
      {/* {router} */}
      {/* </PopupProvider> */}
    </Loading>
  );
}
