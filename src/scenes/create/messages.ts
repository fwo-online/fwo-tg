import { Profs } from '../../data';

export const messages = {
  enter: `Здравствуй, сраный путник. Я вижу ты здесь впервые.
    Бла бла бла.Вот кнопка, чтобы создать персонажа.`,
  create: 'Странные упыри ползут со всех сторон, нам нужны бойцы, кем ты желаешь стать в этом мире?',
  select: (prof: Profs.Prof): string => {
    const { name, descr } = Profs.profsData[prof];

    return `Ты выбрал класс ${name}.
${name} – ${descr}.

Введи ник для подтверждения выбора`;
  },
  back: 'Думаешь лучше попробовать кем то другим?',
};
