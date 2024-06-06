import type { BreaksMessage, FailArgs } from '@/arena/Constuructors/types';
import { formatCause } from './format-cause';
/**
 * msg
 * @todo WIP, функция должна будет принимать как значения урона т.п так и
 * уметь работать с i18n
 * сейчас (е) не обрабатывается, нужно обрабатывать только нужный тип Error
 * если это не BattleLog выброс, его нужно прокидывать дальше вверх
 */
export function formatError(msgObj: FailArgs): string {
  const {
    action, actionType, reason, target, initiator,
  } = msgObj;

  if (typeof reason === 'string') {
    const TEXT: Record<BreaksMessage | 'default', Record<'en' | 'ru', string>> = {
      NO_INITIATOR: {
        ru: `Некто хотел использовать _${action}_ на игрока *${target}*, но исчез`,
        en: '',
      },
      NO_TARGET: {
        ru: `Цель для заклинания _${action}_ игрока *${initiator}* не была найдена`,
        en: '',
      },
      NO_MANA: {
        ru: `*${initiator}* пытался использовать _${action}_ на *${target}, но не хватило маны`,
        en: '',
      },
      NO_ENERGY: {
        ru: `*${initiator}* пытался применить  _${action}_, но не хватило энергии`,
        en: '',
      },
      CHANCE_FAIL: {
        ru: `*${initiator}* пытался сотворить _${action}_, но у него не вышло`,
        en: '',
      },
      GOD_FAIL: {
        ru: `Заклинание _${action}_ *${initiator}* провалилось по воле богов`,
        en: '',
      },
      HEAL_FAIL: {
        ru: `*${initiator}* пытался _вылечить_ *${target}*, но тот был атакован`,
        en: '',
      },
      SKILL_FAIL: {
        ru: `*${initiator}* пытался использовать умение _${action}_, но у него не вышло`,
        en: '',
      },
      PHYS_FAIL: {
        ru: `*${initiator}* пытался _атаковать_ *${target}*, но не пробил`,
        en: '',
      },
      NO_WEAPON: {
        ru: `*${initiator}* пытался атаковать *${target}*, но у него не оказалось оружия в руках`,
        en: '',
      },
      default: {
        ru: 'Ошибка парсинга строки магии',
        en: '',
      },
    };

    const text = TEXT[reason];

    if (!text) {
      console.log(reason);
      return TEXT.default.ru;
    }
    // @todo сейчас battleLog на стороне клиента не понимает типы магий, и
    // просто отображает полученную строку
    return text.ru;
  }

  const normalizedReason = Array.isArray(reason) ? reason : [reason];
  const formattedReason = normalizedReason.map(formatCause).join('\n');

  switch (actionType) {
    case 'phys':
      return `*${initiator}* пытался атаковать *${target}*, но у него не получилось\n${formattedReason}`;
    default:
      return `*${initiator}* пытался использовать _${action}_ на *${target}*, но у него не получилось\n${formattedReason}`;
  }
}
