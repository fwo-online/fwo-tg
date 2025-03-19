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
      {header && <span className="title mb-2! text-md font-semibold!">{header}</span>}
      {children}
    </div>
  );
};
