/**
 * FWO Config Files
 *
 * @description Конфигурационный файл для арены
 *
 */

export default {
  Name: 'FightWorld Online',
  noReg: false, // Запрещена регистрация
  // -------------------------- Регистрация ------------
  roundClanLimit: 5, // Максимальное кол-во игроков из одного клана в одном бою (defaul: 5)
  minPlayersLimit: 2, //  минимальное кол-во игроков в 1 бою
  maxPlayersLimit: 15, // максимальное кол-во игроков в 1 бою
  maxIter: 5, // Максимальное число проверок за один тик
  roundMinPSR: 2, // Минимальный коэфицент PSR, на который клан в бою должен быть
  startGameTimeout: 35000,
  // ---------------------------------------------------------
  startRoundTime: 50000, // время на сбор участников для игры (30сек)
  ordersTime: 30000, // время заказов (30сек)
  minMemb: 0, // минимальное кол-во участников в игру
  roundTimeout: 20000, // время задержки между раундами
  lvlRatio: 3, // коэфицент уровня 1000*х = 1лвл
  maxExp: 1000, // максимальное кол-во exp за игру (maxexp * lvl)
  // ///////////////////////// clans //////////////////////////
  clanCreatePrice: 1, // Цена создания клана.
  clanInvitePrice: 1, // Цена за прием в клан нового
  magic: {
    // Шанс проучки новой магии
    learnChance: 60,
  },
  defaultItems: {
    w: 'machete',
    l: 'rocks',
    p: 'staff',
    m: 'staff',
  }, // Порядок выполнения магия (ОЧЕНЬ ОПАСНО!)
  stages: [
    'silence',
    'magicDefense',
    // 'mass_silence',
    'dispel',
    'exorcism',
    'anathema',
    // 8mpb armag
    // 8pmb podmena?!?
    // 8wpb clonirivanie
    // 'magic_devastation',
    // 'energy_devastation', // predlagay sna4alo sdelat energy potom mag
    // 'satanic_glitches',
    // 8mpa ahuyalipsis
    // 'sacrifice',
    // 'dead_call',
    // 'firestorm',
    // 8mma mozgovaya huyaka
    // 'plague',
    // 'pray',
    'sleep', // ?!?!?!?!!? why there?
    'lightShield',
    // 'sphere',
    // 'mana_burn',
    // 8ppa
    ['blessing', 'curse', 'entangle'], // ???
    ['blight', 'bodySpirit'],
    // 'mirror_reflection',
    ['smallAura', 'magicArmor', 'strongAura', 'dustShield', 'mediumAura', 'stoneSkin', 'magicWall'], // ???
    // 'cats_claw',
    // 'vampiric_aura',
    'glitch',
    'madness',
    // 'holy_weapon',
    //
    ['paralysis', 'eclipse'],
    // @todo Тут пойду ВСЕ скилы, очередность в процессе
    // SKILLS:
    'berserk',
    'dodge',
    'parry',
    'disarm',
    'shieldBlock',
    [
      'protect',
      // 'regen_energy',
      // 'regen_mana',
      'regeneration',
    ],
    'attack',
    'bleeding',
    //
    [
      'fireBall',
      // 'ice_lance',
      'magicArrow',
      'poisonBreath',
      'frostTouch',
      'acidSpittle',
      'chainLightning',
      'fireRain',
      // 'wild_lighting',
      'rockfall',
      'physicalSadness',
    ],
    // 'magic_sadness',
    'vampirism',
    [
      'lightHeal',
      // 'mass_heal',
      'mediumHeal',
      'strongHeal',
    ],
    'handsHeal',
    // 'postHeal',
    // 'life_force',
    // 'spirit_unity',
    'secondLife',
  ] as const,
};
