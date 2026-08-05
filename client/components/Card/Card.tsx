import type { ComponentProps } from '@solidjs/web';
import type { JSX } from '@solidjs/web/jsx-runtime';
import { themeParams, useSignal } from '@tma.js/sdk-solid';
import { type ParentProps, Show } from 'solid-js';

import './Card.css';

type CardProps = ComponentProps<'div'> & {
  header?: JSX.Element;
};

export const Card = (props: ParentProps<CardProps>) => {
  const isDark = useSignal(themeParams.isDark);

  return (
    <div
      {...props}
      class={[
        'nes-container is-rounded p-2',
        {
          'with-title': !!props.header,
          'is-dark': isDark(),
        },
        props.class,
      ]}
    >
      <Show when={props.header}>
        <svg viewBox="0 0 300 30" class="text-md font-semibold!">
          <text class="nes-container__outline" x="10" y="50%">
            {props.header}
          </text>
          <text class="nes-container__text" x="10" y="50%">
            {props.header}
          </text>
        </svg>
      </Show>

      {props.children}
    </div>
  );
};
