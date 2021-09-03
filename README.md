# FWO Telegram Game

NodeJS реалзиация старой tcl IRC игры Arena [TypeScript/JS]

```
 "Arena/v.xxx by Chpock (rusnet team); additions and modifications by: akhkharu, dismembered, murrena, eerie (new.arena team); optimization and modifications by: DoS (@WeNet), frippy (@IrcNet.RU), LightAngel (@IrcNet.RU)"
```
Отдельное спасибо: @freaky за TCL версию и помощь в 2014 году

## Готово:

1. Создание персонажей и интерфейс.
2. 3 первых круга магии (без массовых скилов).
3. Подбор боев.
4. Прокачка персонажа.
5. Прокачка характеристик.
6. Магазин.
7. 3 круга магий.
8. Инвентарь и работа с ним.


## Разработка:

1. Для запуска потребуется установленный Docker [(здесь)](https://docs.docker.com/engine/install/) и Docker Compose [(здесь)](https://docs.docker.com/compose/install/)
2. Далее создаем Telegram Bot Token [(описание)](https://core.telegram.org/bots#3-how-do-i-create-a-bot) или [Ru версия](https://tlgrm.ru/docs/bots#kak-sozdat-bota)
3. В корневой папке репозитория создаем файл: `.tg-token`
4. Содержимое файла:
    ```
    BOT_TOKEN="<ваш_токен_от_botfather>"
    BOT_CHATID="<telegram chat ID вашего канали или личного чата>"
5. Запускаем: docker-compose up -d
    ```
### BOT:

#### Prod: [@FightWorldBot](https://t.me/FightWorldBot)

Основной бот на канале Arena

#### Test: [@fwo_bot](https://t.me/fwo_bot)

Для тестовых сборок

### Screen

![image](https://user-images.githubusercontent.com/5936445/131505977-9fd805c0-9a08-4fe3-97ca-f3cb242bfd12.png)

### Help

В чате доступна кнопка "Помощь" с ссылкой на мануал: [Описание игры](https://telegra.ph/Fight-Wold-Online-Help-11-05)

### Help Wanted

Приветствуется помощь с проектом :)

