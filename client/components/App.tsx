import { miniApp, useSignal, retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { Suspense } from 'react';
import { HashRouter } from 'react-router';

import { CharacterProvider } from '@/contexts/character';
import { Router } from '@/router';

import { WebSocketProvider } from '@/contexts/webSocket';
import { createWebSocket } from '@/api';
import { getCharacter } from '@/api/character';
import { Placeholder } from '@/components/Placeholder';

export function App() {
  const { tgWebAppPlatform } = retrieveLaunchParams();
  const isDark = useSignal(miniApp.isDark);

  return (
    <AppRoot
      appearance={isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(tgWebAppPlatform) ? 'ios' : 'base'}
      style={{
        '--tgui--font-family': '"Pixeloid", sans-serif',
      }}
    >
      <HashRouter>
        <Suspense fallback={<Placeholder description="Ищем вашего персонажа..." />}>
          <WebSocketProvider socket={createWebSocket()}>
            <CharacterProvider character={getCharacter()}>
              <Router />
            </CharacterProvider>
          </WebSocketProvider>
        </Suspense>
      </HashRouter>
    </AppRoot>
  );
}
