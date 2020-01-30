/**
 * FWO Config Files
 *
 * @description Конфигурационный файл для арены
 *
 */
module.exports = {
  Name: 'Arena-Beta',
  noReg: false, // Запрещена регистрация
  // -------------------------- Регистрация ------------
  roundClanLimit: 5, // Максимальное кол-во игроков из одного клана в одном бою (defaul: 5)
  roundPlayersLimit: 2, //  кол-во игроков в 1 бою (defaul:10)
  maxIter: 5, // Максимальное число проверок за один тик
  roundMinPSR: 2, // Минимальный коэфицент PSR, на который клан в бою должен быть
  // ---------------------------------------------------------
  startRoundTime: 30000, // время на сбор участников для игры (30сек)
  roundTime: 15000, // время заказов (15сек)
  minMemb: 0, // минимальное кол-во участников в игру
  roundTimeout: 15000, // время задержки между раундами
  lvlRatio: 1, // коэфицент уровня 1000*х = 1лвл
  maxExp: 1000, // максимальное кол-во exp за игру (maxexp * lvl)
  // ///////////////////////// clans //////////////////////////
  clanCreatePrice: 1, // Цена создания клана.
  clanInvitePrice: 1, // Цена за прием в клан нового
  magic: {
    // Шанс проучки новой магии
    learnChance: 60,
  },
  defaultItems: {
    w: 'waa', l: 'wab', p: 'wac', m: 'wac',
  }, // Порядок выполнения магия (ОЧЕНЬ ОПАСНО!)
  stages: [
    'silence',
    'magicDefense',
    'mass_silence',
    'dispel',
    'exorcism',
    'anathema',
    // 8mpb armag
    // 8pmb podmena?!?
    // 8wpb clonirivanie
    'magic_devastation',
    'energy_devastation', // predlagay sna4alo sdelat energy potom mag
    'satanic_glitches',
    // 8mpa ahuyalipsis
    'sacrifice',
    'dead_call',
    'firestorm',
    // 8mma mozgovaya huyaka
    'plague',
    'pray',
    'sleep', // ?!?!?!?!!? why there?
    'light_shield',
    'sphere',
    'mana_burn',
    // 8ppa
    [
      'blessing',
      'curse',
      'entangle'], // ???
    [
      'blight',
      'body_spirit'], // ????????
    'mirror_reflection',
    [
      'smallAura',
      'magicArmor', 'strongAura',
      'dust_shield', 'mediumAura',
      'stoneSkin',
      'magic_wall'], // ???
    'cats_claw',
    'vampiric_aura',
    'glitch',
    'madness',
    'holy_weapon',
    //
    [
      'paralysis',
      'eclipse'],
    // @todo Тут пойду ВСЕ скилы, очередность в процессе
    // SKILLS:
    'berserk',
    'dodge',
    [
      'protect',
      'regen_energy',
      'regen_mana',
      'regeneration'],
    'attack',
    //
    [
      'fireball',
      'ice_lance',
      'magicArrow',
      'poisonBreath',
      'frostTouch', 'acidSpittle', 'chainLightning', 'fireRain',
      'wild_lightning',
      'rockfall',
      'physical_sadness'],
    'magic_sadness',
    [
      'lightHeal',
      'mass_heal', 'mediumHeal', 'strongHeal'],
    'handsHeal',
    'postHeal',
    'life_force',
    'vampirism',
    'spirit_unity', 'secondLife'], /**
   * Суммируемые атрибуты для вещей
   */
  parseAttr: [
    'atc',
    'prt',
    'plushark',
    'mga',
    'mgp',
    'hl',
    'r_fire',
    'r_acid',
    'r_lighting',
    'r_frost',
    'r_physical',
    'add_hp',
    'add_mp',
    'add_en',
    'static_reg_hp',
    'static_reg_en',
    'static_reg_mp',
    'hp_drain',
    'mp_drain',
    'en_drain',
    'hit',
    'fire',
    'acid',
    'lighting',
    'frost',
    'weight'],
};
