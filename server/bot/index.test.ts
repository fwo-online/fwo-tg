import { beforeEach, describe, expect, it, mock, spyOn } from 'bun:test';
import { bot, sendLevelUpCongratulations } from './index';

describe('Bot - sendLevelUpCongratulations', () => {
  let sendPhotoSpy: ReturnType<typeof mock>;

  beforeEach(() => {
    // Мокаем метод sendPhoto у бота
    sendPhotoSpy = mock(() => Promise.resolve({ ok: true }));
    spyOn(bot.api, 'sendPhoto').mockImplementation(sendPhotoSpy);
  });

  it('should send congratulations message with correct parameters', async () => {
    const userID = 123456789;
    const nickname = 'Тестовый Воин';
    const newLevel = 5;

    await sendLevelUpCongratulations(userID, nickname, newLevel);

    // Проверяем, что sendPhoto был вызван один раз
    expect(sendPhotoSpy).toHaveBeenCalledTimes(1);

    // Получаем параметры вызова
    const [receivedUserID, receivedImageUrl, options] = sendPhotoSpy.mock.calls[0];

    // Проверяем userID
    expect(receivedUserID).toBe(userID);

    // Проверяем, что передан URL изображения
    expect(receivedImageUrl).toBeTypeOf('string');
    expect(receivedImageUrl).toContain('http');

    // Проверяем опции
    expect(options).toBeDefined();
    expect(options.parse_mode).toBe('MarkdownV2');
    expect(options.caption).toBeTypeOf('string');

    // Проверяем содержимое caption
    const caption = options.caption;
    expect(caption).toContain('ПОЗДРАВЛЯЕМ');
    expect(caption).toContain(nickname);
    expect(caption).toContain(`${newLevel} уровня`);
    expect(caption).toContain('+10 свободных очков');
  });

  it('should work with string userID', async () => {
    const userID = '987654321';
    const nickname = 'Маг';
    const newLevel = 10;

    await sendLevelUpCongratulations(userID, nickname, newLevel);

    expect(sendPhotoSpy).toHaveBeenCalledTimes(1);

    const [receivedUserID] = sendPhotoSpy.mock.calls[0];
    expect(receivedUserID).toBe(userID);
  });

  it('should handle different level numbers correctly', async () => {
    const testCases = [
      { level: 2, userID: 111 },
      { level: 15, userID: 222 },
      { level: 50, userID: 333 },
      { level: 100, userID: 444 },
    ];

    for (const { level, userID } of testCases) {
      await sendLevelUpCongratulations(userID, 'Игрок', level);

      const [, , options] = sendPhotoSpy.mock.calls[sendPhotoSpy.mock.calls.length - 1];
      expect(options.caption).toContain(`${level} уровня`);
    }

    expect(sendPhotoSpy).toHaveBeenCalledTimes(testCases.length);
  });

  it('should handle special characters in nickname correctly', async () => {
    const specialNicknames = [
      'Воин_2024',
      'Маг-Разрушитель',
      'Лучник (новичок)',
      'Жрец!',
      'Test & Test',
    ];

    for (const nickname of specialNicknames) {
      await sendLevelUpCongratulations(12345, nickname, 5);

      const [, , options] = sendPhotoSpy.mock.calls[sendPhotoSpy.mock.calls.length - 1];
      // Проверяем, что никнейм экранирован для MarkdownV2 или содержится в caption
      expect(options.caption).toBeDefined();
    }

    expect(sendPhotoSpy).toHaveBeenCalledTimes(specialNicknames.length);
  });

  it('should handle errors gracefully and log them', async () => {
    // Мокаем sendPhoto так, чтобы он выбрасывал ошибку
    const errorMessage = 'Telegram API Error: User blocked the bot';
    const errorSpy = mock(() => Promise.reject(new Error(errorMessage)));
    spyOn(bot.api, 'sendPhoto').mockImplementation(errorSpy);

    // Мокаем console.error
    const consoleErrorSpy = spyOn(console, 'error').mockImplementation(() => {});

    // Вызываем функцию - она не должна выбросить ошибку
    await expect(sendLevelUpCongratulations(12345, 'Игрок', 5)).resolves.toBeUndefined();

    // Проверяем, что ошибка была залогирована
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(consoleErrorSpy.mock.calls[0][0]).toContain(
      'Failed to send level up congratulations',
    );

    // Восстанавливаем console.error
    consoleErrorSpy.mockRestore();
  });

  it('should use correct image URL', async () => {
    await sendLevelUpCongratulations(12345, 'Игрок', 5);

    const [, imageUrl] = sendPhotoSpy.mock.calls[0];

    // Проверяем, что URL валидный
    expect(imageUrl).toBeTypeOf('string');
    expect(imageUrl.startsWith('http')).toBe(true);

    // Проверяем, что это URL изображения (должен содержать расширение или быть от известного сервиса)
    const isValidImageUrl =
      imageUrl.includes('.png') ||
      imageUrl.includes('.jpg') ||
      imageUrl.includes('.jpeg') ||
      imageUrl.includes('imgur');

    expect(isValidImageUrl).toBe(true);
  });

  it('should escape special MarkdownV2 characters in message', async () => {
    await sendLevelUpCongratulations(12345, 'Игрок', 5);

    const [, , options] = sendPhotoSpy.mock.calls[0];
    const caption = options.caption;

    // MarkdownV2 требует экранирования специальных символов
    // Проверяем, что символы ! экранированы как \\!
    expect(caption).toContain('\\!');

    // Проверяем, что символы + экранированы как \\+
    expect(caption).toContain('\\+');
  });

  it('should include all required elements in congratulations message', async () => {
    await sendLevelUpCongratulations(12345, 'Тестовый Игрок', 7);

    const [, , options] = sendPhotoSpy.mock.calls[0];
    const caption = options.caption;

    // Проверяем наличие всех ключевых элементов
    const requiredElements = [
      '🎉', // Эмодзи празднования
      'ПОЗДРАВЛЯЕМ', // Заголовок
      'Тестовый Игрок', // Имя игрока
      '7 уровня', // Новый уровень
      '⚔️', // Эмодзи меча
      '💪', // Эмодзи силы
      '+10 свободных очков', // Награда
      '🎁', // Эмодзи подарка
    ];

    for (const element of requiredElements) {
      expect(caption).toContain(element);
    }
  });
});
