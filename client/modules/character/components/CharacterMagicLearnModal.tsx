import { times } from 'es-toolkit/compat';
import { useCharacterLearnMagic } from '../hooks/useCharacterLearnMagic';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useCharacter } from '@/modules/character/store/character';
import { Modal } from '@/components/Modal';
import { canLearnMagic } from '@fwo/shared';

export const CharacterMagicsLearnModal = () => {
  const character = useCharacter();
  const { isLearning, handleLearn } = useCharacterLearnMagic();

  return (
    <Modal trigger={<Button className="is-primary">Изучить</Button>}>
      <Card header="Изучение магии">
        <div className="flex flex-col mb-2">
          <span className="text-sm mb-2">
            Выбери уровень изучаемой магии. Стоимость изучения равна уровню магии
          </span>
          <span>У тебя {character.bonus}💡</span>
        </div>
        <div className="flex gap-2">
          {times(4, (i) => i + 1).map((lvl) => (
            <Button
              key={lvl}
              className="flex-1 is-primary"
              disabled={lvl > character.bonus || !canLearnMagic(character.lvl, lvl) || isLearning}
              onClick={() => handleLearn(lvl)}
            >
              {lvl}💡
            </Button>
          ))}
        </div>
      </Card>
    </Modal>
  );
};
