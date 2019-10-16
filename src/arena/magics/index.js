/**
 * Первичный загрузчик магий
 */
// FIXME: Сюда пока нужно руками добавлять все actions и делать их export
// после будет glob подгрузка модулей
const blessing = require('./blessing');
const chainLightning = require('./chainLightning');
const magicDefense = require('./magicDefense');
const glitch = require('./glitch');
const silence = require('./silence');
const attack = require('../actions/attack');
const protect = require('../actions/protect');
// const regen = require('./regen');
const handsHeal = require('../actions/handsHeal');
const magicArrow = require('./magicArrow');
const curse = require('./curse');
const entangle = require('./entangle');
const frostTouch = require('./frostTouch');
const poisonBreath = require('./poisonBreath');
const rockfall = require('./rockfall');
const lightHeal = require('./lightHeal');
const magicArmor = require('./magicArmor');
const stoneSkin = require('./stoneSkin');
const smallAura = require('./smallAura');
const regeneration = require('../actions/regen');
const postHeal = require('./postHeal');
// skills
const berserk = require('../skills/berserk');

module.exports = {
  blessing: blessing,
  chainLightning: chainLightning,
  magicDefense: magicDefense,
  glitch: glitch,
  silence: silence,
  attack: attack,
  protect: protect, // regen: regen,
  handsHeal: handsHeal,
  magicArrow: magicArrow,
  curse: curse,
  entangle: entangle,
  frostTouch: frostTouch,
  poisonBreath: poisonBreath,
  rockfall: rockfall,
  lightHeal: lightHeal,
  magicArmor: magicArmor,
  stoneSkin: stoneSkin,
  smallAura: smallAura,
  regeneration: regeneration,
  postHeal: postHeal, /**
   * Skills
   */
  berserk: berserk,
};
