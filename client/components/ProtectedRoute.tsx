// import { redirect } from '@solidjs/web';
import { createEffect, createMemo, isPending, Loading, type ParentProps, Show } from 'solid-js';
import { create } from 'zustand';
import { createWebSocket } from '@/api';
import { getCharacter } from '@/api/character';
import { Card } from '@/components/Card';
import { Placeholder } from '@/components/Placeholder';
import { socketStore } from '@/context/socket';
import { useCharacterGuard } from '@/hooks/useCharacterGuard';
import { useForestGuard } from '@/hooks/useForestGuard';
import { useGameGuard } from '@/hooks/useGameGuard';
import { useTowerGuard } from '@/hooks/useTowerGuard';
import { setCharacter } from '@/modules/character/store/character';

// import { socketStore } from '@/stores/socket';

const HydrateFallback = () => (
  <Card class="m-4" header="Загрузка">
    <Placeholder description="Ищем вашего персонажа..." />
  </Card>
);

function ProtectedRouteGuards(props: ParentProps) {
  console.log(3);
  // createEffect(
  //   () => props.data(),
  //   (data) => {
  //     // const value = pops.data();
  //     console.log(data);
  //   },
  // );
  useCharacterGuard();
  // data();
  // useCharacterGuard(props.data);
  // useGameGuard();
  // useTowerGuard();
  // useForestGuard();

  return props.children;
}

const init = async () => {
  try {
    console.log(1);
    const socket = await createWebSocket();
    console.log(11);
    socketStore.set(socket);

    const character = await getCharacter();

    setCharacter(character);

    return {
      socket,
      character,
    };
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === 'No multiple connections') {
        // throw redirect('/connection-error');
      }

      if (e.message === 'Character not found' || e.message === 'Персонаж не найден') {
        // throw redirect('/create');
      }
    }

    // throw redirect('/error');
  }
};

export function ProtectedRoute(props: ParentProps) {
  const data = createMemo(() => init());

  // const listPending = () => isPending(() => data());
  return (
    <Loading on={data()} fallback={<HydrateFallback />}>
      <Show when={data()}>
        <ProtectedRouteGuards>{props.children}</ProtectedRouteGuards>
      </Show>
    </Loading>
  );
}
