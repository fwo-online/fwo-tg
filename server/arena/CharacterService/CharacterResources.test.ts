import { beforeEach, describe, expect, it, mock, spyOn } from 'bun:test';
import { CharacterClass } from '@fwo/shared';
import * as botModule from '@/bot';
import TestUtils from '@/utils/testUtils';
import { expToLevel } from './utils/calculateLvl';
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

    // Добавляем опыт для перехода на 2 уровень
    // С lvlRatio=3: expToLevel(2) = 2^(2-2) * 1000 * 3 = 3000 опыта
    const expForLevel2 = expToLevel(2);
    await character.resources.addResources({ exp: expForLevel2 });

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
    const expForLevel2 = expToLevel(2);
    character.charObj.exp = expForLevel2;
    expect(character.lvl).toBe(2);

    // Добавляем опыт для перехода на 3 уровень
    // С lvlRatio=3: expToLevel(3) - expToLevel(2) = 9000 - 3000 = 6000 опыта
    const expForLevel3 = expToLevel(3) - expForLevel2;
    await character.resources.addResources({ exp: expForLevel3 });

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

  it('should send congratulations once when leveling up multiple levels at once', async () => {
    const oldLevel = character.lvl;
    expect(oldLevel).toBe(1);

    // Добавляем большой опыт для перехода сразу на несколько уровней
    // С lvlRatio=3: expToLevel(4) = 3000 + 6000 + 12000 = 21000
    const expForLevel4 = expToLevel(4);
    await character.resources.addResources({ exp: expForLevel4 });

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
    const expForLevel2 = expToLevel(2);
    await character.resources.addResources({ exp: expForLevel2 });

    expect(character.lvl).toBe(2);
    expect(character.resources.free).toBe(oldFree + 10);

    // Добавляем опыт для перехода на 3 уровень
    const expForLevel3 = expToLevel(3) - expForLevel2;
    await character.resources.addResources({ exp: expForLevel3 });

    expect(character.lvl).toBe(3);
    expect(character.resources.free).toBe(oldFree + 20);
  });

  it('should handle errors in sendLevelUpCongratulations gracefully', async () => {
    // Мокаем функцию так, чтобы она выбрасывала ошибку
    const errorSpy = mock(() => Promise.reject(new Error('Telegram API error')));
    spyOn(botModule, 'sendLevelUpCongratulations').mockImplementation(errorSpy);

    const consoleErrorSpy = spyOn(console, 'error').mockImplementation(() => {});

    // Добавляем опыт для повышения уровня
    const expForLevel2 = expToLevel(2);
    await character.resources.addResources({ exp: expForLevel2 });

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

    // Добавляем опыт для перехода на 2 уровень
    const expForLevel2 = expToLevel(2); // 3000 опыта
    await character.resources.addResources({ exp: expForLevel2 });

    // Проверяем, что бонус увеличился на 30 (3000 / 100)
    expect(character.resources.bonus).toBe(oldBonus + 30);
  });
});
