import type { NotificationType } from '@fwo/shared';
import { InlineKeyboard } from 'grammy';
import type { CharacterService } from '@/arena/CharacterService';
import { bot } from '@/bot';
import { activeConnections } from '@/server/utils/activeConnectons';

/**
 * Centralized notification service for sending Telegram messages to players
 */
export class NotificationService {
  /**
   * Check if player is connected to WebSocket
   */
  private static isPlayerConnected(userID: string): boolean {
    const socket = activeConnections.get(userID);
    const isConnected = socket?.connected ?? false;
    return isConnected;
  }

  /**
   * Check if notification should be sent based on user preferences
   */
  private static shouldSendNotification(
    character: CharacterService,
    notificationType: NotificationType,
  ): boolean {
    const settings = character.charObj.notificationSettings;

    if (!settings) {
      return false;
    }

    return settings[notificationType] ?? false;
  }

  /**
   * Send game start notification to player
   */
  static async sendGameStartNotification(
    character: CharacterService,
    gameId: string,
  ): Promise<void> {
    try {
      const isConnected = this.isPlayerConnected(character.owner);
      if (isConnected) {
        return;
      }

      const shouldSend = this.shouldSendNotification(character, 'gameStart');
      if (!shouldSend) {
        return;
      }

      const gameUrl = `${process.env.APP_URL}/game/${gameId}`;
      const keyboard = new InlineKeyboard().webApp('Открыть игру', gameUrl);

      await bot.api.sendMessage(
        character.owner,
        'Игра начинается!\n\nТвоя игра готова. Нажми кнопку ниже, чтобы присоединиться.',
        { reply_markup: keyboard },
      );
    } catch (error) {
      // Handle cases: user blocked bot, deleted chat, etc.
      console.error('[NotificationService] ✗ Failed to send game start notification:', error);
    }
  }

  /**
   * Send AFK warning notification (for future use)
   */
  static async sendAfkWarningNotification(
    character: CharacterService,
    gameId: string,
  ): Promise<void> {
    try {
      if (!this.shouldSendNotification(character, 'afkWarning')) {
        return;
      }

      const gameUrl = `${process.env.APP_URL}/game/${gameId}`;
      const keyboard = new InlineKeyboard().webApp('Вернуться в игру', gameUrl);

      await bot.api.sendMessage(
        character.owner,
        '⚠️ Предупреждение!\n\nТы не делаешь ходы. Сделай заказ, иначе будешь выброшен из игры.',
        { reply_markup: keyboard },
      );
    } catch (error) {
      console.error('Failed to send AFK warning notification:', error);
    }
  }
}
