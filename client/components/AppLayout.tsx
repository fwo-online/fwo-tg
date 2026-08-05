import { useLocation, useNavigate } from '@solidjs/router';
import { For, type ParentProps } from 'solid-js';

import { Button } from './Button';

const tabs = [
  {
    path: '/character',
    text: 'Персонаж',
    isError: false,
  },
  {
    path: '/lobby',
    text: 'Бой',
    isError: true,
  },
  {
    path: '/agora',
    text: 'Рынок',
    isError: false,
  },
] as const;

export function AppLayout(props: ParentProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div class="flex h-full flex-1 flex-col overflow-hidden">
      <div class="flex-1 overflow-auto">{props.children}</div>

      <div class="flex h-16 w-full gap-2 px-2">
        <For each={tabs}>
          {(tab) => (
            <Button
              class={[
                'flex-1',
                {
                  'is-error': tab.isError && !location.pathname.startsWith(tab.path),

                  'is-primary': location.pathname.startsWith(tab.path),
                },
              ]}
              onClick={() => navigate(tab.path)}
            >
              {tab.text}
            </Button>
          )}
        </For>
      </div>
    </div>
  );
}
