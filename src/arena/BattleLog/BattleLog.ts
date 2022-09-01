import type { SuccessArgs, FailArgs } from '@/arena/Constuructors/types';
import { joinLongDmgMessages, joinLongMessages, formatMessage } from './utils';

export type Message = SuccessArgs | FailArgs

type Formatter = (message: Message) => string;

/**
 * Класс вывода данных в battlelog
 * @todo WIP класс в стадии формирования
 * @see https://trello.com/c/qxnIM1Yq/17
 */
export class BattleLog {
  private messages: Message[] = [];

  constructor(
    private formatter: Formatter = formatMessage,
  ) {}

  /**
   * Удачный проход action
   * @param message сообщение
   */
  success(message: SuccessArgs) {
    switch (message.actionType) {
      case 'magic-long':
        this.messages = joinLongMessages(this.messages, message);
        break;
      case 'dmg-magic-long':
        this.messages = joinLongDmgMessages(this.messages, message);
        break;
      default:
        this.messages.push(message);
        break;
    }
  }

  /**
   * Неудачный проход action
   * @param message сообщение
   */
  fail(message: FailArgs): void {
    this.messages.push(message);
  }

  format() {
    return this.messages.map(this.formatter, this);
  }

  reset() {
    this.messages = [];
  }
}
