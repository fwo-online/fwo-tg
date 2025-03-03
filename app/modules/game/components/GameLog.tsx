import type { FC } from 'react';
import Markdown from 'react-markdown';
import { useGameStore } from '../store/useGameStore';
import { Caption, Divider } from '@telegram-apps/telegram-ui';

export const GameLog: FC = () => {
  const log = useGameStore((state) => state.log);

  return log.map((message, index) => (
    <Caption key={index.toString()}>
      <Markdown>{message}</Markdown>
      <Divider />
    </Caption>
  ));
};
