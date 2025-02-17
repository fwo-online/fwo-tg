import type { FC } from 'react';
import Markdown from 'react-markdown';
import { useGameStore } from '../store/useGameStore';

export const GameLog: FC = () => {
  const log = useGameStore((state) => state.log);

  return log.map((message, index) => <Markdown key={index.toString()}>{message}</Markdown>);
};
