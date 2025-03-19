import { type FC, useCallback } from 'react';
import type { PublicGameStatus } from '@fwo/shared';

export const GameActionTarget: FC<{
  status: PublicGameStatus;
  onChange: (target: string) => void;
}> = ({ status, onChange }) => {
  const handleChange = useCallback(() => {
    onChange(status.id);
  }, [onChange, status.id]);

  return (
    <label>
      <input className="nes-radio" type="radio" name={status.id} onChange={handleChange} />
      <span>{status.name}</span>
    </label>
  );
};
