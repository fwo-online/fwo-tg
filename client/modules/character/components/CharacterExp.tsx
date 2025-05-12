import classNames from 'classnames';
import { useCharacter } from '@/modules/character/store/character';
import { formatNumber } from '@/utils/formatNumber';

import styles from './CharacterExp.module.css';

export const CharacterExp = () => {
  const exp = useCharacter((character) => character.exp);
  const nextLvlExp = useCharacter((character) => character.nextLvlExp);
  const progress = Math.ceil((exp / nextLvlExp) * 100);

  return (
    <div style={{ '--exp-progress': `${progress}%` }} className={classNames(styles.exp, 'text-sm')}>
      {formatNumber(exp)}/{formatNumber(nextLvlExp)}
    </div>
  );
};
