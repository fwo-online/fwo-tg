import { redirect } from '@solidjs/web';
import { createMemo, Loading, type ParentProps } from 'solid-js';
import { createWebSocket } from '@/api';
import { getCharacter } from '@/api/character';
import { Card } from '@/components/Card';
import { Placeholder } from '@/components/Placeholder';
import { socketStore } from '@/context/socket';
import { useCharacterGuard } from '@/hooks/useCharacterGuard';
import { useForestGuard } from '@/hooks/useForestGuard';
import { useGameGuard } from '@/hooks/useGameGuard';
import { useTowerGuard } from '@/hooks/useTowerGuard';
import { characterStore, useCharacterStore } from '@/modules/character/store/character';

// import { socketStore } from '@/stores/socket';

const HydrateFallback = () => (
  <Card class="m-4" header="Загрузка">
    <Placeholder description="Ищем вашего персонажа..." />
  </Card>
);

function ProtectedRouteGuards(props: ParentProps) {
  useCharacterGuard();
  useGameGuard();
  useTowerGuard();
  useForestGuard();

  return props.children;
}

export function ProtectedRoute(props: ParentProps) {
  const auth = createMemo(async () => {
    try {
      const socket = await createWebSocket();
      socketStore.set(socket);

      const character = await getCharacter();

      characterStore.setCharacter(character);

      return {
        character,
      };
    } catch (e) {
      if (e instanceof Error) {
        if (e.message === 'No multiple connections') {
          throw redirect('/connection-error');
        }

        if (e.message === 'Character not found' || e.message === 'Персонаж не найден') {
          throw redirect('/create');
        }
      }

      throw redirect('/error');
    }
  });

  return (
    <Loading on={auth()} fallback={<HydrateFallback />}>
      <ProtectedRouteGuards>{props.children}</ProtectedRouteGuards>
    </Loading>
  );
}
