const { charDescr } = require('../../arena/MiscService');

module.exports = {
  enter: `Здравствуй, сраный путник. Я вижу ты здесь впервые.
    Бла бла бла.Вот кнопка, чтобы создать персонажа.`,
  create: 'Странные упыри ползут со всех сторон, нам нужны бойцы, кем ты желаешь стать в этом мире?',
  select: (prof) => {
    const { name, descr } = charDescr[prof];

    return `Ты выбрал класс ${name}.
    ${name} – ${descr}. 
    Выбрать или вернуться назад?`;
  },
  selectDone: 'Отлично',
  back: 'Думаешь лучше попробовать кем то другим?',
};