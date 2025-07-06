import type { CharacterClass, CreateCharacterDto } from '@fwo/shared';
import cn from 'classnames';
import { type FC, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import {
  characterClassList,
  characterClassNameMap,
  characterDescriptionMap,
} from '@/constants/character';
import { CharacterImage } from './CharacterImage';
import styles from './CharacterSelect.module.css';

const Slide: FC<{ characterClass: CharacterClass; selected: boolean }> = ({
  characterClass,
  selected,
}) => {
  return (
    <div className={styles.slide} data-selected={selected}>
      <CharacterImage characterClass={characterClass} />

      <h2 className="text-xl font-semibold my-4">{characterClassNameMap[characterClass]}</h2>
      <h5>{characterDescriptionMap[characterClass]}</h5>
    </div>
  );
};

export const SelectCharacter: FC<{ onSelect: (createCharacter: CreateCharacterDto) => void }> = ({
  onSelect,
}) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [name, setName] = useState('');
  const slider = useRef<HTMLDivElement>(null);

  const next = () => {
    setSlideIndex((slideIndex + 1) % characterClassList.length);
  };

  const prev = () => {
    setSlideIndex((slideIndex - 1 + characterClassList.length) % characterClassList.length);
  };

  useEffect(() => {
    slider.current?.style.setProperty('--slide', slideIndex.toString());
  }, [slideIndex]);

  const handleSelectCharacter = () => {
    onSelect({
      name,
      class: characterClassList[slideIndex],
    });
  };

  return (
    <Card header="Создание персонажа" className="m-4!">
      <div className="flex justify-center gap-4">
        {characterClassList.map((value, index) => (
          <div
            key={value}
            className={cn('w-2 h-2', {
              'bg-(--tg-theme-text-color)': index !== slideIndex,
              'bg-(--tg-theme-accent-text-color)': index === slideIndex,
            })}
          />
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <div className={styles.slider}>
          <Button className="absolute left-4 top-24 z-10" onClick={prev}>
            ◄
          </Button>
          <div className={styles.slides} data-slide-index={slideIndex} ref={slider}>
            {characterClassList.map((characterClass, i) => (
              <Slide
                key={characterClass}
                characterClass={characterClass}
                selected={slideIndex === i}
              />
            ))}
          </div>
          <Button className="absolute right-4 top-24 z-10" onClick={next}>
            ►
          </Button>
        </div>
        <input
          className="nes-input bg-(--tg-theme-bg-color)"
          value={name}
          placeholder="Введите имя персонажа"
          onChange={(e) => setName(e.target.value)}
        />

        <Button className="is-primary" disabled={!name} onClick={handleSelectCharacter}>
          Создать
        </Button>
      </div>
    </Card>
  );
};
