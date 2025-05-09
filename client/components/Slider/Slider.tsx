import type { FC, InputHTMLAttributes } from 'react';
import classNames from 'classnames';
import { themeParams, useSignal } from '@telegram-apps/sdk-react';

import './Slider.css';

const getBorderSvg = (textColor: `#${string}` | undefined) => {
  const svg = `<?xml version="1.0" encoding="UTF-8" ?><svg version="1.1" width="5" height="5" xmlns="http://www.w3.org/2000/svg"><path d="M2 1 h1 v1 h-1 z M1 2 h1 v1 h-1 z M3 2 h1 v1 h-1 z M2 3 h1 v1 h-1 z" fill="${textColor}" /></svg>`;

  return `url('data:image/svg+xml;utf8,${encodeURIComponent(svg)}')`;
};

export const Slider: FC<InputHTMLAttributes<HTMLInputElement>> = ({
  className,
  min = 0,
  max = 100,
  value,
  ...restProps
}) => {
  const textColor = useSignal(themeParams.textColor);
  const progress = (Number(value) / (Number(max) - Number(min))) * 100;

  return (
    <input
      value={value}
      style={{
        borderImageSource: getBorderSvg(textColor),
        '--slider-progress': `${progress}%`,
      }}
      max={max}
      min={min}
      type="range"
      className={classNames('nes-slider nes-input', className)}
      {...restProps}
    />
  );
};
