import { themeParams, useSignal } from '@telegram-apps/sdk-react';
import type { HTMLAttributes, FC, ReactNode } from 'react';
import cn from 'classnames';
import './Card.css';

type CardProps = HTMLAttributes<HTMLElement> & {
  header?: ReactNode;
};

export const Card: FC<CardProps> = ({ children, header, className, ...restProps }) => {
  const isDark = useSignal(themeParams.isDark);

  return (
    <div
      className={cn(
        'nes-container is-rounded p-2',
        { 'with-title': !!header, 'is-dark': isDark },
        className,
      )}
      {...restProps}
    >
      {header && (
        <svg viewBox="0 0 400 50" x="0" y="0" className="text-md font-semibold!">
          <text className="nes-container__outline" x="-350" y="40">
            {header}
          </text>
          <text className="nes-container__text" x="-350" y="40">
            {header}
          </text>
        </svg>
      )}
      {children}
    </div>
  );
};
