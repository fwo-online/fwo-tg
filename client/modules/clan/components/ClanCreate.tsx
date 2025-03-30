import { Button } from '@/components/Button';
import { useState, type FC } from 'react';

export const ClanCreate: FC<{ onCreate: (name: string) => void }> = ({ onCreate }) => {
  const [name, setName] = useState('');

  return (
    <>
      <input
        className="nes-input"
        value={name}
        placeholder="Введите название клана"
        onChange={(e) => setName(e.target.value)}
      />

      <div className="mt-4 flex flex-col">
        <Button className="is-primary" onClick={() => onCreate(name)}>
          Создать клан за 100💰
        </Button>
      </div>
    </>
  );
};
