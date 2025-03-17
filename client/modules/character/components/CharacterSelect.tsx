import type { CreateCharacterDto, CharacterClass } from '@fwo/shared';
import { type FC, useEffect, useRef, useState } from 'react';
import {
  characterClassImageMap,
  characterClassList,
  characterClassNameMap,
} from '@/constants/character';
import styles from './CharacterSelect.module.css';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import cn from 'classnames';

const Slide = ({ value }: { value: CharacterClass }) => {
  return (
    <div className={styles.slide}>
      <img src={characterClassImageMap[value]} alt={characterClassImageMap[value]} />
      <h2 className="text-xl font-semibold">{characterClassNameMap[value]}</h2>
    </div>
  );
};

export const SelectCharacter: FC<{ onSelect: (createCharacter: CreateCharacterDto) => void }> = ({
  onSelect,
}) => {
  const [selected, setSelected] = useState(0);
  const [name, setName] = useState('');
  const slider = useRef<HTMLDivElement>(null);

  const next = () => {
    setSelected((selected + 1) % characterClassList.length);
  };

  const prev = () => {
    setSelected((selected - 1 + characterClassList.length) % characterClassList.length);
  };

  useEffect(() => {
    slider.current?.style.setProperty('--slide', selected.toString());
  }, [selected]);

  const handleSelectCharacter = () => {
    onSelect({
      name,
      class: characterClassList[selected],
    });
  };

  return (
    <Card header="Создание персонажа" className="m-4!">
      <div className="flex justify-center gap-4">
        {characterClassList.map((value, index) => (
          <div
            key={value}
            className={cn('w-2 h-2', {
              'bg-(--tg-theme-text-color)': index !== selected,
              'bg-(--tg-theme-accent-text-color)': index === selected,
            })}
          />
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <div className={styles.slider}>
          <Button onClick={prev}>◄</Button>
          <div className={styles.slides} data-selected={selected} ref={slider}>
            {characterClassList.map((value) => (
              <Slide key={value} value={value} />
            ))}
          </div>
          <Button onClick={next}>►</Button>
        </div>
        <input
          className="nes-input"
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
