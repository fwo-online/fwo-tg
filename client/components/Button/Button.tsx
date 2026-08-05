import { themeParams, useSignal } from '@tma.js/sdk-solid';
import { createMemo, omit } from 'solid-js';

import './Button.css';
import type { ComponentProps } from '@solidjs/web';

const getButtonSvg = (textColor: `#${string}` | undefined) => {
  const svg = `<?xml version="1.0" encoding="UTF-8" ?><svg version="1.1" width="5" height="5" xmlns="http://www.w3.org/2000/svg"><path d="M2 1 h1 v1 h-1 z M1 2 h1 v1 h-1 z M3 2 h1 v1 h-1 z M2 3 h1 v1 h-1 z" fill="${textColor}" /></svg>`;

  return `url('data:image/svg+xml;utf8,${encodeURIComponent(svg)}')`;
};

type ButtonProps = ComponentProps<'button'>;

export function Button(props: ButtonProps) {
  const rest = omit(props, 'class', 'children', 'disabled', 'style');

  const textColor = useSignal(themeParams.textColor);
  const isDark = useSignal(themeParams.isDark);

  const borderImageSource = createMemo(() => getButtonSvg(textColor()));

  return (
    <button
      {...rest}
      disabled={props.disabled}
      class={[
        'nes-btn',
        props.class,
        {
          'is-disabled': !!props.disabled,
          'is-dark': isDark(),
        },
      ]}
      style={props.style}
      style:border-image-source={borderImageSource()}
    >
      {props.children}
    </button>
  );
}
