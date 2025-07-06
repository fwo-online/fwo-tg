import { themeParams, useSignal } from '@telegram-apps/sdk-react';
import type { HTMLAttributes, FC, ReactNode, Ref } from 'react';
import cn from 'classnames';
import './Card.css';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  header?: ReactNode;
  ref?: Ref<HTMLDivElement>;
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
        <svg viewBox="0 0 300 30" x="0" y="0" className="text-md font-semibold!">
          <text className="nes-container__outline" x="10" y="50%">
            {header}
          </text>
          <text className="nes-container__text" x="10" y="50%">
            {header}
          </text>
        </svg>
      )}
      {children}
    </div>
  );
};
