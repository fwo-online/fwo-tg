import type { GameMessage } from '@fwo/schemas';
import { Cell } from '@telegram-apps/telegram-ui';
// import { formatMessage } from '../../../src/arena/LogService/utils';

export function GameMessageComponent({ message }: { message: GameMessage }) {
  switch (message.action) {
    case 'start':
      return <Cell>Игра начинается</Cell>;
    case 'startRound':
      return <Cell>Начался раунд {message.round}</Cell>;
    case 'endRound':
      return (
        <>
          <Cell>Раунд закончился</Cell>
          {/* {message.log.map((message, index) => (
            <Cell key={index}>{formatMessage(message)}</Cell>
          ))} */}
          <Cell>Погибшие в этом раунде: {message.dead.map((name) => name).join(', ')}</Cell>
        </>
      );
    case 'startOrders':
      return <Cell>Начался этап заказов</Cell>;
    case 'endOrders':
      return <Cell>Закончился этап заказов</Cell>;
    case 'kick':
      return (
        <Cell>
          {message.player.name} был кикнут из игры: {message.reason}
        </Cell>
      );
    default:
      return null;
  }
}
