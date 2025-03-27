import { Button } from '@/components/Button';
import { useState, type FC } from 'react';

export const ClanCreate: FC<{ onCreate: (name: string) => void }> = ({ onCreate }) => {
  const [name, setName] = useState('');

  return (
    <>
      <input
        className="nes-input"
        value={name}
        placeholder="Введите имя персонажа"
        onChange={(e) => setName(e.target.value)}
      />

      <Button onClick={() => onCreate(name)}>Создать клан</Button>
    </>
  );
};
