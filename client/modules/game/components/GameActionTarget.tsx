import type { Player as PlayerType } from '@fwo/shared';
import { type FC, useCallback } from 'react';
import { Player } from '@/components/Player';

export const GameActionTarget: FC<{
  player: PlayerType;
  onChange: (target: string) => void;
}> = ({ player, onChange }) => {
  const handleChange = useCallback(() => {
    onChange(player.id);
  }, [onChange, player.id]);

  return (
    <label>
      <input className="nes-radio" type="radio" name={player.id} onChange={handleChange} />
      <span>
        <Player class={player.class} name={player.name} isBot={player.isBot} />
      </span>
    </label>
  );
};
