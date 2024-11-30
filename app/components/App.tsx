import { miniApp, useSignal, useLaunchParams } from '@telegram-apps/sdk-react';
import { AppRoot, Placeholder } from '@telegram-apps/telegram-ui';
import { Suspense } from 'react';
import { RouterProvider } from 'react-router';

import { getCharacter } from '@/client/character';
import { CharacterProvider } from '@/contexts/character';
import { router } from '@/router';

export function App() {
  const lp = useLaunchParams();
  const isDark = useSignal(miniApp.isDark);

  return (
    <AppRoot
      appearance={isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(lp.platform) ? 'ios' : 'base'}
    >
      <Suspense fallback={<Placeholder description="Ищем вашего персонажа..." />}>
        <CharacterProvider characterPromise={getCharacter()}>
          <RouterProvider router={router} />
        </CharacterProvider>
      </Suspense>
    </AppRoot>
  );
}
