import type { SuccessArgs, FailArgs } from '@/arena/Constuructors/types';
import { formatMessage } from './utils/format-message';
import { joinLongDmgMessages, joinLongMessages } from './utils/join-long-messages';

export type Message = SuccessArgs | FailArgs

const MAX_MESSAGE_LENGTH = 2 ** 12;

/**
 * Класс вывода данных в battlelog
 * @todo WIP класс в стадии формирования
 * @see https://trello.com/c/qxnIM1Yq/17
 */
export class BattleLog {
  private messages: Message[] = [];

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

  getMessages(): string[] {
    let temp = '';
    const messagesByMaxLength: string[] = [];

    this.messages.forEach((msgObj) => {
      const message = formatMessage(msgObj);
      if (temp.length + message.length <= MAX_MESSAGE_LENGTH) {
        temp = temp.concat('\n\n', message);
      } else {
        messagesByMaxLength.push(temp);
      }
    });
    messagesByMaxLength.push(temp);
    return messagesByMaxLength;
  }

  clearMessages(): void {
    this.messages = [];
  }
}
