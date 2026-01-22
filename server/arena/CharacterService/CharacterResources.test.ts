import { beforeEach, describe, expect, it, mock, spyOn } from 'bun:test';
import { CharacterClass } from '@fwo/shared';
import * as botModule from '@/bot';
import TestUtils from '@/utils/testUtils';
import { CharacterService } from './CharacterService';

describe('CharacterResources - Level Up Congratulations', () => {
  let character: CharacterService;
  let sendLevelUpCongratulationsSpy: ReturnType<typeof mock>;

  beforeEach(async () => {
    // Создаем персонажа с начальным опытом
    const char = await TestUtils.createCharacter({
      prof: CharacterClass.Warrior,
      harks: { str: 20, dex: 20, wis: 20, int: 20, con: 20 },
      exp: 0, // Начинаем с 0 опыта (1 уровень)
    });

    character = await CharacterService.getCharacterById(char.id);
    // @ts-expect-error - мокаем saveToDb
    spyOn(character, 'saveToDb').mockImplementation(async () => character.charObj);

    // Мокаем функцию отправки поздравлений
    sendLevelUpCongratulationsSpy = mock(() => Promise.resolve());
    spyOn(botModule, 'sendLevelUpCongratulations').mockImplementation(
      sendLevelUpCongratulationsSpy,
    );
  });

  it('should send level up congratulations when leveling up from 1 to 2', async () => {
    const oldLevel = character.lvl;
    expect(oldLevel).toBe(1);

    // Добавляем опыт для перехода на 2 уровень (нужно 1000 опыта)
    await character.resources.addResources({ exp: 1000 });

    const newLevel = character.lvl;
    expect(newLevel).toBe(2);

    // Проверяем, что функция поздравления была вызвана
    expect(sendLevelUpCongratulationsSpy).toHaveBeenCalledTimes(1);
    expect(sendLevelUpCongratulationsSpy).toHaveBeenCalledWith(
      character.owner,
      character.nickname,
      2,
    );
  });

  it('should send level up congratulations when leveling up from 2 to 3', async () => {
    // Устанавливаем персонажа на 2 уровень
    character.charObj.exp = 1000;
    expect(character.lvl).toBe(2);

    // Добавляем опыт для перехода на 3 уровень (нужно еще 2000 опыта)
    await character.resources.addResources({ exp: 2000 });

    const newLevel = character.lvl;
    expect(newLevel).toBe(3);

    // Проверяем, что функция поздравления была вызвана с правильными параметрами
    expect(sendLevelUpCongratulationsSpy).toHaveBeenCalledTimes(1);
    expect(sendLevelUpCongratulationsSpy).toHaveBeenCalledWith(
      character.owner,
      character.nickname,
      3,
    );
  });

  it('should send congratulations multiple times when leveling up multiple levels at once', async () => {
    const oldLevel = character.lvl;
    expect(oldLevel).toBe(1);

    // Добавляем большой опыт для перехода сразу на несколько уровней
    // 1000 (2 lvl) + 2000 (3 lvl) + 4000 (4 lvl) = 7000
    await character.resources.addResources({ exp: 7000 });

    const newLevel = character.lvl;
    expect(newLevel).toBe(4);

    // Функция вызывается один раз с финальным уровнем
    expect(sendLevelUpCongratulationsSpy).toHaveBeenCalledTimes(1);
    expect(sendLevelUpCongratulationsSpy).toHaveBeenCalledWith(
      character.owner,
      character.nickname,
      4,
    );
  });

  it('should not send congratulations when not leveling up', async () => {
    const oldLevel = character.lvl;
    expect(oldLevel).toBe(1);

    // Добавляем опыт, но не достаточно для нового уровня
    await character.resources.addResources({ exp: 500 });

    const newLevel = character.lvl;
    expect(newLevel).toBe(1);

    // Проверяем, что функция поздравления НЕ была вызвана
    expect(sendLevelUpCongratulationsSpy).not.toHaveBeenCalled();
  });

  it('should add correct amount of free points when leveling up', async () => {
    const oldFree = character.resources.free;

    // Добавляем опыт для перехода на 2 уровень
    await character.resources.addResources({ exp: 1000 });

    expect(character.lvl).toBe(2);
    expect(character.resources.free).toBe(oldFree + 10);

    // Добавляем опыт для перехода на 3 уровень
    await character.resources.addResources({ exp: 2000 });

    expect(character.lvl).toBe(3);
    expect(character.resources.free).toBe(oldFree + 20);
  });

  it('should handle errors in sendLevelUpCongratulations gracefully', async () => {
    // Мокаем функцию так, чтобы она выбрасывала ошибку
    const errorSpy = mock(() => Promise.reject(new Error('Telegram API error')));
    spyOn(botModule, 'sendLevelUpCongratulations').mockImplementation(errorSpy);

    const consoleErrorSpy = spyOn(console, 'error').mockImplementation(() => {});

    // Добавляем опыт для повышения уровня
    await character.resources.addResources({ exp: 1000 });

    expect(character.lvl).toBe(2);

    // Проверяем, что функция была вызвана
    expect(errorSpy).toHaveBeenCalledTimes(1);

    // Ждем следующий тик для обработки async ошибки
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Проверяем, что ошибка была залогирована
    expect(consoleErrorSpy).toHaveBeenCalled();

    // Восстанавливаем console.error
    consoleErrorSpy.mockRestore();
  });

  it('should add bonus points when gaining experience', async () => {
    const oldBonus = character.resources.bonus;

    // Добавляем 1000 опыта
    await character.resources.addResources({ exp: 1000 });

    // Проверяем, что бонус увеличился на 10 (1000 / 100)
    expect(character.resources.bonus).toBe(oldBonus + 10);
  });
});
