import { getCharacter } from '@/modules/character/store/character';
import { formatNumber } from '@/utils/formatNumber';

import styles from './CharacterExp.module.css';

export const CharacterExp = () => {
  const character = () => getCharacter();
  const progress = () => Math.ceil((character().exp / character().nextLvlExp) * 100);

  return (
    <div style={{ '--exp-progress': `${progress()}%` }} class={styles.exp}>
      {formatNumber(character().exp)}/{formatNumber(character().nextLvlExp)}
    </div>
  );
};
