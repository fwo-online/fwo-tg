/**
 * Первичный загрузчик магий
 */
// FIXME: Сюда пока нужно руками добавлять все actions и делать их export
// после будет glob подгрузка модулей
const acidSpittle = require('./acidSpittle');
const blessing = require('./blessing');
const chainLightning = require('./chainLightning');
const glitch = require('./glitch');
const silence = require('./silence');
const curse = require('./curse');
const eclipse = require('./eclipse');
const entangle = require('./entangle');
const frostTouch = require('./frostTouch');
const poisonBreath = require('./poisonBreath');
const rockfall = require('./rockfall');
const lightHeal = require('./lightHeal');
const madness = require('./madness');
const magicArmor = require('./magicArmor');
const magicArrow = require('./magicArrow');
const magicDefense = require('./magicDefense');
const mediumHeal = require('./mediumHeal');
const paralysis = require('./paralysis');
const stoneSkin = require('./stoneSkin');
const smallAura = require('./smallAura');
const regeneration = require('../actions/regen');
const postHeal = require('./postHeal');

module.exports = {
  blessing,
  chainLightning,
  glitch,
  silence,
  curse,
  eclipse,
  entangle,
  frostTouch,
  poisonBreath,
  rockfall,
  lightHeal,
  magicArmor,
  magicArrow,
  magicDefense,
  mediumHeal,
  paralysis,
  stoneSkin,
  smallAura,
  regeneration,
  postHeal,
};
