import type { JSX } from '@solidjs/web/jsx-runtime';
import { type ParentProps, Show } from 'solid-js';

type PlaceholderProps = ParentProps<{
  header?: JSX.Element;
  description: JSX.Element;
}>;

export function Placeholder(props: PlaceholderProps) {
  return (
    <div class="flex flex-col gap-2 p-4">
      <Show when={props.header}>
        <div class="flex items-center justify-center font-semibold">{props.header}</div>
      </Show>
      <div class="flex items-center justify-center text-sm font-semibold">{props.description}</div>
      {props.children}
    </div>
  );
}
