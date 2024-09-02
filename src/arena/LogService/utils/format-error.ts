import type { BreaksMessage, FailArgs } from '@/arena/Constuructors/types';
import { normalizeToArray } from '@/utils/array';
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
        ru: `Некто хотел использовать _${action}_ на игрока *${target.nick}*, но исчез`,
        en: '',
      },
      NO_TARGET: {
        ru: `Цель для заклинания _${action}_ игрока *${initiator.nick}* не была найдена`,
        en: '',
      },
      NO_MANA: {
        ru: `*${initiator.nick}* пытался использовать _${action}_ на *${target.nick}, но не хватило маны`,
        en: '',
      },
      NO_ENERGY: {
        ru: `*${initiator.nick}* пытался применить  _${action}_, но не хватило энергии`,
        en: '',
      },
      CHANCE_FAIL: {
        ru: `*${initiator.nick}* пытался сотворить _${action}_, но у него не вышло`,
        en: '',
      },
      GOD_FAIL: {
        ru: `Заклинание _${action}_ *${initiator.nick}* провалилось по воле богов`,
        en: '',
      },
      HEAL_FAIL: {
        ru: `*${initiator.nick}* пытался _вылечить_ *${target.nick}*, но тот был атакован`,
        en: '',
      },
      SKILL_FAIL: {
        ru: `*${initiator.nick}* пытался использовать умение _${action}_, но у него не вышло`,
        en: '',
      },
      PHYS_FAIL: {
        ru: `*${initiator.nick}* пытался _атаковать_ *${target.nick}*, но не пробил`,
        en: '',
      },
      NO_WEAPON: {
        ru: `*${initiator.nick}* пытался атаковать *${target.nick}*, но у него не оказалось оружия в руках`,
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

  const normalizedReason = normalizeToArray(reason);
  const formattedReason = normalizedReason.map(formatCause).join('\n');

  switch (actionType) {
    case 'phys':
      return `*${initiator.nick}* пытался атаковать *${target.nick}*, но у него не получилось\n${formattedReason}`;
    default:
      return `*${initiator.nick}* пытался использовать _${action}_ на *${target.nick}*, но у него не получилось\n${formattedReason}`;
  }
}
