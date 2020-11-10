import { DmgMagic } from '../Constuructors/DmgMagicConstructor';

/**
 * Огненный дождь
 * Основное описание магии общее требовани есть в конструкторе
 */
class FireRain extends DmgMagic {
  constructor() {
    super({
      // @ts-expect-error не используется
      name: 'fireRain',
      displayName: 'Огненный дождь',
      desc: 'Обрушивает на команду противника огненный дождь',
      cost: 18,
      baseExp: 8,
      costType: 'mp',
      lvl: 3,
      orderType: 'enemy',
      aoeType: 'team',
      magType: 'bad',
      chance: [92, 94, 95],
      effect: ['1d2', '1d2+2', '1d2+4'],
      dmgType: 'fire',
      profList: ['m'],
    });
  }

  /**
   * Основная функция запуска магии
   * @todo
   */
  run(): void {
    // @ts-expect-error @todo
    return this;
  }
}

export default new FireRain();
