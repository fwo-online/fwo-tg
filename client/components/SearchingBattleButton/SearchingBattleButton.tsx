import { useNavigate } from 'react-router';
import { useGlobalQueueStatus } from '@/modules/lobby/hooks/useGlobalQueueStatus';
import type { GameType } from '@fwo/shared';
import './SearchingBattleButton.css';

const QUEUE_PATHS: Record<GameType, string> = {
  practice: '/lobby/practice',
  ladder: '/lobby/arena',
  tower: '/lobby/tower',
};

const QUEUE_LABELS: Record<GameType, string> = {
  practice: 'Тренировка',
  ladder: 'Арена',
  tower: 'Башня',
};

export function SearchingBattleButton() {
  const navigate = useNavigate();
  const { isSearching, queueType } = useGlobalQueueStatus();

  if (!isSearching || !queueType) {
    return null;
  }

  const handleClick = () => {
    navigate(QUEUE_PATHS[queueType]);
  };

  return (
    <button className="searching-battle-button nes-btn is-warning" onClick={handleClick}>
      <div className="searching-battle-button__content">
        <span className="searching-battle-button__label">Поиск</span>
        <span className="searching-battle-button__type">{QUEUE_LABELS[queueType]}</span>
      </div>
    </button>
  );
}
