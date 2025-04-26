import { miniApp, useSignal, retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { Suspense } from 'react';
import { HashRouter } from 'react-router';

import { CharacterProvider } from '@/contexts/character';
import { Router } from '@/router';

import { WebSocketProvider } from '@/contexts/webSocket';
import { createWebSocket } from '@/api';
import { Placeholder } from '@/components/Placeholder';
import { Card } from '@/components/Card';

export function App() {
  const { tgWebAppPlatform } = retrieveLaunchParams();
  const isDark = useSignal(miniApp.isDark);

  return (
    <AppRoot
      appearance={isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(tgWebAppPlatform) ? 'ios' : 'base'}
      style={{
        '--tgui--font-family': '"Pixeloid", sans-serif',
        height: '100%',
      }}
    >
      <HashRouter>
        <Suspense
          fallback={
            <Card className="m-4" header="Загрузка">
              <Placeholder description="Ищем вашего персонажа..." />
            </Card>
          }
        >
          <WebSocketProvider socket={createWebSocket()}>
            <CharacterProvider>
              <Router />
            </CharacterProvider>
          </WebSocketProvider>
        </Suspense>
      </HashRouter>
    </AppRoot>
  );
}
