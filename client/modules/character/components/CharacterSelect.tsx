import type { CharacterClass, CreateCharacterDto } from '@fwo/shared';
import cn from 'classnames';
import { createSignal, For } from 'solid-js';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { characterClassList, characterClassNameMap } from '@/constants/character';
import { CharacterImage } from './CharacterImage';
import styles from './CharacterSelect.module.css';

const Slide = ({ value }: { value: CharacterClass }) => {
  return (
    <div class={styles.slide}>
      <CharacterImage characterClass={value} />

      <h2 class="text-xl font-semibold">{characterClassNameMap[value]}</h2>
    </div>
  );
};

export const SelectCharacter = ({
  onSelect,
}: {
  onSelect: (createCharacter: CreateCharacterDto) => void;
}) => {
  const [selected, setSelected] = createSignal(0);
  const [name, setName] = createSignal('');

  const next = () => {
    setSelected((i) => (i + 1) % characterClassList.length);
  };

  const prev = () => {
    setSelected((i) => (i - 1 + characterClassList.length) % characterClassList.length);
  };

  let slider: HTMLDivElement;

  const handleSelectCharacter = () => {
    onSelect({
      name: name(),
      class: characterClassList[selected()],
    });
  };

  return (
    <Card header="Создание персонажа" class="m-4!">
      <div class="flex justify-center gap-4">
        <For each={characterClassList}>
          {(_, index) => (
            <div
              class={cn('w-2 h-2', {
                'bg-(--tg-theme-text-color)': index !== selected,
                'bg-(--tg-theme-accent-text-color)': index === selected,
              })}
            />
          )}
        </For>
      </div>
      <div class="flex flex-col gap-2">
        <div class={styles.slider}>
          <Button onClick={prev}>◄</Button>
          <div class={styles.slides} data-selected={selected} ref={slider}>
            <For each={characterClassList}>{(value) => <Slide value={value} />}</For>
          </div>
          <Button onClick={next}>►</Button>
        </div>
        <input
          class="nes-input"
          value={name()}
          placeholder="Введите имя персонажа"
          onChange={(e) => setName(e.target.value)}
        />

        <Button class="is-primary" disabled={!name} onClick={handleSelectCharacter}>
          Создать
        </Button>
      </div>
    </Card>
  );
};
