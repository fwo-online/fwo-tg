import { type FC, useCallback } from 'react';
import type { Player } from '@fwo/shared';

export const GameActionTarget: FC<{
  player: Player;
  onChange: (target: string) => void;
}> = ({ player, onChange }) => {
  const handleChange = useCallback(() => {
    onChange(player.id);
  }, [onChange, player.id]);

  return (
    <label>
      <input className="nes-radio" type="radio" name={player.id} onChange={handleChange} />
      <span>{player.name}</span>
    </label>
  );
};
