import type { BreaksMessage, FailArgs } from '@/arena/Constuructors/types';
import { normalizeToArray } from '@/utils/array';
import { formatCause } from './format-cause';
import { bold, italic } from '@/utils/formatString';
/**
 * msg
 * @todo WIP, функция должна будет принимать как значения урона т.п так и
 * уметь работать с i18n
 * сейчас (е) не обрабатывается, нужно обрабатывать только нужный тип Error
 * если это не BattleLog выброс, его нужно прокидывать дальше вверх
 */
export function formatError(msgObj: FailArgs): string {
  const { action, actionType, reason, target, initiator } = msgObj;

  if (typeof reason === 'string') {
    const TEXT: Record<BreaksMessage | 'default', Record<'en' | 'ru', string>> = {
      NO_INITIATOR: {
        ru: `Некто хотел использовать ${italic(action)} на игрока ${bold(target.nick)}, но исчез`,
        en: '',
      },
      NO_TARGET: {
        ru: `Цель для заклинания ${italic(action)} игрока ${bold(initiator.nick)} не была найдена`,
        en: '',
      },
      NO_MANA: {
        ru: `${bold(initiator.nick)} пытался использовать ${italic(action)} на ${bold(target.nick)}, но не хватило маны`,
        en: '',
      },
      NO_ENERGY: {
        ru: `${bold(initiator.nick)} пытался применить  ${italic(action)}, но не хватило энергии`,
        en: '',
      },
      CHANCE_FAIL: {
        ru: `${bold(initiator.nick)} пытался сотворить ${italic(action)}, но у него не вышло`,
        en: '',
      },
      GOD_FAIL: {
        ru: `Заклинание ${italic(action)} ${bold(initiator.nick)} провалилось по воле богов`,
        en: '',
      },
      HEAL_FAIL: {
        ru: `${bold(initiator.nick)} пытался ${italic`вылечить`} ${bold(target.nick)}, но тот был атакован`,
        en: '',
      },
      SKILL_FAIL: {
        ru: `${bold(initiator.nick)} пытался использовать умение ${italic(action)}, но у него не вышло`,
        en: '',
      },
      PHYS_FAIL: {
        ru: `${bold(initiator.nick)} пытался ${italic`атаковать`} ${bold(target.nick)}, но не пробил`,
        en: '',
      },
      NO_SHIELD: {
        ru: `${bold(initiator.nick)} пытался использовать щит, но у него не окалось его в руках`,
        en: '',
      },
      NO_WEAPON: {
        ru: `${bold(initiator.nick)} пытался атаковать ${bold(target.nick)}, но у него не оказалось оружия в руках`,
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
      return `${bold(initiator.nick)} пытался атаковать ${bold(target.nick)}, но у него не получилось\n${formattedReason}`;
    default:
      return `${bold(initiator.nick)} пытался использовать ${italic(action)} на ${bold(target.nick)}, но у него не получилось\n${formattedReason}`;
  }
}
