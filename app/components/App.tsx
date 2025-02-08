import { miniApp, useSignal, useLaunchParams } from '@telegram-apps/sdk-react';
import { AppRoot, Placeholder } from '@telegram-apps/telegram-ui';
import { Suspense } from 'react';
import { HashRouter } from 'react-router';

import { CharacterProvider } from '@/contexts/character';
import { Router } from '@/router';

import { WebSocketProvider } from '@/contexts/webSocket';

export function App() {
  const lp = useLaunchParams();
  const isDark = useSignal(miniApp.isDark);

  return (
    <AppRoot
      appearance={isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(lp.platform) ? 'ios' : 'base'}
      style={{
        '--tgui--font-family': '"Pixeloid", serif',
      }}
    >
      <HashRouter>
        <Suspense fallback={<Placeholder description="Ищем вашего персонажа..." />}>
          <WebSocketProvider>
            <CharacterProvider>
              <Router />
            </CharacterProvider>
          </WebSocketProvider>
        </Suspense>
      </HashRouter>
    </AppRoot>
  );
}
