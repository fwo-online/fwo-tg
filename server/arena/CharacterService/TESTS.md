# Тесты для системы поздравлений с получением уровня

## Описание

Добавлены тесты для проверки функциональности автоматических поздравлений игроков при получении нового уровня.

## Файлы с тестами

### 1. [CharacterResources.test.ts](CharacterResources.test.ts)

Тесты для логики добавления опыта и отправки поздравлений.

**Проверяемые сценарии:**

- ✅ Отправка поздравления при переходе с 1 на 2 уровень
- ✅ Отправка поздравления при переходе с 2 на 3 уровень
- ✅ Отправка поздравления при одновременном получении нескольких уровней
- ✅ Отсутствие отправки поздравления, если уровень не изменился
- ✅ Правильное начисление свободных очков характеристик (+10 за уровень)
- ✅ Корректная обработка ошибок при отправке поздравлений
- ✅ Правильное начисление бонусных очков (exp / 100)

### 2. [../../bot/index.test.ts](../../bot/index.test.ts)

Тесты для функции отправки поздравлений через Telegram бота.

**Проверяемые сценарии:**

- ✅ Отправка сообщения с корректными параметрами
- ✅ Работа с userID типа string и number
- ✅ Корректное отображение различных уровней (2, 15, 50, 100)
- ✅ Обработка специальных символов в никнеймах
- ✅ Корректная обработка ошибок Telegram API
- ✅ Использование корректного URL изображения
- ✅ Экранирование специальных символов для MarkdownV2
- ✅ Наличие всех необходимых элементов в сообщении (эмодзи, текст, награды)

## Запуск тестов

### Запуск всех тестов проекта

```bash
npm test
# или
bun test
```

### Запуск только тестов CharacterResources

```bash
cd server
bun test CharacterResources.test.ts
```

### Запуск тестов бота

```bash
cd server
bun test bot/index.test.ts
```

### Запуск тестов с покрытием кода

```bash
bun test --coverage
```

## Структура тестов

### CharacterResources.test.ts

```typescript
describe('CharacterResources - Level Up Congratulations', () => {
  // Мокируем зависимости
  beforeEach(async () => {
    // Создаем тестового персонажа
    // Мокируем функцию отправки поздравлений
  });

  it('should send level up congratulations when leveling up', async () => {
    // Тест логики повышения уровня
  });

  // ... остальные тесты
});
```

### bot/index.test.ts

```typescript
describe('Bot - sendLevelUpCongratulations', () => {
  // Мокируем Telegram Bot API
  beforeEach(() => {
    // Мокируем bot.api.sendPhoto
  });

  it('should send congratulations message with correct parameters', async () => {
    // Тест отправки сообщения
  });

  // ... остальные тесты
});
```

## Покрываемая функциональность

### CharacterResources.ts

- `private addExp(value: number)` - основной метод добавления опыта
  - Вычисление нового уровня
  - Начисление свободных очков (+10 за уровень)
  - Начисление бонусных очков (exp / 100)
  - Вызов функции поздравления при повышении уровня
  - Обработка ошибок отправки

### bot/index.ts

- `export const sendLevelUpCongratulations(userID, nickname, newLevel)` - отправка поздравления
  - Формирование текста сообщения
  - Подстановка параметров (nickname, level)
  - Экранирование символов для MarkdownV2
  - Отправка изображения с поздравлением
  - Обработка ошибок Telegram API

## Ожидаемые результаты

Все тесты должны проходить успешно:

```
✓ CharacterResources - Level Up Congratulations
  ✓ should send level up congratulations when leveling up from 1 to 2
  ✓ should send level up congratulations when leveling up from 2 to 3
  ✓ should send congratulations multiple times when leveling up multiple levels at once
  ✓ should not send congratulations when not leveling up
  ✓ should add correct amount of free points when leveling up
  ✓ should handle errors in sendLevelUpCongratulations gracefully
  ✓ should add bonus points when gaining experience

✓ Bot - sendLevelUpCongratulations
  ✓ should send congratulations message with correct parameters
  ✓ should work with string userID
  ✓ should handle different level numbers correctly
  ✓ should handle special characters in nickname correctly
  ✓ should handle errors gracefully and log them
  ✓ should use correct image URL
  ✓ should escape special MarkdownV2 characters in message
  ✓ should include all required elements in congratulations message
```

## Примечания

- Тесты используют моки (mock) для изоляции от внешних зависимостей (Telegram API, база данных)
- Асинхронные операции корректно обрабатываются с помощью `async/await`
- Ошибки логируются, но не прерывают игровой процесс
- Все тесты независимы и могут выполняться в любом порядке
