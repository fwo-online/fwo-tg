import type {
  Breaks, SuccessArgs, PhysBreak,
} from '@/arena/Constuructors/types';
import { formatMessage } from './utils/format-message';
import { joinHealMessages } from './utils/join-heal-messages';
import { joinLongMessages } from './utils/join-long-messages';

const MAX_MESSAGE_LENGTH = 2 ** 12;

type FailArgs = Breaks | PhysBreak;

type LogMessage = (SuccessArgs & { __success: true } | (FailArgs & { __success: false }));

/**
 * Класс вывода данных в battlelog
 * @todo WIP класс в стадии формирования
 * @see https://trello.com/c/qxnIM1Yq/17
 */
export class BattleLog {
  private messages: LogMessage[] = [];

  /**
   * Функция логирует действия в console log
   * @param msgObj тип сообщения
   */
  fail(msgObj: FailArgs): void {
    this.messages.push({ ...msgObj, __success: false });
  }

  /**
   * Удачный проход action
   * @param msgObj тип сообщения
   */
  success(msgObj: SuccessArgs): void {
    this.messages.push({ ...msgObj, __success: true });
  }

  getMessages(): string[] {
    let temp = '';
    const messagesByMaxLength: string[] = [];
    this.messages = joinLongMessages(this.messages);
    this.messages = joinHealMessages(this.messages);
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
