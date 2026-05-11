import { canLearnMagic, getLearnMagicCost } from '@fwo/shared';
import classNames from 'classnames';
import { times } from 'es-toolkit/compat';
import type { FC } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Modal } from '@/components/Modal';
import { useCharacter } from '@/modules/character/store/character';
import { useCharacterLearnMagic } from '../hooks/useCharacterLearnMagic';

export const CharacterMagicsLearnModal: FC<{ avaiableMagicLevels: Record<number, boolean> }> = ({
  avaiableMagicLevels,
}) => {
  const character = useCharacter();
  const { isLearning, handleLearn } = useCharacterLearnMagic();

  const hasBonus = (lvl: number) => {
    return character.bonus >= getLearnMagicCost(lvl);
  };

  const isDisabled = (lvl: number) =>
    !hasBonus(lvl) || !canLearnMagic(character.lvl, lvl) || !avaiableMagicLevels[lvl] || isLearning;

  return (
    <Modal trigger={<Button className="is-primary flex-1">Изучение магий</Button>} modal={false}>
      <Card header="Изучение магии">
        <h5 className="text-sm">Выбери уровень магии, который хочешь изучить</h5>

        <div className="flex flex-col gap-2">
          <span className="self-end mr-4">У тебя {character.bonus}💡</span>
          {times(4, (i) => i + 1).map((lvl) => (
            <Button
              key={lvl}
              className={classNames('flex-1', {
                'is-primary': !isDisabled(lvl),
              })}
              disabled={isDisabled(lvl)}
              onClick={() => handleLearn(lvl)}
            >
              <div className="flex justify-between">
                <div> Уровень {lvl} </div>
                {avaiableMagicLevels[lvl] ? `${getLearnMagicCost(lvl)}💡` : '✅'}
              </div>
            </Button>
          ))}
        </div>
      </Card>
    </Modal>
  );
};
