import { themeParams, useSignal } from '@telegram-apps/sdk-react';
import type { ButtonHTMLAttributes, FC } from 'react';
import cn from 'classnames';
import './Button.css';

const getButtonSvg = (textColor: `#${string}` | undefined) => {
  const svg = `<?xml version="1.0" encoding="UTF-8" ?><svg version="1.1" width="5" height="5" xmlns="http://www.w3.org/2000/svg"><path d="M2 1 h1 v1 h-1 z M1 2 h1 v1 h-1 z M3 2 h1 v1 h-1 z M2 3 h1 v1 h-1 z" fill="${textColor}" /></svg>`;

  return `url('data:image/svg+xml;utf8,${encodeURIComponent(svg)}')`;
};

export const Button: FC<ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children,
  className,
  disabled,
  ...restProps
}) => {
  const textColor = useSignal(themeParams.textColor);
  const isDark = useSignal(themeParams.isDark);
  return (
    <button
      style={{
        borderImageSource: getButtonSvg(textColor),
      }}
      className={cn(
        'nes-btn',
        {
          'is-disabled': disabled,
          'is-dark': isDark,
        },
        className,
      )}
      disabled={disabled}
      {...restProps}
    >
      {children}
    </button>
  );
};
