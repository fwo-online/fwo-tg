import { Cell, Info, Selectable } from '@telegram-apps/telegram-ui';
import { type FC, useCallback } from 'react';
import type { PublicGameStatus } from '@fwo/shared';
import styles from './GameAction.module.css';

export const GameActionTarget: FC<{
  status: PublicGameStatus;
  onChange: (target: string) => void;
}> = ({ status, onChange }) => {
  const handleChange = useCallback(() => {
    onChange(status.id);
  }, [onChange, status.id]);

  return (
    <Cell
      className={styles.target}
      Component="label"
      before={<Selectable name="target" value={status.id} onChange={handleChange} />}
      key={status.id}
      after={
        <Info type="text" style={{ marginLeft: 'auto' }}>
          ❤️ {status.hp}
        </Info>
      }
    >
      {status.name} ({status.hp})
    </Cell>
  );
};
